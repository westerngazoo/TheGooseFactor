---
sidebar_position: 1
sidebar_label: Introduction
title: "C++ Algorithms & Data Structures (Draft)"
slug: /
---

# C++ Algorithms & Data Structures (Working Draft)

> Living manuscript. Expect rough edges, TODOs, and iterative refinement. Feedback welcome via GitHub issues or X @techno_goose.

## Purpose

Build an opinionated, modern C++ (C++20/23 leaning) guide to core data structures and algorithms with:

- Implementation patterns (value semantics first, RAII, strong types)
- Complexity intuition & cache-aware notes
- Benchmarks + micro-optimization flags (only when it matters)
- Trade-offs & "when NOT to use this" sections
- Testing + fuzzing angles

## Philosophy

1. Clarity over premature cleverness.
2. Measure before optimizing.
3. Prefer invariants + assertions early.
4. Favor composition & iterators over inheritance.
5. Expose minimal clean interfaces; hide mutation guts.

## Progress Legend

Status markers will appear inline: `[ ] planned` · `[~] drafting` · `[✓] reviewed` · `[⚡] optimize`

## Current Focus

Working on: Ch 1–2 historical context drafts + Sorting-first narrative justification (Ch 7) + benchmark harness skeleton.

Next up: Value semantics examples (copy elision, NRVO visuals) and iterator/ranges canonical patterns.

## Contributing / Feedback

Open an issue with: chapter number, concern, suggestion. Example: `Issue: Ch 9 - collision strategy alternative (cuckoo)`. PRs welcome once skeleton stabilizes.

> This page will grow; sections may reshuffle. Track diffs via repo history.
