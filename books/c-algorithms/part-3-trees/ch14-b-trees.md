---
sidebar_position: 5
sidebar_label: "Ch 14: B-Trees"
title: "Chapter 14: B-Trees and B+Trees — How Databases Index"
---

# Chapter 14: B-Trees

A **B-tree** is a self-balancing search tree where each node holds *many* keys and has *many* children — typically dozens to hundreds, not two. The reason is not academic: B-trees are designed for storage hierarchies where reading a single byte and reading a 4 KB block cost about the same. By packing many keys into each block, a B-tree minimizes the number of block reads to find or modify a key.

Every modern database index is a B-tree variant. PostgreSQL, MySQL InnoDB, MongoDB, SQLite, LMDB, RocksDB — they all use B-trees or their close relatives (B+trees, log-structured merge trees with B-tree memtables). The same applies to filesystems: ext4, NTFS, APFS, ZFS, Btrfs all index directories and metadata with B-trees.

This chapter covers the B-tree, its insert and delete operations with split/merge, the difference between B-trees and B+trees, and the engineering reasons high-fanout structures dominate disk-resident data.

## The Idea

A binary search tree of $n$ keys has height $\Theta(\log_2 n)$. Each node access from root to leaf touches one node — for a billion-key tree, that's about 30 nodes.

If each access requires reading from disk (or SSD, or the network), 30 reads is *expensive*. Disk seek is on the order of 5 ms; SSD random read is ~50 µs. Thirty 50-µs reads is 1.5 ms per query. That's slow.

The fix is fanout. If each node has 100 children instead of 2, the tree's height becomes $\log_{100} n = \log_2 n / \log_2 100 \approx (\log_2 n) / 6.6$. For a billion keys, that's ~5 levels. Five 50-µs reads is 250 µs — six times faster.

The catch: each "access" still costs one block read. So we want each node to be exactly one block — the unit of disk transfer (typically 4 KB or 16 KB). A 4 KB block holds maybe 200 integer keys; a 16 KB block holds 800.

> :nerdygoose: This is why "B-tree" stands for "balanced" or "block" or "Bayer" (the inventor) depending on who you ask — Bayer himself never specified. The "B" is permanently ambiguous, and that's part of the lore.

## The B-Tree Structure

A B-tree of *order* $m$ (or *minimum degree* $t$, where $m = 2t$) is a search tree where:

1. Every node has at most $m - 1$ keys.
2. Every node except the root has at least $\lceil m/2 \rceil - 1$ keys (the root may have as few as 1).
3. A node with $k$ keys has $k + 1$ children.
4. All leaves are at the same depth.
5. Keys within a node are sorted; for each child, keys in the child's subtree fall in the range bounded by the surrounding keys.

```text
                  [50, 100]
                /     |     \
        [10, 30]  [60, 80] [120, 200, 300]
       /  |   \    /  |  \   /  |  |  \
      ...
```

The root has 2 keys (50 and 100) and 3 children. Keys less than 50 go left; keys between 50 and 100 go middle; keys greater than 100 go right. Each leaf is at depth 2.

```c
// include/algo/btree.h — sketch.
constexpr size_t BTREE_T = 32;        // minimum degree; nodes hold 32-63 keys.

typedef struct btree_node {
    int keys[2 * BTREE_T - 1];
    struct btree_node *children[2 * BTREE_T];
    size_t n_keys;
    bool   is_leaf;
} btree_node_t;
```

For $t = 32$, each node has between 31 and 63 keys, and between 32 and 64 children. Node size: $63 \cdot 4 + 64 \cdot 8 + \text{overhead} \approx 770$ bytes. For a 4 KB block, you'd push $t$ higher (say $t = 200$); the choice depends on key size and block size.

## Search

Walk down: at each node, find the position where the key would go (binary search within the node) and descend into the corresponding child.

```c
bool btree_search(const btree_node_t *n, int key) {
    if (!n) return false;
    size_t i = 0;
    while (i < n->n_keys && key > n->keys[i]) ++i;
    if (i < n->n_keys && key == n->keys[i]) return true;
    if (n->is_leaf) return false;
    return btree_search(n->children[i], key);
}
```

Per-node cost: $\Theta(\log m)$ via binary search (or $\Theta(m)$ via linear scan; for small $m$ they're identical in practice because of cache prefetching).
Total cost: $\Theta(\log_m n) \cdot \Theta(\log m) = \Theta(\log n)$.

In terms of *disk reads*, search costs $\Theta(\log_m n)$ — the metric we actually care about.

## Insert: Split

Naive: walk to a leaf, insert. But the leaf may already be full ($2t - 1$ keys). The B-tree's elegant trick is **proactive splitting**: as we walk down to insert, every full node we encounter is split first, before we descend into it.

```c
// Split node->children[i], which is full. Lift its median into node.
void btree_split_child(btree_node_t *node, size_t i) {
    btree_node_t *full = node->children[i];
    btree_node_t *nu = btree_node_new(full->is_leaf);

    // Right half of full's keys go to nu.
    nu->n_keys = BTREE_T - 1;
    for (size_t j = 0; j < BTREE_T - 1; ++j) {
        nu->keys[j] = full->keys[j + BTREE_T];
    }
    if (!full->is_leaf) {
        for (size_t j = 0; j < BTREE_T; ++j) {
            nu->children[j] = full->children[j + BTREE_T];
        }
    }
    full->n_keys = BTREE_T - 1;        // left half stays in full

    // Insert the median key into node, with nu as new child.
    for (size_t j = node->n_keys; j > i; --j) {
        node->keys[j] = node->keys[j - 1];
        node->children[j + 1] = node->children[j];
    }
    node->children[i + 1] = nu;
    node->keys[i] = full->keys[BTREE_T - 1];
    ++node->n_keys;
}
```

The split takes a full node of $2t - 1$ keys, separates it into two nodes of $t - 1$ keys each, and lifts the median ($t$-th key) up into the parent. The parent gets one more key and one more child. Critically, *the parent had room* — we ensured that by splitting it first, on the way down.

> :sharpgoose: Proactive splitting is the structural insight that makes B-tree insert clean. The naive approach (insert at leaf, then walk back up splitting) requires the recursion to bubble splits upward — same complexity but with parents potentially overflowing during the bubble-up. Proactive split eliminates the back-propagation: by the time you reach the leaf, every ancestor has room.

```c
void btree_insert_nonfull(btree_node_t *n, int key) {
    if (n->is_leaf) {
        size_t i = n->n_keys;
        while (i > 0 && key < n->keys[i - 1]) {
            n->keys[i] = n->keys[i - 1];
            --i;
        }
        n->keys[i] = key;
        ++n->n_keys;
        return;
    }
    size_t i = n->n_keys;
    while (i > 0 && key < n->keys[i - 1]) --i;
    if (n->children[i]->n_keys == 2 * BTREE_T - 1) {
        btree_split_child(n, i);
        if (key > n->keys[i]) ++i;
    }
    btree_insert_nonfull(n->children[i], key);
}

void btree_insert(btree_t *t, int key) {
    btree_node_t *r = t->root;
    if (r->n_keys == 2 * BTREE_T - 1) {
        // Root full: create new root above it.
        btree_node_t *new_root = btree_node_new(false);
        new_root->children[0] = r;
        btree_split_child(new_root, 0);
        t->root = new_root;
    }
    btree_insert_nonfull(t->root, key);
}
```

The only place the tree's height grows is when we split the *root* — a new root is created above it. This is why all leaves stay at the same depth: every other split keeps the relative depths constant.

## Delete: Merge and Borrow

Symmetric to insert. As we walk down to delete, every node we descend into has at least $t$ keys (one more than the minimum). If it doesn't, we *fix* it before descending — by either *borrowing* a key from a sibling, or *merging* with a sibling.

The cases multiply in detail (many texts spend pages on them) but the principle is straightforward. The key invariant: after a delete, every non-root node has at least $t - 1$ keys.

> :angrygoose: Implementing B-tree delete from scratch is a project. The cases are: descend into a child with too few keys → check siblings → borrow if either has spare → otherwise merge with one. After borrowing/merging, descend. If we reached the leaf, remove the key. If we needed to delete an internal-node key, we either find its predecessor or successor, do that delete (recursively, in the subtree), and put it where the deleted key was. Every step needs the right minimum-keys invariant. Get it slightly wrong and the tree decays. Use a library.

## B-Trees vs B+Trees

The main variant: in a **B+tree**, all the actual data lives in the leaves, and internal nodes hold *only routing keys* (which sometimes don't even appear in the leaves). The leaves are linked into a doubly-linked list for fast sequential traversal.

```text
B-Tree:                         B+Tree:
   [50]                            [50]
  /    \                          /    \
[20:v] [70:v]                  [20]    [50, 70]
                              / |      / |  \
                          [10:v][20:v] [50:v][60:v][70:v]
                                          ↔ leaves linked
```

Properties of B+trees:

- **Higher fanout in internal nodes.** No data, just routing keys, so each block packs more.
- **Range queries are dramatically faster.** Find the start in $\Theta(\log n)$, then walk the leaf list.
- **All searches descend to the leaf.** Even for keys present in routing nodes (which is rare; typically only leaves have data).
- **Inserts and deletes only modify leaves and their ancestors.** Routing keys may shift, but the algorithm is similar to B-tree.

Every modern database engine uses B+trees, not plain B-trees. The leaf-list speedup on range queries is decisive for SQL workloads — `WHERE x BETWEEN a AND b ORDER BY x` is the bread-and-butter query.

> :nerdygoose: The B+tree is also why most production "B-tree libraries" are actually B+tree libraries. PostgreSQL's `nbtree`, MySQL InnoDB's clustered index, MongoDB's WiredTiger — all B+trees. The naked B-tree shows up in some filesystems for directory structures (where range queries are rare) but the database default is B+.

## Why Fanout Beats Height

Concrete numbers. A billion ($10^9$) keys, 16-byte keys including pointer:

- Binary tree: $\log_2 10^9 \approx 30$ levels. 30 cache misses per lookup at minimum.
- B-tree with 4 KB nodes (~250 keys): $\log_{250} 10^9 \approx 4$ levels. 4 cache misses per lookup.

The B-tree is ~7× faster on cache-bound workloads, even at the same asymptotic class. For disk-resident structures the gap widens dramatically — disk seek is 100,000× slower than cache.

This is also why **in-memory** B-trees are competitive even though the asymptotic complexity is identical to a Red-Black tree:

- A Red-Black tree of 1M ints: each node access is one cache miss; ~20 misses per lookup.
- A B-tree with 64 keys per node: ~4 cache misses per lookup.

For lookup-bound code, the in-memory B-tree wins by several times. PostgreSQL benchmarks consistently show this for range scans even when the data fits in RAM.

## Augmenting B-trees

Like AVL, B-trees can be augmented with subtree statistics — total count, sum, min, max — to support O($\log n$) range aggregates. Each internal node stores the aggregate of its subtree; updates propagate. SQL `OVER (PARTITION BY)` window functions are often implemented this way.

A specific augmentation: the **B-tree map** with values stored alongside keys. Either the values live with the keys (data alongside) — making nodes larger and reducing fanout — or the leaves contain values and internal nodes contain only routing (B+tree style).

## Concurrency: B-tree's Other Advantage

B-trees are easier to make concurrent than binary trees. The reason: each node holds many keys, so contention happens at the *block* level. A reader can lock a single block and traverse many keys; a writer can lock a path and modify a single block. Compared to Red-Black, where every node is contended individually, B-trees scale much better under concurrent access.

The classic concurrent B-tree algorithm is the Lehman-Yao **B-link tree**: each node has a pointer to its right sibling (in addition to children), so a thread that holds an outdated reference to a split node can follow the right-link to the correct one without re-locking. This is the basis of PostgreSQL's index concurrency.

> :sharpgoose: B-link trees are one of the most clever concurrency designs in basic algorithms. Every concurrent insert / split is *one* atomic operation; readers may briefly see "the wrong" node and recover by following one extra pointer. The ratio of throughput-to-complexity is unmatched. If you ever build a multi-threaded ordered map, study Lehman-Yao first.

## Performance vs Other Structures

For a billion-row index, ordered queries:

| Structure | Lookup | Range scan (1000 keys) | Insert | Block reads / lookup |
|---|---|---|---|---|
| B+tree (4 KB blocks) | ~5 µs | ~50 µs | ~5 µs | 4 |
| Red-Black tree (in memory) | ~150 ns | ~70 µs | ~250 ns | n/a |
| Hash table (in memory) | ~25 ns | not supported | ~30 ns | n/a |
| LSM tree | ~10 µs | varies | ~200 ns | varies |

B+trees are the right structure when:

- The data doesn't fit in RAM.
- Block-aligned access matters (disk, SSD, network storage).
- Range queries are common.
- Concurrent access is required.

Red-Black is right for in-memory ordered maps with mixed reads/writes. Hash tables are right when order doesn't matter and lookup speed is everything. LSM trees (which we don't cover in depth) are right for write-heavy workloads on slow storage.

## A Concrete Production: PostgreSQL nbtree

PostgreSQL stores tables and indexes as 8 KB pages on disk. The default index type is `nbtree`, a B+tree variant with these properties:

- **8 KB pages**, holding ~150 keys (plus tuple identifiers).
- **Right-link concurrency** (Lehman-Yao style).
- **Leaf list for sequential scan.**
- **High keys** for split tracking.
- **VACUUM** for deferred deletion (delete marks the slot; VACUUM reclaims space).

The full implementation is in `src/backend/access/nbtree/`. Reading it is a graduate course in production B-tree engineering.

> :weightliftinggoose: Want to truly understand B-trees? Spend a weekend reading PostgreSQL's `nbtree.c`, `nbtinsert.c`, `nbtsplitloc.c`. Then read InnoDB's `btr0btr.cc` for the alternative perspective. The textbook B-tree is one chapter; the production B-tree is a career.

## What's Next

Chapter 15 covers **heaps and priority queues** — a binary tree variant where the only ordering rule is "parent dominates child." Heaps are simpler than BSTs (no left-vs-right comparison, no balance), and they support `extract-min` in $\Theta(\log n)$ — the canonical priority queue. They are also the structure behind heap sort, Dijkstra's algorithm, and most schedulers. We'll show the array-as-tree representation, sift-up and sift-down, the elegant $\Theta(n)$ build_heap, and d-ary variants.
