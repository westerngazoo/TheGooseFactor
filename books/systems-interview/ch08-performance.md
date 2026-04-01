---
sidebar_position: 9
sidebar_label: "Ch 8: Performance & Profiling"
title: "Chapter 8: Performance Engineering & Profiling"
---

# Chapter 8: Performance Engineering & Profiling

What to know:
- "Measure first" discipline; cycle counters or timers
- Reducing variance; reporting deltas, not absolutes

Example (C++: micro-benchmark harness):
```cpp
#include <chrono>
template<typename F> long bench(F f,int it){
	using C=std::chrono::high_resolution_clock; auto s=C::now();
	for(int i=0;i<it;++i) f();
	auto e=C::now(); return std::chrono::duration_cast<std::chrono::nanoseconds>(e-s).count();
}
```

Lab:
- Benchmark two implementations (branchy vs LUT); report mean and p95 over 30 runs
- Show before/after for an inlined hot path with cache-friendly layout
