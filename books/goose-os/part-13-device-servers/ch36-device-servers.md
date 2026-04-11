---
sidebar_position: 1
sidebar_label: "Ch 36: Device Servers"
title: "Chapter 36: Device Servers — Drivers Leave the Kernel"
---

# Chapter 36: Device Servers — Drivers Leave the Kernel

In a monolithic kernel, the UART driver lives inside the kernel. It has direct access to hardware registers, handles interrupts, and runs at the highest privilege level. Every bug in the driver is a kernel bug. Every crash in the driver crashes the machine.

In a microkernel, the driver moves to userspace. It becomes a *device server* — an ordinary process that happens to have permission to talk to hardware. If it crashes, the kernel is fine. Restart it and move on.

This chapter moves GooseOS's UART driver out of the kernel and into PID 2.

## The Architecture

The kernel keeps exactly three responsibilities for device I/O:

1. **PLIC management** — claim and complete interrupt cycles
2. **IRQ routing** — deliver interrupts to the owning process via IPC
3. **Page table setup** — map device MMIO into the server's address space

Everything else — register programming, data transfer, protocol handling — lives in userspace.

```
Before (Phase 12):
  +-----------------------------+
  |         KERNEL              |
  |  UART driver                |
  |  PLIC handler               |
  |  println! -> THR direct     |
  +-----------------------------+

After (Phase 13):
  +--------------+  +--------------+
  |  UART Server |  |  init (PID1) |
  |   (PID 2)    |  |              |
  |  IER, THR,   |  |  SYS_CALL    |
  |  LSR access  |  |  (2, char)   |
  +------+-------+  +------+-------+
         |  IPC            |  IPC
  +------+-----------------+-------+
  |            KERNEL              |
  |  IRQ routing only              |
  |  PLIC claim/complete           |
  |  println! for boot/panic       |
  +--------------------------------+
```

## Two New Syscalls

Phase 13 adds two syscalls to the GooseOS interface:

| #  | Name             | Convention        | Purpose                          |
|----|------------------|-------------------|----------------------------------|
| 14 | SYS_IRQ_REGISTER | a0 = IRQ number   | Claim ownership of a hardware IRQ |
| 15 | SYS_IRQ_ACK      | (none)            | Complete the PLIC cycle           |

### SYS_IRQ_REGISTER

A process calls this to claim a specific IRQ number. The kernel records the mapping in a global table:

```rust
const MAX_IRQS: usize = 64;
static mut IRQ_OWNER: [usize; MAX_IRQS] = [0; MAX_IRQS];

pub fn sys_irq_register(frame: &mut TrapFrame) {
    frame.sepc += 4;
    let current = unsafe { CURRENT_PID };
    let irq = frame.a0 as u32;

    unsafe {
        if IRQ_OWNER[irq as usize] != 0 {
            frame.a0 = usize::MAX; // already claimed
            return;
        }
        IRQ_OWNER[irq as usize] = current;
        PROCS[current].irq_num = irq;
    }
    frame.a0 = 0;
}
```

Only one process can own an IRQ at a time. This is the "exclusive ownership" model — simple and sufficient for our hardware.

### SYS_IRQ_ACK

After a device server handles an interrupt, it must acknowledge it. This completes the PLIC claim/complete cycle and allows the next interrupt of the same type to fire:

```rust
pub fn sys_irq_ack(frame: &mut TrapFrame) {
    frame.sepc += 4;
    let irq = unsafe { PROCS[CURRENT_PID].irq_num };
    crate::plic::complete(irq);
    frame.a0 = 0;
}
```

Without this, the PLIC suppresses the IRQ forever. This is intentional — it prevents interrupt storms while the server processes the previous one.

## IRQ Delivery via IPC

When a registered IRQ fires, the kernel delivers it as a synthetic IPC message. The device server doesn't need special interrupt handling code — it just calls `SYS_RECEIVE` and checks if the sender is PID 0 (the kernel).

```rust
pub fn irq_notify(irq: u32, owner: usize) {
    unsafe {
        if PROCS[owner].state == ProcessState::BlockedRecv {
            // Deliver immediately
            PROCS[owner].context.a0 = irq as usize;  // message = IRQ number
            PROCS[owner].context.a1 = 0;              // sender = kernel (PID 0)
            PROCS[owner].state = ProcessState::Ready;
        } else {
            // Server is busy -- mark pending
            PROCS[owner].irq_pending = true;
        }
    }
}
```

Two cases:

**Server is waiting (BlockedRecv):** The interrupt arrives while the server is blocked on `SYS_RECEIVE`. The kernel writes the IRQ number into the server's saved `a0` register and the sender (0 = kernel) into `a1`. The server wakes up and handles it immediately.

**Server is busy:** The interrupt arrives while the server is processing a previous request (writing to the UART, handling another client). The kernel sets `irq_pending = true`. When the server next calls `SYS_RECEIVE`, the pending flag is checked *before* scanning for blocked senders:

```rust
// In sys_receive, before the sender scan:
if PROCS[current].irq_pending && (from_pid == 0) {
    PROCS[current].irq_pending = false;
    frame.a0 = PROCS[current].irq_num as usize;
    frame.a1 = 0;  // sender = kernel
    return;
}
```

This is the same model seL4 uses for interrupt notifications. Interrupts become messages. No special API, no callback registration, no signal handlers. The server's main loop is just a `SYS_RECEIVE` loop that handles both client requests and hardware events.

## The IRQ Routing Change

The kernel's `handle_external` function — the PLIC interrupt dispatcher — gains an ownership check:

```rust
fn handle_external(frame: &mut TrapFrame) {
    let irq = plic::claim();
    if irq == 0 { return; }

    let owner = crate::process::irq_owner(irq);
    if owner != 0 {
        // Userspace owns this IRQ -- deliver via IPC
        crate::process::irq_notify(irq, owner);
        // DON'T complete -- server must SYS_IRQ_ACK
        return;
    }

    // Kernel fallback (no owner registered yet)
    match irq {
        UART0_IRQ => crate::uart::handle_interrupt(),
        _ => println!("[plic] unhandled IRQ: {}", irq),
    }
    plic::complete(irq);
}
```

Before the UART server registers, UART interrupts flow to the kernel handler (keyboard echo during boot). After registration, they flow to the server. The transition is seamless.

## The Dual-VA Mapping Trick

Here's a subtle problem. The UART server needs U-mode access to UART registers at physical address 0x10000000. The obvious approach: map VA 0x10000000 with `USER_MMIO` flags (U bit set).

But `map_kernel_regions()` already maps VA 0x10000000 with `KERNEL_MMIO` (no U bit) in every user page table. If we overwrite that mapping with `USER_MMIO`, the kernel loses access — `println!` faults during PID 2's syscalls because S-mode can't access U-bit pages.

The fix: map the same physical UART at a *different* virtual address for the server.

```rust
const UART_USER_VA: usize = 0x5E00_0000;
kvm::map_user_page(root2, UART_USER_VA, platform::UART_BASE, USER_MMIO);
```

Now PID 2's page table has two mappings for the same physical device:

| Virtual Address | Physical Address | Flags | Who uses it |
|----------------|-----------------|-------|-------------|
| 0x10000000 | 0x10000000 | KERNEL_MMIO (no U) | Kernel println! |
| 0x5E000000 | 0x10000000 | USER_MMIO (with U)  | UART server |

Both work simultaneously. The kernel prints via 0x10000000, the server reads/writes via 0x5E000000, and the physical UART sees both — it doesn't care what virtual address was used.

## Kernel Idle Mode

Phase 12 had a simple model: when all processes exit, the kernel enters an interactive idle loop. Phase 13 changes this. The UART server never exits — it runs forever, handling keyboard input. But after init exits, the server is the only process, and it's blocked on `SYS_RECEIVE`.

No Ready processes. No one to schedule. But the system is alive — the server will wake when a UART interrupt arrives.

GooseOS now has a proper kernel idle:

```rust
pub extern "C" fn kernel_idle() -> ! {
    loop {
        unsafe { asm!("wfi"); }
    }
}
```

The idle loop executes WFI (Wait For Interrupt), which halts the hart until an interrupt fires. When a UART IRQ arrives:

1. `handle_external` -> `irq_notify` -> UART server becomes Ready
2. Next timer tick -> `handle_timer` -> `schedule_from_idle` -> switch to server
3. trap.S restores the server's context -> `sret` to U-mode
4. The kernel idle loop never resumes — it was "preempted" by the interrupt

This is the same pattern real microkernels use. The idle "task" is just the kernel with nothing to do, waiting for the world to need it again.

## The Updated Syscall Table

Phase 13 brings GooseOS to 16 syscalls. The original blueprint planned SYS_IRQ_REGISTER as #16 and SYS_IRQ_ACK as #17. We moved them to #14 and #15 because we skipped SYS_SET_TIMER and SYS_GRANT — preemptive scheduling (Phase 12) used kernel-internal timers, and page sharing isn't needed yet.

```
+-----+------------------+-----------------------------+----------+
|  #  |  Name            |  Purpose                    |  Done    |
+-----+------------------+-----------------------------+----------+
|  0  |  SYS_PUTCHAR     |  Debug output (1 byte)      |  Ph 7    |
|  1  |  SYS_EXIT        |  Terminate process          |  Ph 7    |
|  2  |  SYS_SEND        |  Sync send (blocks)         |  Ph 7    |
|  3  |  SYS_RECEIVE     |  Sync receive (blocks)      |  Ph 7    |
|  4  |  SYS_CALL        |  RPC (Send + wait Reply)    |  Ph 9    |
|  5  |  SYS_REPLY       |  Server replies to caller   |  Ph 9    |
|  6  |  SYS_MAP         |  Map phys page to virt      |  Ph 10   |
|  7  |  SYS_UNMAP       |  Remove page mapping        |  Ph 10   |
|  8  |  SYS_ALLOC_PAGES |  Allocate N phys pages      |  Ph 10   |
|  9  |  SYS_FREE_PAGES  |  Return pages to kernel     |  Ph 10   |
| 10  |  SYS_SPAWN       |  Create process from ELF    |  Ph 11   |
| 11  |  SYS_WAIT        |  Block until child exits    |  Ph 11   |
| 12  |  SYS_GETPID      |  Query own PID              |  Ph 11   |
| 13  |  SYS_YIELD       |  Voluntary preemption       |  Ph 12   |
| 14  |  SYS_IRQ_REGISTER|  Claim hardware IRQ         |  Ph 13   |
| 15  |  SYS_IRQ_ACK     |  Acknowledge IRQ handled    |  Ph 13   |
+-----+------------------+-----------------------------+----------+
```

16 syscalls implemented. The remaining two from the blueprint (SYS_SET_TIMER and SYS_GRANT) may appear later, or they may not be needed. The architecture adapts.
