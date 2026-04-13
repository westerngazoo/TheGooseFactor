# Appendix B: Debugging GooseOS — A Practical Guide

Debugging a bare-metal OS has no `println` until you build `println`. No debugger until you set up JTAG or GDB. No stack trace until your trap handler is stable. This appendix documents the real techniques we used to find and fix bugs in GooseOS, with actual session transcripts.

## The Debugging Toolkit

### 1. Kernel println! (Your Best Friend)

Once UART works (Phase 2), `println!` is the primary debugging tool. Unlike application debugging, you can't set breakpoints from inside the kernel — but you can print state at key moments.

```rust
pub fn sys_call(frame: &mut TrapFrame) {
    let current = unsafe { CURRENT_PID };
    let target = frame.a0;
    let msg = frame.a1;
    println!("  [debug] PID {} SYS_CALL target={} msg={:#x}", current, target, msg);
    // ... rest of handler ...
}
```

**When to use:** Always start here. Add prints at function entry, before and after state changes, at branch points. Remove them when the bug is found.

**Limitations:** If UART itself is broken, println won't help. If the bug corrupts the stack before reaching a println, you'll see nothing. If the bug is a race condition, the println timing may hide it.

### 2. QEMU with Timeout

The `make test` target runs QEMU with a 5-second timeout:

```bash
$ make test
timeout 5 qemu-system-riscv64 -machine virt -nographic -bios default -kernel target/.../goose-os || true
```

If the kernel panics, you see the panic message. If it hangs (infinite loop, deadlock), the timeout kills it. If it works, you see normal output for 5 seconds.

**Pattern:** Make a change, run `make test`, read the output. Repeat. This is the inner loop of OS development.

### 3. QEMU GDB Stub

For hard bugs where println isn't enough:

```bash
# Terminal 1: start QEMU paused, waiting for GDB
$ make debug
qemu-system-riscv64 -machine virt -nographic -bios default -kernel target/.../goose-os -s -S

# Terminal 2: connect GDB
$ gdb-multiarch target/riscv64gc-unknown-none-elf/release/goose-os
(gdb) target remote :1234
(gdb) break kmain
(gdb) continue
```

Useful GDB commands for OS debugging:

```
(gdb) info registers           # dump all GPRs
(gdb) p/x $sepc                # supervisor exception PC
(gdb) p/x $scause              # why we trapped
(gdb) p/x $satp                # page table root
(gdb) x/32x $sp                # examine stack
(gdb) x/10i $sepc              # disassemble at trap PC
(gdb) watch *0x80208000        # break on memory write (slow but powerful)
```

### 4. QEMU Monitor

Press `Ctrl-A, C` in QEMU to enter the monitor:

```
(qemu) info registers          # QEMU's view of ALL registers
(qemu) xp/16x 0x80200000       # examine physical memory
(qemu) info mtree               # memory map — see all MMIO regions
```

This is invaluable when debugging page table issues — you can see physical memory directly, bypassing the MMU.

### 5. objdump — Reading the Binary

When instruction encoding matters (compressed instructions, PC-relative offsets):

```bash
$ riscv64-linux-gnu-objdump -d target/riscv64gc-unknown-none-elf/release/goose-os | less
```

Or from the Rust toolchain:

```bash
$ make objdump
```

This shows you the exact bytes the CPU will execute. Critical when dealing with the C extension (compressed instructions) or inline assembly.

## Real Debugging Sessions

### Session 1: The Silent Kernel (UART VA Collision)

**Build 40 → 41.** Phase 13: adding userspace UART server.

**Symptom:** After "Launching PID 1." — nothing. No output, no panic, no hang. The kernel just went silent.

**What we expected:**
```
  [proc] Launching PID 1 (init)...

Hello from userspace UART!
```

**What we got:**
```
  [proc] Launching PID 1 (init)...

<nothing>
```

**Investigation:**

Step 1: Add println between every operation in `launch()`:

```rust
println!("A: before create_process(1)");
create_process(1, init_start, init_size);
println!("B: after create_process(1)");
create_process(2, uart_start, uart_size);
println!("C: after create_process(2)");

// Map UART MMIO into PID 2
const UART_VA: usize = 0x10000000;
kvm::map_user_page(root2, UART_VA, platform::UART_BASE, USER_MMIO);
println!("D: after mapping UART");
```

**Output:**
```
A: before create_process(1)
B: after create_process(1)
C: after create_process(2)
<nothing — println D never appeared>
```

Step 2: The `map_user_page` call killed println. But it didn't panic — it just silently failed. Why?

Step 3: Look at what we mapped:
```rust
const UART_VA: usize = 0x10000000;  // same as kernel UART!
kvm::map_user_page(root2, UART_VA, platform::UART_BASE, USER_MMIO);
```

We mapped the UART at VA `0x10000000` — but the kernel already maps UART at `0x10000000` with `KERNEL_MMIO` flags (no U bit). We overwrote the kernel's UART mapping with `USER_MMIO` (with U bit set).

Now when the kernel tries to println (in S-mode), it accesses `0x10000000`, but the page has the U (user) bit set. S-mode cannot access U-bit pages unless the SUM (Supervisor User Memory) bit is set in `sstatus`. We don't set SUM. So the access silently fails — no exception (it's a store to MMIO that just doesn't go through), no output.

**Fix:** Map user UART at a different virtual address:

```rust
const UART_USER_VA: usize = 0x5E00_0000;  // user VA, different from kernel
kvm::map_user_page(root2, UART_USER_VA, platform::UART_BASE, USER_MMIO);
```

Both VAs (kernel `0x10000000` and user `0x5E000000`) map to the same physical UART at `0x10000000`. Kernel keeps its mapping, server gets its own.

**Lesson:** MMIO mappings are not like RAM — overwriting a page table entry for an MMIO address can silently break another privilege level's access. Always use separate VAs for kernel and user access to the same physical device.

**Time to fix:** ~20 minutes. Would have been 2 minutes with the SUM-bit knowledge upfront.

---

### Session 2: "pace UART!" (Compressed Instruction Offset)

**Build 41 → 42.** Init process sending greeting to UART server.

**Symptom:** Partial string output.

**Expected:**
```
Hello from userspace UART!
```

**Got:**
```
pace UART!
```

"pace UART!" is the tail of "Hello from userspace UART!" starting at byte 16.

**Investigation:**

Step 1: The init code used `auipc` to find the string:

```asm
auipc   s0, 0           # s0 = current PC
addi    s0, s0, 56      # s0 = PC + 56 (hardcoded offset to string)
```

The offset 56 was calculated by hand: 14 instructions x 4 bytes = 56 bytes from the auipc to the `.hello_str` label.

Step 2: But we're building with `riscv64gc` — the C extension! Let's check the actual binary:

```bash
$ riscv64-linux-gnu-objdump -d target/.../goose-os | grep -A 20 "_user_init_start"
```

Output:
```
_user_init_start:
  c.li      a7, 4          # 2 bytes (compressed!)
  c.li      a0, 2          # 2 bytes (compressed!)
  mv        a1, t0         # 4 bytes
  ecall                    # 4 bytes
  c.addi    s0, 1          # 2 bytes (compressed!)
  j         .init_send_loop # 4 bytes
  ...
```

Several `li` and `addi` instructions were compressed from 4 bytes to 2 bytes. The actual code was 40 bytes, not 56. The string pointer was 16 bytes past the string start: `56 - 40 = 16`. And "Hello from userspace UART!" starting at byte 16 is... "pace UART!" (the "s" from "userspace" is at byte 15, the space is 16).

**Fix:** Use assembler-computed PC-relative relocations:

```asm
1:  auipc   s0, %pcrel_hi(.hello_str)
    addi    s0, s0, %pcrel_lo(1b)
```

The assembler computes the correct offset at link time, regardless of instruction compression. The `%pcrel_hi` and `%pcrel_lo` pair handle the 20-bit upper + 12-bit lower split of the offset.

**Lesson:** Never hardcode PC-relative offsets in assembly when targeting `riscv64gc`. The C extension compresses some instructions to 2 bytes unpredictably (depends on register numbers and immediate values). Always use `%pcrel_hi/%pcrel_lo` relocations.

**Time to fix:** ~30 minutes. The partial string output was the key clue — once we counted the offset, the cause was obvious.

---

### Session 3: The if/else Result Bug (WASM Interpreter)

**Phase 15.** WASM interpreter, first test run.

**Symptom:** `test_if_true` fails — returns 0 instead of 42.

**Test code (WASM bytecode):**
```
i32.const 1          # condition: true
if (result i32)      # if block produces i32
  i32.const 42       # true branch
else
  i32.const 0        # false branch
end
end                  # function end
```

**Expected:** 42 (true branch)
**Got:** 0 (false branch value?!)

**Investigation:**

The `skip_to_end()` function was designed to find the end of a block. But it had this logic:

```rust
op::ELSE => {
    if depth == 1 {
        return Ok(()); // found our else — STOP HERE
    }
}
```

This was the problem. When `IF` called `skip_to_end()` to find the block's end (for the label's `target_pc`), it stopped at `ELSE` instead of continuing to `END`. So `target_pc` pointed to the start of the else body.

When the true branch executed `i32.const 42` and then hit `ELSE`, the handler jumped to `target_pc` — which was the else body. So it executed `i32.const 0` too, overwriting 42 on the stack.

**Fix:** `skip_to_end()` should skip past `ELSE` and find the real `END`:

```rust
// Before (broken):
op::ELSE => {
    if depth == 1 {
        return Ok(());  // WRONG: stops at else
    }
}

// After (fixed):
// ELSE is just part of the block — skip over it
// (no special handling needed)
```

**Lesson:** When parsing control flow in a bytecode interpreter, `ELSE` is not a block boundary — it's an instruction within the `IF` block. The block ends at `END`. Getting this wrong means the label's branch target is wrong, and control flow silently goes to the wrong place.

**Time to fix:** ~10 minutes. The test name told us exactly which opcode to look at.

---

### Session 4: Process Preemption Corruption (Phase 12)

**Build 36.** Timer-driven preemptive scheduling.

**Symptom:** After adding timer preemption, the spinner process (a delay loop) would occasionally jump to a wrong address and fault. The init process worked fine.

**Investigation:**

Step 1: The spinner's delay loop used `t0` as a counter:

```asm
.spinner_delay:
    li      t0, 5000000
.delay_loop:
    addi    t0, t0, -1
    bnez    t0, .delay_loop
```

Step 2: In `trap.S`, the register save sequence was:

```asm
csrr    t0, sscratch       # t0 = original sp (CLOBBERS t0!)
sd      t0, 0x08(sp)       # save original sp
sd      x5, 0x20(sp)       # save t0... but it's already clobbered!
```

We used `t0` as a temp to read `sscratch`, but saved `t0` *after* clobbering it. The process's actual `t0` value (the loop counter) was lost. When the process resumed, `t0` had the `sscratch` value instead of the delay counter.

Without preemption, this didn't matter — ecalls save/restore explicitly. But with timer interrupts, the process could be preempted *at any instruction*, including mid-delay-loop.

**Fix:** Save `t0` BEFORE using it as a temp:

```asm
sd      x5, 0x20(sp)       # save t0 FIRST — before we clobber it
csrr    t0, sscratch        # NOW use t0 as temp
sd      t0, 0x08(sp)        # save original sp
```

**Lesson:** In trap entry code, the order of register saves is critical. Any register used as a temp must be saved *before* it's clobbered. This is why trap.S has a comment block: "CRITICAL: Save t0 BEFORE using it as a temp register."

---

## Debugging Checklist

When something goes wrong in GooseOS, work through this list:

1. **Does it println?** Add prints at function entry. If a print doesn't appear, the bug is *before* that point (or the UART is broken).

2. **Does it panic?** If yes, the panic handler gives you file:line:column. Read that code.

3. **Does it hang?** Infinite loop or deadlock. Use QEMU timeout. Add prints inside loops to find which one. Check for processes that are all BlockedRecv with no one to send.

4. **Wrong output?** Count bytes. Partial strings mean wrong pointer offsets. Wrong values mean wrong register usage or stack corruption.

5. **Works on QEMU, fails on VF2?** Platform-specific issue:
   - Check UART register stride (1 on QEMU, 4 on VF2)
   - Check IRQ number (10 on QEMU, 32 on VF2)
   - Check PLIC context (1 on QEMU, 3 on VF2)
   - Check kernel load address (0x80200000 on QEMU, 0x40200000 on VF2)

6. **Intermittent failure?** Race condition or preemption bug. Check trap.S register save order. Check that all state is saved before any temp register is used.

7. **Silent failure (no output, no panic)?** Page table issue. Check if a mapping was overwritten. Check privilege bits (U bit vs no U bit). Use QEMU monitor `xp` to examine physical memory directly.

## VisionFive 2 Hardware Debugging

When QEMU works but VF2 doesn't:

1. **Serial output** — Use TeraTerm at 115200 baud, 8N1. If you see U-Boot but not GooseOS, the kernel isn't loading correctly.

2. **U-Boot `md` command** — Before `go`, examine memory to verify the kernel is where you think it is:
   ```
   StarFive # md 0x40200000 4
   40200000: 00000297 02828293 30529073 ...
   ```
   First bytes should be the `_start` entry point (auipc + jump).

3. **LED/GPIO** — When UART itself is broken, toggle a GPIO pin in `_start` before any complex initialization. If the LED blinks, the CPU is alive.

4. **Build number** — Always check the build number in the banner matches what you deployed. A stale `kernel.bin` on the SD card is the most common VF2 "bug."
