---
sidebar_position: 2
title: "B-Trees: the Read-Optimized Index"
---

# B-Trees

> The single most important data structure in databases. A **B-tree**
> (really the **B+ tree**) is a balanced, high-fanout search tree designed
> to minimize **page reads** — it stays just a few levels deep even for
> billions of keys, so any lookup is a handful of disk accesses. It powers
> the indexes in PostgreSQL, MySQL, SQLite, and most relational engines.

[Chapter 3](/database/part-1-foundations/storage-on-disk) left us with a
heap file that finds rows by RID instantly but by *value* only via a full
scan. The **B-tree** is the index that fixes that: given `WHERE id = 42`,
it locates the row in ~3–4 page reads instead of scanning millions. It's
the workhorse of the read-optimized world, and worth understanding deeply.

## 1. Why not a binary tree?

A balanced **binary** search tree has O(log₂ n) height — for a billion
keys, ~30 levels. If each node is on a different page, that's ~30 page
reads per lookup ([Chapter 3](/database/part-1-foundations/storage-on-disk)
told us page reads are the expensive thing). Far too many.

The B-tree's insight: make each node **a whole page** holding *hundreds*
of keys, so each node has *hundreds* of children. The base of the log
jumps from 2 to (say) 500, and the tree's height collapses:

```
  log₂(1,000,000,000) ≈ 30      (binary tree)
  log₅₀₀(1,000,000,000) ≈ 3–4   (B-tree with fanout 500)
```

A billion keys in **3–4 levels** = 3–4 page reads per lookup. *That* is
why databases use B-trees: the structure is shaped around the page as the
unit of I/O.

> :nerdygoose: A B-tree is what you get when you redesign a search tree to
> minimize *page accesses* instead of *comparisons*. In-memory algorithms
> count CPU operations; on-disk algorithms count I/Os, and an I/O is ~1000×
> a comparison. So you cram a page full of keys (making comparisons within
> a node "free" relative to fetching the page) to maximize **fanout** and
> minimize **height**. The whole design follows from "the page read is the
> cost." It's the cleanest example of the memory/disk mindset shift from
> [Part I](/database/part-1-foundations/storage-on-disk).

## 2. B-tree vs B+ tree

Two close variants, and databases almost always use the second:

- **B-tree**: keys *and* their associated values/RIDs can live in any
  node, internal or leaf.
- **B+ tree**: **internal nodes hold only keys** (as signposts);
  **all values/RIDs live in the leaves**; and the **leaves are linked**
  in a sorted list.

The B+ tree wins for databases because (a) internal nodes, holding only
keys, fit *more* keys per page → higher fanout → shallower tree, and
(b) the linked leaves make **range scans** trivial (walk the leaf chain).
When people say "B-tree" in a database context, they nearly always mean
**B+ tree** — and so will we.

## 3. The structure

A B+ tree of fanout *m*:

```
            ┌───────────────[ 30 | 70 ]───────────────┐      internal (keys only)
            │                  │                       │
       ┌─[10|20]─┐        ┌─[40|55]─┐            ┌─[80|95]─┐  internal
       │    │    │        │    │    │            │    │    │
     leaves...  (leaves hold keys + RIDs, linked left→right) ...leaves
     [..|..]→[..|..]→[..|..]→[..|..]→[..|..]→[..|..]→[..|..]
```

- **Internal nodes**: sorted **keys** that partition the key space, plus
  child pointers. Key `30` means "keys `< 30` go left, keys `≥ 30` go
  right."
- **Leaf nodes**: the actual **(key, RID)** entries, in sorted order,
  **linked** to the next leaf.
- **Balanced**: all leaves are at the *same depth*; the tree stays
  balanced through splits/merges, guaranteeing the height bound.
- Each node is at least **half full** (the "B-tree invariant"), bounding
  wasted space and height.

## 4. Lookup

Finding `id = 42` walks root-to-leaf, doing a binary search *within* each
node's keys to pick the next child:

```
search(key):
  node = root
  while node is internal:
      i = first key in node where key < node.keys[i]   # binary search
      node = node.children[i]
  # node is now a leaf
  return leaf entry with this key, or "not found"
```

Each step reads **one page** (the node) and descends one level. With
height 3–4, that's **3–4 page reads** — and the top levels are almost
always cached in the buffer pool
([Chapter 7](/database/part-2-storage-engines/buffer-pool)), so in
practice often just the leaf hits disk. The found leaf entry gives the
**RID**, and the executor fetches the row from the heap.

## 5. Range scans: the B+ tree superpower

`WHERE id BETWEEN 40 AND 90` is where the linked leaves shine:

1. Look up the start key (`40`) — descend to its leaf (3–4 reads).
2. Read entries left-to-right in that leaf.
3. Follow the **leaf link** to the next leaf, continue.
4. Stop when you pass `90`.

The scan reads only the leaves covering the range, sequentially via the
links — no re-descending the tree per key. Because leaves are sorted and
linked, **ordered iteration and range queries are cheap**, which is why
B+ trees also accelerate `ORDER BY`, `MIN`/`MAX`, and prefix matches. This
range capability is a big reason B-trees beat hash indexes for general use
(a hash index does O(1) point lookups but *no* ranges).

## 6. Insert and node splits

Inserting keeps the tree balanced via **splitting**:

1. Find the leaf where the key belongs (a lookup).
2. If the leaf has room, insert in sorted order. Done.
3. If the leaf is **full**, **split** it into two half-full leaves, and
   **push the middle key up** into the parent as a new separator.
4. If that push overflows the parent, split *it* too — splits cascade
   upward.
5. If the **root** splits, a new root is created — and *this is the only
   way the tree grows taller*, which is why all leaves stay at equal
   depth.

```
 leaf [10 20 30 40] + insert 25, full → split:
   [10 20]   [25 30 40]      and push 25 up to the parent
```

Deletion is the mirror image: remove the key, and if a node falls below
half-full, **borrow** from a sibling or **merge** with one (pulling a
separator down). These local rebalancing operations keep the tree balanced
and at least half-full *without* ever rebuilding it — the elegance of the
B-tree.

## 7. The cost model and amplification

B-tree performance, in page I/Os:

- **Point lookup**: O(height) ≈ 3–4 reads (fewer with caching).
- **Range scan**: O(height + matching leaves).
- **Insert/update/delete**: O(height) to find + occasional split/merge.

The B-tree's weakness is **write amplification** and **random I/O**:
inserting one key may dirty a leaf page (and split pages up the tree), and
those pages are scattered across the disk — so a write-heavy workload
generates many random page writes. The data is also updated **in place**,
which complicates concurrency and crash consistency
([Part IV](/database/part-4-transactions/concurrency-control),
[Part V](/database/part-5-durability/write-ahead-log)). These weaknesses
are exactly what the **LSM-tree**
([Chapter 6](/database/part-2-storage-engines/lsm-trees)) attacks.

## 8. B-trees in the real world

A few practical notes:

- **Ubiquity**: `CREATE INDEX` in PostgreSQL, MySQL, SQLite, SQL Server,
  Oracle defaults to a B-tree. When you "add an index," you're almost
  always building one.
- **Clustered indexes** ([Chapter 4](/database/part-2-storage-engines/storage-engine)):
  InnoDB and SQLite store the *whole row* in the leaf of the primary-key
  B-tree, so a PK lookup lands on the row directly.
- **Fanout in practice**: with 8–16 KB pages and small keys, fanout is
  often several hundred to a couple thousand — so even huge tables are
  3–4 levels deep, and the upper levels live permanently in cache.
- **Composite keys**: a B-tree on `(last_name, first_name)` sorts by the
  tuple, which is why multi-column index *order matters* and why such an
  index helps queries filtering on a *prefix* of the columns.

Understanding the B-tree explains a huge fraction of practical database
performance advice: why indexes speed up lookups and ranges, why they slow
down writes, why index *order* matters, and why an index on a
low-selectivity column may not help. It's the structure to know cold.

> :weightliftinggoose: The B-tree (really **B+ tree**) is the data
> structure to internalize: a **high-fanout, balanced** tree shaped to
> minimize **page reads**, so a billion keys sit **3–4 levels** deep.
> Drill the mechanics — **lookup** (descend, one page per level),
> **range scan** (descend once, then walk the **linked leaves**), and
> **insert with splits** that push a middle key up and only grow the tree
> at the root. Remember the trade: superb reads and ranges, but
> **in-place, random writes** with write amplification — the gap the
> LSM-tree fills next. Most index advice you'll ever give follows from
> this structure.

## What we covered

- A **B-tree** uses **page-sized, high-fanout nodes** so the tree is only
  **3–4 levels** deep even for billions of keys — minimizing **page
  reads**.
- Databases use the **B+ tree**: internal nodes hold **keys only**
  (higher fanout), all **(key, RID)** entries live in **linked leaves**.
- **Lookup** descends root→leaf, one page per level, returning a **RID**;
  upper levels are usually cached.
- **Range scans** descend once then walk the **sorted, linked leaves** —
  cheap ranges and ordered iteration (also helps `ORDER BY`, `MIN`/`MAX`).
- **Insert** splits a full leaf and **pushes the middle key up**, cascading
  upward; the tree grows taller only when the **root** splits — keeping
  all leaves at equal depth. Delete borrows/merges.
- Costs are O(height) page I/Os; the weaknesses are **write
  amplification** and **random in-place writes** (the LSM-tree's target).
- B-trees are the default for `CREATE INDEX`; clustered variants store rows
  in PK leaves; **composite-key order** matters.

## What's next

[Chapter 6](/database/part-2-storage-engines/lsm-trees) — LSM-trees and
SSTables, the write-optimized alternative. Instead of updating pages in
place, buffer writes in memory and flush immutable sorted files, merging in
the background — turning the B-tree's random writes into sequential ones,
at a cost to reads.
