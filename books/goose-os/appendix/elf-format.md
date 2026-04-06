---
sidebar_position: 7
sidebar_label: "ELF Binary Format"
title: "The ELF Binary Format — What's Inside a Program"
---

# The ELF Binary Format — What's Inside a Program

When you compile a Rust or C program, the compiler doesn't produce raw machine code. It produces an **ELF file** — Executable and Linkable Format. ELF is the universal container for programs on Unix-like systems. Linux uses it. FreeBSD uses it. And GooseOS will use it to load userspace processes.

This appendix dissects ELF from the ground up — every header, every field, every byte. By the end, you'll be able to read a hex dump of an ELF binary and tell exactly where the code lives, where the data lives, and where execution begins.

## Why ELF Exists

A raw binary — just machine instructions dumped to a file — works if you know exactly where to load it and where execution starts. Our current embedded programs are essentially raw binaries (`global_asm!` blocks embedded in the kernel). But raw binaries carry no metadata:

- Where does the code go in memory?
- Where does read-only data go?
- What's the entry point?
- How big is the BSS (zero-initialized data)?
- Does the program need a stack? How big?

ELF answers all of these. It's a container with a table of contents that tells the loader exactly how to set up memory before jumping to the first instruction.

## The View from 10,000 Feet

Every ELF file has three major structures:

```
┌──────────────────────────────────────────────┐
│                 ELF Header                    │  ← 64 bytes (always at offset 0)
│  Magic number, arch, entry point,             │
│  program header table offset,                 │
│  section header table offset                  │
├──────────────────────────────────────────────┤
│           Program Header Table                │  ← array of Phdr entries
│  Segment 0: LOAD, offset, vaddr, size, flags │     (used for LOADING)
│  Segment 1: LOAD, offset, vaddr, size, flags │
│  ...                                          │
├──────────────────────────────────────────────┤
│              Segment Data                     │  ← the actual bytes
│  .text (code), .rodata, .data, etc.          │
├──────────────────────────────────────────────┤
│           Section Header Table                │  ← array of Shdr entries
│  .text, .rodata, .data, .bss, .symtab, ...  │     (used for LINKING/DEBUG)
└──────────────────────────────────────────────┘
```

Two parallel views of the same file:
- **Program headers** (segments): how the OS *loads* the program. "Put these bytes at this virtual address with these permissions."
- **Section headers** (sections): how the linker and debugger *understand* the program. "This range is `.text`, this range is `.data`."

For loading a program into memory, we only need the **program headers**. Section headers are optional for execution — you can strip them and the program still runs. GooseOS's ELF loader will read program headers and ignore section headers entirely.

## The ELF Header (64 bytes)

Every ELF file starts with a 64-byte header (for 64-bit ELF). This is the master record:

```
Offset  Size  Field            Description
────────────────────────────────────────────────────────────────
0x00    4     e_ident[0..3]    Magic: 0x7F 'E' 'L' 'F'
0x04    1     e_ident[4]       Class: 1=32-bit, 2=64-bit
0x05    1     e_ident[5]       Endianness: 1=little, 2=big
0x06    1     e_ident[6]       ELF version: 1
0x07    1     e_ident[7]       OS/ABI: 0=SYSV (generic Unix)
0x08    8     e_ident[8..15]   Padding (zeroes)
0x10    2     e_type           Type: 2=ET_EXEC (executable)
0x12    2     e_machine        Architecture: 0xF3=RISC-V
0x14    4     e_version        Version: 1
0x18    8     e_entry          Entry point virtual address
0x20    8     e_phoff          Program header table offset
0x28    8     e_shoff          Section header table offset
0x30    4     e_flags          Processor-specific flags
0x34    2     e_ehsize         This header's size (64)
0x36    2     e_phentsize      Program header entry size (56)
0x38    2     e_phnum          Number of program headers
0x3A    2     e_shentsize      Section header entry size (64)
0x3C    2     e_shnum          Number of section headers
0x3E    2     e_shstrndx       Section name string table index
```

The fields GooseOS cares about:

| Field | Why we need it |
|-------|---------------|
| `e_ident[0..3]` | Validate it's actually ELF (magic bytes) |
| `e_ident[4]` | Must be 2 (64-bit) for RISC-V 64 |
| `e_ident[5]` | Must be 1 (little-endian) for RISC-V |
| `e_machine` | Must be 0xF3 (RISC-V) |
| `e_entry` | Where to set `sepc` — first instruction |
| `e_phoff` | Where the program headers start in the file |
| `e_phnum` | How many program headers to read |
| `e_phentsize` | Size of each program header entry |

Everything else we can ignore. Section headers, flags, version — irrelevant for loading.

> :nerdygoose: The magic bytes `0x7F 'E' 'L' 'F'` are the first thing any ELF loader checks. If those four bytes don't match, stop immediately — it's not an ELF file. This is the same check that Linux's `load_elf_binary()` does at the top of `fs/binfmt_elf.c`. Three more validation checks (class, endianness, machine) confirm the binary is for our specific architecture. Only then do we trust the rest of the header.

## The Program Header (56 bytes per entry)

Each program header describes one **segment** — a contiguous region of the file that should be loaded into memory:

```
Offset  Size  Field       Description
────────────────────────────────────────────────────────────
0x00    4     p_type      Segment type (1=PT_LOAD)
0x04    4     p_flags     Permissions (R=4, W=2, X=1)
0x08    8     p_offset    Offset of segment data in file
0x10    8     p_vaddr     Virtual address to load at
0x18    8     p_paddr     Physical address (usually = vaddr)
0x20    8     p_filesz    Size of segment data in file
0x28    8     p_memsz     Size of segment in memory
0x30    8     p_align     Alignment (usually page size)
```

The key fields:

| Field | What it means |
|-------|--------------|
| `p_type` | Only care about `PT_LOAD` (1). Skip everything else. |
| `p_flags` | `PF_R=4`, `PF_W=2`, `PF_X=1`. Tells us page permissions. |
| `p_offset` | Where in the ELF file the segment data starts. |
| `p_vaddr` | Where to put it in virtual memory. |
| `p_filesz` | How many bytes to copy from the file. |
| `p_memsz` | How much memory the segment occupies (may be larger than filesz). |

### The filesz vs memsz Trick

`p_memsz >= p_filesz` always. When `p_memsz > p_filesz`, the extra bytes are **zero-filled**. This is how BSS works:

```
ELF file:
  ┌───────────────────────────┐
  │ .data: initialized values │  ← p_filesz bytes
  └───────────────────────────┘

Memory (after loading):
  ┌───────────────────────────┬──────────────────┐
  │ .data: initialized values │ .bss: all zeroes  │
  │ (copied from file)        │ (not in file!)    │
  └───────────────────────────┴──────────────────┘
  ◄──────── p_filesz ────────►◄── memsz-filesz ──►
  ◄──────────────── p_memsz ──────────────────────►
```

The BSS section doesn't exist in the file — that would waste disk space storing thousands of zeroes. Instead, the program header says "this segment is 8KB in memory but only 4KB in the file." The loader copies 4KB and zeroes the remaining 4KB. Elegant, compact, and universal.

> :surprisedgoose: A "hello world" in C might have 100 bytes of code and 4KB of BSS (for the standard library's buffers). Without the filesz/memsz optimization, the ELF file would be 4KB larger — mostly zeroes. For embedded systems where flash storage is precious, this matters. For GooseOS loading programs from a tiny SD card partition, it matters even more.

## A Real Example: RISC-V ELF

Let's look at what `readelf` shows for a typical RISC-V binary:

```
$ readelf -h hello-rv64

ELF Header:
  Magic:   7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00
  Class:                             ELF64
  Data:                              2's complement, little endian
  Version:                           1 (current)
  OS/ABI:                            UNIX - System V
  Type:                              EXEC (Executable file)
  Machine:                           RISC-V
  Version:                           0x1
  Entry point address:               0x10000
  Start of program headers:          64 (bytes into file)
  Start of section headers:          4528 (bytes into file)
  Flags:                             0x5, RVC, double-float ABI
  Size of this header:               64 (bytes)
  Size of program headers:           56 (bytes)
  Number of program headers:         2
  Size of section headers:           64 (bytes)
  Number of section headers:         12
  Section header string table index: 11
```

And the program headers:

```
$ readelf -l hello-rv64

Program Headers:
  Type    Offset   VirtAddr           PhysAddr           FileSiz  MemSiz   Flg  Align
  LOAD    0x001000 0x0000000000010000 0x0000000000010000 0x000120 0x000120 R E  0x1000
  LOAD    0x002000 0x0000000000011000 0x0000000000011000 0x000018 0x000050 RW   0x1000

 Section to Segment mapping:
  Segment Sections...
   00     .text
   01     .data .bss
```

Two LOAD segments:
1. **Code segment**: load 0x120 bytes from file offset 0x1000 to VA 0x10000, permissions R+E
2. **Data segment**: load 0x18 bytes from file offset 0x2000 to VA 0x11000, permissions R+W. But memsz is 0x50 — so 0x38 bytes of BSS get zeroed.

This is all the loader needs. Two segments, two `memcpy` operations, one `memset` for BSS, done.

## ELF Loading Algorithm

Here's the algorithm GooseOS's SYS_SPAWN will implement:

```
load_elf(elf_data):
    # 1. Validate header
    if elf[0..4] != [0x7f, 'E', 'L', 'F']:  error
    if elf[4] != 2:                          error  # not 64-bit
    if elf[5] != 1:                          error  # not little-endian
    if elf.e_machine != 0xF3:                error  # not RISC-V

    entry = elf.e_entry

    # 2. Create new page table
    root = alloc_page()
    map_kernel_regions(root)

    # 3. Process each program header
    for phdr in elf.program_headers:
        if phdr.p_type != PT_LOAD:
            continue

        # Determine page permissions from p_flags
        if phdr.p_flags & PF_X:
            flags = USER_RX
        else:
            flags = USER_RW

        # Allocate pages for this segment
        num_pages = ceil(phdr.p_memsz / PAGE_SIZE)
        for each page:
            page = alloc_page()
            zero_page(page)
            map_page(root, vaddr, page, flags)

        # Copy file data into mapped pages
        memcpy(phdr.p_vaddr, elf_data + phdr.p_offset, phdr.p_filesz)
        # Remaining bytes (BSS) already zeroed by alloc

    # 4. Allocate stack
    stack_page = alloc_page()
    map_page(root, STACK_VADDR, stack_page, USER_RW)

    # 5. Set up process context
    process.sepc = entry
    process.sp = STACK_VADDR + PAGE_SIZE
    process.satp = make_satp(root, pid)
```

Five steps: validate, create page table, load segments, set up stack, initialize context. Each step uses primitives we already have — `alloc_page()`, `map_page()`, `zero_page()`. SYS_SPAWN is composition, not invention.

## ELF Structures in Rust

Here's how the ELF structures look as Rust types:

```rust
/// ELF64 file header — always at offset 0.
#[repr(C)]
pub struct Elf64Header {
    pub e_ident:     [u8; 16],   // Magic + class + endian + version + padding
    pub e_type:      u16,        // ET_EXEC=2
    pub e_machine:   u16,        // EM_RISCV=0xF3
    pub e_version:   u32,        // 1
    pub e_entry:     u64,        // Entry point VA
    pub e_phoff:     u64,        // Program header table offset
    pub e_shoff:     u64,        // Section header table offset (ignored)
    pub e_flags:     u32,        // Processor flags
    pub e_ehsize:    u16,        // This header size (64)
    pub e_phentsize: u16,        // Program header entry size (56)
    pub e_phnum:     u16,        // Number of program headers
    pub e_shentsize: u16,        // Section header entry size
    pub e_shnum:     u16,        // Number of section headers
    pub e_shstrndx:  u16,        // Section name string table index
}

/// ELF64 program header — describes one loadable segment.
#[repr(C)]
pub struct Elf64Phdr {
    pub p_type:   u32,    // PT_LOAD=1
    pub p_flags:  u32,    // PF_R=4, PF_W=2, PF_X=1
    pub p_offset: u64,    // File offset of segment data
    pub p_vaddr:  u64,    // Virtual address to load at
    pub p_paddr:  u64,    // Physical address (usually = vaddr)
    pub p_filesz: u64,    // Bytes in file
    pub p_memsz:  u64,    // Bytes in memory (>= filesz)
    pub p_align:  u64,    // Alignment
}
```

Both are `#[repr(C)]` — the Rust compiler lays them out exactly as the ELF spec dictates. No padding, no reordering. We can cast a raw pointer to these structs and read the fields directly.

> :angrygoose: Casting raw pointers to `#[repr(C)]` structs is `unsafe` in Rust for good reason: alignment, validity, and lifetime are all on you. The ELF data might be malformed, truncated, or maliciously crafted. Every field read is a trust boundary. GooseOS's loader must validate before trusting: check magic bytes, check sizes are within bounds, check segment addresses don't overlap kernel memory. A single unchecked `p_vaddr` from a malicious ELF could map over kernel code and escalate to S-mode. Trust nothing from user-provided data.

## ELF vs Other Formats

| Format | Used by | Metadata | Simplicity |
|--------|---------|----------|------------|
| Raw binary | Firmware, GooseOS (current) | None | Trivial — but no relocations, no entry point |
| ELF | Linux, FreeBSD, GooseOS (next) | Full | Two struct reads + memcpy |
| PE/COFF | Windows | Full | More complex headers, DOS stub |
| Mach-O | macOS/iOS | Full | Fat binaries, code signing |
| WASM | Browsers, GooseOS (future) | Full | Stack machine, portable |

ELF is the sweet spot: enough metadata to load correctly, simple enough to parse in 100 lines of Rust. PE has historical baggage (DOS headers). Mach-O has Apple-specific complexity. WASM is portable but needs an interpreter. ELF gives us native execution with minimal parsing overhead.

## What the Loader Doesn't Need

Things GooseOS's ELF loader can safely ignore:

- **Section headers**: only needed for linking and debugging
- **Dynamic linking**: no shared libraries, everything is statically linked
- **Relocations**: programs are compiled for fixed virtual addresses
- **Symbol tables**: no runtime symbol lookup
- **Debug info**: no kernel debugger (yet)
- **PHDR/INTERP/NOTE segments**: only PT_LOAD matters
- **TLS (thread-local storage)**: single-threaded processes

By ignoring all of this, the loader stays small — under 100 lines. Parse the header, iterate program headers, copy segments, done. The complexity of a full ELF loader (like glibc's `ld.so`) comes from dynamic linking, which we don't support and don't need.

> :happygoose: Linux's ELF loader in `fs/binfmt_elf.c` is about 2,000 lines. Ours will be about 80. The difference? Linux handles dynamic linking, core dumps, ASLR, interpreter loading, VDSO injection, audit hooks, security modules, personality flags, and backwards compatibility with every ELF variant since 1999. We load static binaries into user page tables. Sometimes less is more.
