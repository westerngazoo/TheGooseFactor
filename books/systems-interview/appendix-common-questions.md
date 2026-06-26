---
sidebar_position: 15
sidebar_label: "Appendix: Common Questions"
title: "Appendix: Common Questions & Code Challenges"
---

# Appendix: Common Questions & Code Challenges

This appendix covers a few more classic systems interview questions. These often test your understanding of memory, pointers, bit manipulation, and the hardware-software boundary.

## 1. Aligned Malloc and Free

**Problem:** Implement `aligned_malloc(size_t required_bytes, size_t alignment)` and `aligned_free(void *p)` using standard `malloc` and `free`. `alignment` must be a power of two.

**"Ultrathink" Approach:**
1.  **Over-allocation:** We need to allocate enough extra space to guarantee we can find an aligned address within the allocated block. We need `alignment - 1` extra bytes to shift the pointer forward if it's unaligned.
2.  **Bookkeeping:** `aligned_free` needs the *original* pointer returned by `malloc` to free the memory. We must store this original pointer somewhere. The best place is immediately preceding the aligned pointer we return to the user.
3.  **Space for Bookkeeping:** We need at least `sizeof(void*)` extra bytes. So total extra memory = `(alignment - 1) + sizeof(void*)`.
4.  **Math:** To round a pointer `p` up to a multiple of `A` (where `A` is a power of 2), you can use `(p + A - 1) & ~(A - 1)`.

**Implementation:**

```c
#include <stdlib.h>
#include <stddef.h>

void* aligned_malloc(size_t required_bytes, size_t alignment) {
    // Alignment must be a power of two and > 0
    if (alignment == 0 || (alignment & (alignment - 1)) != 0) {
        return NULL;
    }

    // Allocate extra space for alignment and the original pointer
    size_t offset = alignment - 1 + sizeof(void*);
    void* p1 = malloc(required_bytes + offset);

    if (p1 == NULL) {
        return NULL;
    }

    // Calculate the aligned address
    // 1. Cast p1 to size_t so we can do math
    // 2. Add the offset to make room for the hidden pointer
    // 3. Mask off the lower bits to align it
    size_t raw_address = (size_t)p1 + sizeof(void*);
    size_t aligned_address = (raw_address + alignment - 1) & ~(alignment - 1);

    void** p2 = (void**)aligned_address;

    // Store the original pointer just before the aligned address
    p2[-1] = p1;

    return p2;
}

void aligned_free(void *p) {
    if (p == NULL) return;

    // Retrieve the original pointer
    void** p2 = (void**)p;
    void* p1 = p2[-1];

    free(p1);
}
```

> :nerdygoose: Why do we care about alignment? SIMD instructions (like AVX) often require 16-byte or 32-byte aligned data, and will fault if given unaligned memory. Even for standard types, unaligned access can cause the CPU to issue multiple cache line reads, killing performance.
>
> :angrygoose: Don't forget `p2[-1] = p1;`! You are storing a `void*` in the memory slot just *before* the pointer you give the user. If you don't allocate `sizeof(void*)` extra bytes, you'll overwrite user data or crash.

## 2. Counting Set Bits (Hamming Weight)

**Problem:** Write a function that takes an unsigned integer and returns the number of '1' bits it has.

**"Ultrathink" Approach:**
1.  **Naive approach:** Loop 32 times, shifting and checking `val & 1`. $O(\text{total bits})$.
2.  **Brian Kernighan's Algorithm:** `val & (val - 1)` clears the lowest set bit. We can loop exactly as many times as there are set bits. $O(\text{set bits})$.
3.  **Hardware:** In modern systems, this is just a single CPU instruction (e.g., `POPCNT` on x86, `VCNT` on ARM).

**Implementation:**

```c
#include <stdint.h>

// Approach 1: Brian Kernighan's Algorithm
int hamming_weight_kernighan(uint32_t n) {
    int count = 0;
    while (n) {
        n &= (n - 1); // Clears the lowest set bit
        count++;
    }
    return count;
}

// Approach 2: Using Built-ins (The Systems Way)
int hamming_weight_builtin(uint32_t n) {
    // Maps to a single hardware instruction on most architectures
    return __builtin_popcount(n);
}
```

> :sarcasticgoose: The interviewer wants to see Brian Kernighan's algorithm. But if you start by saying "I'd use `__builtin_popcount` because it compiles to a single instruction," you immediately signal that you know how hardware actually works.

## 3. Endianness Conversion (ntohl)

**Problem:** Implement a function to convert a 32-bit integer from Network Byte Order (Big-Endian) to Host Byte Order (Little-Endian), assuming the host is Little-Endian.

**"Ultrathink" Approach:**
1.  **The Goal:** Swap byte 0 with byte 3, and byte 1 with byte 2.
2.  **Bitwise operations:** Use shifts (`<<`, `>>`) and masks (`&`) to isolate each byte and move it to its new position.
3.  **Avoiding branching:** This should be a pure mathematical operation. No `if` statements.

**Implementation:**

```c
#include <stdint.h>

uint32_t my_ntohl(uint32_t netlong) {
    return ((netlong & 0xFF000000) >> 24) |
           ((netlong & 0x00FF0000) >> 8)  |
           ((netlong & 0x0000FF00) << 8)  |
           ((netlong & 0x000000FF) << 24);
}
```

> :weightliftinggoose: This pattern is pure muscle memory for systems engineers. Notice the symmetry. A solid compiler (like gcc or clang with `-O2`) will recognize this exact pattern and optimize it into a single `BSWAP` instruction on x86 or `REV` on ARM. You don't pay the cost of all those shifts and ORs at runtime!
