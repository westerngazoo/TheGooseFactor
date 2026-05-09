---
title: "C23 Is Here and Nobody's Talking About It"
description: "C++26 is grabbing all the language-news oxygen. Meanwhile C has quietly shipped its biggest update in 24 years — and it deserves a fraction of the attention. A tour of how C has evolved from K&R to today, and what C23 actually changes."
authors: [geese]
tags: [c-language, programming-languages]
---

# C23 Is Here and Nobody's Talking About It

C++26 is in the news. Reflection, contracts, executors, more
pattern-matching. The language-news cycle treats every C++
standard like a Marvel release.

C23 shipped its final draft in 2024. It's the **biggest update
to ISO C since C99** — twenty-four years ago. There's no marketing
campaign, no conference keynote tour, no breathless Reddit thread.
The kernel community shrugged. Embedded compilers caught up at
their own pace. Move on.

That's a mistake.

<!-- truncate -->

> :angrygoose: C is the substrate. The kernel is C. The Python
> runtime is C. The OpenSSL stack you trust with your money is C.
> When the language under all the other languages quietly improves,
> people should care. They don't, because every blog post about
> "new language features" is in C++. So today we're going to talk
> about C, and what's actually changed since Brian Kernighan and
> Dennis Ritchie typed the first compiler in the early 1970s.

## A 50-year speedrun

C is older than every working programmer's career. The
sequence of standards:

| Year | Common name | Major theme |
|---|---|---|
| 1972–1978 | "K&R C" | The original. Defined by Kernighan & Ritchie's book. |
| 1989 | **ANSI C / C89** | First ISO standard. Function prototypes, `void`, the standard library as we know it. |
| 1990 | C90 | ISO ratification of C89, identical contents. |
| 1995 | C95 | Tiny revision: wide characters, digraphs. |
| 1999 | **C99** | Big update. `inline`, `bool`, mixed declarations and statements, VLAs, `<stdint.h>`, designated initializers, `restrict`. |
| 2011 | **C11** | Threading. Atomics. `_Generic`. Anonymous structs. `static_assert`. |
| 2018 | C17 / C18 | Bug-fix release. No new features. |
| 2024 | **C23** | The big one. We'll spend most of this post here. |

Notice the gaps. C goes 24 years between K&R and ANSI. Then 10
years to C99. Then 12 years to C11. Then 13 years to C23. Compare
to C++, which has shipped on a rigid 3-year cadence since 2011.

> :sarcasticgoose: C++ ships features by the bucketful every three
> years. C ships features by the bushel every twelve. Different
> philosophies — neither obviously wrong, but C's slower pace
> *is* a feature for the people writing operating systems and
> implementing libc. They want stability, not novelty.

## What changed at each turn

### K&R → ANSI C (1989): the basics most programmers take for granted

If you read code from before 1989, you'll see things that look
broken to a modern reader:

```c
// K&R style — function with no parameter types declared
double sqrt(x)
double x;
{
    /* ... */
}
```

ANSI C made **function prototypes** mandatory:

```c
double sqrt(double x);
```

Other ANSI additions you can't imagine C without:

- The `void` keyword (for "no parameters" and "no return value").
- `const` and `volatile` qualifiers.
- The standard library headers (`<stdio.h>`, `<stdlib.h>`,
  `<string.h>`, etc.) standardized.
- `enum`, `signed`, struct copying, function pointers as
  first-class.
- Trigraphs and digraphs (the 7-bit-charset escapes — historical
  curiosities now).

ANSI C is the C most engineers learned. It's the dialect of K&R
*The C Programming Language, 2nd edition* (1988) — which is
itself the book with "K&R" on the cover that everyone means when
they say "K&R."

> :nerdygoose: When old-timers say "K&R C," they usually mean the
> *first* edition (1978), which used the pre-ANSI parameter
> syntax. The 2nd edition (1988) is ANSI C and looks modern. The
> distinction matters when you're reading legacy code.

### C95 (1995): wide characters, briefly

Almost a non-event. `<wchar.h>`, `<wctype.h>`, the `wchar_t`
type. Trigraphs got rebranded as digraphs. Most production codebases
ignored it.

### C89/95 → C99: the long-overdue refresh

C99 is where modern C really begins. Highlights:

**Mixed declarations and statements.** Before C99 you had to
declare all variables at the top of a block:

```c
// C89: legal
int main(void) {
    int i, sum;
    sum = 0;
    for (i = 0; i < 10; i++) sum += i;
    return sum;
}

// C99: also legal — declarations interleave with code
int main(void) {
    int sum = 0;
    for (int i = 0; i < 10; i++) sum += i;
    return sum;
}
```

**Designated initializers.** Initialize struct fields by name:

```c
struct point { int x, y, z; };
struct point p = { .x = 1, .z = 3 };  // y is zero-initialized
```

**Compound literals.** Anonymous struct/array values:

```c
draw_line((struct point){.x=0, .y=0}, (struct point){.x=10, .y=10});
```

**`<stdint.h>` and `<inttypes.h>`.** Fixed-width integer types
(`int32_t`, `uint64_t`, etc.) that finally killed the "is `int`
16 bits or 32 bits on this platform?" question.

**`<stdbool.h>`.** A `bool` type, with `true` and `false`
constants, that demystified "0 vs nonzero" in conditional code.

**`inline` keyword.** Suggest function inlining to the compiler.

**`restrict` keyword.** Promise that two pointers don't alias —
unlocks compiler optimizations.

**Variable-length arrays (VLAs).** `int arr[n]` where `n` is a
runtime value. Controversial — became *optional* in C11 because
they cause stack-overflow risks and aren't supported by all
compilers (notably MSVC). Use sparingly.

**Variadic macros.** `#define LOG(...) fprintf(stderr, __VA_ARGS__)`.

**`//` line comments.** That's right — single-line `//` comments
were not officially in C until 1999. Compilers had supported
them as extensions for decades.

> :surprisedgoose: Single-line comments became standard in C **in
> the same year that XML 1.0 second-edition shipped**. The
> standardization process is glacial, even when the feature is
> universally implemented as an extension.

### C99 → C11: concurrency joins the language

C11's biggest contribution: **threading and atomics are now part
of the language**, not just POSIX.

**`<threads.h>`.** Standard threading primitives:
`thrd_create`, `thrd_join`, `mtx_init`, `mtx_lock`. Almost no one
uses these — POSIX threads (`pthread_*`) had two decades of
momentum and existing code. But the standard now includes
threading, which matters for portable code.

**`<stdatomic.h>`.** Atomic types and operations:
`atomic_int`, `atomic_compare_exchange_strong`,
`memory_order_acquire`. These actually got adopted — the
Linux kernel's atomic ops use compiler built-ins that match this
spec.

**`_Generic`.** A primitive form of overloading via type
selection at compile time:

```c
#define abs(x) _Generic((x), \
    int: abs, \
    long: labs, \
    double: fabs, \
    float: fabsf \
)(x)
```

This is how C `<tgmath.h>` (type-generic math) is implemented in
C11. It's not as flexible as C++ templates, but it's enough for
many "polymorphic" macros.

**Anonymous structs and unions.** Nest a struct/union inside
another without naming it:

```c
struct outer {
    int tag;
    union {
        int i;
        float f;
    };  // anonymous — access as outer.i, outer.f
};
```

**`static_assert` (via `_Static_assert`).** Compile-time
assertions:

```c
_Static_assert(sizeof(int) >= 4, "need 32-bit int");
```

**Bounds-checking interfaces (Annex K).** Optional, mostly
ignored. The "safe" string functions like `strcpy_s`. Microsoft
pushed for them; the wider C community didn't bite.

**`alignas`, `alignof`, `noreturn`.** Memory-alignment
specifiers and a way to mark functions that don't return.

### C17 (2018): a bug-fix release

C17 is C11 with errata applied. No new features. Compiler
implementers needed a clean baseline before tackling the next big
revision. Skipped from a "what's new?" perspective.

### C99 → C23: the big one

Now to the main course.

C23 is the **first major new C standard in 12 years**. Its
ambition is genuinely bigger than C11 was. Some of it is overdue
cleanup; some of it is genuinely new.

#### True boolean type (no underscore)

```c
// C99 / C11
#include <stdbool.h>
bool flag = true;

// C23 — bool, true, false are keywords now
bool flag = true;     // no #include needed
```

`bool`, `true`, `false`, and `nullptr` are now native keywords.
This may seem cosmetic. It's not — it removes the dependency on
`<stdbool.h>` for cross-platform code and makes `bool` a real
first-class type, not a typedef in disguise.

#### `nullptr` — finally a typed null

```c
void *p = NULL;        // pre-C23 — NULL is some implementation-defined null
void *p = nullptr;     // C23 — typed nullptr
```

Why this matters: in C, `NULL` could be defined as `0`, `(void*)0`,
or even `(int)0`. This caused subtle bugs in variadic functions
and in `_Generic` selectors. `nullptr` has a *type* —
`nullptr_t` — that disambiguates.

> :sharpgoose: If you've ever written `printf("%d\n", NULL)` and
> gotten a warning about "passing argument of incompatible
> integer type," that's the bug `nullptr` fixes.

#### Binary literals

```c
uint8_t mask = 0b1100'0011;  // C23 binary literal
```

That `'` is a **digit separator** — also new — for readability.
You can write `1'000'000` instead of `1000000`. C++14 had this
since 2014; C finally caught up.

#### `auto` for type inference

```c
auto x = 42;          // x is int
auto v = 3.14;        // v is double
auto p = &v;          // p is double*
```

Yes, *that* `auto`, the same as C++ and Rust. C had `auto` as a
storage-class keyword for decades, but it meant nothing (`auto
int x = 5;` was synonymous with `int x = 5;`). C23 repurposes it
for type inference.

> :sarcasticgoose: We had a free `auto` keyword sitting around
> doing literally nothing for 50 years. Eventually someone
> noticed.

#### `constexpr` for variables

```c
constexpr int buffer_size = 4096;
char buf[buffer_size];   // legal — buffer_size is a true constant expression
```

This is **less powerful than C++'s `constexpr`** (no `constexpr
functions`, only variables). But it solidifies the "real
compile-time constant" concept that pre-C23 had to be expressed
via `enum` or `#define`.

#### Improved `enum`

```c
enum Color : uint8_t {  // C23: explicit underlying type
    RED, GREEN, BLUE
};
```

You can now specify the storage type of an enum, exactly the
same way C++11 lets you. No more "is this enum a 4-byte int or
a 1-byte byte?" — you say.

#### `typeof` and `typeof_unqual`

```c
int x = 42;
typeof(x) y = x;   // y is int
typeof(&x) p;       // p is int*
```

GCC has had `__typeof__` as an extension forever. C23 finally
standardizes it. `typeof_unqual` strips `const` / `volatile`.

#### Decimal floating-point

```c
_Decimal32 d = 3.14df;
_Decimal64 d2 = 100.00dd;
```

For financial / accounting work where binary floating-point
introduces rounding errors. Optional in C23 (Annex H), but
implementations are showing up in mainline GCC.

#### Bit utilities in `<stdbit.h>`

```c
#include <stdbit.h>
unsigned int x = 0b10110100;
int leading_zeros = stdc_leading_zeros(x);
int trailing_zeros = stdc_trailing_zeros(x);
int popcount       = stdc_count_ones(x);
unsigned int next_power_of_2 = stdc_bit_ceil(x);
```

These were always available as compiler intrinsics or via
`__builtin_clz`. Now they're standardized.

#### `<stdckdint.h>` — checked arithmetic

```c
#include <stdckdint.h>
int result;
if (ckd_add(&result, a, b)) {
    // overflow detected
}
```

Add, sub, mul with overflow detection — finally part of the
standard library. Saves you writing your own overflow checks for
the millionth time.

#### `[[attribute]]` syntax

C23 borrows C++11's attribute syntax for compiler hints:

```c
[[nodiscard]] int compute(void);    // warn if return value is discarded
[[deprecated("use foo2 instead")]] int foo(void);
[[noreturn]] void panic(const char *msg);
[[maybe_unused]] int debug_var;
```

This replaces the `_Noreturn`, `_Deprecated`, and various
implementation-specific attribute syntaxes from C11 and earlier.

#### `#embed`

```c
const unsigned char logo[] = {
    #embed "logo.png"
};
```

Embed binary file contents directly at compile time. No more
`xxd -i logo.png > logo.h` hack. This is a quietly major
quality-of-life feature for embedded developers.

#### `#elifdef` / `#elifndef`

Tiny but appreciated:

```c
#ifdef __linux__
    // ...
#elifdef __APPLE__   // C23
    // ...
#endif
```

Saves writing `#elif defined(...)`.

#### Improvements to function syntax

```c
// Pre-C23
void f(void) { /* ... */ }   // explicit "no parameters"
void g() { /* ... */ }        // K&R-style "unspecified parameters"

// C23: empty parens now mean "no parameters" — same as void
void g() { /* ... */ }        // C23: equivalent to void g(void)
```

Aligning C with C++ closes a 50-year-old footgun.

#### Standard library cleanup

Annex K (the `_s` "safe" functions) was deprecated. A bunch of
header files got reorganized. `<uchar.h>` got Unicode literal
helpers. `<time.h>` got `timespec_get` clarifications. All small
but cumulative.

## Why C23 deserves attention

Three reasons.

**1. It's the C *most new code will be written in for the next
decade*.** C is conservative. C99 still feels modern in 2026. C23
will feel modern in 2036. The features you ignore now are
features you'll be using when you're senior.

**2. The standard library improvements are real.** `<stdbit.h>`,
`<stdckdint.h>`, `#embed`, `nullptr` — these are quality-of-life
wins for the kind of low-level code C is for. Embedded teams,
kernel teams, libc maintainers will all benefit.

**3. C++ isn't replacing C, and never will.** C is the lingua
franca of FFI between languages. Every Rust crate that wraps a C
library uses C ABI. Every Python C extension uses C ABI. When the
language under all the other languages improves, the
ecosystem-wide knock-on effects are bigger than the C++ standard
of the same year.

## What it doesn't have (and probably never will)

C23 is not C++. Specifically, C23 still has:

- **No templates / generics.** `_Generic` is the closest thing,
  and it's a glorified compile-time switch.
- **No namespaces.** Header guards and prefix conventions remain
  the answer.
- **No exceptions.** `setjmp`/`longjmp` is the only mechanism,
  and almost nobody uses it.
- **No RAII.** You free what you allocate, by hand.
- **No standard collection library.** No `vector`, no `map`. You
  write your own or use a third-party library (klib, stb, etc.).
- **No string class.** `char *` and the manual buffer-management
  rituals continue.

This is the deal with C. **C is the language that doesn't grow
just because C++ did.** That's the point — keep the language
small enough that one person can understand the whole spec.
Twenty years from now, every C programmer will still recognize
every other C programmer's code.

> :weightliftinggoose: Quietly stable beats loudly clever.
> Every C standard is committee-vetted for compatibility with
> 50-year-old codebases. C++ ships breaking changes regularly
> ("compiler bugs you've come to depend on"). C ships changes
> that 30-year-old code still compiles under. That's not a bug
> in C — it's the deal.

## Compiler support

As of mid-2026:

- **GCC 13+ and Clang 18+** support the bulk of C23 with
  `-std=c23` (or `-std=c2x` on older versions).
- **MSVC** lags but is catching up. `nullptr`, `bool`, attributes,
  digit separators, `[[nodiscard]]` — supported. VLAs and some
  preprocessor features still missing.
- **Embedded compilers** (XC8, IAR, Keil) typically lag the most.
  C99 is your safe bet for cross-vendor portability today; C11 is
  reachable on all major modern toolchains; C23 is "use it on
  your dev machine, target C99 in production for now."

> :nerdygoose: The pragmatic playbook: write in C23, but use
> only the subset your target toolchain supports. Most C23
> features have C99 fallbacks (`bool` ↔ `_Bool`, `nullptr` ↔
> `NULL`, etc.). The discipline is the same as it was for C99
> in 2005.

## Resources

- The [C23 standard draft (N3220)](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n3220.pdf) — free PDF.
- Robert Seacord, *Effective C, 2nd ed.* (2024) — covers C23.
- Jens Gustedt, *Modern C, 2nd ed.* (2025) — also covers C23.
- The [C book on this site](/c-book) — a working draft of an
  intuition-first C algorithms-and-data-structures book.

## Closing

C is not in decline. C is in maintenance — quiet, steady,
twelve-year cadence. C23 is a real upgrade with twenty years of
accumulated good ideas finally landing. It will outlast a dozen
C++ revisions, get embedded in everything from microcontrollers
to kernels, and continue to be the substrate everyone else's
favorite language stands on.

If you write systems code, learn what C23 added. If you don't,
remember that the language under your favorite language just got
a refresh — and that in fifteen years it'll still look the same.

> :happygoose: K&R wrote a 200-page book that defined a language.
> Fifty years later, the spec is bigger, the features are
> richer, and the philosophy hasn't moved. That's how a language
> earns the word "classic."
