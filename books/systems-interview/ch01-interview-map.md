---
sidebar_position: 2
sidebar_label: "Ch 1: Interview Map & Strategy"
title: "Chapter 1: Interview Map & Strategy"
---

# Chapter 1: Interview Map & Strategy

Scope: embedded device roles (bare‑metal and RTOS) using C, modern C++ (17/20/23), and Rust (no_std).

## What companies actually test (signal vs noise)
- Systems fundamentals: CPU/memory, I/O, timing, data movement
- Concurrency judgment: when to use interrupts/threads/queues; race detection; latency bounds
- Debugging process: reproduce → isolate → measure → hypothesize → patch → validate
- Practical design: APIs, backpressure, error budgets, observability, upgrade paths (OTA)
- Communication: requirements, trade‑offs, constraints, and clear written artifacts

Noise to de‑prioritize: trick puzzles, excessive big‑O brainteasers unrelated to devices, niche language trivia.

> :sharpgoose: The biggest signal in an embedded interview is *judgment under constraints*. Anyone can implement a sorting algorithm. Not everyone can explain why they chose a ring buffer over a linked list when the ISR has a 5µs deadline and zero heap access.
>
> :sarcasticgoose: If an interviewer asks you to reverse a linked list on a whiteboard for an embedded role, smile and do it — then ask them about their interrupt latency budget. That's the real interview.

## Four prep tracks (run them in parallel)
1) Fundamentals: memory hierarchy, MMIO, DMA, bit ops, endianness, CRCs
2) Concurrency: ISRs vs tasks, queues/ring buffers, atomics/memory ordering
3) Systems design: driver/HAL shapes, protocols, RTOS scheduling, failure modes
4) Hands‑on debugging: build harnesses, inject faults, collect evidence, write fixes

Daily cadence (60–90 min):
- 15–20 min fundamentals drills (latency math, bitwise, packet math)
- 25–40 min hands‑on (tiny lab or code kata)
- 10–15 min artifact polish (README snippet, diagram, or note)

Weekend deep‑dive (2–4 hrs): pick one lab, build a small demo with a micro benchmark and a short write‑up.

## 30/60/90‑day roadmap (choose an archetype to anchor: smart speaker, e‑reader, streaming stick, battery camera, home router, or earbuds/wearables)
Day 0 setup (2–3 hrs):
- Pick one archetype and list top 5 constraints (e.g., smart speaker: wake‑word latency, audio DMA, Wi‑Fi handoff)
- Create a repo or folder for labs; add a simple benchmark harness template
- Make a living checklist (below) and a single‑page resume draft

By Day 30 (Foundations + 1 demo):
- Fundamentals: latency ladder, MMIO vs cached memory, CRC math – can explain and apply
- Concurrency: implement an SPSC ring buffer with tests and bounds
- Demo: one end‑to‑end lab relevant to your archetype (e.g., UART RX + overflow counter)

By Day 60 (Concurrency + 2–3 demos):
- Add an ISR handoff pattern and backpressure to a driver or logger
- Design exercise: RTOS task set with deadlines and jitter bounds; justify stack sizes
- Two mock interviews (one design, one debugging) with written feedback

By Day 90 (Polish + performance):
- Performance pass: measure, find hot paths, validate speedups with before/after plots
- Portfolio: tidy READMEs, reproduce scripts, small GIF/video of demos
- Story bank: 5 concise stories (failure, recovery, trade‑off, incident response, teamwork)

## Artifact prep (interviewer‑visible)
- Resume bullets: action + problem + scale + result (with numbers). Example: "Cut ISR logging latency 3.2ms→0.6ms by SPSC ring + DMA; bounded loss under overload."
- Portfolio structure: labs/driver‑style folders with BUILD/RUN instructions and 60‑second READMEs
- Diagrams: one page per lab (timing diagram, data flow, error paths)
- Lab notebook: short posts (like this site) linking to code and measurements

## Day‑of playbook
- Clarify constraints first (latency, throughput, memory, power, failure modes)
- Think in artifacts: quick timing diagram, interface sketch, test harness outline
- State trade‑offs (throughput vs latency, RAM vs CPU, safety vs performance)
- For debugging questions: ask for a repro, add a probe, bisect, propose minimal patch, list risks

## Readiness checklist
- [ ] I can explain cache vs MMIO effects on loads/stores and when to use volatile/barriers
- [ ] I can design/justify a ring buffer and its memory ordering requirements
- [ ] I can outline an ISR→worker handoff with bounded latency and backpressure
- [ ] I can size stacks and reason about WCET and jitter
- [ ] I can build a small benchmark, measure properly, and report deltas
- [ ] I have two short demos and a repo others can run in under 5 minutes

## Mock prompts to practice this week
- Design a resilient UART RX path with overflow counters and a background parser; justify buffer size and latency budget
- Build an exponential backoff with jitter for flaky Wi‑Fi reconnect; show retry caps and telemetry
- Sketch a packet format with versioning + CRC; describe upgrade compatibility and error handling

Tip: Tie each prompt to your chosen archetype (e.g., smart speaker: audio ring + wake‑word latency; e‑reader: power‑aware state machine; battery camera: pre‑trigger frame buffer).

## Day 0 setup: your repo skeleton
Create a small, reproducible layout you'll reuse across labs.

```
embedded-interview/
	labs/
		01-crc16/
		02-spsc-ring/
		03-uart-rx/
		04-backoff-jitter/
	scripts/
		run_bench.sh
	docs/
		README.md
		lab-notes/
```

Recommended: keep each lab self-contained with a minimal README, inputs/outputs, and a quick test/bench harness.

> :happygoose: A well-organized repo with `BUILD` and `RUN` instructions is itself an interview artifact. Interviewers *will* look at your GitHub. A clean lab repo with measured results says more than a bullet point on your resume.
>
> :weightliftinggoose: Treat each lab like a training session. Write down what you measured, what surprised you, and what you'd do differently. That notebook becomes your interview story bank — real experiences beat memorized answers every time.

## Templates you'll reuse
- Design prompt template:
	- Problem: what/why (constraints: latency/throughput/memory/power)
	- Interfaces: inputs, outputs, error types, backpressure
	- Data flow: diagram, timing notes, ISR→worker handoff if relevant
	- Risks: failure modes, mitigations, observability
	- Test plan: happy path, overload, fault injection, rollback

- Debugging report template:
	- Repro: steps, environment, frequency
	- Observations: logs, timings, counters, memory use
	- Hypotheses tried: change, expected, observed
	- Fix: minimal patch, risk, rollback plan
	- Verification: before/after metrics

- Resume bullet template:
	- "Action verb + what + scale + result." Example: "Reduced ISR logging latency from 3.2 ms to 0.6 ms via SPSC ring + DMA; bounded loss under overload."

## Example week 1 plan
- Day 1: CRC fundamentals + vectors; write a 60‑sec README
- Day 2: SPSC push/pop happy path + wraparound test
- Day 3: SPSC under load; measure throughput and drops
- Day 4: UART RX ISR → ring; add overflow counter
- Day 5: Backoff with jitter; cap retries; basic telemetry
- Weekend: 2‑hour deep dive to polish one lab and record results

## Mock interview rubric (quick score 1–5)
- Fundamentals (caches/MMIO/latency math)
- Concurrency (ISR handoff, memory ordering, queues)
- Design (API clarity, backpressure, failure modes)
- Debugging (reproduce, instrument, bisect, validate)
- Communication (trade‑offs, diagrams, crisp artifacts)

## Prep tracker (check off weekly)
- [ ] Finish one fundamentals drill and one lab
- [ ] Add before/after metrics to a lab and a brief note
- [ ] Do one mock (design or debugging) and capture feedback
- [ ] Improve one artifact: README, diagram, or test harness

## Signals weighting (what matters most)
- Fundamentals: 25% — memory hierarchy, MMIO, latency math, bit/CRC
- Concurrency: 25% — ISR handoff, atomics/memory ordering, queues/backpressure
- Systems design: 25% — APIs, failure modes, observability, upgrade paths
- Debugging: 15% — reproduce, instrument, bisect, validate
- Communication: 10% — clear written artifacts, diagrams, trade‑offs

Use this to prioritize practice time and tailor your portfolio demos.

## Evidence rubrics (5‑level scale)
- Memory ordering explanation
	- 1: Vague "happens‑before" hand‑waving
	- 3: Correctly uses acquire/release with an SPSC example
	- 5: Can derive why relaxed is unsafe for consumer load; maps to real bug
- ISR→worker handoff design
	- 1: "Just use a queue"
	- 3: SPSC ring with overflow counter and drop policy
	- 5: Backpressure, telemetry, bounded latency proof with measurements
- Debugging process
	- 1: Guess fixes
	- 3: Repro + logging + binary search to culprit
	- 5: Fault injection harness, fix, regression test, risk/rollback plan

## Experiment design for labs (contract)
- Problem statement: clear scope, constraints, and success criteria
- Invariants: what must always hold (e.g., no data loss below rate X)
- Metrics: latency, throughput, drops, power, memory; define units
- Instrumentation: timestamps, counters, GPIO toggle, cycle counter
- Protocol: runs, warmup, repetition count, variance reporting
- Confounders: cache warm/cold, IRQ load, DMA contention, power state
- Interpretation: hypothesis, result, alternate explanations, next step

## Benchmark harness standards (minimal but rigorous)
- Stable timing source (hrtimer, cycle counter, or monotonic clock)
- Warmup runs, then N repeated trials; report mean, p50, p95
- Fixed input sizes and randomized variants; pin thread/IRQ if applicable
- Report environment (toolchain, flags, CPU/board); check in scripts

## Schedules by time budget (per week)
- 10 hours: 3 drills, 1 lab, 1 mock, 1 artifact polish
- 20 hours: 6 drills, 2 labs, 1 design mock, 1 debugging mock
- 40 hours: 10 drills, 3 labs (one end‑to‑end), 3 mocks, full portfolio pass

## Failure‑mode taxonomy (embedded focus)
- Timing: jitter, missed deadlines, priority inversion, ISR starvation
- Concurrency: ABA, torn reads, insufficient barriers, reentrancy bugs
- I/O: framing errors, overflow/underflow, DMA descriptor misconfig
- Memory: aliasing UB, stack overflows, fragmentation, stale cache
- Power: brownouts, sleep state surprises, wake race, clock instability
- Updates: partial OTA, version skew, rollback gaps, schema drift

For each lab/design, list which failure modes you handle and how you observe them.

> :angrygoose: Failure modes are where interviews are won or lost. Anyone can design a happy-path system. The candidate who says "what happens when the DMA descriptor ring wraps while we're in a brown-out?" gets the offer.
>
> :nerdygoose: The taxonomy above maps to real CVEs. ABA problems show up in lock-free queues. Torn reads crash CAN bus parsers. Stale cache causes MMIO reads to return yesterday's data. Learn these patterns — they'll come up in debugging questions.
