---
sidebar_position: 2
sidebar_label: "Ch 6: Panic Handler"
title: "Chapter 6: The Panic Handler — When Things Go Wrong"
---

# Chapter 6: The Panic Handler — When Things Go Wrong

In Part 1, our panic handler was this:

```rust
#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    loop { unsafe { asm!("wfi") }; }
}
```

Silent death. The underscore in `_info` means we're throwing away the *exact error message and location*. That's like disconnecting your car's dashboard warning lights. Now that we have `println!`, let's fix this.

## The Upgraded Panic Handler

```rust
#[panic_handler]
fn panic(info: &core::panic::PanicInfo) -> ! {
    println!();
    println!("!!! KERNEL PANIC !!!");

    if let Some(location) = info.location() {
        println!(
            "  at {}:{}:{}",
            location.file(),
            location.line(),
            location.column()
        );
    }

    if let Some(message) = info.message().as_str() {
        println!("  {}", message);
    } else {
        println!("  {}", info.message());
    }

    println!();
    println!("System halted.");

    loop { unsafe { asm!("wfi") }; }
}
```

Now when something panics:

```
!!! KERNEL PANIC !!!
  at src/main.rs:53:5
  this is a test panic — everything is fine!

System halted.
```

> :happygoose: File, line, column, and the panic message. When your kernel crashes at 2 AM, this is the difference between "I have no idea what happened" and "oh, line 53, I see the bug."

> :angrygoose: `PanicInfo` gives you `location()` (file/line) and `message()` (the formatted string from `panic!("...")` or the automatic message from array bounds, `unwrap()`, etc.). Both return `Option` because theoretically the compiler can strip them. In practice, with `panic = "abort"`, they're always present in debug and release builds.

## Testing It

We deliberately trigger a panic to verify the handler works:

```rust
println!("Testing panic handler in 3... 2... 1...");
panic!("this is a test panic — everything is fine!");
```

> :sarcasticgoose: Yes, we intentionally crashed our own OS. This is called "testing." You'd be amazed how many kernel developers skip this step and only discover their panic handler is broken when they actually need it. Test your error paths *before* they're the only output you have.

## The `message()` API

`PanicInfo::message()` returns a `fmt::Arguments`, which you can print directly. We try `as_str()` first — if the panic message is a simple string literal, this returns it without needing the formatting machinery. Otherwise, we print the full `fmt::Arguments`:

```rust
if let Some(message) = info.message().as_str() {
    println!("  {}", message);      // fast path: string literal
} else {
    println!("  {}", info.message()); // slow path: formatted args
}
```

> :nerdygoose: The `as_str()` fast path matters more than you think. Inside the panic handler, we want to do as little work as possible — the system is in an unknown state. If the heap is corrupted, if the stack is nearly full, if interrupts are firing — the less code we run, the more likely our error message actually makes it to the screen.

## What Triggers a Panic?

In Rust, these all call the panic handler:

```rust
panic!("explicit panic");                    // manual
let x: Option<i32> = None; x.unwrap();      // unwrap on None
let v = vec![1, 2, 3]; let _ = v[5];        // index out of bounds
unreachable!();                              // code that shouldn't execute
todo!();                                     // unimplemented placeholder
assert!(false);                              // assertion failure
```

> :happygoose: In C, array out-of-bounds silently reads garbage memory. Integer overflow wraps silently. Null pointer dereference *might* segfault or *might* just corrupt something. In Rust, all of these are caught — either at compile time (null pointers don't exist) or at runtime (bounds checks, `unwrap()`), and they all go through our panic handler. The error is loud, located, and lethal (we halt). That's better than silent corruption.

## Branch

```bash
git checkout part-2   # see the code at this point
```
