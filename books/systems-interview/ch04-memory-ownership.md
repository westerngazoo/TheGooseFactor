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
