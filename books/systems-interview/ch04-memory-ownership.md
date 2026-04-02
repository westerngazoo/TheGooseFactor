---
sidebar_position: 5
sidebar_label: "Ch 4: Memory, Pointers & Ownership"
title: "Chapter 4: Memory, Pointers, and Ownership"
---

# Chapter 4: Memory, Pointers, and Ownership

What to know:
- C++ RAII and move semantics for resources (GPIO, DMA, files)
- Rust ownership/borrowing and Send/Sync across ISRs
- C aliasing rules; restrict; padding/UB pitfalls

Example (C++ RAII GPIO):
```cpp
struct GpioPin { int id; bool owned; GpioPin(int id):id(id),owned(true){/*cfg*/} ~GpioPin(){ if(owned){/*deinit*/} }
	GpioPin(const GpioPin&)=delete; GpioPin& operator=(const GpioPin&)=delete;
	GpioPin(GpioPin&& o) noexcept : id(o.id), owned(o.owned){ o.owned=false; }
};
```

> :happygoose: This C++ RAII GPIO pattern is interview gold. Show that `GpioPin` can't be copied (deleted copy ctor), only moved — so the compiler enforces single ownership of the hardware pin. Ask the interviewer: "What happens if two drivers try to configure the same pin?" With RAII: compile error. Without: silent corruption.
>
> :angrygoose: `GpioPin(GpioPin&& o) noexcept` — that `noexcept` isn't optional for move constructors used in containers. Without it, `std::vector` falls back to copy... which is deleted... so you get a compile error when you try to `push_back`. Ask me how many hours this costs people.

Example (C: aliasing with restrict):
```c
void axpy(int n, float a, float* restrict y, const float* restrict x){
	for(int i=0;i<n;++i) y[i]+=a*x[i];
}
```

Example (Rust: ownership wrapper):
```rust
pub struct Buffer<'a> { data: &'a mut [u8] }
impl<'a> Buffer<'a>{ pub fn clear(&mut self){ for b in &mut self.data { *b = 0; } } }
```

Lab:
- Build a fixed-capacity arena in C and in Rust; prove no dynamic allocation
- Show a GPIO RAII handle in C++ that cannot be copied, only moved

> :sarcasticgoose: "Just use `restrict` everywhere for performance!" Sure — and when you accidentally pass overlapping buffers, enjoy your undefined behavior. `restrict` is a *promise* to the compiler. Break it and the optimizer will generate wrong code, with no warning. At least Rust's borrow checker catches this at compile time.
>
> :nerdygoose: The Rust `Buffer<'a>` example shows lifetime-bounded borrowing — the buffer can't outlive its backing storage. In C, you'd return a dangling pointer and find out at runtime (or in production). In Rust, the compiler says "no" before you even run the code.
