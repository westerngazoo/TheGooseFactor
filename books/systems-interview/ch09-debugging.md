---
sidebar_position: 10
sidebar_label: "Ch 9: Debugging & Failure Analysis"
title: "Chapter 9: Debugging & Failure Analysis"
---

# Chapter 9: Debugging & Failure Analysis

What to know:
- Reproduce; minimize; instrument; bisect; validate

Example (C: simple tracing macro):
```c
#include <stdio.h>
#define TRACE(tag, x) do{ printf("%s: %ld\n", tag, (long)(x)); }while(0)
```

Lab:
- Build a repro harness for an intermittent bug; add counters and timing traces
- Use binary search to localize; produce a minimal patch and a risk list
