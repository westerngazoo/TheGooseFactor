---
sidebar_position: 12
sidebar_label: "Ch 11: Coding Questions"
title: "Chapter 11: Coding Questions (Systems-Flavored)"
---

# Chapter 11: Coding Questions (Systems-Flavored)

What to know:
- Simple, correct, boundary-aware code under constraints

Example (C: parse length-prefixed frame):
```c
int parse_frame(const uint8_t* buf, int n){ if(n<3) return -1; int len=buf[1]; if(2+len+1>n) return -2; /* verify CRC here */ return len; }
```

Example (Rust: bounded binary search):
```rust
pub fn exp_then_bin<F: Fn(usize)->bool>(limit:usize, ok:F)->Option<usize>{
	let mut hi=1; while hi<limit && !ok(hi){ hi*=2; }
	let (mut l, mut r)=(hi/2, hi.min(limit)); while l<r { let m=(l+r)/2; if ok(m){ r=m } else { l=m+1 } }
	if ok(l){ Some(l) } else { None }
}
```

Lab:
- Implement circular buffer ops: push, pop, peek, count; test wrap-around
- Implement time-bounded search for first true in monotonic predicate
