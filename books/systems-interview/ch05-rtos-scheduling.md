---
sidebar_position: 6
sidebar_label: "Ch 5: RTOS & Scheduling"
title: "Chapter 5: RTOS & Scheduling Drills"
---

# Chapter 5: RTOS & Scheduling Drills

What to know:
- Cooperative vs preemptive; period/deadline/jitter; queue vs mailbox

Example (FreeRTOS periodic task skeleton):
```c
void vSampler(void* arg){ TickType_t last = xTaskGetTickCount();
	for(;;){ sample_once(); vTaskDelayUntil(&last, pdMS_TO_TICKS(10)); }
}
```

Example (RTIC skeleton, Rust):
```rust
#[rtic::app(device = crate::pac)]
mod app{
	#[task(schedule = [tick])]
	fn tick(cx: tick::Context){ /* do work */ cx.schedule.tick(cx.scheduled + 10.millis()).ok(); }
}
```

Lab:
- Design a 3-task pipeline with deadlines; justify periods and stack sizes
- Add a watchdog and demonstrate recovery from a stuck task

> :angrygoose: `vTaskDelayUntil` and `vTaskDelay` are NOT the same. `vTaskDelay(10)` delays 10 ticks *from now* — so execution time adds to the period and you get drift. `vTaskDelayUntil` anchors to the last wake time. Using the wrong one in a real-time loop is a classic interview trap.
>
> :nerdygoose: RTIC (Real-Time Interrupt-driven Concurrency) is Rust's answer to "RTOS but at compile time." Tasks are interrupt handlers scheduled by hardware priority — no runtime scheduler, no stack per task, no heap. The compiler proves your priorities are consistent. In an interview, comparing RTIC to FreeRTOS shows breadth.
>
> :surprisedgoose: Stack sizing is the most under-discussed RTOS topic. Each task gets a fixed stack (typically 256–4096 bytes on Cortex-M). Too small → silent stack overflow → corrupted TCB → random crashes three hours later. Always measure with stack watermarking and add 25% headroom.
