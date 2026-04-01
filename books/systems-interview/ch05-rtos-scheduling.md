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
