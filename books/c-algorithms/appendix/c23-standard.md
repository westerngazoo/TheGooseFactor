---
sidebar_position: 1
sidebar_label: "C23 Standard Reference"
title: "Appendix: The C23 Standard — What's New, What's Gone, What to Use"
---

# Appendix: The C23 Standard

C23 is the third major revision of the language since C99 — published as ISO/IEC 9899:2024 (final draft N3220). It is the version this book is written against. This appendix covers every C23 feature you are likely to use in algorithm code, with a runnable example for each.

## Enabling C23

| Compiler | Flag | Minimum version |
|---|---|---|
| GCC | `-std=c23` (alias `-std=c2x` on GCC ≤ 13) | GCC 14 (most features); GCC 15 for full coverage |
| Clang | `-std=c23` (alias `-std=c2x` on Clang ≤ 17) | Clang 18 (most features); Clang 19 for `#embed` |
| MSVC | `/std:clatest` | VS 17.9+ (partial; lags GCC/Clang significantly) |

Throughout this book the assumed flags are:

```sh
gcc -std=c23 -Wall -Wextra -Werror -O2 -pedantic
```

> :angrygoose: Compiler support for C23 is a moving target. Treat the matrix above as "should work, may not." When a feature isn't yet portable, this book uses the C11/C17 fallback and notes it in the chapter. The two non-portable features as of mid-2024 are `#embed` (Clang 19+, GCC 15+) and `_BitInt` widths above 128.

## Keywords Promoted From Macros

C99 and C11 added several features as macros in headers. C23 promotes them to keywords:

| C23 keyword | Was in pre-C23 |
|---|---|
| `bool` | `_Bool` (keyword) + `<stdbool.h>` macro |
| `true`, `false` | `<stdbool.h>` macros (now keywords with type `bool`) |
| `static_assert` | `_Static_assert` keyword + `<assert.h>` macro |
| `thread_local` | `_Thread_local` keyword + `<threads.h>` macro |
| `alignas`, `alignof` | `_Alignas`, `_Alignof` keywords + `<stdalign.h>` macros |

You no longer need `#include <stdbool.h>` to use `bool`, `true`, `false`. The same goes for `static_assert`, `thread_local`, `alignas`, `alignof`. Including the legacy headers is harmless — they're empty in C23.

```c
// C23: no headers needed for any of these.
static_assert(sizeof(int) >= 4, "int must be at least 32 bits");

bool flag = true;
thread_local int tls_counter = 0;
alignas(64) char cache_line[64];
```

> :nerdygoose: `true` and `false` in C23 have type `bool`, not `int`. This breaks code that did `sizeof(true) == sizeof(int)` (it's now `sizeof(bool)`, which is `1`). Such code should not have existed.

## `nullptr` and `nullptr_t`

C23 adds a typed null pointer constant.

```c
#include <stddef.h>  // for nullptr_t

void *p = nullptr;          // nullptr_t implicitly converts to any pointer type
int  *q = nullptr;          // same
nullptr_t n = nullptr;

// The classic NULL ambiguity is gone:
void f(int);
void f(void *);
f(NULL);     // ambiguous on some implementations (NULL might be (void*)0 or 0)
f(nullptr);  // unambiguous: calls the void* overload (in C, via _Generic)
```

`NULL` continues to work and is unchanged. Use `nullptr` for new code; you don't need to grep through old code to replace `NULL`.

> :sharpgoose: The real win of `nullptr` is in `_Generic` selections and variadic functions. `NULL` is a macro that expands to `(void*)0` or `0` — type-dependent, brittle. `nullptr` is a single token with a known type. If you write a generic API, prefer it.

## Empty Parameter Lists

In C17 and earlier, a function declared `int f()` accepted any number of arguments of any type — a holdover from K&R C. C23 finally aligns with C++: `f()` means `f(void)`.

```c
// C17: foo() means "unspecified parameters" — calling foo(1, 2, 3) is legal.
// C23: foo() means foo(void) — calling foo(1) is a constraint violation.
int foo();

int main(void) {
    foo(42);  // C17: legal. C23: error.
    return 0;
}
```

This is a silent breaking change in old code. Run `-Wstrict-prototypes` (GCC) before upgrading.

> :angrygoose: This change kills a category of bugs that have plagued C since 1989. K&R prototypes meant the compiler could not check argument counts or types across declarations. People got used to it. The cost was 35 years of subtle calling-convention mismatches. C23 finally pulls the plug. Good.

## `[[attribute]]` Syntax

C23 adopts the `[[attribute]]` syntax from C++. The standard attributes:

| Attribute | Meaning |
|---|---|
| `[[deprecated]]`, `[[deprecated("reason")]]` | Warn if used |
| `[[fallthrough]]` | Marks intentional `case` fall-through |
| `[[maybe_unused]]` | Suppress unused-variable/parameter warnings |
| `[[nodiscard]]`, `[[nodiscard("reason")]]` | Warn if return value ignored |
| `[[noreturn]]` | Function does not return (replaces `_Noreturn`) |
| `[[reproducible]]` | Pure function (same input → same output, no observable side effects beyond return) |
| `[[unsequenced]]` | Stronger than `reproducible`: no observable side effects, including reads of global state |

```c
[[nodiscard("memory leak — check return")]]
static int *make_array(size_t n);

[[noreturn]]
static void die(const char *msg);

static void parse(int op) {
    switch (op) {
        case 1:
            do_thing();
            [[fallthrough]];
        case 2:
            do_other_thing();
            break;
        default:
            die("bad op");
    }
}

[[deprecated("use vec_push_safe instead")]]
static void vec_push_unsafe(struct vec *v, int x);
```

`[[reproducible]]` and `[[unsequenced]]` are new in C23 and let the compiler optimize aggressively across calls. `[[unsequenced]]` is the stronger of the two:

```c
[[unsequenced]]
static int square(int x) { return x * x; }   // no side effects, no reads of globals

[[reproducible]]
static int hash(const char *s);               // pure function of s; may read s
```

The compiler can hoist, fold, and CSE calls to `[[unsequenced]]` functions freely.

## `typeof` and `typeof_unqual`

C23 standardizes `typeof` (a long-time GCC extension) and adds `typeof_unqual`, which strips `const` and `volatile`.

```c
const int x = 42;
typeof(x)         a = x;  // const int — same qualifiers
typeof_unqual(x)  b = x;  // int       — qualifiers stripped

#define SWAP(a, b) do { \
    typeof(a) tmp = (a); \
    (a) = (b); \
    (b) = tmp; \
} while (0)
```

`typeof` is the foundation of type-generic macros without the `_Generic` ceremony. Combine with `__auto_type` (now standardized as the new `auto`, see below) for clean macro hygiene.

## `auto` Type Inference

C23 reuses the `auto` keyword (which has been in C since K&R but meant nothing useful — "automatic storage duration," the default) for type inference.

```c
auto x = 42;        // int
auto y = 3.14;      // double
auto p = &x;        // int *

auto i = 0u;        // unsigned int
auto j = 0uz;       // size_t (C23 also adds the 'z' suffix)
```

`auto` requires an initializer. Use it where the type is obvious from the right-hand side and ceremony hurts readability — particularly with iterator-like patterns or in macros.

> :sarcasticgoose: "But this is the C++ feature people complain about!" The C++ complaint is that `auto` hides types in long expressions and method chains. C has neither. In C, `auto` essentially replaces `__auto_type` (the GCC extension). It is mostly useful inside macros where the expansion needs to capture an argument's type without naming it.

## `constexpr` Objects

C23 introduces `constexpr` for **objects** (not functions — that's still C++ only).

```c
constexpr int MAX_USERS = 1024;
constexpr double TAU = 6.283185307179586;
constexpr size_t HASH_SEED = 0x9E3779B97F4A7C15ull;

// constexpr objects are usable in:
//   - array dimensions (like enum constants)
//   - case labels
//   - static_assert
static_assert(MAX_USERS > 0, "must be positive");
int users[MAX_USERS];
```

The difference from `const`: a `const int` is read-only but is *not* a constant expression in C — you can't use it as an array size or in a `case` label. A `constexpr int` is. Before C23, the workaround was `enum` constants or `#define`. Both still work; `constexpr` is the modern choice for typed compile-time values.

> :nerdygoose: `constexpr` in C is more limited than in C++. It applies only to objects with literal-typed initializers. You cannot have a `constexpr` function or a `constexpr` `struct` literal initializer that calls a non-constexpr function. The compiler must be able to evaluate the initializer at translation time.

## `_BitInt(N)` — Arbitrary-Width Integers

C23 standardizes `_BitInt(N)` for arbitrary-width signed integers and `unsigned _BitInt(N)` for unsigned. `N` is the exact width in bits.

```c
_BitInt(7)            small;    // 7-bit signed: -64..63
unsigned _BitInt(33)  big;      // 33-bit unsigned

unsigned _BitInt(128) huge_a = 12345;
unsigned _BitInt(128) huge_b = 67890;
unsigned _BitInt(128) sum    = huge_a + huge_b;  // exact 128-bit math
```

The implementation must support widths up to `BITINT_MAXWIDTH` (in `<limits.h>`). A typical lower bound is 64 bits; GCC and Clang now support widths up to several thousand bits.

`_BitInt` types do **not** undergo integer promotion. Arithmetic on a `_BitInt(7)` stays at 7 bits (with C23's well-defined wrapping for unsigned, undefined overflow for signed).

> :nerdygoose: Use cases: cryptographic algorithms, bignum arithmetic, hardware register modeling, exact-bit-count fields without bitfield syntax. The signed-overflow rules are the same as for plain `int`: undefined on overflow. Use the `unsigned` form unless you specifically want signed semantics.

## Decimal Floating-Point

C23 adds `_Decimal32`, `_Decimal64`, `_Decimal128` (IEEE 754-2008 decimal floats).

```c
_Decimal64 price = 19.99dd;   // decimal double — represents 19.99 exactly
_Decimal64 sum   = price + 0.01dd;  // 20.00 exactly, no binary rounding
```

These are useful in financial code where binary rounding of $0.1$ is unacceptable. Compiler support is uneven; GCC supports the types under `-std=c23` on platforms with hardware DFP (POWER, z/Arch); Clang's support is partial.

> :angrygoose: Don't reach for these unless you actually need decimal exactness. They are slower than binary floats on every consumer CPU and the library function support is sparse.

## Binary Literals and Digit Separators

```c
int  mask  = 0b1010'1010;   // binary literal + digit separator
long count = 1'000'000;     // ten million, readable
unsigned long bytes = 0xDEAD'BEEFul;
```

Binary literals (`0b...`) and digit separators (`'`) are both C23 additions. They are also valid in C++, so the syntax is shared.

> :sharpgoose: Use digit separators on any literal longer than $4$ characters where the magnitude matters. `1'000'000` reads instantly; `1000000` requires a moment of counting zeros. The cost is one apostrophe per group.

## New Integer Suffixes

| Suffix | Type |
|---|---|
| `wb` / `WB` | `_BitInt` (signed) |
| `uwb` / `UWB` | `unsigned _BitInt` |
| `z` / `Z` | signed size — typically `ptrdiff_t` |
| `uz` / `UZ` | `size_t` |

```c
size_t n = 100uz;             // size_t, no cast
auto   m = 100uz;             // auto picks size_t
_BitInt(64) bb = 0xFEDC'BA98'7654'3210wb;
```

The `uz` suffix is the most useful — it eliminates casts in loop bounds and array-index arithmetic.

```c
// Pre-C23:
for (size_t i = 0; i < n; ++i) {}    // 0 is int, n is size_t — compiler warns at -Wsign-compare

// C23:
for (size_t i = 0uz; i < n; ++i) {}  // both size_t, no warning
```

## `unreachable()`

A new macro in `<stddef.h>` that tells the compiler the location is impossible to reach. Reaching it is undefined behavior.

```c
#include <stddef.h>

static int sign(int x) {
    if (x < 0) return -1;
    if (x > 0) return  1;
    if (x == 0) return 0;
    unreachable();
}
```

The compiler uses `unreachable()` to prune the dead path. Without it, GCC and Clang emit a fall-through path with a default return of zero (or undefined garbage in `-O0`). With it, the compiler trusts you and emits no fall-through.

> :angrygoose: If control actually reaches `unreachable()`, you have undefined behavior. The compiler will optimize as if the prior `if`/`switch` exhausted all cases, and you will get nasal demons. Use it only when the case truly is impossible — and prefer to `static_assert` the impossibility when you can.

## Improved Enumerations

C23 enums can have an explicit underlying type:

```c
enum Color : unsigned char {
    RED, GREEN, BLUE
};

static_assert(sizeof(enum Color) == 1, "fits in a byte");

enum Status : int32_t {
    OK    = 0,
    ERROR = -1
};
```

In C17, the underlying type of an `enum` was implementation-defined (usually `int`). C23 lets you pin it to anything you want, which matters for serialization, memory-mapped I/O, and array packing.

Forward declarations work too:

```c
enum Color : unsigned char;   // forward decl
struct Pixel { enum Color c; };
// ... later ...
enum Color : unsigned char { RED, GREEN, BLUE };
```

## Variadic Macros: `__VA_OPT__`

`__VA_OPT__(content)` expands to `content` if `__VA_ARGS__` is non-empty, and to nothing otherwise.

```c
#define LOG(fmt, ...) printf(fmt __VA_OPT__(,) __VA_ARGS__)

LOG("hello\n");                  // printf("hello\n")
LOG("hello %d\n", 42);           // printf("hello %d\n", 42)
```

In C17, you needed compiler-specific tricks (`##__VA_ARGS__`) to avoid the dangling comma. C23 standardizes the solution.

## `#embed` — Binary Inclusion

C23 introduces `#embed` for including binary data at translation time.

```c
const unsigned char favicon[] = {
    #embed "favicon.ico"
};

const unsigned char shader[] = {
    #embed "shader.spv" limit(4096)
};
```

`limit(N)` caps the number of bytes embedded; an `if_empty` clause provides a fallback. This replaces shell scripts that converted binaries to C arrays (`xxd -i`).

> :nerdygoose: As of mid-2024, `#embed` is in Clang 19 and GCC 15. For earlier versions, fall back to `xxd -i favicon.ico > favicon.h` in the build system.

## Preprocessor: `__has_include`, `__has_c_attribute`, `#elifdef`/`#elifndef`

Feature-test the preprocessor directly:

```c
#if __has_include(<stdbit.h>)
#  include <stdbit.h>
#  define HAVE_STDBIT 1
#else
#  define HAVE_STDBIT 0
#endif

#if __has_c_attribute(nodiscard) >= 202003L
#  define NODISCARD [[nodiscard]]
#else
#  define NODISCARD __attribute__((warn_unused_result))
#endif

#ifdef DEBUG
#  define LOG(...) fprintf(stderr, __VA_ARGS__)
#elifdef RELEASE        // C23: shorter than #elif defined(RELEASE)
#  define LOG(...) ((void)0)
#elifndef HEADLESS
#  define LOG(...) write_to_console(__VA_ARGS__)
#else
#  define LOG(...) ((void)0)
#endif
```

## New Library: `<stdbit.h>` — Bit Operations

C23 finally adds portable bit utilities. Every function comes in width-specific variants (`uc`, `us`, `ui`, `ul`, `ull`) and a generic version that dispatches on type:

| Function | Description |
|---|---|
| `stdc_count_ones` | Population count (number of `1` bits) |
| `stdc_count_zeros` | Number of `0` bits |
| `stdc_leading_zeros` | Count leading zero bits |
| `stdc_leading_ones` | Count leading one bits |
| `stdc_trailing_zeros` | Count trailing zero bits |
| `stdc_trailing_ones` | Count trailing one bits |
| `stdc_first_leading_one` | Position of highest set bit (1-indexed; `0` if none) |
| `stdc_first_trailing_one` | Position of lowest set bit |
| `stdc_bit_width` | Minimum bits to represent value |
| `stdc_bit_floor` | Largest power of 2 ≤ value |
| `stdc_bit_ceil` | Smallest power of 2 ≥ value |
| `stdc_has_single_bit` | True if exactly one bit set |

```c
#include <stdbit.h>

unsigned x = 0b0010'1100;
unsigned popcount = stdc_count_ones(x);          // 3
unsigned next_pow2 = stdc_bit_ceil(100u);         // 128
bool is_power = stdc_has_single_bit(64u);         // true
```

These map to single CPU instructions on most architectures (`POPCNT`, `LZCNT`, `TZCNT`). Before C23 you wrote `__builtin_popcount` (GCC/Clang) or hand-rolled `int popcnt(uint32_t x) { x = x - ((x >> 1) & 0x55555555); ... }`.

## New Library: `<stdckdint.h>` — Checked Integer Arithmetic

Portable overflow-checking arithmetic, finally.

```c
#include <stdckdint.h>

int a = INT_MAX, b = 1, sum;
if (ckd_add(&sum, a, b)) {
    fprintf(stderr, "overflow!\n");
}

size_t n = 1000, elem = 16, total;
if (ckd_mul(&total, n, elem)) {
    return -1;  // would overflow size_t — refuse to allocate
}
void *buf = malloc(total);
```

Each function returns `true` on overflow, `false` on success, and writes the wrapped result to the output. The functions are type-generic:

```c
ckd_add(&dst, a, b)   // dst, a, b can be any integer types
ckd_sub(&dst, a, b)
ckd_mul(&dst, a, b)
```

Before C23, the safe pattern was either compiler builtins (`__builtin_add_overflow`) or careful manual checks. Use `<stdckdint.h>` instead — every `malloc(n * sizeof *p)` should route through `ckd_mul` first.

> :angrygoose: The number of CVE-rated vulnerabilities caused by `n * size` overflowing into a small `malloc` followed by an unbounded write is in the thousands. `<stdckdint.h>` makes the safe version one line. There is no longer an excuse.

## `<string.h>` Additions

| Function | Description |
|---|---|
| `memccpy` | Copy bytes until a delimiter or count limit |
| `strdup` | Allocate and copy a string (was POSIX, now standard) |
| `strndup` | Same as `strdup` with a max length |
| `memset_explicit` | Like `memset` but cannot be optimized away (replaces `memset_s`) |

```c
char *copy = strdup("hello");       // malloc'd, must free
if (!copy) return -1;
free(copy);

char password[64];
read_password(password, sizeof password);
use(password);
memset_explicit(password, 0, sizeof password);   // not elided by optimizer
```

`memset_explicit` replaces the C11 Annex K `memset_s` (which never saw wide implementation). Use it for any sensitive data — keys, passwords, plaintext after encryption.

## UTF-8 Character Type: `char8_t`

C23 adds `char8_t` (an unsigned 8-bit type) and `u8` character constants:

```c
char8_t c = u8'A';
const char8_t *greeting = u8"hello, world";
```

This is mostly relevant when interoperating with code that distinguishes UTF-8 from arbitrary byte arrays. Plain `char *` continues to work for UTF-8 strings.

## What's Removed

- **K&R function declarations.** `int f(x, y) int x; int y; { ... }` is no longer valid.
- **K&R prototype semantics.** `f()` no longer means "unspecified arguments" (covered above).
- **Trigraphs.** Removed in C23 (had been deprecated since C99).
- **Storage-class specifier `register`** on parameters in function definitions remains, but reduced semantics.
- **The `<assert.h>` macro `static_assert`** still exists, but now expands to the keyword.

## Quick-Reference Cheat Sheet

```c
// Keywords (no header needed):
bool, true, false, nullptr, static_assert, thread_local, alignas, alignof
typeof, typeof_unqual, auto, constexpr

// Types:
nullptr_t, _BitInt(N), unsigned _BitInt(N), char8_t,
_Decimal32, _Decimal64, _Decimal128

// Suffixes:
0b...                       // binary literal
1'000'000                   // digit separator
100uz, 100z                 // size_t, ptrdiff_t
123wb, 123uwb               // _BitInt
1.5dd, 1.5df, 1.5dl         // _Decimal{64,32,128}

// Attributes:
[[nodiscard]] [[noreturn]] [[deprecated]] [[fallthrough]]
[[maybe_unused]] [[reproducible]] [[unsequenced]]

// New headers:
<stdbit.h>     // bit utilities (popcount, bit_ceil, ...)
<stdckdint.h>  // checked arithmetic (ckd_add, ckd_mul, ...)

// Preprocessor:
#embed "file.bin"
#elifdef X / #elifndef X
__has_include(...) / __has_c_attribute(...)
__VA_OPT__(...)

// Functions added to existing headers:
strdup, strndup, memccpy, memset_explicit  // <string.h>
unreachable()                              // <stddef.h>

// Empty parens:
int f();   // C23: equivalent to f(void). C17: any args.
```

## Reading List

- **N3220** — final C23 working draft (April 2024). The authoritative document.
- **N3096** — earlier C23 draft, widely available, very close to final.
- **WG14 papers** — `https://www.open-std.org/jtc1/sc22/wg14/` lists every accepted C23 paper. Each feature in this appendix has a corresponding paper number explaining the design rationale.
- **GCC C23 status** — `https://gcc.gnu.org/projects/cxx-status.html#c23` (yes, the URL says cxx; the table is correct).
- **Clang C23 status** — `https://clang.llvm.org/c_status.html`.

> :happygoose: C23 is the first C standard since C99 that genuinely changes how you write everyday C. C11 added `_Generic`, atomics, and threads — useful for libraries, invisible in most code. C17 was a bugfix release. C23 is the one where ordinary code looks different: `bool`, `nullptr`, `[[nodiscard]]`, `constexpr`, real popcount. Adopt it as your default and don't look back.
