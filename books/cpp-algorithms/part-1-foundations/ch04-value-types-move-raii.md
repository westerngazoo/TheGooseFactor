---
sidebar_position: 4
sidebar_label: "Ch 4: Value Types & Move Semantics"
title: "Chapter 4: Value Types, Move Semantics, and Resource Management"
---

# Chapter 4: Value Types, Move Semantics, and Resource Management

Every data structure in this book owns memory. How you acquire, transfer, and release that memory determines both correctness and performance. This chapter covers the three pillars: value semantics, move semantics, and RAII.

> :mathgoose: A data structure is a resource manager. An array owns a heap buffer. A tree owns its nodes. A hash table owns its buckets. If the resource management is wrong, everything built on top is wrong — leaks, double-frees, dangling pointers. Get this chapter right and the rest follows.

## Value Semantics

A type has **value semantics** when copies are independent — modifying one doesn't affect the other.

```cpp
// Value semantics: ints are values
int a = 5;
int b = a;   // b is a copy
b = 10;      // a is still 5
```

```cpp
// Value semantics: std::vector is a value
std::vector<int> v1 = {1, 2, 3};
std::vector<int> v2 = v1;  // Deep copy
v2.push_back(4);           // v1 is still {1, 2, 3}
```

**C equivalent** — value semantics by default for structs (shallow copy):

```c
typedef struct { int x, y; } Point;

Point a = {1, 2};
Point b = a;   // Bitwise copy — both independent
b.x = 10;     // a.x is still 1
```

But C breaks down when the struct owns heap memory:

```c
typedef struct {
    int* data;
    size_t size;
} IntArray;

IntArray a = {malloc(3 * sizeof(int)), 3};
IntArray b = a;   // Shallow copy — b.data == a.data!
free(a.data);     // b.data is now dangling
```

> :angrygoose: C's struct copy is memcpy — it copies bytes, not semantics. If those bytes contain pointers, both copies point to the same heap allocation. Free one, the other is a bomb. This is the fundamental problem that C++ constructors and destructors solve.

## The Rule of Five (and Zero)

If your type manages a resource (heap memory, file handle, socket), you need to define — or explicitly delete — five special member functions:

```cpp
class DynamicArray {
    int* data_ = nullptr;
    size_t size_ = 0;
    size_t capacity_ = 0;

public:
    // 1. Constructor
    explicit DynamicArray(size_t cap)
        : data_(new int[cap]), size_(0), capacity_(cap) {}

    // 2. Destructor
    ~DynamicArray() { delete[] data_; }

    // 3. Copy constructor (deep copy)
    DynamicArray(const DynamicArray& other)
        : data_(new int[other.capacity_])
        , size_(other.size_)
        , capacity_(other.capacity_)
    {
        std::copy(other.data_, other.data_ + other.size_, data_);
    }

    // 4. Copy assignment (copy-and-swap)
    DynamicArray& operator=(DynamicArray other) {
        swap(*this, other);
        return *this;
    }

    // 5. Move constructor (steal resources)
    DynamicArray(DynamicArray&& other) noexcept
        : data_(std::exchange(other.data_, nullptr))
        , size_(std::exchange(other.size_, 0))
        , capacity_(std::exchange(other.capacity_, 0))
    {}

    friend void swap(DynamicArray& a, DynamicArray& b) noexcept {
        using std::swap;
        swap(a.data_, b.data_);
        swap(a.size_, b.size_);
        swap(a.capacity_, b.capacity_);
    }
};
```

**C equivalent** — every operation is a separate function you call manually:

```c
typedef struct {
    int* data;
    size_t size;
    size_t capacity;
} DynArray;

// "Constructor"
DynArray dynarray_create(size_t cap) {
    DynArray a;
    a.data = (int*)malloc(cap * sizeof(int));
    a.size = 0;
    a.capacity = cap;
    return a;
}

// "Destructor"
void dynarray_destroy(DynArray* a) {
    free(a->data);
    a->data = NULL;
    a->size = 0;
    a->capacity = 0;
}

// "Copy constructor"
DynArray dynarray_clone(const DynArray* src) {
    DynArray dst = dynarray_create(src->capacity);
    memcpy(dst.data, src->data, src->size * sizeof(int));
    dst.size = src->size;
    return dst;
}

// "Move" — transfer ownership
DynArray dynarray_move(DynArray* src) {
    DynArray dst = *src;
    src->data = NULL;
    src->size = 0;
    src->capacity = 0;
    return dst;
}
```

> :sarcasticgoose: The C version has the same operations, the same logic, the same performance. The difference: in C you must call `dynarray_destroy` manually and hope nobody forgets. In C++ the destructor runs automatically — when the object goes out of scope, when an exception fires, when a container is cleared. You can't forget because the compiler remembers for you.

### The Rule of Zero

If your type only contains members that manage themselves (smart pointers, `std::vector`, `std::string`), you don't need any of the five:

```cpp
// Rule of Zero: compiler-generated defaults are correct
struct Graph {
    std::vector<std::vector<int>> adjacency;
    std::vector<std::string> labels;
    // No destructor, no copy constructor, no move constructor
    // Compiler generates them all correctly
};
```

> :happygoose: The Rule of Zero is the goal. Build your types from self-managing components and let the compiler generate the special members. Every `DynamicArray` in this book exists to teach the concept — in practice, you'd use `std::vector` and never write a destructor.

## Move Semantics In Depth

### What Is a Move?

A move transfers ownership of a resource from one object to another. The source is left in a "valid but unspecified" state — typically empty.

**Conceptual flow:**

```
Before move:
  src: [data_→ ████████]  size_=5  capacity_=8
  dst: [data_→ (null)]    size_=0  capacity_=0

After move:
  src: [data_→ (null)]    size_=0  capacity_=0
  dst: [data_→ ████████]  size_=5  capacity_=8
```

The heap buffer didn't move in memory — only the pointer changed hands. Cost: three pointer/integer copies = $O(1)$.

### Lvalues vs Rvalues

```cpp
int x = 42;        // x is an lvalue (has a name, has an address)
int y = x + 1;     // (x + 1) is an rvalue (temporary, no address)

DynamicArray a(10);              // a is an lvalue
DynamicArray b = std::move(a);   // std::move casts a to an rvalue reference
// a is now "moved-from" — valid but empty
```

> :nerdygoose: `std::move` doesn't move anything. It's a cast — it converts an lvalue to an rvalue reference (`T&&`), which tells the compiler "I'm done with this object, you may steal its resources." The actual move happens in the move constructor or move assignment operator.

### When Moves Happen Automatically

```cpp
// 1. Returning a local variable (NRVO may elide this entirely)
DynamicArray make_array() {
    DynamicArray a(100);
    // ... fill a ...
    return a;  // Moved (or elided — even better)
}

// 2. Inserting a temporary into a container
std::vector<DynamicArray> v;
v.push_back(DynamicArray(50));  // Temporary → moved into vector

// 3. std::move explicitly
DynamicArray a(100);
DynamicArray b = std::move(a);  // Explicit move
```

### Copy Elision and NRVO

The compiler can eliminate copies and moves entirely:

```cpp
DynamicArray make_array() {
    DynamicArray a(100);
    return a;
}

DynamicArray x = make_array();  // No copy, no move — a is constructed directly in x
```

This is **Named Return Value Optimization (NRVO)**. The compiler constructs `a` in the memory location of `x`. Zero overhead.

```
Without NRVO:         With NRVO:
┌──────────┐          ┌──────────┐
│ a (local) │          │          │
│  data→███ │          │          │
└─────┬─────┘          │  x       │
      │ move           │  data→███│
┌─────▼─────┐          │          │
│ x          │          │          │
│  data→███  │          └──────────┘
└────────────┘
  2 allocations          1 allocation
```

> :surprisedgoose: Since C++17, copy elision is **mandatory** for temporaries (prvalues). `DynamicArray x = DynamicArray(100);` is guaranteed to construct in-place — no move constructor needed, not even required to exist. NRVO for named variables is still optional but every major compiler does it.

### The `noexcept` Contract

Move constructors **must** be `noexcept`:

```cpp
DynamicArray(DynamicArray&& other) noexcept;  // Critical
```

**Why:** `std::vector` reallocates when it grows. It needs to move elements from the old buffer to the new one. If a move can throw, `vector` must fall back to copying (which can throw but leaves the source intact). Without `noexcept`, you lose the performance benefit.

```
vector::push_back reallocation:

Move constructor is noexcept?
├── YES → move elements (O(1) each) ✓
└── NO  → copy elements (O(n) each for nested containers)
```

> :angrygoose: A move constructor that isn't `noexcept` is a bug. Moves should be pointer swaps and integer copies — operations that cannot fail. If your move constructor allocates or does I/O, redesign the type. `std::vector`, `std::sort`, and essentially every standard library algorithm check `noexcept` to decide between move and copy.

## RAII: Resource Acquisition Is Initialization

The principle: **acquire resources in the constructor, release them in the destructor.** Since destructors run automatically when scope exits, resources are always cleaned up.

### RAII for Memory

```cpp
{
    std::vector<int> v = {1, 2, 3, 4, 5};
    // v owns its heap buffer
    process(v);
    // ...
}   // v's destructor runs here — heap buffer freed
    // Even if process() throws an exception
```

### RAII for Files

```cpp
{
    std::ifstream file("data.txt");  // Opens file
    if (!file) throw std::runtime_error("open failed");
    // ... read from file ...
}   // file's destructor runs — closes file handle
```

### RAII for Locks

```cpp
{
    std::lock_guard<std::mutex> lock(mtx);  // Acquires mutex
    shared_data.push_back(value);
}   // lock's destructor runs — releases mutex
```

**C equivalent** — every resource needs manual cleanup:

```c
void process_file(const char* path) {
    FILE* f = fopen(path, "r");
    if (!f) return;

    int* buf = malloc(1024 * sizeof(int));
    if (!buf) {
        fclose(f);  // Must remember to close on every error path
        return;
    }

    // ... use f and buf ...

    free(buf);    // Must free in correct order
    fclose(f);    // Must close
}
// What if there are 5 resources? 10? Each error path must clean up
// every previously acquired resource. In the right order.
```

> :mathgoose: RAII converts a runtime discipline ("remember to free") into a compile-time guarantee ("the destructor runs"). The resource's lifetime is tied to the object's scope. When scope ends — normally, via `return`, or via exception — the destructor fires. This is why C++ doesn't need a garbage collector: deterministic destruction is strictly more powerful.

## Smart Pointers

When you need heap allocation with ownership semantics:

### `std::unique_ptr` — Exclusive Ownership

```cpp
// One owner, no copies, automatic deletion
auto node = std::make_unique<TreeNode>(42);

// Transfer ownership
auto other = std::move(node);  // node is now nullptr
```

**Use for:** Tree nodes, linked list nodes, any structure with a single clear owner.

### `std::shared_ptr` — Shared Ownership

```cpp
// Reference counted, multiple owners
auto data = std::make_shared<LargeBuffer>(1024);
auto alias = data;  // Both own the buffer, refcount = 2

// Buffer freed when last shared_ptr is destroyed
```

**Use for:** Graphs with shared nodes, caches, any situation where lifetime isn't tied to a single scope.

> :angrygoose: `shared_ptr` has overhead: atomic reference count increments/decrements on every copy. For data structures where ownership is clear (trees, linked lists), use `unique_ptr`. Save `shared_ptr` for genuinely shared ownership. If you're not sure, start with `unique_ptr` — if the compiler complains about copies, that's telling you something about your design.

### `std::weak_ptr` — Non-owning Observer

```cpp
std::shared_ptr<Node> parent = std::make_shared<Node>(1);
std::weak_ptr<Node> child_back_ref = parent;  // Doesn't prevent deletion

if (auto p = child_back_ref.lock()) {
    // Parent still alive, use p
}
```

**Use for:** Breaking cycles in graph structures, caches where entries may be evicted.

## Putting It Together: A Complete Dynamic Array

Here's the full implementation in both styles — this is the foundation for Chapter 8 (Arrays) and Chapter 9 (Dynamic Arrays).

### Modern C++23

```cpp
#include <algorithm>
#include <cstddef>
#include <initializer_list>
#include <memory>
#include <stdexcept>
#include <utility>

template<typename T>
class DynArray {
    std::unique_ptr<T[]> data_;
    size_t size_ = 0;
    size_t cap_ = 0;

public:
    // --- Construction ---
    DynArray() = default;

    explicit DynArray(size_t cap)
        : data_(std::make_unique<T[]>(cap)), cap_(cap) {}

    DynArray(std::initializer_list<T> init)
        : data_(std::make_unique<T[]>(init.size()))
        , size_(init.size())
        , cap_(init.size())
    {
        std::copy(init.begin(), init.end(), data_.get());
    }

    // --- Rule of Five ---
    ~DynArray() = default;  // unique_ptr handles cleanup

    DynArray(const DynArray& other)
        : data_(std::make_unique<T[]>(other.cap_))
        , size_(other.size_)
        , cap_(other.cap_)
    {
        std::copy(other.data_.get(), other.data_.get() + other.size_, data_.get());
    }

    DynArray& operator=(DynArray other) noexcept {
        swap(*this, other);
        return *this;
    }

    DynArray(DynArray&&) noexcept = default;

    friend void swap(DynArray& a, DynArray& b) noexcept {
        using std::swap;
        swap(a.data_, b.data_);
        swap(a.size_, b.size_);
        swap(a.cap_, b.cap_);
    }

    // --- Access ---
    [[nodiscard]] T& operator[](size_t i) { return data_[i]; }
    [[nodiscard]] const T& operator[](size_t i) const { return data_[i]; }

    [[nodiscard]] T& at(size_t i) {
        if (i >= size_) throw std::out_of_range("DynArray::at");
        return data_[i];
    }

    [[nodiscard]] size_t size() const noexcept { return size_; }
    [[nodiscard]] size_t capacity() const noexcept { return cap_; }
    [[nodiscard]] bool empty() const noexcept { return size_ == 0; }
    [[nodiscard]] T* data() noexcept { return data_.get(); }
    [[nodiscard]] const T* data() const noexcept { return data_.get(); }

    // --- Iterators (for range-based for and algorithms) ---
    T* begin() noexcept { return data_.get(); }
    T* end() noexcept { return data_.get() + size_; }
    const T* begin() const noexcept { return data_.get(); }
    const T* end() const noexcept { return data_.get() + size_; }

    // --- Modification ---
    void push_back(const T& val) {
        if (size_ == cap_) grow();
        data_[size_++] = val;
    }

    void push_back(T&& val) {
        if (size_ == cap_) grow();
        data_[size_++] = std::move(val);
    }

    void pop_back() noexcept { --size_; }

    void clear() noexcept { size_ = 0; }

private:
    void grow() {
        size_t new_cap = cap_ == 0 ? 4 : cap_ * 2;
        auto new_data = std::make_unique<T[]>(new_cap);
        std::move(data_.get(), data_.get() + size_, new_data.get());
        data_ = std::move(new_data);
        cap_ = new_cap;
    }
};
```

### C Version

```c
#include <stdlib.h>
#include <string.h>

typedef struct {
    void* data;
    size_t size;      /* number of elements */
    size_t cap;       /* allocated elements */
    size_t elem_size; /* sizeof one element */
} DynArray;

/* Constructor */
DynArray dynarray_create(size_t elem_size, size_t initial_cap) {
    DynArray a;
    a.elem_size = elem_size;
    a.size = 0;
    a.cap = initial_cap;
    a.data = initial_cap > 0 ? malloc(initial_cap * elem_size) : NULL;
    return a;
}

/* Destructor */
void dynarray_destroy(DynArray* a) {
    free(a->data);
    a->data = NULL;
    a->size = 0;
    a->cap = 0;
}

/* Clone (deep copy) */
DynArray dynarray_clone(const DynArray* src) {
    DynArray dst = dynarray_create(src->elem_size, src->cap);
    memcpy(dst.data, src->data, src->size * src->elem_size);
    dst.size = src->size;
    return dst;
}

/* Move (transfer ownership) */
DynArray dynarray_move(DynArray* src) {
    DynArray dst = *src;
    src->data = NULL;
    src->size = 0;
    src->cap = 0;
    return dst;
}

/* Element access (returns pointer to element at index i) */
void* dynarray_at(DynArray* a, size_t i) {
    return (char*)a->data + i * a->elem_size;
}

const void* dynarray_at_const(const DynArray* a, size_t i) {
    return (const char*)a->data + i * a->elem_size;
}

/* Grow (internal) */
static void dynarray_grow(DynArray* a) {
    size_t new_cap = a->cap == 0 ? 4 : a->cap * 2;
    void* new_data = realloc(a->data, new_cap * a->elem_size);
    if (!new_data) abort();  /* Out of memory */
    a->data = new_data;
    a->cap = new_cap;
}

/* Push back (copies elem_size bytes from src) */
void dynarray_push(DynArray* a, const void* elem) {
    if (a->size == a->cap) dynarray_grow(a);
    memcpy((char*)a->data + a->size * a->elem_size, elem, a->elem_size);
    a->size++;
}

/* Pop back */
void dynarray_pop(DynArray* a) {
    if (a->size > 0) a->size--;
}

/* Clear */
void dynarray_clear(DynArray* a) {
    a->size = 0;
}
```

> :nerdygoose: The C version uses `void*` and `elem_size` for genericity — the same approach as `qsort`. It works, but every access requires a cast and pointer arithmetic. The C++ template version generates type-specific code — `DynArray<int>` works with `int*` directly, no casts, no size parameter, and the compiler can optimize the element access to a single indexed load.

### Side-by-Side Comparison

| Operation | C++ | C |
|---|---|---|
| Create | `DynArray<int> a(16);` | `DynArray a = dynarray_create(sizeof(int), 16);` |
| Destroy | Automatic (scope exit) | `dynarray_destroy(&a);` |
| Copy | `auto b = a;` | `DynArray b = dynarray_clone(&a);` |
| Move | `auto b = std::move(a);` | `DynArray b = dynarray_move(&a);` |
| Access | `a[3]` | `*(int*)dynarray_at(&a, 3)` |
| Push | `a.push_back(42);` | `int v = 42; dynarray_push(&a, &v);` |
| Iterate | `for (auto x : a)` | `for (size_t i = 0; i < a.size; i++)` |
| Sort | `std::sort(a.begin(), a.end());` | `qsort(a.data, a.size, a.elem_size, cmp);` |

> :sarcasticgoose: Same algorithm, same memory layout, same machine code (mostly). The C version makes you manage everything manually. The C++ version makes the compiler manage it. Both are valid — the C version runs on any platform with a C compiler, the C++ version runs on any platform with a C++23 compiler. Know both. Prefer the one that matches your constraints.

## Common Pitfalls

### Moved-From Objects

```cpp
DynArray<int> a = {1, 2, 3};
DynArray<int> b = std::move(a);

// a is now "valid but unspecified"
// OK: a.size(), a.empty(), a.clear(), a = new_value
// NOT OK: assume a still has elements
```

### Returning by Value vs by Reference

```cpp
// Good: return by value (move/NRVO eliminates copy)
DynArray<int> make_sorted(DynArray<int> input) {
    std::sort(input.begin(), input.end());
    return input;  // Moved out
}

// Bad: return reference to local
const DynArray<int>& make_sorted(DynArray<int> input) {
    std::sort(input.begin(), input.end());
    return input;  // DANGLING REFERENCE — input dies at }
}
```

### Self-Assignment

```cpp
DynArray<int> a = {1, 2, 3};
a = a;  // Must not crash or corrupt
// Copy-and-swap handles this automatically:
// 1. Copy parameter creates a clone
// 2. Swap with self
// 3. Clone (now holding old data) is destroyed
```

> :happygoose: Copy-and-swap is the exception-safe pattern for assignment operators. It reuses the copy constructor (which you've already tested) and the destructor (which you've already tested). No special-case code for self-assignment, no half-assigned state on exception. One pattern, correct by construction.

## Key Takeaways

1. **Value semantics**: copies are independent. If your type owns resources, implement deep copy.
2. **Move semantics**: $O(1)$ resource transfer. Mark move constructors `noexcept`.
3. **RAII**: acquire in constructor, release in destructor. No manual cleanup.
4. **Rule of Zero**: prefer types that don't need custom special members.
5. **Rule of Five**: if you write one, write all five (or delete the ones you don't want).
6. **Smart pointers**: `unique_ptr` for exclusive ownership, `shared_ptr` for shared, raw pointers for non-owning observation.
