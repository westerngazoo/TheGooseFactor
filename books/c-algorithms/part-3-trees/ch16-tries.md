---
sidebar_position: 7
sidebar_label: "Ch 16: Tries"
title: "Chapter 16: Tries — Trees Keyed on Prefixes"
---

# Chapter 16: Tries

A **trie** (pronounced "try," from re*trie*val) is a tree where each edge is a character and each path from the root to a node spells out a prefix of a stored string. Tries are the right answer for prefix queries: "find all strings starting with `pr`" in $\Theta(\text{prefix length} + \text{number of results})$, regardless of how many strings the trie contains.

They power autocomplete, IP routing tables (longest-prefix match on binary tries), spell checkers, dictionary lookups, regex engines, and the Aho-Corasick multi-pattern matcher. They're also the "obvious" data structure that almost no one's first reach for, despite being absurdly fast for their problem domain.

This chapter covers the basic trie, the compressed (Patricia) trie, the radix tree variants used for IP routing, and when each is appropriate.

## The Basic Trie

```text
              (root)
              /  |  \
             a   b   c
            /    |    \
           t     a     a
          / \    |     |
         e   o   t     t
              \  |
              m? (terminal)

stored words: "ate", "atom", "bat", "cat"
```

Each node has up to one child per possible character. A node is *terminal* if its path from the root spells a complete word.

```c
// include/algo/trie.h — trie over lowercase ASCII letters.
#ifndef ALGO_TRIE_H
#define ALGO_TRIE_H

#include <stddef.h>
#include <stdbool.h>

constexpr size_t TRIE_FANOUT = 26;

typedef struct trie_node {
    struct trie_node *children[TRIE_FANOUT];
    bool   is_terminal;
} trie_node_t;

typedef struct trie {
    trie_node_t *root;
    size_t       count;
} trie_t;

void trie_init(trie_t *t);
void trie_free(trie_t *t);

[[nodiscard]] int  trie_insert(trie_t *t, const char *word);
[[nodiscard]] bool trie_contains(const trie_t *t, const char *word);
[[nodiscard]] bool trie_starts_with(const trie_t *t, const char *prefix);

typedef void (*trie_visit_fn)(const char *word, void *ctx);
void trie_collect(const trie_t *t, const char *prefix, trie_visit_fn f, void *ctx);

#endif
```

## Insert and Search

```c
static int char_idx(char c) { return c - 'a'; }

int trie_insert(trie_t *t, const char *word) {
    if (!t->root) {
        t->root = calloc(1, sizeof *t->root);
        if (!t->root) return -1;
    }
    trie_node_t *cur = t->root;
    for (const char *p = word; *p; ++p) {
        int idx = char_idx(*p);
        if (!cur->children[idx]) {
            trie_node_t *fresh = calloc(1, sizeof *fresh);
            if (!fresh) return -1;
            cur->children[idx] = fresh;
        }
        cur = cur->children[idx];
    }
    if (!cur->is_terminal) {
        cur->is_terminal = true;
        ++t->count;
    }
    return 0;
}

bool trie_contains(const trie_t *t, const char *word) {
    const trie_node_t *cur = t->root;
    if (!cur) return false;
    for (const char *p = word; *p; ++p) {
        cur = cur->children[char_idx(*p)];
        if (!cur) return false;
    }
    return cur->is_terminal;
}

bool trie_starts_with(const trie_t *t, const char *prefix) {
    const trie_node_t *cur = t->root;
    if (!cur) return false;
    for (const char *p = prefix; *p; ++p) {
        cur = cur->children[char_idx(*p)];
        if (!cur) return false;
    }
    return true;       // prefix exists; words may or may not
}
```

**Complexity:**

- Insert: $\Theta(L)$ where $L$ is the word length. Independent of $n$ (the number of stored words).
- Search: $\Theta(L)$.
- Prefix existence: $\Theta(L)$ where $L$ is the prefix length.

Compare to a hash table: hash table is $\Theta(L)$ for hash + $\Theta(1)$ for the lookup, *and cannot answer prefix queries*. Compare to a balanced BST of strings: $\Theta(\log n \cdot L)$ — the BST is $\log n$ levels, each with a string comparison of up to $L$ characters.

> :nerdygoose: For string sets, the trie is *asymptotically* better than the hash table on the metric of "characters compared per query." A hash table compares the entire query string against the entire stored string twice (once during hashing, once during equality check). A trie compares character-by-character, stopping at the first divergence.

## Prefix Queries

Find all words with a given prefix:

```c
static void trie_walk(const trie_node_t *n, char *buf, size_t depth,
                      trie_visit_fn f, void *ctx) {
    if (n->is_terminal) {
        buf[depth] = '\0';
        f(buf, ctx);
    }
    for (size_t i = 0; i < TRIE_FANOUT; ++i) {
        if (n->children[i]) {
            buf[depth] = (char)('a' + i);
            trie_walk(n->children[i], buf, depth + 1, f, ctx);
        }
    }
}

void trie_collect(const trie_t *t, const char *prefix, trie_visit_fn f, void *ctx) {
    const trie_node_t *cur = t->root;
    if (!cur) return;
    char buf[256];                       // assumes max word length < 256
    size_t depth = 0;

    for (const char *p = prefix; *p; ++p, ++depth) {
        buf[depth] = *p;
        cur = cur->children[char_idx(*p)];
        if (!cur) return;
    }
    trie_walk(cur, buf, depth, f, ctx);
}
```

Time: $\Theta(\text{prefix length} + \text{output size})$. The prefix walk is bounded by the prefix length; the subtree walk is bounded by the number of words emitted, plus a constant per visited node.

> :sharpgoose: This is the operation that makes tries unique. Autocomplete in any decent text editor — VS Code, Sublime, IntelliJ — uses a trie (or a more sophisticated variant). When you type "pr", the editor walks down the "p" → "r" path and dumps the subtree. Hash maps and BSTs cannot do this efficiently.

## The Memory Problem

The basic trie has a problem: every node carries one pointer per possible character. With ASCII (256 characters), each node is 2 KB on a 64-bit system. With 50,000 words, the trie can have hundreds of thousands of nodes, totaling hundreds of megabytes — for a *small* dictionary.

The 26-way fanout we used above is reasonable for lowercase English. For any larger alphabet (Unicode, full ASCII, byte strings), the basic trie is impractical without compression.

Three fixes:

1. **Hash map per node** — replace the 256-pointer array with a hash map from character to child. Faster for large alphabets, slower for small ones. Robin Hood hashing makes this competitive.

2. **Sorted child list** — store children in a sorted array, search by binary search. Cache-friendlier than the hash map for small numbers of children. Used in Lucene for in-memory indexes.

3. **Compressed (Patricia) tries** — coalesce single-child paths. Discussed below.

## Patricia Trie (Radix Tree)

A **Patricia trie** (or *radix tree*) compresses chains of single-child nodes into a single edge labeled with multiple characters. The trie that stored "ate", "atom", "bat", "cat" becomes:

```text
              (root)
              /  |  \
             a   b   c
            /    |    \
           t    at    at
          / \
        e?   om?
```

Each edge is now a string, not a single character. Lookup walks edges by string prefix. Insert may split an existing edge into two. Delete may coalesce.

Memory savings are dramatic — for natural-language dictionaries, often 10× smaller than a basic trie. Lookup remains $\Theta(L)$ but with much better cache behavior because each edge is contiguous.

```c
typedef struct patricia_node {
    struct patricia_node *children;    // sorted linked list of siblings
    struct patricia_node *next;        // next sibling
    char  *edge;                       // edge label
    size_t edge_len;
    bool   is_terminal;
} patricia_node_t;
```

Patricia tries are the production form of tries. The IP routing tables in the Linux kernel use a Patricia variant; many filesystems use one for in-memory directory caches; modern key-value stores like LMDB use them for the metadata layer.

> :nerdygoose: The original Patricia trie (Morrison 1968) is for *binary* strings — each edge is a sequence of bits. The radix tree generalization (Sedgewick) uses arbitrary alphabets. Both are common; "Patricia trie" in 2026 usually means "compressed trie over byte strings" by default.

## Binary Tries for IP Routing

Internet routing has a specific problem: given an IP address, find the longest stored prefix that matches it. ($192.168.1.5$ matches both $192.168.0.0/16$ and $192.168.1.0/24$ — return the longer one, which is more specific.)

**Binary tries** solve this. Each level of the trie is one bit of the IP address; left child for 0, right child for 1. Each node may store a route. Lookup walks down the bits of the address, remembering the deepest stored route along the way.

```c
typedef struct iptrie_node {
    struct iptrie_node *zero;
    struct iptrie_node *one;
    int   route_id;             // -1 if no route stored here
} iptrie_node_t;

int iptrie_lookup(const iptrie_node_t *root, uint32_t ip) {
    int best = -1;
    const iptrie_node_t *cur = root;
    for (int bit = 31; bit >= 0 && cur; --bit) {
        if (cur->route_id >= 0) best = cur->route_id;
        cur = ((ip >> bit) & 1) ? cur->one : cur->zero;
    }
    if (cur && cur->route_id >= 0) best = cur->route_id;
    return best;
}
```

Time: $\Theta(B)$ where $B$ is the bit-length of the address ($32$ for IPv4, $128$ for IPv6). $\Theta(B)$ is *constant* for a given address family — IPv4 lookups are at most 32 levels deep regardless of the routing table size.

Production routers compress this further with **multibit tries** that consume 4-8 bits per level (fanout $2^k$), reducing the levels at the cost of memory. Linux's FIB (Forwarding Information Base) uses a "LC-trie" — a level-compressed trie — that's around 8 levels for typical Internet routing tables.

> :sharpgoose: This is the structure that makes Internet routing fast. A core router's BGP table has 800,000+ prefixes; an LC-trie can do longest-prefix match in fewer than 10 memory accesses. The naive linear scan would be $\Theta(n)$; sorting and binary search would be $\Theta(\log n) \approx 20$. The trie wins not just on throughput but on *predictable* worst-case lookup time.

## Aho-Corasick: Multi-Pattern Matching

A trie augmented with **failure links** lets you scan a long text for occurrences of any of a set of patterns, in $\Theta(|text| + |patterns| + \text{matches})$. This is *Aho-Corasick*, the algorithm behind `grep -F` (fixed-string mode), antivirus signature matching, and intrusion detection.

The construction:

1. Build a trie of all patterns.
2. For each node, compute its failure link — the longest proper suffix of the path-from-root that is also a path-from-root to some other node.
3. Scan the text one character at a time, following normal edges where possible and failure links when not.

The failure links turn the trie into a finite-state automaton. Each text character advances the state in $\Theta(1)$ amortized; matches are emitted when a terminal node (or a node whose failure path leads to one) is reached.

We don't implement Aho-Corasick here — it's a chapter on its own — but it's the canonical example of "trie plus extra pointers becomes a powerful matcher." Worth studying for any text-processing system.

## Memory Layout: Cache vs Flexibility

The two extremes:

- **Pointer-per-character node** (the basic trie above): $\Theta(\text{alphabet size})$ memory per node, $\Theta(1)$ child lookup. Cache-unfriendly but lookup-fast.
- **Linked-list of children** (Patricia-style): $\Theta(\text{children present})$ memory per node, $\Theta(\text{children})$ child lookup. Cache-friendlier, but slower lookup if children are many.

A common middle ground: **double-array tries**, used in dictionary engines like Mecab (Japanese morphological analysis). Two parallel arrays encode the trie's transition function in two indices per node — extremely compact and fast, at the cost of complex insertion logic. Used when the trie is built once and queried many times.

## Persistence: HAMT

A variant called **Hash Array Mapped Trie** (HAMT) is the basis of Clojure's persistent maps and Scala's `Vector`. The idea: hash the key, use the hash as a path through a trie of bitmapped fanout. Each node is small (32-way fanout, but only the present children are stored, indexed by a bitmap). Mutations create new nodes along the modification path; the rest of the trie is shared.

HAMTs give **persistent** (immutable) map operations in $\Theta(\log_{32} n)$. They're the structure behind Clojure's `assoc`, `dissoc`, and many functional language standard libraries.

> :nerdygoose: HAMTs combine a trie's structural sharing with a hash map's $\Theta(1)$-ish lookup. They're slower than mutable hash tables on most operations but trivially support immutable persistence — meaning two versions of "the same map" share most of their nodes. Critical for functional programming, version control, and concurrent data structures.

## Performance Summary

For 100,000 words from `/usr/share/dict/words`, on a typical x86-64 laptop:

| Structure | Memory | Insert | Lookup | Prefix lookup (1000 results) |
|---|---|---|---|---|
| Hash set of strings | ~2 MB | ~150 ns | ~80 ns | not supported |
| Sorted vector + binary search | ~1.5 MB | n/a (build once) | ~250 ns | ~30 µs (linear scan from start) |
| Basic trie (26-way) | ~50 MB | ~300 ns | ~150 ns | ~50 µs |
| Patricia trie | ~3 MB | ~400 ns | ~200 ns | ~80 µs |
| Double-array trie | ~1.5 MB | n/a (build once) | ~50 ns | ~20 µs |

Hash sets win on raw lookup speed and memory. Tries win on prefix queries — the only structure that supports them efficiently. Patricia tries win on memory among tries. Double-array tries are a build-once-query-many sweet spot.

## When to Use a Trie

Three triggers:

1. **You need prefix queries.** Autocomplete, fuzzy search, spell check — anything that asks "find words starting with X."
2. **You need longest-prefix match.** IP routing, URL routing, hierarchical config lookup.
3. **The set of strings shares lots of common prefixes.** Code completion (every variable in scope shares the namespace prefix). DNA/protein sequences. URL paths in a web app.

For point lookups on independent strings, hash maps win. For sorted iteration, balanced trees win. The trie's niche is *prefix-aware* operations — and that niche is large.

> :weightliftinggoose: Tries are underused because they're not in `<algorithm>`. Most languages don't ship one in the standard library; you either roll your own or pull a dependency. The result is that engineers reach for hash maps even when a trie would be 10× faster on prefix queries. If your problem says "starting with," "matching the longest," or "complete this," consider the trie. The ROI for the implementation effort is high.

## What's Next

Part III ends here. Trees were the deep dive — binary trees as the foundation, BSTs for order, AVL and Red-Black for guaranteed balance, B-trees for high fanout on disk, heaps for priority, and tries for prefix-aware lookup. Every flavor of "tree" you'll meet in production maps onto one of these patterns or a small extension.

From here, the book continues: Part IV (sorting), Part V (graphs), Part VI (strings), Part VII (engineering — profiling, PGO, SIMD, the cost of correctness). The data structures are now in place; the algorithms come next.
