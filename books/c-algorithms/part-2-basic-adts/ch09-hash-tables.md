---
sidebar_position: 4
sidebar_label: "Ch 9: Hash Tables"
title: "Chapter 9: Hash Tables"
---

# Chapter 9: Hash Tables

A hash table maps keys to values in $\Theta(1)$ expected time. It is the most-used non-trivial data structure in computing — every dictionary, every JSON object, every database index, every symbol table, every memcache. It is also the structure with the most subtleties: hash function quality, collision resolution, load factor, deletion, and resizing all interact in ways that ruin naive implementations.

This chapter covers the design space honestly and shows two production-grade implementations: separate chaining and linear probing.

## The Hash Table ADT

```c
// include/algo/hashmap.h — int → int mapping for clarity. Generic version in a later chapter.
#ifndef ALGO_HASHMAP_H
#define ALGO_HASHMAP_H

#include <stddef.h>
#include <stdbool.h>

typedef struct hashmap hashmap_t;

hashmap_t *hashmap_new(void);
void       hashmap_free(hashmap_t *h);

[[nodiscard]] int  hashmap_set(hashmap_t *h, int key, int value);  // Θ(1) amortized expected
[[nodiscard]] bool hashmap_get(const hashmap_t *h, int key, int *out); // Θ(1) expected
[[nodiscard]] bool hashmap_remove(hashmap_t *h, int key);          // Θ(1) expected
size_t  hashmap_size(const hashmap_t *h);

#endif
```

The contract is "expected" $\Theta(1)$ — over random keys with a good hash function, the per-operation cost is bounded by a constant. Worst case is $\Theta(n)$ (every key collides), but worst case requires either a degenerate hash function or an adversarial input distribution.

A **hash set** is a hash map with no value. We treat them as the same structure here.

## How a Hash Table Works

The mechanism, in three steps:

1. **Hash the key** to an integer: $h(k)$.
2. **Reduce the hash modulo the table size**: $h(k) \bmod m$, where $m$ is the number of slots. This gives an index into a flat array.
3. **Resolve collisions** when two keys hash to the same slot.

The rest of the chapter is about how those three steps interact with each other, and especially how step 3 dominates everything.

## Hash Functions

A hash function takes a key and produces a 32- or 64-bit integer. A *good* hash function:

- **Distributes uniformly.** For typical inputs, output bits are statistically independent.
- **Is fast.** Hashing happens on every operation. Spending 100 ns on the hash is 100 ns added to every lookup.
- **Avalanches.** Flipping one bit of input flips on average half the bits of the output.
- **Has no obvious cycles.** Different inputs should not produce the same output by structural accident.

For integers, a multiply-shift is fast and decent:

```c
static inline uint64_t hash_int(uint64_t x) {
    // Splittable's mix64. Used in many production hashmaps.
    x ^= x >> 30;
    x *= 0xbf58476d1ce4e5b9ull;
    x ^= x >> 27;
    x *= 0x94d049bb133111ebull;
    x ^= x >> 31;
    return x;
}
```

For strings, the simplest acceptable function is FNV-1a:

```c
static uint64_t hash_string(const char *s) {
    uint64_t h = 0xcbf29ce484222325ull;   // FNV offset basis
    while (*s) {
        h ^= (unsigned char)*s++;
        h *= 0x100000001b3ull;             // FNV prime
    }
    return h;
}
```

For production use, prefer xxHash, MurmurHash3, or SipHash (the last is collision-resistant against adversaries — important for any hash table that processes user-supplied input).

> :angrygoose: **Never use the identity function as a hash for sequential integers.** If your keys are `0, 1, 2, ..., n` and you hash with `h(x) = x`, then `h(x) % m` for a power-of-two `m` is just the low bits of `x`, which means every key with the same low bits collides. Mixing matters. The `hash_int` above does the mixing for you.

> :nerdygoose: Adversarial collisions are a real attack vector — "hashDoS." If a server hashes user input into a table and the user can predict the hash function, they can craft inputs that all collide and force the server into $\Theta(n^2)$ behavior. The fix is a randomized seed (chosen at process start) combined into the hash function. SipHash is designed for this. For internal data structures with non-adversarial keys, a fast non-cryptographic hash is fine.

## Collision Resolution: Two Schools

Two keys hash to the same slot. What now?

**Separate chaining.** Each slot holds a linked list of (key, value) pairs that hashed to it. Lookup walks the list. Insert prepends. Delete walks and unlinks.

**Open addressing.** All entries live in the table array itself. On collision, probe forward to the next slot. The classic probing sequences are:

- **Linear probing**: try $i, i+1, i+2, \ldots$
- **Quadratic probing**: try $i, i+1, i+4, i+9, \ldots$
- **Double hashing**: try $i, i + h_2(k), i + 2 h_2(k), \ldots$
- **Robin Hood**: linear probing with displacement-based reordering.
- **Cuckoo**: two tables, two hashes; on collision, evict and re-insert.

We'll implement two: separate chaining (the simplest) and linear probing (the fastest in practice).

## Implementation 1: Separate Chaining

```c
// src/hashmap_chained.c
#include "algo/hashmap.h"
#include <stdlib.h>
#include <stdint.h>

typedef struct entry {
    int key, value;
    struct entry *next;
} entry_t;

struct hashmap {
    entry_t **buckets;
    size_t    bucket_count;
    size_t    size;
};

constexpr size_t INITIAL_BUCKETS = 16;
constexpr double MAX_LOAD = 0.75;

static uint64_t hash_int(uint64_t x) {
    x ^= x >> 30; x *= 0xbf58476d1ce4e5b9ull;
    x ^= x >> 27; x *= 0x94d049bb133111ebull;
    x ^= x >> 31; return x;
}

hashmap_t *hashmap_new(void) {
    hashmap_t *h = malloc(sizeof *h);
    if (!h) return nullptr;
    h->buckets = calloc(INITIAL_BUCKETS, sizeof *h->buckets);
    if (!h->buckets) { free(h); return nullptr; }
    h->bucket_count = INITIAL_BUCKETS;
    h->size = 0;
    return h;
}

void hashmap_free(hashmap_t *h) {
    if (!h) return;
    for (size_t i = 0; i < h->bucket_count; ++i) {
        entry_t *e = h->buckets[i];
        while (e) {
            entry_t *next = e->next;
            free(e);
            e = next;
        }
    }
    free(h->buckets);
    free(h);
}

static int hashmap_resize(hashmap_t *h, size_t new_count) {
    entry_t **new_buckets = calloc(new_count, sizeof *new_buckets);
    if (!new_buckets) return -1;
    for (size_t i = 0; i < h->bucket_count; ++i) {
        entry_t *e = h->buckets[i];
        while (e) {
            entry_t *next = e->next;
            size_t idx = hash_int((uint64_t)e->key) & (new_count - 1);
            e->next = new_buckets[idx];
            new_buckets[idx] = e;
            e = next;
        }
    }
    free(h->buckets);
    h->buckets = new_buckets;
    h->bucket_count = new_count;
    return 0;
}

int hashmap_set(hashmap_t *h, int key, int value) {
    if ((double)(h->size + 1) > MAX_LOAD * (double)h->bucket_count) {
        if (hashmap_resize(h, h->bucket_count * 2) != 0) return -1;
    }
    size_t idx = hash_int((uint64_t)key) & (h->bucket_count - 1);
    for (entry_t *e = h->buckets[idx]; e; e = e->next) {
        if (e->key == key) { e->value = value; return 0; }
    }
    entry_t *e = malloc(sizeof *e);
    if (!e) return -1;
    e->key = key;
    e->value = value;
    e->next = h->buckets[idx];
    h->buckets[idx] = e;
    ++h->size;
    return 0;
}

bool hashmap_get(const hashmap_t *h, int key, int *out) {
    size_t idx = hash_int((uint64_t)key) & (h->bucket_count - 1);
    for (entry_t *e = h->buckets[idx]; e; e = e->next) {
        if (e->key == key) { *out = e->value; return true; }
    }
    return false;
}

bool hashmap_remove(hashmap_t *h, int key) {
    size_t idx = hash_int((uint64_t)key) & (h->bucket_count - 1);
    entry_t **pp = &h->buckets[idx];
    while (*pp) {
        if ((*pp)->key == key) {
            entry_t *dead = *pp;
            *pp = dead->next;
            free(dead);
            --h->size;
            return true;
        }
        pp = &(*pp)->next;
    }
    return false;
}

size_t hashmap_size(const hashmap_t *h) { return h->size; }
```

Notes:

- **Bucket count is a power of two.** The mask `& (bucket_count - 1)` replaces `% bucket_count`, which is faster.
- **Resize at load 0.75.** Above this, collision chains lengthen and per-operation cost climbs.
- **Resize doubles the bucket count.** Same amortized $\Theta(1)$ argument as the dynamic array — total rehash cost over $n$ inserts is $\Theta(n)$.
- **`calloc` zeroes the bucket array.** A `nullptr` bucket is "empty"; we don't need a sentinel.

> :nerdygoose: With load 0.75 and a good hash, the expected chain length is $0.75 / 1 = 0.75$ items per bucket — most lookups touch one cache line. With load 1.0 you'd expect 1.0; with load 4.0 you'd expect 4.0. As load grows, lookup cost grows linearly, eventually overtaking the cost of resizing. 0.75 is a good default; the right value depends on your access patterns.

## Implementation 2: Linear Probing (Open Addressing)

In open addressing, all entries live in the table array. On collision, scan forward to the next slot. The key advantage is *cache locality* — every probe touches a slot adjacent to the previous, prefetched into the same line.

```c
// src/hashmap_linear.c — linear probing.
#include "algo/hashmap.h"
#include <stdlib.h>
#include <stdint.h>

typedef enum slot_state : uint8_t {
    EMPTY = 0,
    OCCUPIED = 1,
    TOMBSTONE = 2,
} slot_state_t;

typedef struct slot {
    int          key;
    int          value;
    slot_state_t state;
} slot_t;

struct hashmap {
    slot_t *slots;
    size_t  cap;
    size_t  size;
    size_t  tombstones;
};

constexpr size_t INITIAL_CAP = 16;
constexpr double MAX_LOAD = 0.5;   // lower than chaining; clustering hurts faster

static uint64_t hash_int(uint64_t x) {
    x ^= x >> 30; x *= 0xbf58476d1ce4e5b9ull;
    x ^= x >> 27; x *= 0x94d049bb133111ebull;
    x ^= x >> 31; return x;
}

hashmap_t *hashmap_new(void) {
    hashmap_t *h = malloc(sizeof *h);
    if (!h) return nullptr;
    h->slots = calloc(INITIAL_CAP, sizeof *h->slots);   // EMPTY = 0
    if (!h->slots) { free(h); return nullptr; }
    h->cap = INITIAL_CAP;
    h->size = 0;
    h->tombstones = 0;
    return h;
}

void hashmap_free(hashmap_t *h) {
    if (!h) return;
    free(h->slots);
    free(h);
}

static int hashmap_resize(hashmap_t *h, size_t new_cap);

int hashmap_set(hashmap_t *h, int key, int value) {
    // Resize if (size + tombstones) / cap > MAX_LOAD.
    if ((double)(h->size + h->tombstones + 1) > MAX_LOAD * (double)h->cap) {
        if (hashmap_resize(h, h->cap * 2) != 0) return -1;
    }
    size_t idx = hash_int((uint64_t)key) & (h->cap - 1);
    size_t first_tomb = (size_t)-1;
    while (h->slots[idx].state != EMPTY) {
        if (h->slots[idx].state == OCCUPIED && h->slots[idx].key == key) {
            h->slots[idx].value = value;     // update existing
            return 0;
        }
        if (h->slots[idx].state == TOMBSTONE && first_tomb == (size_t)-1) {
            first_tomb = idx;
        }
        idx = (idx + 1) & (h->cap - 1);
    }
    // Use the first tombstone we saw, or this empty slot.
    size_t target = (first_tomb != (size_t)-1) ? first_tomb : idx;
    h->slots[target].key = key;
    h->slots[target].value = value;
    if (h->slots[target].state == TOMBSTONE) --h->tombstones;
    h->slots[target].state = OCCUPIED;
    ++h->size;
    return 0;
}

bool hashmap_get(const hashmap_t *h, int key, int *out) {
    size_t idx = hash_int((uint64_t)key) & (h->cap - 1);
    while (h->slots[idx].state != EMPTY) {
        if (h->slots[idx].state == OCCUPIED && h->slots[idx].key == key) {
            *out = h->slots[idx].value;
            return true;
        }
        idx = (idx + 1) & (h->cap - 1);
    }
    return false;
}

bool hashmap_remove(hashmap_t *h, int key) {
    size_t idx = hash_int((uint64_t)key) & (h->cap - 1);
    while (h->slots[idx].state != EMPTY) {
        if (h->slots[idx].state == OCCUPIED && h->slots[idx].key == key) {
            h->slots[idx].state = TOMBSTONE;
            --h->size;
            ++h->tombstones;
            return true;
        }
        idx = (idx + 1) & (h->cap - 1);
    }
    return false;
}

static int hashmap_resize(hashmap_t *h, size_t new_cap) {
    slot_t *new_slots = calloc(new_cap, sizeof *new_slots);
    if (!new_slots) return -1;
    for (size_t i = 0; i < h->cap; ++i) {
        if (h->slots[i].state != OCCUPIED) continue;
        size_t idx = hash_int((uint64_t)h->slots[i].key) & (new_cap - 1);
        while (new_slots[idx].state == OCCUPIED) {
            idx = (idx + 1) & (new_cap - 1);
        }
        new_slots[idx] = h->slots[i];
        new_slots[idx].state = OCCUPIED;
    }
    free(h->slots);
    h->slots = new_slots;
    h->cap = new_cap;
    h->tombstones = 0;
    return 0;
}

size_t hashmap_size(const hashmap_t *h) { return h->size; }
```

The key subtlety is **tombstones**. When you delete an entry, you can't just set the slot to `EMPTY` — that would break lookups for any key whose probe sequence passed through this slot. Instead, mark it `TOMBSTONE`: lookups skip past it; inserts may reuse it (after confirming the key isn't already further down the probe chain).

Tombstones accumulate. When `(size + tombstones) / cap` exceeds the load factor, we resize, which clears them.

> :angrygoose: Linear probing without tombstones is the classic hash table bug. New programmers write a delete that sets the slot empty, and lookups silently start returning "not found" for keys that are still in the table — anywhere along a probe chain that passed through the deleted slot. The bug only shows up after deletes, on specific key combinations, and is hell to debug. Tombstones, or the slightly trickier "backshift deletion," are non-negotiable.

## When to Use Which

| Property | Separate chaining | Linear probing |
|---|---|---|
| Cache friendliness | Mediocre (chain pointers) | Excellent (sequential probes) |
| Load factor | 0.75 - 1.0 typical | 0.5 - 0.7 typical |
| Memory per entry | Higher (extra pointer per node) | Lower (slots only) |
| Worst case | Long chains under bad hash | Long probe sequences under bad hash |
| Deletion | Easy (unlink) | Tombstones or backshift |
| Resizing cost | Same | Same |
| Adversarial input | Robust if hash is robust | More sensitive to clustering |

For most workloads, linear probing wins. It's faster, uses less memory, and is friendlier to the cache. Production hash tables (Google's `dense_hash_map`, `absl::flat_hash_map`, Rust's `HashMap`, Robin Hood variants) are open-addressing variants. The C++ standard's `std::unordered_map` is separate chaining for ABI-stability reasons; almost everyone considers it slow.

> :sharpgoose: If you need to design a hash table from scratch in 2026, default to linear probing or Robin Hood. Don't reach for separate chaining unless you specifically need stable element addresses (the C++ ABI requires this; that's why `unordered_map` is what it is).

## Robin Hood Hashing

A small refinement of linear probing that drastically improves the variance of probe distances.

**Idea.** When inserting, if the existing entry at a slot has a smaller "distance from its ideal slot" (DIB) than the entry being inserted, swap them and continue inserting the displaced entry.

**Effect.** No entry is ever further from its ideal than necessary; the variance of probe distances drops by an order of magnitude. Worst-case lookup time becomes much closer to average.

```c
// Sketch: in linear probing, on insert, also track DIB:
size_t dib = 0;
while (h->slots[idx].state == OCCUPIED) {
    size_t their_ideal = hash_int((uint64_t)h->slots[idx].key) & (h->cap - 1);
    size_t their_dib = (idx - their_ideal) & (h->cap - 1);
    if (their_dib < dib) {
        // Swap: insert our (key, value) here, keep going with theirs.
        swap(&h->slots[idx], &incoming);
        dib = their_dib;
    }
    idx = (idx + 1) & (h->cap - 1);
    ++dib;
}
```

The full implementation is a bit more involved (lookup also uses DIB to terminate early). It's the basis for Rust's `HashMap`, Boost's `flat_map`, and many production tables.

## Load Factor: The Knob

Load factor $\alpha = \text{size} / \text{capacity}$. As $\alpha$ rises:

- **Memory use drops** — fewer wasted slots.
- **Per-op cost rises** — more collisions to resolve.

For separate chaining at load $\alpha$, expected chain length is $\alpha$. Lookup is $\Theta(1 + \alpha)$.

For linear probing at load $\alpha$ with a good hash, expected probe length is $\Theta(1 / (1 - \alpha))$. At $\alpha = 0.5$ this is 2 probes; at $\alpha = 0.9$ it's 10; at $\alpha = 0.99$ it's 100. **Linear probing degrades catastrophically near full.** Resize before $\alpha = 0.7$.

> :nerdygoose: The $\Theta(1 / (1 - \alpha))$ formula is from queueing theory — it's the expected length of a "burst" in a Bernoulli process. The same math governs traffic in highway lanes near capacity. Hash tables are highways.

## Iteration

Iterating over all entries:

- **Separate chaining**: walk every bucket; for each, walk its chain. $\Theta(\text{bucket\_count} + \text{size})$.
- **Linear probing**: walk every slot; emit OCCUPIED ones. $\Theta(\text{cap})$, which is $\Theta(\text{size} / \alpha)$.

Both can iterate efficiently. Order is *unspecified* — keys come back in hash order, not insertion order. Insertion-order hash tables (Python 3.7+, Java's `LinkedHashMap`) maintain a separate doubly-linked list overlay; we cover that variant in a sidebar of Chapter 11.

## What This Costs in Practice

Representative microbenchmark — 1 million `set` operations followed by 1 million random `get`s, integer keys, on a typical x86-64 laptop:

| Implementation | set (ns/op) | get (ns/op) |
|---|---|---|
| Separate chaining | ~95 | ~50 |
| Linear probing | ~45 | ~25 |
| Robin Hood | ~50 | ~22 |
| `std::unordered_map` | ~100 | ~55 |
| Google `flat_hash_map` | ~30 | ~15 |
| Identity-hash on sequential keys | $\Theta(n)$ catastrophe | — |

The 2× gap between separate chaining and linear probing is essentially all cache. The 1.5× gap between linear probing and `flat_hash_map` is SIMD probe-batching and other low-level tricks. The catastrophic identity-hash row is what happens when you skimp on the hash function.

## What's Next

Chapter 10 starts Part III: trees. We open with binary trees in general — definition, traversals, recursive vs iterative — and use them as the foundation for everything that follows: BSTs, AVL, Red-Black, B-trees, heaps, and tries.
