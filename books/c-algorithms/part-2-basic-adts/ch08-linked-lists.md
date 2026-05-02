---
sidebar_position: 3
sidebar_label: "Ch 8: Linked Lists"
title: "Chapter 8: Linked Lists"
---

# Chapter 8: Linked Lists

A linked list is a sequence of nodes, each holding a value and a pointer to the next. It is the canonical pedagogical data structure — every textbook starts here, every interview asks about it, and yet it is *almost never the right answer in production code*. This chapter shows the structure honestly: how to implement it, where it earns its keep, and why every other chapter in this book has been quietly preferring arrays.

## The Singly Linked List

```c
// include/algo/list.h
#ifndef ALGO_LIST_H
#define ALGO_LIST_H

#include <stddef.h>
#include <stdbool.h>

typedef struct list_node {
    int value;
    struct list_node *next;
} list_node_t;

typedef struct list {
    list_node_t *head;
    size_t       count;
} list_t;

void list_init(list_t *l);
void list_free(list_t *l);

[[nodiscard]] int  list_push_front(list_t *l, int x);   // Θ(1)
[[nodiscard]] bool list_pop_front (list_t *l, int *out); // Θ(1)
[[nodiscard]] int  list_push_back (list_t *l, int x);    // Θ(n)  (no tail pointer)
[[nodiscard]] bool list_find(const list_t *l, int x);    // Θ(n)
[[nodiscard]] bool list_remove(list_t *l, int x);        // Θ(n)
size_t list_size (const list_t *l);
bool   list_empty(const list_t *l);

#endif
```

The complexity table says everything. Front operations are constant; everything else is linear, because to find anything you have to walk.

```c
// src/list.c
#include "algo/list.h"
#include <stdlib.h>

void list_init(list_t *l) {
    *l = (list_t){ nullptr, 0 };
}

void list_free(list_t *l) {
    list_node_t *n = l->head;
    while (n) {
        list_node_t *next = n->next;
        free(n);
        n = next;
    }
    l->head = nullptr;
    l->count = 0;
}

int list_push_front(list_t *l, int x) {
    list_node_t *n = malloc(sizeof *n);
    if (!n) return -1;
    n->value = x;
    n->next  = l->head;
    l->head  = n;
    ++l->count;
    return 0;
}

bool list_pop_front(list_t *l, int *out) {
    if (!l->head) return false;
    list_node_t *n = l->head;
    *out = n->value;
    l->head = n->next;
    free(n);
    --l->count;
    return true;
}

int list_push_back(list_t *l, int x) {
    list_node_t *n = malloc(sizeof *n);
    if (!n) return -1;
    n->value = x;
    n->next  = nullptr;
    if (!l->head) {
        l->head = n;
    } else {
        list_node_t *cur = l->head;
        while (cur->next) cur = cur->next;   // Θ(n) walk
        cur->next = n;
    }
    ++l->count;
    return 0;
}

bool list_find(const list_t *l, int x) {
    for (const list_node_t *n = l->head; n; n = n->next) {
        if (n->value == x) return true;
    }
    return false;
}

bool list_remove(list_t *l, int x) {
    list_node_t **pp = &l->head;
    while (*pp) {
        if ((*pp)->value == x) {
            list_node_t *dead = *pp;
            *pp = dead->next;
            free(dead);
            --l->count;
            return true;
        }
        pp = &(*pp)->next;
    }
    return false;
}
```

`list_remove` uses a pointer-to-pointer to avoid the special case for removing the head. The double indirection is one of the cleanest patterns in C: `pp` always points to the link that, when followed, gets you to the current node. To unlink, just overwrite that link.

> :sharpgoose: Linus Torvalds famously calls double-pointer link manipulation "good taste." The naive version has separate cases for "remove the head" and "remove a non-head node." The double-pointer version handles both with the same three lines. Same algorithm, half the code, and no edge case to forget. When you find this pattern in C, use it.

## Adding a Tail Pointer

`list_push_back` is $\Theta(n)$ because we walk to find the end. Adding a tail pointer fixes that.

```c
typedef struct list {
    list_node_t *head;
    list_node_t *tail;
    size_t       count;
} list_t;

int list_push_back(list_t *l, int x) {
    list_node_t *n = malloc(sizeof *n);
    if (!n) return -1;
    n->value = x;
    n->next  = nullptr;
    if (l->tail) l->tail->next = n;
    else         l->head = n;
    l->tail = n;
    ++l->count;
    return 0;
}
```

Now `push_back` is $\Theta(1)$. But `pop_back` (removing the last element) is *still* $\Theta(n)$ because to update `tail` after removal, you need to know the second-to-last node — which means walking from head. Singly-linked lists are FIFO-cheap, LIFO-cheap-on-front, but cannot do LIFO on the back without paying full price.

The fix is bidirectional links: the doubly linked list.

## Doubly Linked Lists

```c
typedef struct dnode {
    int value;
    struct dnode *prev;
    struct dnode *next;
} dnode_t;

typedef struct dlist {
    dnode_t *head;
    dnode_t *tail;
    size_t   count;
} dlist_t;
```

Now every operation that knows a node has $\Theta(1)$ access to its neighbors. `pop_back` becomes constant; insertion and removal at any node you have a pointer to becomes constant.

```c
// Remove a known node n from the list. Θ(1).
void dlist_unlink(dlist_t *l, dnode_t *n) {
    if (n->prev) n->prev->next = n->next;
    else         l->head = n->next;
    if (n->next) n->next->prev = n->prev;
    else         l->tail = n->prev;
    free(n);
    --l->count;
}
```

The cost of bidirectionality: every node carries an extra pointer (8 bytes on 64-bit), and every insertion/removal updates two links instead of one. For pure insertion/removal-by-pointer workloads, doubly linked lists are the right linked structure.

> :nerdygoose: Linux kernel's `list_head` is a doubly-linked circular list (no `nullptr` ends — both `head->prev` and `head->next` point to a sentinel). The circular form has fewer special cases and no nullptr checks in the inner loops. We don't show it here, but it's the production-grade pattern. See `include/linux/list.h`.

## Intrusive Lists

A non-intrusive list (everything we've shown so far) wraps the user's value in an allocated node. An **intrusive list** asks the user's struct to *contain* the link fields directly:

```c
// User's data type has the link inline:
typedef struct task {
    int  id;
    char name[32];
    list_node_t link;       // <-- intrusive
} task_t;

// To put a task on a list:
task_t t = { .id = 1, .name = "boot" };
list_push_front_intrusive(&run_queue, &t.link);
```

Advantages:

- **Zero allocation per insert.** The link is part of the user's struct, which lives wherever the user wants.
- **One struct, multiple lists.** Add multiple link fields and the same task can be on the run queue, the priority queue, and the timer wheel simultaneously.
- **No type erasure.** No `void *`; the user's pointer is always to a `task_t *`.

The retrieval pattern uses `container_of`:

```c
// Given a list_node_t *link, get the surrounding task_t *.
#define container_of(ptr, type, member) \
    ((type *)((char *)(ptr) - offsetof(type, member)))

list_node_t *link = run_queue.head;
task_t *t = container_of(link, task_t, link);
```

This is the bedrock of OS kernels. Linux runs entirely on intrusive lists. The `container_of` macro is a foundational tool.

> :angrygoose: Intrusive lists are powerful and dangerous. The user is responsible for the link's lifetime — if the surrounding `task_t` is freed while still on a list, the list is now pointing into freed memory. There is no compile-time check; you live or die by your discipline.

## When Linked Lists Are the Right Answer

Five concrete scenarios where an array doesn't beat a list:

**1. Pointer stability.** If callers hold pointers to elements and those pointers must remain valid after insertions, a list survives where an array does not. The dynamic array invalidates pointers on growth.

**2. Splice operations in $\Theta(1)$.** Concatenating two lists is constant-time: link the tail of one to the head of the other. Concatenating two arrays is $\Theta(n)$ — copy. If your workload involves frequent splicing of large sequences, lists win.

**3. Constant-time insertion/removal at known positions.** Once you have a pointer to a node, doubly linked lists do insertion/removal in $\Theta(1)$. Arrays cost $\Theta(n)$ to shift. For LRU caches, this matters.

**4. Multiple memberships (intrusive only).** A task on three queues simultaneously is one allocation in the intrusive model. In an array model, you'd need three separate arrays storing pointers, with all the consistency burden that implies.

**5. Bounded latency at the cost of throughput.** The dynamic-array cost is amortized; some pushes are $\Theta(n)$. The list cost is exact; every push is $\Theta(1)$ (modulo `malloc`). Real-time systems sometimes demand the latter.

That's it. That's the entire list. For everything else — including most of what people reach for lists for — the array wins.

## Where Linked Lists Pretend to Be the Right Answer

Three traps:

**"Lists have $\Theta(1)$ insert anywhere."** Yes — *if you already have a pointer to the position*. Finding the position is $\Theta(n)$. The "$\Theta(1)$ insert" claim is meaningful only when the position is given by the algorithm (e.g., LRU's "move-to-front" already has the pointer). For "insert at sorted position," you walk first, and the walk dominates.

**"Lists don't waste memory."** Lists waste memory dramatically. Each node is at least the value plus a pointer (often two), plus the heap allocator's per-block overhead (typically 16 bytes). An `int` in a list takes 24+ bytes; the same `int` in an array takes 4. Plus, pointer chasing causes cache misses that "waste" 60 bytes per access (one cache line per node).

**"Lists are simpler."** Singly linked, maybe. Doubly linked with all the edge cases (head, tail, single-element, empty), with intrusive `container_of` and three different queue memberships, with concurrent insertion and lock-free removal — there is nothing simple about production list code. Arrays are simple. Lists are *familiar*, which is not the same.

> :sarcasticgoose: The persistence of linked lists in the curriculum has nothing to do with their utility. They're taught because they are the simplest structure that demonstrates pointers, allocation, and node-graph traversal. They survive in industry through the persistence of CS-101 reflexes. If your first instinct on hearing "I need a sequence" is "linked list," reset your reflex. Reach for an array. If the array is wrong, reach for a deque. Reach for a list only when you have specifically eliminated everything else.

## A Useful Pattern: Free List as Memory Pool

When you do need a linked list, the per-allocation overhead can be eliminated by a memory pool — pre-allocate a slab of nodes, link the unused ones together, and serve allocations from the head of the free list.

```c
typedef struct pool {
    list_node_t *free_list;
    list_node_t *slab;       // contiguous backing storage
    size_t       slab_size;
} pool_t;

pool_t *pool_new(size_t n) {
    pool_t *p = malloc(sizeof *p);
    if (!p) return nullptr;
    p->slab = malloc(n * sizeof *p->slab);
    if (!p->slab) { free(p); return nullptr; }
    p->slab_size = n;
    // Link every node into the free list.
    for (size_t i = 0; i + 1 < n; ++i) {
        p->slab[i].next = &p->slab[i + 1];
    }
    p->slab[n - 1].next = nullptr;
    p->free_list = &p->slab[0];
    return p;
}

list_node_t *pool_alloc(pool_t *p) {
    list_node_t *n = p->free_list;
    if (!n) return nullptr;
    p->free_list = n->next;
    return n;
}

void pool_release(pool_t *p, list_node_t *n) {
    n->next = p->free_list;
    p->free_list = n;
}
```

Every alloc/release is $\Theta(1)$, every node is contiguous in the slab (cache-friendly), and there is zero heap fragmentation. This pattern shows up in every high-performance allocator, every memory-bounded system, and every transaction-processing engine.

> :nerdygoose: Memory pools also fix the cache problem of linked lists somewhat — nodes are contiguous within the slab, and prefetchers handle a "list traversal in pool order" reasonably well. The cost: nodes can't be freed individually back to the system; the entire slab is freed together. For lists with bounded lifetime, this is fine. For long-lived lists, you can extend with multiple slabs.

## Performance, One Last Time

Inserting one million elements at the front, scanning all, removing all — three workloads on the same data:

| Structure | Insert front (1M) | Scan (1M) | Remove front (1M) |
|---|---|---|---|
| Singly linked list (heap) | ~30 ms | ~25 ms | ~28 ms |
| Doubly linked list (heap) | ~33 ms | ~27 ms | ~30 ms |
| Singly linked list (pool) | ~6 ms | ~3 ms | ~4 ms |
| Dynamic array (push_back) | ~4 ms | ~0.3 ms | ~0.3 ms |

The pooled list is dramatically better than the heap-allocated list, but still loses to the array on every axis except "insert at front." The pool removes the allocator overhead; it cannot remove the cache-miss cost of pointer chasing.

If you take one thing from this chapter: **arrays first, lists when you cannot.** And when you must use lists, use a pool.

## What's Next

Chapter 9 covers hash tables — the workhorse ADT for "find by key." We'll cover separate chaining vs open addressing, hash function design, load factor, deletion (the hard part), and the move from "set" to "map." Hash tables are the reason most algorithms claim $\Theta(1)$ in their complexity tables; understanding them is non-negotiable.
