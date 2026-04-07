---
sidebar_position: 5
sidebar_label: "Ch 5: Iterators & Ranges"
title: "Chapter 5: Iterators, Ranges, and Views"
---

# Chapter 5: Iterators, Ranges, and Views

Iterators are the glue between data structures and algorithms in C++. An algorithm doesn't care whether it's operating on an array, a linked list, or a tree — it only sees iterators. This abstraction is what makes `std::sort` work on any container. Ranges (C++20) wrap the iterator pair into a single object and add composable transformations.

> :mathgoose: The iterator abstraction decouples algorithms from containers: $M$ algorithms $\times$ $N$ containers gives $M + N$ implementations instead of $M \times N$. Each container provides iterators. Each algorithm accepts iterators. The interface is the iterator category.

## Iterator Categories

Iterators form a hierarchy based on what operations they support:

```
                    ┌─────────────────────┐
                    │  contiguous_iterator │  (C++20)
                    │  (array, vector,     │
                    │   span, string)      │
                    └──────────┬──────────┘
                               │ adds: elements are adjacent in memory
                    ┌──────────▼──────────┐
                    │ random_access_iterator│
                    │  (deque, array,      │
                    │   vector)            │
                    └──────────┬──────────┘
                               │ adds: +n, -n, [n], <, >, <=, >=
                    ┌──────────▼──────────┐
                    │ bidirectional_iterator│
                    │  (list, set, map)    │
                    └──────────┬──────────┘
                               │ adds: --it
                    ┌──────────▼──────────┐
                    │  forward_iterator    │
                    │  (forward_list,      │
                    │   unordered_set/map) │
                    └──────────┬──────────┘
                               │ adds: multi-pass guarantee
                    ┌──────────▼──────────┐
                    │   input_iterator     │
                    │  (istream_iterator)  │
                    └──────────────────────┘
                        base: ++it, *it, ==
```

**Why this matters for algorithms:**

| Algorithm | Minimum requirement | Why |
|---|---|---|
| `std::find` | Input iterator | Single pass, forward only |
| `std::reverse` | Bidirectional iterator | Needs `--it` to walk backward |
| `std::sort` | Random access iterator | Needs `it + n` for partitioning |
| `std::binary_search` | Random access iterator | Needs `it + n/2` for midpoint |

> :angrygoose: Passing a `std::list::iterator` to `std::sort` is a compile error with concepts (C++20) or a wall of template errors without them (C++17 and below). `std::sort` requires random access because quicksort/introsort needs $O(1)$ element access by index. `std::list` has its own `.sort()` (merge sort, $O(n \log n)$, works with bidirectional iterators).

### C Equivalent: Pointers

In C, the iterator is a pointer. Always.

```c
// C: "iterators" are pointers
int arr[] = {5, 3, 1, 4, 2};
int* begin = arr;
int* end = arr + 5;

// "Find" — single pass
int* find_c(int* first, int* last, int value) {
    for (; first != last; ++first)
        if (*first == value) return first;
    return last;
}

// "Sort" — random access via pointer arithmetic
// qsort uses void* which is less structured
qsort(arr, 5, sizeof(int), int_compare);
```

> :nerdygoose: C pointers are random access iterators — they support `+n`, `-n`, `ptr[n]`, and comparison. C++ iterators generalize pointers to work with non-contiguous data structures. A `std::list::iterator` still uses `++it` and `*it`, but `it + 5` doesn't compile because list nodes aren't contiguous.

## Writing an Iterator

For our `DynArray` from Chapter 4, raw pointers work as iterators:

```cpp
template<typename T>
class DynArray {
    // ...
public:
    // Raw pointers satisfy contiguous_iterator
    using iterator = T*;
    using const_iterator = const T*;

    iterator begin() noexcept { return data_.get(); }
    iterator end() noexcept { return data_.get() + size_; }
    const_iterator begin() const noexcept { return data_.get(); }
    const_iterator end() const noexcept { return data_.get() + size_; }
    const_iterator cbegin() const noexcept { return begin(); }
    const_iterator cend() const noexcept { return end(); }
};

// Now this works:
DynArray<int> a = {5, 3, 1, 4, 2};
std::sort(a.begin(), a.end());
for (int x : a) { /* range-based for works */ }
auto it = std::find(a.begin(), a.end(), 3);
```

For non-contiguous structures (linked list, tree), you need a custom iterator class:

```cpp
// Linked list iterator skeleton
template<typename T>
class ListIterator {
    Node<T>* current_ = nullptr;

public:
    using value_type = T;
    using difference_type = std::ptrdiff_t;
    using pointer = T*;
    using reference = T&;
    using iterator_category = std::forward_iterator_tag;

    explicit ListIterator(Node<T>* node) : current_(node) {}

    reference operator*() const { return current_->value; }
    pointer operator->() const { return &current_->value; }

    ListIterator& operator++() {
        current_ = current_->next.get();
        return *this;
    }

    ListIterator operator++(int) {
        auto tmp = *this;
        ++(*this);
        return tmp;
    }

    bool operator==(const ListIterator& other) const = default;
};
```

**C equivalent** — manual traversal:

```c
// C: "iterate" a linked list
typedef struct Node {
    int value;
    struct Node* next;
} Node;

// No abstraction — you just walk the pointers
for (Node* n = head; n != NULL; n = n->next) {
    process(n->value);
}
```

> :happygoose: The C++ iterator wraps the `n = n->next` traversal into `++it`, and the `n->value` access into `*it`. This lets `std::find`, `std::for_each`, `std::accumulate`, and every other algorithm work on your linked list without knowing it's a linked list. The abstraction cost is zero — the compiler inlines everything.

## Sentinels (C++20)

A sentinel marks the end of a range without being the same type as the iterator.

```cpp
// Traditional: begin and end are the same type
std::sort(v.begin(), v.end());

// C++20 sentinel: end can be a different type
struct NullTerminated {
    bool operator==(const char* p) const { return *p == '\0'; }
};

// Iterate a C string without knowing its length upfront
void process(const char* str) {
    for (auto it = str; it != NullTerminated{}; ++it) {
        // *it is each character
    }
}
```

The sentinel pattern is useful for:
- Null-terminated strings (end condition is `*p == '\0'`, not a position)
- Streams (end condition is "no more data")
- Generators (end condition is "done producing")

## Ranges (C++20)

A range is anything with `begin()` and `end()`. Instead of passing two iterators, pass one range:

```cpp
// Pre-ranges
std::sort(v.begin(), v.end());
auto it = std::find(v.begin(), v.end(), 42);

// C++20 ranges
std::ranges::sort(v);
auto it = std::ranges::find(v, 42);
```

### Range Concepts

```cpp
// A range is anything with begin() and end()
static_assert(std::ranges::range<std::vector<int>>);
static_assert(std::ranges::range<int[10]>);
static_assert(std::ranges::range<std::string>);

// Sized range — knows its size in O(1)
static_assert(std::ranges::sized_range<std::vector<int>>);

// Contiguous range — elements are adjacent in memory
static_assert(std::ranges::contiguous_range<std::vector<int>>);
static_assert(!std::ranges::contiguous_range<std::list<int>>);
```

## Views: Lazy Composition

Views are ranges that are cheap to copy (they don't own data) and transform data lazily (no work until you iterate).

### The Pipeline

```cpp
#include <ranges>

std::vector<int> data = {1, -2, 3, -4, 5, -6, 7, -8, 9, -10};

// Filter → Transform → Take: lazy pipeline
auto result = data
    | std::views::filter([](int x) { return x > 0; })
    | std::views::transform([](int x) { return x * x; })
    | std::views::take(3);

// Nothing computed yet. Evaluate:
for (int x : result) {
    std::cout << x << ' ';  // 1 9 25
}
```

**Execution flow** (lazy, element-by-element):

```
data:      [1, -2, 3, -4, 5, -6, 7, -8, 9, -10]
             │   │  │   │  │
filter>0:    1   ·  3   ·  5   (skip negatives)
             │      │      │
transform²:  1      9     25
             │      │      │
take(3):     1      9     25   DONE (took 3, stop)
```

Only 5 elements of `data` were touched. The pipeline short-circuits at `take(3)`.

**C equivalent** — manual loop:

```c
int data[] = {1, -2, 3, -4, 5, -6, 7, -8, 9, -10};
int n = 10;

int count = 0;
for (int i = 0; i < n && count < 3; i++) {
    if (data[i] > 0) {
        int squared = data[i] * data[i];
        printf("%d ", squared);
        count++;
    }
}
```

> :nerdygoose: The C loop and the C++ pipeline compile to essentially the same machine code. The difference is composability. In C, to change the pipeline (add a step, reorder, remove a filter), you rewrite the loop. In C++, you add or remove a pipe stage. Each stage is independently testable, reusable, and nameable.

### Common Views

| View | What it does | Example |
|---|---|---|
| `filter(pred)` | Skip elements where `pred` is false | `views::filter(is_even)` |
| `transform(fn)` | Apply `fn` to each element | `views::transform(square)` |
| `take(n)` | First `n` elements | `views::take(10)` |
| `drop(n)` | Skip first `n` elements | `views::drop(5)` |
| `reverse` | Iterate backward | `views::reverse` |
| `keys` / `values` | First/second of pairs | `views::keys` (on a map) |
| `enumerate` | (C++23) Pairs of index + element | `views::enumerate` |
| `zip(r1, r2)` | (C++23) Pairs from two ranges | `views::zip(names, scores)` |
| `chunk(n)` | (C++23) Groups of `n` elements | `views::chunk(3)` |
| `iota(start)` | Generate `start, start+1, ...` | `views::iota(0, 10)` |

### Materializing Views

Views are lazy — to get a concrete container:

```cpp
// C++23: ranges::to
auto squared = data
    | std::views::filter([](int x) { return x > 0; })
    | std::views::transform([](int x) { return x * x; })
    | std::ranges::to<std::vector>();
```

## Writing Algorithms That Accept Ranges

### C++20 Style

```cpp
// Accept any range of integers
template<std::ranges::input_range R>
    requires std::integral<std::ranges::range_value_t<R>>
auto sum(R&& range) {
    std::ranges::range_value_t<R> total = 0;
    for (auto x : range) total += x;
    return total;
}

// Works with anything:
sum(std::vector{1, 2, 3});
sum(std::array{4, 5, 6});
int arr[] = {7, 8, 9};
sum(arr);
sum(std::views::iota(1, 101));  // Sum 1..100
```

### Iterator-Pair Style (Still Valid)

```cpp
// Accept iterator pair — works with C++11 and later
template<std::random_access_iterator Iter, std::sentinel_for<Iter> Sent>
void my_sort(Iter first, Sent last) {
    // ...
}
```

### C Style — Always Pointer + Length

```c
// C: generic via void* + element size
int sum_ints(const int* data, size_t n) {
    int total = 0;
    for (size_t i = 0; i < n; i++) total += data[i];
    return total;
}

// "Generic" sum via void*
long sum_generic(const void* data, size_t n, size_t elem_size,
                 long (*to_long)(const void*)) {
    long total = 0;
    for (size_t i = 0; i < n; i++) {
        total += to_long((const char*)data + i * elem_size);
    }
    return total;
}
```

> :sarcasticgoose: C's `void*` genericity is the poor man's template: no type safety, no inlining (function pointers block optimization), and every access requires a cast. It works — `qsort` proves that — but compare the ergonomics: `sum(vec)` vs `sum_generic(arr, n, sizeof(int), int_to_long)`. The C++ version is shorter, safer, and faster (the compiler inlines the lambda).

## Projections (C++20)

A projection transforms elements before the algorithm sees them:

```cpp
struct Student {
    std::string name;
    int grade;
};

std::vector<Student> students = {{"Alice", 95}, {"Bob", 87}, {"Eve", 92}};

// Sort by grade using a projection
std::ranges::sort(students, std::ranges::less{}, &Student::grade);
// Equivalent to: sort by student.grade in ascending order

// Find by name
auto it = std::ranges::find(students, "Bob", &Student::name);
```

No lambda needed for member access. Projections compose with algorithms cleanly.

**C equivalent**:

```c
int compare_by_grade(const void* a, const void* b) {
    const Student* sa = (const Student*)a;
    const Student* sb = (const Student*)b;
    return (sa->grade > sb->grade) - (sa->grade < sb->grade);
}
qsort(students, n, sizeof(Student), compare_by_grade);
```

## The Pattern: Algorithm Interfaces in This Book

Every algorithm we implement follows this convention:

```cpp
// 1. Iterator-pair version (most general)
template<std::random_access_iterator Iter, std::sentinel_for<Iter> Sent,
         typename Comp = std::ranges::less, typename Proj = std::identity>
void algo(Iter first, Sent last, Comp comp = {}, Proj proj = {});

// 2. Range version (convenience wrapper)
template<std::ranges::random_access_range R,
         typename Comp = std::ranges::less, typename Proj = std::identity>
void algo(R&& range, Comp comp = {}, Proj proj = {}) {
    algo(std::ranges::begin(range), std::ranges::end(range), comp, proj);
}
```

And every algorithm also has a C version:

```c
// 3. C version (void*, function pointer)
void algo_c(void* base, size_t nmemb, size_t size,
            int (*compar)(const void*, const void*));
```

> :mathgoose: Three versions, one algorithm. The C++ versions are zero-cost abstractions over the C version. The compiler generates the same loops and comparisons. The difference is the interface: concepts catch type errors at compile time, projections avoid writing lambdas, and ranges eliminate begin/end boilerplate. The machine code is the same.

## Quick Sanity Checks

- If your algorithm needs `it + n`, it requires random access. Don't accept `input_iterator`.
- Views don't own data — if the source is destroyed, the view dangles.
- `std::views::filter` returns a view that can't give you `.size()` in $O(1)$ (it doesn't know how many pass the filter until it iterates).
- `begin()` and `end()` must return the same type unless you're using sentinels.
- Range-based `for` calls `begin()` once and `end()` once. If your end is expensive to compute, cache it.
