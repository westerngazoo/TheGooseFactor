---
sidebar_position: 2
sidebar_label: "Ch 2: Modern C++ Evolution"
title: "Chapter 2: Modern C++ Evolution (C++11 → C++26)"
---

# Chapter 2: Modern C++ Evolution (C++11 → C++26)

C++ before 2011 and C++ after 2011 are practically different languages. The committee adopted a three-year release cadence, and each standard has delivered features that fundamentally change how you write algorithms and data structures. This chapter maps the features that matter for this book — what they replaced, and why you should care.

> :nerdygoose: We're not covering every feature in every standard. We're covering the ones that change how you write, reason about, or optimize algorithms. If a feature doesn't show up in this book's code, it's not here.

## The Old World: C++98/03

Before C++11, this is what "modern C++" looked like:

```cpp
// C++98: Sorting a vector of pairs by second element
#include <vector>
#include <algorithm>

struct CompareBySecond {
    bool operator()(const std::pair<int,int>& a,
                    const std::pair<int,int>& b) const {
        return a.second < b.second;
    }
};

void sort_by_value(std::vector<std::pair<int,int>>& v) {
    std::sort(v.begin(), v.end(), CompareBySecond());
}
```

You needed a named struct with `operator()` just to pass a comparison function. Iterators required verbose type declarations. Templates produced error messages measured in kilobytes. Resource management meant raw `new`/`delete` and hoping you got the exception safety right.

> :angrygoose: C++98 templates were Turing-complete at compile time, which sounds powerful until you realize the "programming language" was accidental — no variables, no loops, just recursive template instantiation and `sizeof` tricks. People wrote compile-time programs in this. It was heroic and terrible.

## C++11: The Revolution

C++11 wasn't an incremental update. It was a new language wearing the old one's name.

### Move Semantics

The single most important feature for data structure performance.

**The problem**: C++98 copied everything. Returning a `vector` from a function copied every element. Inserting a temporary into a container copied it. Every copy was $O(n)$ when it could have been $O(1)$.

**The C way** (what we used to do):

```c
// C: "Move" by transferring pointer ownership
typedef struct {
    int* data;
    size_t size;
    size_t capacity;
} IntVec;

// "Move" — just copy the struct, null out the source
IntVec intvec_move(IntVec* src) {
    IntVec dst = *src;
    src->data = NULL;
    src->size = 0;
    src->capacity = 0;
    return dst;
}
```

**Modern C++23**:

```cpp
// C++11+: Move semantics built into the type system
class IntVec {
    std::unique_ptr<int[]> data_;
    size_t size_ = 0;
    size_t capacity_ = 0;
public:
    // Move constructor — steals resources, O(1)
    IntVec(IntVec&& other) noexcept
        : data_(std::move(other.data_))
        , size_(std::exchange(other.size_, 0))
        , capacity_(std::exchange(other.capacity_, 0))
    {}

    // Move assignment
    IntVec& operator=(IntVec&& other) noexcept {
        data_ = std::move(other.data_);
        size_ = std::exchange(other.size_, 0);
        capacity_ = std::exchange(other.capacity_, 0);
        return *this;
    }
};
```

> :mathgoose: Move semantics turn $O(n)$ copies into $O(1)$ pointer swaps. For a `vector<vector<int>>` with $m$ inner vectors averaging size $k$, sorting by copy is $O(m \log m \cdot k)$ — the $k$ factor comes from copying inner vectors during swaps. With moves, it's $O(m \log m)$ — three pointer swaps per "move." That's not a constant factor improvement; it changes the complexity class.

### `auto` and Type Deduction

```cpp
// C++98
std::vector<std::pair<std::string, int>>::const_iterator it = m.begin();

// C++11
auto it = m.begin();  // Same type, compiler deduces it
```

For algorithm code, `auto` eliminates noise without hiding intent. The type is still static — the compiler knows exactly what `it` is.

### Range-based `for`

```cpp
// C++98
for (std::vector<int>::iterator it = v.begin(); it != v.end(); ++it) {
    process(*it);
}

// C++11
for (auto& x : v) {
    process(x);
}
```

### Lambdas

The sorting example from the top of the chapter becomes:

```cpp
// C++11
std::sort(v.begin(), v.end(),
    [](const auto& a, const auto& b) { return a.second < b.second; });
```

No struct. No separate definition. The comparison lives where it's used.

**C equivalent** — function pointers, the only option:

```c
int compare_by_second(const void* a, const void* b) {
    const int* pa = (const int*)a + 1;  // second element
    const int* pb = (const int*)b + 1;
    return (*pa > *pb) - (*pa < *pb);
}

qsort(arr, n, 2 * sizeof(int), compare_by_second);
```

> :sarcasticgoose: `qsort` takes a `void*` comparator that can't inline, operates on untyped memory, and forces you to cast. `std::sort` with a lambda compiles to the same machine code as a hand-written loop — the comparator is inlined at compile time. Same algorithm. Same hardware. Dramatically different ergonomics and performance.

### Smart Pointers

```cpp
// C++98: manual memory management
Node* n = new Node(42);
// ... who deletes this? When? What if an exception fires?
delete n;  // Maybe. If we remembered.

// C++11: ownership is encoded in the type
auto n = std::make_unique<Node>(42);  // Automatically deleted
auto shared = std::make_shared<Node>(42);  // Reference counted
```

**C equivalent**:

```c
// C: you are the garbage collector
Node* n = malloc(sizeof(Node));
n->value = 42;
// ... 200 lines later, in a different file, maybe ...
free(n);  // Hope nothing else points to it
```

> :angrygoose: Every data structure in this book that allocates heap memory uses smart pointers or RAII containers. Raw `new`/`delete` appears exactly zero times in our modern C++ code. If you're writing `new` in 2026, you need a very specific reason (custom allocators, placement new) or you're doing it wrong.

### `constexpr`

Compile-time computation that's actually readable:

```cpp
// C++11
constexpr int factorial(int n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
}

static_assert(factorial(5) == 120);  // Evaluated at compile time
```

**C equivalent** — preprocessor macros:

```c
// C: "compile-time" via preprocessor (fragile, no type safety)
#define FACTORIAL_5 120  // Just hardcode it
// Or recursive macros (don't)
```

## C++14: Polishing the Revolution

C++14 was mostly quality-of-life improvements.

### Generic Lambdas

```cpp
// C++14: auto parameters in lambdas
auto print = [](const auto& x) { std::cout << x << '\n'; };

print(42);        // int
print(3.14);      // double
print("hello");   // const char*
```

### Extended `constexpr`

C++11 `constexpr` functions could only be a single `return` statement. C++14 allows loops, local variables, and conditionals:

```cpp
// C++14
constexpr int factorial(int n) {
    int result = 1;
    for (int i = 2; i <= n; ++i)
        result *= i;
    return result;
}
```

### `std::make_unique`

```cpp
// C++11 oversight: make_shared existed but not make_unique
auto p = std::unique_ptr<Node>(new Node(42));  // C++11

// C++14 fix
auto p = std::make_unique<Node>(42);  // No raw new
```

## C++17: Practical Power

### Structured Bindings

```cpp
// C++17: Decompose pairs, tuples, structs
std::map<std::string, int> scores = {{"alice", 95}, {"bob", 87}};

for (const auto& [name, score] : scores) {
    std::cout << name << ": " << score << '\n';
}
```

**C equivalent**:

```c
// C: Access struct members manually, always
for (int i = 0; i < n; i++) {
    printf("%s: %d\n", entries[i].name, entries[i].score);
}
```

### `std::optional`

```cpp
// C++17: Explicit "might not have a value"
std::optional<int> find_index(std::span<const int> data, int target) {
    for (size_t i = 0; i < data.size(); ++i)
        if (data[i] == target) return static_cast<int>(i);
    return std::nullopt;
}

auto idx = find_index(arr, 42);
if (idx) { /* found at *idx */ }
```

**C equivalent**:

```c
// C: Return -1 or use an out-parameter
int find_index(const int* data, size_t n, int target) {
    for (size_t i = 0; i < n; i++)
        if (data[i] == target) return (int)i;
    return -1;  // Sentinel. Hope nobody uses -1 as valid index.
}
```

> :happygoose: `std::optional` eliminates sentinel values. No more `-1` meaning "not found," no more `nullptr` meaning "no result," no more checking documentation to know what the "invalid" return value is. The type itself says "this might be empty." Our search algorithms return `optional` throughout.

### `if constexpr`

Compile-time branching that eliminates dead code:

```cpp
// C++17: Branch at compile time
template<typename T>
void process(const T& val) {
    if constexpr (std::is_integral_v<T>) {
        // Integer-specific path — only compiled for integers
    } else if constexpr (std::is_floating_point_v<T>) {
        // Float path — only compiled for floats
    } else {
        // Generic path
    }
}
```

### `std::string_view`

Zero-copy string references:

```cpp
// C++17: No allocation, no copy
void log(std::string_view msg) {
    std::cout << msg << '\n';
}

log("literal");           // No allocation
log(some_string);         // No copy
log(some_string.substr(3, 5));  // Still no copy (unlike std::string::substr)
```

**C equivalent**:

```c
// C: Pointer + length (manual, no safety)
typedef struct { const char* ptr; size_t len; } StrView;

void log(StrView msg) {
    printf("%.*s\n", (int)msg.len, msg.ptr);
}
```

### Parallel Algorithms

```cpp
// C++17: Execution policies
#include <execution>

std::sort(std::execution::par, v.begin(), v.end());  // Parallel sort
std::reduce(std::execution::par_unseq, v.begin(), v.end());  // Vectorized reduction
```

> :nerdygoose: Execution policies are a hint, not a guarantee. `par` means "you may parallelize," `par_unseq` means "you may parallelize and vectorize." The implementation chooses the strategy. On small inputs, both fall back to sequential. The important thing is: the algorithm interface doesn't change — you add one parameter and the library handles threading.

## C++20: The Paradigm Shift

### Concepts

Type constraints that replace SFINAE and `enable_if` nightmares:

```cpp
// C++20: Sortable means what it says
template<std::random_access_iterator Iter, std::sentinel_for<Iter> Sent,
         std::indirect_strict_weak_order<Iter> Comp = std::ranges::less>
void my_sort(Iter first, Sent last, Comp comp = {});

// Or simpler with concept shorthand:
void my_sort(std::sortable_range auto&& r);
```

**Before concepts** (C++17 and earlier):

```cpp
// SFINAE horror
template<typename Iter,
    typename = std::enable_if_t<
        std::is_base_of_v<std::random_access_iterator_tag,
            typename std::iterator_traits<Iter>::iterator_category>>>
void my_sort(Iter first, Iter last);
// Error messages: 400 lines of template instantiation backtrace
```

> :angrygoose: Pre-concept error messages for template failures were legendary. Pass an `std::list::iterator` to an algorithm requiring random access? Here's 200 lines of nested template expansion ending with "no matching function call." With concepts: "constraint `std::random_access_iterator` not satisfied." One line. The right line.

### Ranges

The iterator pair `(begin, end)` becomes a single range:

```cpp
// C++20 Ranges
#include <ranges>

auto results = data
    | std::views::filter([](int x) { return x > 0; })
    | std::views::transform([](int x) { return x * x; })
    | std::views::take(10);

// Lazy — nothing computed until you iterate
for (int x : results) { /* ... */ }
```

**C++98 equivalent** (eager, allocates intermediates):

```cpp
std::vector<int> filtered;
std::copy_if(data.begin(), data.end(), std::back_inserter(filtered),
    [](int x) { return x > 0; });
std::vector<int> transformed;
std::transform(filtered.begin(), filtered.end(), std::back_inserter(transformed),
    [](int x) { return x * x; });
transformed.resize(std::min(transformed.size(), size_t(10)));
```

**C equivalent**:

```c
// C: Manual loop. Always manual.
int results[10];
int count = 0;
for (size_t i = 0; i < n && count < 10; i++) {
    if (data[i] > 0) {
        results[count++] = data[i] * data[i];
    }
}
```

> :happygoose: Ranges compose like Unix pipes: each stage transforms the data and passes it to the next. The C loop does the same thing but mixes filtering, transformation, and limiting into one block. Ranges separate concerns while staying just as efficient — views are lazy and allocate nothing.

### `std::span`

A non-owning view over contiguous memory:

```cpp
// C++20
void process(std::span<const int> data) {
    for (int x : data) { /* ... */ }
}

std::vector<int> v = {1, 2, 3};
int arr[] = {4, 5, 6};

process(v);    // Works
process(arr);  // Works
process({v.data() + 1, 2});  // Subrange — works
```

**C equivalent**:

```c
// C: Pointer + size. The original span.
void process(const int* data, size_t n) {
    for (size_t i = 0; i < n; i++) { /* ... */ }
}
```

> :nerdygoose: `std::span` is the C++ formalization of what C programmers have always done: pass a pointer and a length. The difference is that `span` knows its size, supports range-based `for`, and catches out-of-bounds access in debug mode. Our algorithm interfaces take `span` over raw pointers throughout this book.

### Three-Way Comparison (`<=>`)

```cpp
// C++20: Spaceship operator
struct Point {
    int x, y;
    auto operator<=>(const Point&) const = default;
};
// Generates ==, !=, <, <=, >, >= automatically
```

**C equivalent**:

```c
// C: Write a comparison function. Then another. Then four more.
int point_cmp(const void* a, const void* b) {
    const Point* pa = a;
    const Point* pb = b;
    if (pa->x != pb->x) return pa->x - pb->x;
    return pa->y - pb->y;
}
```

### Modules

```cpp
// C++20 module
export module goose.algorithm.sort;

export template<std::random_access_iterator Iter>
void bubble_sort(Iter first, Iter last);
```

Replaces `#include` with explicit module imports. Faster compilation, no header pollution, no include-order bugs.

## C++23: Refinements

### `std::expected`

Error handling without exceptions:

```cpp
// C++23
std::expected<int, std::string> parse_int(std::string_view s) {
    int val;
    auto [ptr, ec] = std::from_chars(s.data(), s.data() + s.size(), val);
    if (ec != std::errc{})
        return std::unexpected("parse failed");
    return val;
}

auto result = parse_int("42");
if (result) {
    use(*result);
} else {
    log(result.error());
}
```

**C equivalent**:

```c
// C: Error codes + out-parameters
typedef enum { OK, PARSE_ERROR } ErrCode;

ErrCode parse_int(const char* s, int* out) {
    char* end;
    long val = strtol(s, &end, 10);
    if (end == s) return PARSE_ERROR;
    *out = (int)val;
    return OK;
}
```

### `std::print`

```cpp
// C++23: Type-safe formatted output
std::print("Found {} at index {}\n", value, idx);
```

Replaces both `printf` (unsafe) and `iostream` (verbose).

### More `constexpr`

`std::vector` and `std::string` are now `constexpr`-capable. You can build and sort a vector at compile time:

```cpp
// C++23
consteval auto sorted_primes() {
    std::vector<int> primes = {7, 2, 11, 3, 5};
    std::sort(primes.begin(), primes.end());
    return primes;  // Computed at compile time
}
```

> :surprisedgoose: A full `std::vector` with heap allocation, `std::sort` with comparisons and swaps — all at compile time. The compiler is now a general-purpose interpreter. This means lookup tables, precomputed data structures, and validation can all happen before your program runs. Zero runtime cost.

### `std::mdspan`

Multidimensional view over contiguous memory:

```cpp
// C++23: 2D matrix view over a flat array
std::vector<double> data(rows * cols);
std::mdspan matrix(data.data(), rows, cols);

matrix[i, j] = 3.14;  // C++23 multidimensional subscript
```

## C++26: On the Horizon

### Contracts (proposed)

```cpp
// C++26 (expected)
int binary_search(std::span<const int> data, int target)
    pre(std::is_sorted(data.begin(), data.end()))
    post(r: r == -1 || data[r] == target)
{
    // Implementation...
}
```

Preconditions and postconditions as part of the function signature. The compiler can check them in debug builds and optimize with them in release.

> :mathgoose: Contracts formalize what we've been writing as comments: "input must be sorted," "result is non-negative." Moving them into the language means they're checkable (debug builds), optimizable (release builds assume them true), and documentable (they're in the signature). Every algorithm has preconditions — contracts make them first-class.

### Reflection (proposed)

Compile-time introspection of types, members, and attributes. Will enable automatic serialization, generic comparators, and debug printers without macros.

## Feature Map: What We Use in This Book

| Feature | Standard | Where it appears |
|---|---|---|
| Move semantics | C++11 | Every data structure (Ch 4, 8–17) |
| `auto`, lambdas | C++11 | Everywhere |
| Smart pointers | C++11 | Trees, graphs (Ch 13, 17) |
| `constexpr` | C++11/14/23 | Compile-time tables, tests |
| Structured bindings | C++17 | Graph algorithms (Ch 19–21) |
| `std::optional` | C++17 | Search functions (Ch 18) |
| `if constexpr` | C++17 | Generic algorithm dispatch |
| Concepts | C++20 | All algorithm interfaces |
| Ranges/views | C++20 | Pipeline composition (Ch 5, 18) |
| `std::span` | C++20 | Array/buffer algorithms (Ch 8) |
| `<=>` | C++20 | Comparison-based structures |
| `std::expected` | C++23 | Error-returning algorithms |
| `std::print` | C++23 | Examples and demos |

## The C Column

Throughout this book, every algorithm gets two implementations:

1. **Modern C++23/26** — concepts, ranges, RAII, value semantics
2. **C-compatible** — `void*`, function pointers, manual memory, portable

The C version isn't nostalgia. It's pedagogical. When you see a sort implemented with raw pointers and `memcpy`, you understand exactly what the hardware does. When you see the same sort with iterators and concepts, you understand what the abstraction buys you. Both versions compile to similar machine code. The difference is in who manages the complexity — you or the compiler.

> :sarcasticgoose: "Why would I ever write the C version?" Because embedded systems exist. Because kernel code exists. Because understanding what's under the abstraction makes you better at using the abstraction. And because when your C++ template error is 300 lines long, the C version reminds you that sorting an array is actually simple.

> :weightliftinggoose: Think of it like training: the C version is raw barbell work — no machines, no assistance, just you and the iron. The C++ version is the same movement pattern with better equipment. You need to understand the raw form before the assisted version makes sense. And sometimes, the raw form is all you have.

## Quick Reference: Standard Availability

| Compiler | C++17 | C++20 | C++23 | C++26 |
|---|---|---|---|---|
| GCC 13+ | Full | Full | Partial | Experimental |
| GCC 14+ | Full | Full | Mostly | Experimental |
| Clang 17+ | Full | Full | Partial | Experimental |
| Clang 18+ | Full | Full | Mostly | Experimental |
| MSVC 19.38+ | Full | Full | Partial | Experimental |

Compile with `-std=c++23` (GCC/Clang) or `/std:c++latest` (MSVC).

For the C versions: `-std=c11` or `-std=c17`. Any compiler from the last decade works.
