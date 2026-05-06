---
sidebar_position: 1
sidebar_label: "Ch 1: Why C?"
title: "Chapter 1: Why C?"
---

# Chapter 1: Why C?

> The book begins with a defense, because every reasonable student in
> 2026 will start with the same question: *Why am I learning algorithms
> in a language with no `std::vector`?* The answer is in the question.

## 1.1 The Argument

Three propositions:

1. **Algorithms are about machines, not languages.** When CLRS
   describes Quicksort's partition step, it describes pointers
   sliding through contiguous memory and a comparator function being
   invoked at each step. C is the language whose semantics most
   directly express this. Higher-level languages add abstractions
   that are useful in production but obscure the algorithm itself.

2. **C forces the bookkeeping.** A `std::sort` call hides the
   comparator, the swap primitive, the memory allocator, and the
   recursive descent. A C `qsort` exposes them — and you write the
   comparator yourself. The exposure is the lesson.

3. **C is the substrate.** The languages people prefer for
   production — Rust, Go, Python, JavaScript — are all implemented
   in C (or C-adjacent C++). Their standard libraries' performance
   characteristics are inherited from C-level decisions.
   Understanding C means understanding why your favorite language
   chose the trade-offs it did.

> :nerdygoose: A more direct version: if you can't write Quicksort in
> C, your understanding of Quicksort is shallow. The implementation
> details are not noise — they're where the algorithm lives.

## 1.2 The Counter-Arguments

We owe them an honest hearing.

### "C is unsafe."

True, in a sense. C has undefined behavior, manual memory
management, and no built-in bounds checking. **For production code,
this matters.** The Rust ecosystem exists for good reasons.

For *learning*, the absence of safety guards is pedagogically
useful. You will write a buffer overrun. AddressSanitizer will
catch it. You will understand, in your bones, why the safer
languages exist. That understanding is hard to acquire any other
way.

> :sharpgoose: Every chapter assumes you compile with
> `-fsanitize=address,undefined`. We will exploit ASan and UBSan as
> teaching tools, not avoid them.

### "C is old."

C17 is the current ratified standard; C23 lands soon. C has had
more revisions in the last decade than Java has had meaningful
language changes. The "old" C is K&R C from 1978 — that one is
indeed obsolete. Modern C (`_Generic`, designated initializers,
compound literals, anonymous structs) is a different language.

### "Nobody writes algorithms in C anymore."

Linux, FreeBSD, SQLite, Redis, the CPython interpreter, the V8
JavaScript engine, FFmpeg, OpenSSL, Git's core, and the Linux
kernel's `lib/` directory — all C. If you intend to read or
contribute to systems code, C fluency is the price of entry.

For interview prep specifically — Amazon's embedded teams, AWS
Nitro, Lambda's runtime, S3's storage layer, every cloud
provider's hot path — C is widely used. Even when the *interview*
is in Python, the *interviewer* is mentally compiling your code to
something that looks like C.

## 1.3 What This Book Asks of You

Two things, really.

### 1.3.1 Build with sanitizers on, always.

Every Makefile in this book starts with:

```c
CFLAGS  = -std=c17 -Wall -Wextra -Wpedantic -O2 -g
CFLAGS += -fsanitize=address,undefined
LDFLAGS = -fsanitize=address,undefined
```

You'll write a buffer overrun. ASan will catch it before your
program corrupts memory and limps along until something else dies
in a confusing way. That's the whole point — the sanitizer is your
co-author.

> :sharpgoose: A program that "works" without ASan but fails with it
> isn't working. It's getting lucky.

### 1.3.2 Do the practice questions.

Each chapter ends with a short set: a few **Try it** problems (do
these), a couple of **Stretch** ones (most readers should), and an
optional **Deep dive** for the curious. We don't grade on rigor.
We do ask you to predict runtimes, explain your reasoning, and write
working code.

> :weightliftinggoose: Reading without practicing is reading. Practicing
> without reading is fumbling. Do both.

## 1.4 The Setup

Before Chapter 2, install:

```bash
# Linux / WSL
sudo apt install build-essential gdb valgrind clang clang-tools

# macOS
xcode-select --install
brew install gdb valgrind  # valgrind on macOS is best-effort

# Windows: use WSL. Native Windows toolchains work but the book's
# tooling assumes a POSIX environment.
```

Verify:

```bash
$ cc --version
$ make --version
$ gdb --version
$ # ASan check:
$ echo 'int main(void){int*p=0;*p=1;return 0;}' | cc -x c - -fsanitize=address -o /tmp/asan && /tmp/asan
```

That last command should print an ASan report and exit non-zero.
If it doesn't, your compiler isn't built with ASan and you'll need
clang.

## 1.5 The Roadmap

The next four chapters of Part I are pure foundation:

- **[Ch 2](/c-book/part-1-foundations/ch02-abstract-machine):** the
  C abstract machine. Memory, sequence points, integer promotions,
  undefined behavior. The vocabulary you'll use for the rest of
  the book.
- **[Ch 3](/c-book/part-1-foundations/ch03-asymptotics):** asymptotic
  notation, formal definitions, master theorem.
- **[Ch 4](/c-book/part-1-foundations/ch04-loop-invariants):** loop
  invariants and Hoare logic at the level you'll use it.
- **[Ch 5](/c-book/part-1-foundations/ch05-amortized):** amortized
  analysis with the dynamic-array proof as the canonical example.

By the time you reach Part II, you'll have a complete vocabulary
for talking about algorithms rigorously. Then we start
*implementing* them.

> :weightliftinggoose: First reps, then load. Foundations now,
> implementations next.

---

## Practice

### Try it

**1.1** Compile this program with `cc -fsanitize=undefined`:

```c
#include <stdio.h>
int main(void) {
    int x = 1 << 31;
    printf("%d\n", x);
    return 0;
}
```

What does UBSan report? In your own words, why is the program
ill-formed?

**1.2** Write a tiny C program that intentionally writes one byte
past the end of a heap buffer (`malloc(8)`, write to index 8).
Compile with `-fsanitize=address` and run it. Read the report —
what info did ASan give you?

### Stretch

**1.3** Find an open-source C project on GitHub (SQLite, Redis,
git's source). Open one source file. Read it. Note three things
that surprise you about how production C code is written compared
to what you've seen in textbooks.

**1.4** Skim the GitHub `main` README of two of these tools (your
choice): cmocka, Unity, libFuzzer, valgrind. Which would you reach
for first if you were starting a new C project today, and why?

### Deep dive (optional)

**1.5** What can C *not* express directly that languages like
Rust or Haskell can? Pick one feature (e.g., sum types, generics,
ownership). Sketch how you'd simulate it in C — and what's lost in
translation.

---

> :happygoose: That's Chapter 1. Chapter 2 covers the C abstract
> machine — the mental model you'll use to reason about everything
> else.
