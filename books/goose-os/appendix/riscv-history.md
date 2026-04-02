---
sidebar_position: 1
sidebar_label: "A Brief History of RISC-V"
title: "A Brief History of RISC-V"
---

# A Brief History of RISC-V

## From Berkeley to the World

RISC-V (pronounced "risk-five") started in 2010 at UC Berkeley as a teaching ISA. Professors Krste Asanovic and David Patterson (co-author of *Computer Organization and Design*) needed a clean, modern instruction set for their architecture courses — and nothing available fit the bill.

**Why not use ARM, x86, or MIPS?**
- **x86**: Decades of legacy cruft, proprietary, fiendishly complex encoding
- **ARM**: Proprietary licensing fees, increasingly complex ISA extensions
- **MIPS**: Licensing issues, declining ecosystem, some odd design choices

So they designed a new one from scratch — open, modular, and clean.

> :sarcasticgoose: "Just use x86," they said. "It's only 4,000 pages of documentation and three decades of backwards-compatible mistakes." Hard pass.
>
> :happygoose: Starting from scratch with 40 years of hindsight? That's not laziness — that's wisdom.

## Timeline

| Year | Milestone |
|------|-----------|
| 2010 | First RISC-V design at UC Berkeley |
| 2011 | First paper: "The RISC-V Instruction Set Manual" |
| 2014 | ISA frozen (base integer instructions), first silicon tapeouts |
| 2015 | RISC-V Foundation formed |
| 2019 | Foundation moves to Switzerland (RISC-V International) for vendor neutrality |
| 2020+ | SiFive, Alibaba T-Head, Espressif (ESP32-C3), and others ship production silicon |
| 2023+ | RISC-V laptops and SBCs appear (StarFive VisionFive 2, Milk-V) |

## Design Philosophy

RISC-V was designed with hindsight from 40 years of ISA mistakes:

1. **Modular**: Base integer ISA (RV32I/RV64I) + optional extensions (M, A, F, D, C, V, ...)
2. **Simple encoding**: Fixed 32-bit instructions (with 16-bit compressed extension)
3. **No legacy baggage**: No condition codes, no delay slots, no weird addressing modes
4. **Open standard**: Free to implement, no licensing fees, no NDA
5. **Clean privilege model**: User (U), Supervisor (S), Machine (M) modes with clear separation

> :nerdygoose: The modular approach means a tiny embedded core can implement just RV32I (47 instructions!) while a Linux-capable chip adds MAFDCV. Same ISA family, wildly different silicon budgets.
>
> :angrygoose: "No legacy baggage" is doing heavy lifting here. No condition codes means no subtle flag-clobbering bugs. No delay slots means no "oops, the instruction after the branch always executes" surprises. If you've been burned by those on MIPS or x86 — you'll appreciate this.

## Why RISC-V for OS Development?

For learning OS development, RISC-V is ideal:

- **Small, readable spec**: The privileged ISA spec is ~100 pages (vs. thousands for x86)
- **QEMU support**: Full system emulation, no hardware needed to start
- **Transparent**: No hidden microcode, no undocumented instructions
- **Real hardware available**: VisionFive 2, Milk-V boards for deployment
- **Growing ecosystem**: Linux runs on it, bootloaders exist, toolchains are mature

> :surprisedgoose: The entire privileged ISA spec is ~100 pages. The x86 manual set is over 5,000 pages. You can actually *read* the RISC-V spec in a weekend and understand your whole machine.
>
> :mathgoose: 47 base instructions × clean encoding = you can build a decoder in a few hundred lines of HDL. Try that with x86's variable-length instruction nightmare.

> The entire GooseOS book targets RISC-V because it lets you see every layer — from the first instruction the CPU executes to userspace processes — without proprietary black boxes hiding the interesting parts.
