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

> :angrygoose: The `do{...}while(0)` wrapper on that macro isn't pedantry — without it, `if(cond) TRACE("x", v); else ...` breaks because the semicolon terminates the `if` block early. This is a classic C debugging macro pattern that interviewers expect you to recognize (and explain).
>
> :sharpgoose: "Reproduce → minimize → instrument → bisect → validate" is not just a debugging process — it's an interview framework. When given a debugging question, say these five words in order. Then execute them. The structure alone demonstrates senior-level thinking.
>
> :happygoose: A minimal patch with a risk list shows engineering maturity. The junior fix is "I changed 50 lines and it works now." The senior fix is "I changed 3 lines, here's why it fixes the root cause, here's what could break, and here's my rollback plan."
