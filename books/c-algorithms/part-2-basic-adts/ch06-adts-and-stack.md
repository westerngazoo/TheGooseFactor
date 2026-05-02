---
sidebar_position: 1
sidebar_label: "Ch 6: ADTs & Stack"
title: "Chapter 6: Abstract Data Types and the Stack"
---

# Chapter 6: Abstract Data Types and the Stack

An **abstract data type** (ADT) is a contract: a set of operations and what they promise, with no commitment to how they are implemented. A `stack` is "push, pop, top, with LIFO semantics" — not "an array with a `len` field." A `map` is "lookup, insert, delete, with $\Theta(1)$ expected time" — not "a hash table" or "a red-black tree."

This separation matters because the *interface* survives implementation changes. You can swap a stack's storage from array to linked list without rewriting the code that uses it, as long as the operations behave the same. ADTs are how you manage complexity in any non-trivial program.

This chapter introduces the ADT discipline and uses the simplest ADT — the stack — as the worked example. The next four chapters cover the other everyday ADTs: queue, list, hash table, and the tree family.

## Interface vs Implementation

A C ADT consists of:

1. **An opaque or partially-opaque struct** declared in a public header.
2. **A set of functions** that operate on it.
3. **A complexity contract** for each operation.
4. **An invariants** the struct maintains between calls.

Example, for a stack:

```c
// include/algo/stack.h
#ifndef ALGO_STACK_H
#define ALGO_STACK_H

#include <stddef.h>
#include <stdbool.h>

typedef struct stack stack_t;       // opaque

stack_t *stack_new(void);
void     stack_free(stack_t *s);

[[nodiscard]] int  stack_push(stack_t *s, int x);   // Θ(1) amortized
[[nodiscard]] bool stack_pop (stack_t *s, int *out); // Θ(1)
[[nodiscard]] bool stack_top (const stack_t *s, int *out); // Θ(1)
size_t  stack_size(const stack_t *s);              // Θ(1)
bool    stack_empty(const stack_t *s);             // Θ(1)

#endif
```

The user of this header can do nothing but call these functions. They cannot inspect the struct's fields, because `stack` is forward-declared without a definition. Whatever the implementation chooses — array, list, deque — the user's code does not change.

> :sharpgoose: Opaque types are the strongest form of encapsulation in C. The user has a pointer; they can't dereference it; they can't `sizeof` it; they can't put it on the stack. The trade-off is allocation: every instance is heap-allocated. For most ADTs that's fine. For ones used in tight loops, expose the struct and let users put it on their stack — covered below.

The two trade-offs are:

| Style | Pro | Con |
|---|---|---|
| Opaque struct | Real ABI stability, can change layout silently | Forces heap allocation |
| Public struct | Stack-allocatable, zero-cost wrappers | Layout changes break ABI |

For data structures that show up in tight loops (vec_int_t in Chapter 4), expose the struct. For larger, longer-lived structures (a database connection, a parser state), keep it opaque.

## The Stack ADT

A stack is **last-in-first-out** (LIFO). Everything goes in the top, comes out the top.

Operations and their canonical complexities:

| Operation | Complexity | What it does |
|---|---|---|
| `push(x)` | $\Theta(1)$ amortized | Place `x` on top |
| `pop()` | $\Theta(1)$ | Remove and return top |
| `top()` | $\Theta(1)$ | Return top without removing |
| `size()` | $\Theta(1)$ | Number of elements |
| `empty()` | $\Theta(1)$ | True iff size is zero |

Every operation is constant-time. There is no operation that requires inspecting more than the top element. This is the ADT's defining property: stacks are about *recency*, not search.

### Where Stacks Show Up

The stack is everywhere in computing, often invisibly:

- **The call stack** — every function call pushes a frame; every return pops one. Recursion is just pushing-the-same-frame-shape repeatedly.
- **Expression evaluation** — `1 + 2 * 3` is parsed by a stack of operands and a stack of operators. Postfix (RPN) evaluation is even simpler.
- **Backtracking** — depth-first search keeps an explicit stack of nodes to visit.
- **Undo systems** — every text editor's "Ctrl-Z" walks a stack of previous states.
- **Parser state** — most non-trivial parsers have a stack of currently-open contexts (matching brackets, nested expressions).
- **Memory allocators** — many simple allocators (arena, bump) are conceptually stacks.

> :weightliftinggoose: When a problem says "match brackets," "convert infix to postfix," "find next greater element," or "validate balanced delimiters," the answer is a stack. Practice spotting the LIFO pattern; it's one of the most reusable shapes in algorithms.

## Implementation 1: Array-Backed

The simplest stack is a `vec_int_t` from Chapter 4 with `vec_push` for push and `vec_pop` for pop. Everything is done.

```c
// src/stack_array.c — array-backed stack, built on vec_int_t.
#include "algo/stack.h"
#include "algo/vec.h"
#include <stdlib.h>

struct stack {
    vec_int_t v;
};

stack_t *stack_new(void) {
    stack_t *s = malloc(sizeof *s);
    if (!s) return nullptr;
    vec_init(&s->v);
    return s;
}

void stack_free(stack_t *s) {
    if (!s) return;
    vec_free(&s->v);
    free(s);
}

int stack_push(stack_t *s, int x) {
    return vec_push(&s->v, x);
}

bool stack_pop(stack_t *s, int *out) {
    return vec_pop(&s->v, out);
}

bool stack_top(const stack_t *s, int *out) {
    if (s->v.len == 0) return false;
    *out = s->v.data[s->v.len - 1];
    return true;
}

size_t stack_size (const stack_t *s) { return s->v.len; }
bool   stack_empty(const stack_t *s) { return s->v.len == 0; }
```

Top is the last element of the array. Push is `vec_push`. Pop is `vec_pop`. Done.

**Complexity:**

- `push`: $\Theta(1)$ amortized (the same proof as `vec_push`).
- `pop`, `top`, `size`, `empty`: $\Theta(1)$ exact.

**Cache behavior:** excellent. Top of stack is always the most recently written word, almost certainly in L1.

## Implementation 2: Linked

A linked-list stack pushes nodes onto a singly-linked list, with the head as the top.

```c
// src/stack_linked.c — node-allocating stack.
#include "algo/stack.h"
#include <stdlib.h>

typedef struct node {
    int value;
    struct node *next;
} node_t;

struct stack {
    node_t *top;
    size_t  count;
};

stack_t *stack_new(void) {
    stack_t *s = malloc(sizeof *s);
    if (!s) return nullptr;
    *s = (struct stack){ nullptr, 0 };
    return s;
}

void stack_free(stack_t *s) {
    if (!s) return;
    node_t *n = s->top;
    while (n) {
        node_t *next = n->next;
        free(n);
        n = next;
    }
    free(s);
}

int stack_push(stack_t *s, int x) {
    node_t *n = malloc(sizeof *n);
    if (!n) return -1;
    n->value = x;
    n->next  = s->top;
    s->top   = n;
    ++s->count;
    return 0;
}

bool stack_pop(stack_t *s, int *out) {
    if (!s->top) return false;
    node_t *n = s->top;
    *out = n->value;
    s->top = n->next;
    free(n);
    --s->count;
    return true;
}

bool stack_top(const stack_t *s, int *out) {
    if (!s->top) return false;
    *out = s->top->value;
    return true;
}

size_t stack_size (const stack_t *s) { return s->count; }
bool   stack_empty(const stack_t *s) { return s->count == 0; }
```

**Complexity:** all operations are $\Theta(1)$ — no amortization needed.

**Cache behavior:** terrible. Each push allocates a fresh node from the heap; nodes scatter; pop traverses one cache miss to read `top->next`.

## Comparing the Two

| Aspect | Array-backed | Linked |
|---|---|---|
| Push | $\Theta(1)$ amortized | $\Theta(1)$ exact (with `malloc`) |
| Pop | $\Theta(1)$ exact | $\Theta(1)$ exact (with `free`) |
| Memory per element | 4 bytes (just the int) | 16+ bytes (int + pointer + alignment + heap header) |
| Cache friendliness | Excellent | Poor |
| Allocator load | One `realloc` per doubling | One `malloc` per push, one `free` per pop |
| Worst-case latency | $\Theta(n)$ on a doubling | $\Theta(1)$ (assuming `malloc` is) |

For 99% of use cases, the array-backed stack wins. The linked version is only preferable when:

1. **You need pointer stability.** If callers hold pointers to the elements, the array version invalidates them on growth. The linked version doesn't.
2. **Worst-case latency matters more than throughput.** Real-time systems may prefer the linked version because no individual push triggers a $\Theta(n)$ realloc.
3. **The compiler / memory layout makes amortization unsafe.** Some embedded systems can't afford a $\Theta(n)$ spike even if the average is fast.

> :angrygoose: People reach for linked lists out of habit ("a stack is a list with a head pointer"). Don't. The array version is faster in every scenario where elements are values and pointers don't escape. The intuition that "linked is cheaper because no copying" ignores cache. The doubling array copies less than you think and benefits from sequential prefetch on every operation.

## Worked Example: Bracket Matching

The canonical "you need a stack" problem.

```c
// Returns true iff every bracket in s has a matching counterpart and they nest correctly.
bool brackets_balanced(const char *s) {
    stack_t *stk = stack_new();
    if (!stk) return false;

    for (const char *p = s; *p; ++p) {
        char c = *p;
        if (c == '(' || c == '[' || c == '{') {
            if (stack_push(stk, c) != 0) {
                stack_free(stk);
                return false;
            }
        } else if (c == ')' || c == ']' || c == '}') {
            int top;
            if (!stack_pop(stk, &top)) {
                stack_free(stk);
                return false;   // closer with no opener
            }
            char want = (c == ')') ? '(' : (c == ']') ? '[' : '{';
            if (top != want) {
                stack_free(stk);
                return false;
            }
        }
        // ignore other characters
    }

    bool ok = stack_empty(stk);
    stack_free(stk);
    return ok;
}
```

The algorithm runs in $\Theta(n)$ where $n$ is the length of the string. Each character is pushed at most once and popped at most once. Memory is $\Theta(d)$ where $d$ is the maximum nesting depth.

> :sarcasticgoose: The "elegant" solution that uses recursion to walk the string is doing the same thing — the call stack *is* the stack. Recursion makes the algorithm pretty and slower. An explicit stack is uglier and faster, and works for inputs deeper than your call stack supports. Pretty has its place; production code is rarely the place.

## Edge Cases

- **Empty stack:** `pop` and `top` on an empty stack must report failure cleanly. We return `false`; out-parameter is untouched.
- **Maximum capacity:** the array-backed version is bounded by `realloc` failure (or `size_t` overflow on the capacity). The linked version is bounded by `malloc` failure.
- **Use-after-free:** if a caller stores `top()` then calls `pop()`, what they had is invalidated for the linked version (they're holding a pointer to a freed node) but stable for the array version (until growth or another pop). We document the contract: the int returned by `top` is a value, not a pointer; callers don't have a re-use problem in this design.

## What's Next

Chapter 7 covers queues and deques — the FIFO and double-ended cousins of the stack — and introduces the ring buffer as a non-obvious but essential implementation technique.
