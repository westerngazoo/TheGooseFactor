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

> :weightliftinggoose: "Measure first" is the cardinal rule. In an interview, if you say "I'd optimize X because it's probably slow" without measuring, you've already lost. Say instead: "I'd profile, identify the hot path, measure the baseline, then compare after the change." Process over intuition.
>
> :nerdygoose: Report p95, not just mean. Mean hides outliers. If your mean latency is 10µs but p95 is 500µs, you have a cache miss or context switch problem that mean will never reveal. Interviewers who care about real-time systems want to see you think in distributions, not averages.
>
> :surprisedgoose: The difference between a branchy lookup and a flat LUT can be 10×+ on a Cortex-M with no branch predictor. x86 devs are spoiled by hardware prediction. On embedded, every branch is a potential pipeline stall. Measuring this is a powerful interview demo.
