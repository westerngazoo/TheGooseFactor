---
title: "Bigger, Stronger, Faster: AI-Assisted Embedded Systems Development"
description: "Lessons from building a RISC-V operating system with an AI pair-programmer — where it saved weeks of work, where it almost bricked a board, and how to structure the collaboration to move at startup speed as a solo developer."
authors: [geese]
tags: [embedded, ai, risc-v, goose-os]
---

# Bigger, Stronger, Faster: AI-Assisted Embedded Systems Development

I'm building [GooseOS](https://github.com/westerngazoo/goose-os) — a RISC-V operating system in Rust, targeting real hardware (StarFive VisionFive 2). I'm one person. No team, no budget, no six-month timeline. Just me, a $65 dev board, a USB-to-serial adapter, and an AI pair-programmer.

Here's what I've learned about using AI for embedded systems development — what it's genuinely good at, what will get you in trouble, and how to structure the collaboration so you ship faster without frying your hardware.

<!-- truncate -->

## The Premise: One Developer, Team-Sized Output

Building an OS from scratch normally involves:
- Reading thousands of pages of hardware documentation (RISC-V privileged spec, SoC manuals, UART datasheets, PLIC specs)
- Writing boot assembly, linker scripts, trap handlers, device drivers
- Setting up cross-compilation toolchains, QEMU configurations, build systems
- Debugging hardware quirks that no tutorial covers
- Writing documentation and a tutorial book alongside the code

That's a team. Architecture lead, embedded engineer, technical writer, build engineer. Six months minimum.

With AI, I shipped a working kernel — booting on real silicon, interrupt-driven I/O, platform abstraction for two targets, automated deployment pipeline, and a companion tutorial book — in **days of active development**. Not because AI wrote the OS for me. Because it handled the right tasks while I handled the right decisions.

## What AI Is Genuinely Good At

### 1. Extracting Information from Manuals You Haven't Read

The JH7110 SoC (the chip on the VisionFive 2) has a Technical Reference Manual that's hundreds of pages. The SiFive U74 core manual is another 300. The RISC-V privileged specification is 100 more. The PLIC spec, the DW8250 UART datasheet, the OpenSBI documentation...

I didn't read any of them cover to cover. Instead:

> "What's the UART register stride on the JH7110?"
> "Which PLIC context maps to hart 1 S-mode?"
> "How does the MCR OUT2 bit gate interrupt output on a 16550?"

AI pulls the answer in seconds. Not "I think it might be..." — specific register addresses, bit masks, initialization sequences. The kind of detail that takes 45 minutes of PDF searching to find manually.

**This is where AI saves the most time in embedded development.** Hardware manuals are dense, poorly indexed, and written for people who already know the answer. AI functions as a queryable index across all of them simultaneously.

### 2. Memory Maps and Register Layouts

Ask an AI to produce the JH7110 memory map — DRAM base, PLIC address, UART base, SPI controller, clock regions — and it generates a complete, formatted table in seconds. Ask it for the NS16550A register layout with bit-field descriptions and you get a reference card you can keep open while coding.

This isn't intelligence — it's recall. But recall over a corpus of hardware documentation is exactly what embedded developers spend hours on. Every register access in a bare-metal driver starts with "what's the offset and which bits do I set?" AI answers that instantly.

### 3. Boilerplate and Scaffolding

Linker scripts, Makefile targets, Cargo feature flags, assembly boot stubs, `println!` macro implementations, panic handlers — these follow well-known patterns. The RISC-V boot sequence (`_start` → zero BSS → set stack pointer → jump to Rust) is the same in every OS tutorial. Trap vector setup, PLIC initialization, UART polling loops — all pattern code.

AI generates correct scaffolding in one shot. I review it, adjust for my architecture, and move on. What would take an afternoon of referencing other projects takes minutes.

### 4. Troubleshooting Hardware Mysteries

This is where it gets interesting. When my UART TX worked on the VisionFive 2 but RX didn't, the debugging session went like this:

> **Me:** "TX works, no RX echo. QEMU works fine."
> **AI:** "The DesignWare 8250 requires MCR OUT2 (bit 3) to gate interrupt output to the PLIC. QEMU doesn't model this. Set MCR to 0x0B (OUT2 + RTS + DTR)."

That's a piece of knowledge buried in a footnote of the NS16550A datasheet. I would have found it eventually — after hours of bisecting register writes and reading forum posts from 2004. AI surfaced it immediately because it's seen this exact failure mode hundreds of times across its training data.

The pattern: **when your symptom matches a known hardware gotcha, AI is faster than any search engine.** It doesn't just find the forum post — it gives you the fix, the register value, and the explanation.

### 5. Build System Automation

The GooseOS development workflow evolved from "swap SD cards and type U-Boot commands manually" to a 30-second cycle:

```
PC:   make deploy     → builds, bumps build number, git push
VF2:  goose go        → git pull, copies kernel, reboots
```

AI wrote the Makefile's auto-incrementing build numbers, the `deploy` target, the `goose-upgrade.sh` shell script, and wired `option_env!("GOOSE_BUILD")` into the Rust binary for compile-time build tracking. None of this is complex — but designing, writing, and debugging all these pieces takes time. AI generates them correctly the first time because they're standard patterns.

### 6. Documentation and Technical Writing

I'm writing a tutorial book alongside GooseOS. Each chapter explains what we built and why, with code listings, architecture diagrams, and troubleshooting guides. AI drafts these chapters in the project's established voice and format — goose mascot callouts, comparison tables, ASCII diagrams, the works.

I provide the architecture narrative ("this chapter covers the UART RX debugging, MCR OUT2, why polling is the pragmatic fix, and the TODO for interrupt-driven sleep"). AI produces a 3,000-word chapter with accurate code references, properly formatted for Docusaurus. I review, adjust the narrative, and publish.

A technical writer would cost $50-100/hour. This is $20/month.

## What AI Is Dangerous At (And When to Stop It)

### 1. Anything That Writes to Flash

This is the golden rule: **never let AI drive flash operations unsupervised.**

During the VisionFive 2 SPI flash recovery, AI suggested a sequence of `sf erase` / `sf write` commands to reflash the SPL and U-Boot. The commands were syntactically correct. The offsets were reasonable. But:

- The SPL binary didn't match my board revision's DDR training parameters
- The fw_payload image was 200KB too large for the target MTD partition
- Writing a bad SPL to SPI flash means the board can't initialize RAM on next boot
- Result: permanent `CCCCCC...` loop. SPI boot was bricked.

The board still boots from SD card (DIP switch override), so it's not dead. But SPI boot is gone, probably permanently, unless I get an identical working board to extract the correct SPL from.

**The lesson:** AI doesn't know your specific board revision, your flash chip's sector layout, or whether the binary it found online matches your silicon. It applies general knowledge to a specific situation. For reversible operations (writing to RAM, changing software), that's fine. For irreversible operations (flashing firmware, erasing boot partitions), **you must verify every parameter yourself.**

> My rule now: if the command contains `sf write`, `sf erase`, `flashcp`, `dd of=/dev/mtd`, or anything that modifies non-volatile storage — I stop, read every argument, verify the binary's size and checksum, and confirm the target offset against the flash layout. AI drafts the command; I audit it.

### 2. Architecture Decisions

AI is excellent at implementing an architecture you've chosen. It is mediocre at choosing the architecture.

When I decided GooseOS should evolve toward a microkernel design (minimal kernel + userspace services communicating via IPC), AI immediately helped structure the roadmap — Sv39 page tables first, then context switching, then IPC, then UART-as-a-service. That's correct sequencing.

But the decision to go microkernel? That was mine. AI would have been equally happy building a monolithic kernel, an exokernel, or a unikernel. It doesn't have opinions about trade-offs that depend on project goals, target use cases, or personal learning objectives.

**You are the architect. AI is the construction crew.** Tell it what to build and why. Don't ask it what to build — it'll give you the most common answer from its training data, which is the median project, not *your* project.

The same applies at smaller scales:
- **Me:** "We're polling UART because VF2 interrupt routing is broken. That's fine for now — we'll fix it when we parse the device tree."
- **AI would happily spend hours debugging interrupt routing right now if I let it.** I made the call to ship polling and move on. That's an architecture decision — prioritization under uncertainty.

### 3. Hardware-Specific Assumptions

AI knows that the RISC-V `la` instruction uses PC-relative addressing. It knows that `_boot_hart_id = 0` defines a symbol at absolute address 0. It didn't predict that combining these two facts would cause a linker relocation overflow — because the overflow depends on where the kernel is linked (0x80200000), and the distance from 0x80200000 to 0x0 exceeds the 20-bit immediate range of `auipc`.

We hit this bug. AI then solved it correctly (store the value in a `.dword` data section and load indirectly). But it didn't *prevent* it — it generated the direct `la` approach first, and the linker caught it.

**Pattern: AI gets the concept right but misses implementation constraints that depend on your specific memory layout, toolchain version, or hardware revision.** Always build and test. Never assume generated code is correct until the toolchain confirms it.

### 4. When the Board is Physically Misbehaving

AI can't see your serial console. It can't hear the fan. It doesn't know that your USB-C power supply is 2A instead of 3A. When I reported "BOOT fail, Error is 0xffffffff", AI gave me five possible causes. The actual cause? The DIP switches were in the wrong position. That's a physical reality that no amount of software debugging can diagnose remotely.

**For physical-layer problems, AI is a rubber duck — useful for organizing your thinking, not for identifying the fix.** You still need to check wiring, power, switches, and LEDs yourself.

## How to Structure the Collaboration

After building GooseOS this way, here's the workflow I've settled on:

### You Lead On:
- **Architecture and design philosophy** — microkernel vs monolith, what to build next, what to defer
- **Hardware interaction** — DIP switches, power cycling, serial console observation, "does the LED blink?"
- **Risk assessment** — "should I flash this?" "is this safe to try?" "what can I not undo?"
- **Prioritization** — "this interrupt bug doesn't matter right now, ship polling and move on"
- **Testing on real hardware** — QEMU and real silicon are different. You are the bridge.

### AI Leads On:
- **Register-level details** — memory maps, bit fields, initialization sequences
- **Boilerplate code** — drivers, build scripts, linker scripts, Makefiles
- **Cross-referencing documentation** — "what does the SBI SRST extension expect in a7?"
- **Writing tests and documentation** — chapter drafts, troubleshooting guides, README files
- **Build automation** — deploy scripts, CI, toolchain setup
- **Pattern debugging** — "TX works but RX doesn't" → MCR OUT2

### The Handoff Points:
1. **You decide what to build** → AI generates the implementation
2. **You test on hardware** → report symptoms to AI
3. **AI proposes a fix** → you evaluate whether it's safe before applying
4. **AI writes documentation** → you review for accuracy and narrative

## The Speed Multiplier

Here's the honest math on GooseOS:

| Task | Without AI | With AI |
|------|-----------|---------|
| Read JH7110 TRM for UART registers | 2 hours | 5 minutes |
| Write UART driver (stride-based) | 3 hours | 20 minutes |
| Write boot assembly + linker scripts | 4 hours | 30 minutes |
| Debug MCR OUT2 issue | 4+ hours | 15 minutes |
| Build Makefile with deploy pipeline | 2 hours | 10 minutes |
| Write one book chapter | 6 hours | 45 minutes |
| Debug linker relocation overflow | 2 hours | 20 minutes |
| Total for Part 4 (4 chapters of work) | ~40 hours | ~5 hours |

That's an **8x multiplier** on the tasks AI handles well. The tasks it doesn't handle — hardware debugging, architecture decisions, physical board interaction — still take the same time. But they're a smaller fraction of total work.

The result: a solo developer shipping at the pace of a small team. Not because AI replaces the team, but because it compresses the parts of the work that are information retrieval and pattern application — which turns out to be most of embedded development.

## Practical Tips

**1. Give AI the full context.** Don't say "write a UART driver." Say "write a UART driver for the JH7110's DesignWare 8250 at 0x10000000 with 4-byte stride, I need polling TX/RX and interrupt enable, here's the existing platform.rs constants." More context = fewer iterations.

**2. Tell it your intent, not just your task.** "I want to be able to reboot from GooseOS without power cycling because the VF2 has no reset button" is better than "write an SBI reset function." Intent lets AI make better auxiliary decisions (like adding Ctrl-R keybinding and printing the hint at boot).

**3. Review before flashing.** Read every register write. Verify every address. Check binary sizes against partition layouts. AI's confidence is not correlated with correctness — it's equally confident about right and wrong answers. You are the safety layer.

**4. Use build numbers.** When iterating fast, you will lose track of which binary is running on the board. A compile-time build number (`option_env!`) costs nothing and saves hours of "is this the new code or the old code?" confusion.

**5. Automate the feedback loop.** The faster you can go from code change to running on hardware, the more you'll test, the fewer bugs accumulate. `make deploy` + `goose go` gets me from edit to hardware in 30 seconds. That workflow was AI-generated. Let it build the tools that accelerate you.

**6. Let it write the docs while the code is fresh.** AI can draft a chapter immediately after you finish a feature — while the decisions, bugs, and fixes are all in context. Waiting a week to write docs means reconstructing context. Do it in the same session.

**7. Know when to stop.** When AI suggests a fifth approach to fix SPI flash and the previous four bricked it further — stop. The problem isn't software. It's DDR training parameters baked into a binary that doesn't match your board revision. No amount of prompt engineering fixes a hardware mismatch. Walk away, accept the limitation, adapt your workflow (we switched to SD card boot permanently).

## The Bigger Picture

Embedded systems development has traditionally been slow because the information is scattered across datasheets, errata documents, forum posts, and tribal knowledge locked in senior engineers' heads. The actual *coding* is often straightforward — it's finding the right register, the right bit, the right initialization sequence that takes time.

AI compresses that information retrieval from hours to seconds. It doesn't make the hardware less complex — the JH7110 still has five harts, an interrupt mux, and a DesignWare UART with a 40-year-old interrupt gating quirk. But it makes the complexity *navigable* at a pace that wasn't possible before.

The developer who understands the architecture and owns the decisions, while delegating information retrieval and pattern code to AI, can build systems that previously required a team. Not toy systems — real kernels on real silicon, with real deployment pipelines and real documentation.

The catch: you still need to understand what you're building. AI amplifies capability — it doesn't create it. If you don't know what a PLIC context is, AI giving you the right context number doesn't help you debug when it's wrong. The foundation matters. AI makes the building faster, not the learning optional.

## Follow Along

GooseOS is an active project — new parts ship regularly, each one documented as a book chapter. If you're interested in RISC-V, bare-metal Rust, OS internals, or just how far one developer + AI can push embedded development:

- **Source code:** [github.com/westerngazoo/goose-os](https://github.com/westerngazoo/goose-os)
- **Tutorial book:** [TheGooseFactor / GooseOS](https://github.com/westerngazoo/TheGooseFactor/tree/main/books/goose-os)
- **Follow the series:** [@theg00sefactor](https://x.com/theg00sefactor) on X

Next up: **Sv39 page tables** — the gateway to userspace, process isolation, and the microkernel architecture. The real OS starts here.

Have questions about the workflow, the AI collaboration model, or want to try it on your own hardware? Open an issue on the repo or reach out on X. I'm building this in public because I think the process is as valuable as the product — and I want to hear how others are doing it.
