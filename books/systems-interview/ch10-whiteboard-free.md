---
sidebar_position: 11
sidebar_label: "Ch 10: Whiteboard-Free Labs"
title: "Chapter 10: Hands-on Whiteboard-Free Labs"
---

# Chapter 10: Hands-on Whiteboard-Free Labs

What to know:
- Read unfamiliar code; make safe local fixes; justify trade-offs

Example (C: bounded logger outline):
```c
int log_push(const char* msg); // returns 0 if dropped due to backpressure
```

Lab:
- Fix a timing bug in a periodic task; document cause and validation
- Design a sensor driver API; define error handling and init contract
