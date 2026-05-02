---
sidebar_position: 2
sidebar_label: "Ch 11: Binary Search Trees"
title: "Chapter 11: Binary Search Trees"
---

# Chapter 11: Binary Search Trees

A **binary search tree** (BST) is a binary tree with one ordering invariant: for every node, all values in its left subtree are less than the node's value, and all values in its right subtree are greater. This turns the tree into a *sorted dictionary*: search, insert, and delete in $\Theta(h)$ time, with inorder traversal returning all keys in sorted order.

When the tree is balanced ($h = \Theta(\log n)$), BSTs are as fast as hash tables on lookups while preserving order — you can range-query, find predecessors, walk in order. When the tree is *not* balanced, the BST degrades to a linked list. Most of the rest of Part III is about preventing this degradation.

## The BST Invariant

For every node $v$:

```math
\forall x \in \text{left-subtree}(v): x < v.\text{key}
\qquad
\forall x \in \text{right-subtree}(v): x > v.\text{key}
```

(For now, no duplicates. We'll cover the variants — multiset, allowing equal — at the end of the chapter.)

The invariant has three immediate consequences:

1. **Inorder traversal yields sorted output.** A direct corollary of the invariant; chapter 10 showed the traversal.
2. **The smallest key is in the leftmost node.** Walk left from the root until you can't.
3. **The largest is in the rightmost.** Symmetric.

## The Structure

```c
// include/algo/bst.h
#ifndef ALGO_BST_H
#define ALGO_BST_H

#include <stddef.h>
#include <stdbool.h>

typedef struct bst_node {
    int key;
    struct bst_node *left;
    struct bst_node *right;
} bst_node_t;

typedef struct bst {
    bst_node_t *root;
    size_t      count;
} bst_t;

void bst_init(bst_t *t);
void bst_free(bst_t *t);

[[nodiscard]] int  bst_insert(bst_t *t, int key);    // Θ(h)
[[nodiscard]] bool bst_search(const bst_t *t, int key);
[[nodiscard]] bool bst_remove(bst_t *t, int key);

[[nodiscard]] bool bst_min(const bst_t *t, int *out);
[[nodiscard]] bool bst_max(const bst_t *t, int *out);

#endif
```

## Search

```c
bool bst_search(const bst_t *t, int key) {
    const bst_node_t *cur = t->root;
    while (cur) {
        if (key == cur->key) return true;
        cur = (key < cur->key) ? cur->left : cur->right;
    }
    return false;
}
```

At each step, the invariant tells us which subtree to descend into. The number of steps is the depth of the key (or the leaf where it would be), bounded by the tree's height $h$. **$\Theta(h)$ time, $\Theta(1)$ space.** No recursion needed.

## Insert

Walk the tree as if searching; when you reach a `nullptr` link, install the new node there.

```c
int bst_insert(bst_t *t, int key) {
    bst_node_t **link = &t->root;
    while (*link) {
        if (key == (*link)->key) return 0;     // duplicate; no insert
        link = (key < (*link)->key) ? &(*link)->left : &(*link)->right;
    }
    bst_node_t *n = malloc(sizeof *n);
    if (!n) return -1;
    *n = (bst_node_t){ key, nullptr, nullptr };
    *link = n;
    ++t->count;
    return 0;
}
```

The double-pointer trick from Chapter 8 reappears: `link` points at the slot where the new node should go. When the slot is null, we write the new node there; the parent's `left` or `right` is updated automatically.

**$\Theta(h)$ time** — same walk as search.

## Min, Max, Predecessor, Successor

```c
static bst_node_t *bst_min_node(bst_node_t *n) {
    if (!n) return nullptr;
    while (n->left) n = n->left;
    return n;
}

static bst_node_t *bst_max_node(bst_node_t *n) {
    if (!n) return nullptr;
    while (n->right) n = n->right;
    return n;
}

bool bst_min(const bst_t *t, int *out) {
    if (!t->root) return false;
    bst_node_t *m = bst_min_node(t->root);
    *out = m->key; return true;
}
```

Min/max are $\Theta(h)$ — walk to the leftmost/rightmost node.

**Inorder successor** — the smallest key strictly greater than a given node's key:

- If the node has a right subtree, it's the leftmost node of that subtree.
- Otherwise, walk up; the successor is the lowest ancestor for which the current node is in the *left* subtree.

The second case requires parent pointers (or a stack from the search path). Production BST implementations carry parent pointers for exactly this.

## Delete: The Hard One

Insert is easy. Delete has three cases, the third of which is subtle.

**Case 1: Leaf.** Just remove it. The parent's link to it becomes null.

**Case 2: One child.** Replace the node with its single child.

**Case 3: Two children.** Find the node's *inorder successor* (the leftmost node of the right subtree), copy its key into the node being deleted, and delete the successor from the right subtree. The successor has at most one child (it has no left child by definition — if it did, that left child would be smaller and the successor wouldn't be), so removing it falls into Case 1 or Case 2.

```c
static bst_node_t *bst_remove_node(bst_node_t *n, int key, bool *removed) {
    if (!n) { *removed = false; return nullptr; }

    if (key < n->key) {
        n->left = bst_remove_node(n->left, key, removed);
        return n;
    }
    if (key > n->key) {
        n->right = bst_remove_node(n->right, key, removed);
        return n;
    }

    // Found the node to remove.
    *removed = true;
    if (!n->left)  { bst_node_t *r = n->right; free(n); return r; }   // Cases 1 & 2
    if (!n->right) { bst_node_t *l = n->left;  free(n); return l; }

    // Case 3: two children. Replace key with successor's key, delete successor.
    bst_node_t *succ = n->right;
    while (succ->left) succ = succ->left;
    n->key = succ->key;
    bool dummy;
    n->right = bst_remove_node(n->right, succ->key, &dummy);
    return n;
}

bool bst_remove(bst_t *t, int key) {
    bool removed;
    t->root = bst_remove_node(t->root, key, &removed);
    if (removed) --t->count;
    return removed;
}
```

> :angrygoose: Case 3 is where students get bugs. Common mistake: replacing the node's key with the successor's key, but then forgetting to remove the successor — leaving the tree with a duplicate. The recursive call `bst_remove_node(n->right, succ->key, ...)` is the cleanup; without it, your tree has UB-shaped consistency violations that show up later as mysterious "search misses keys that I just inserted."

> :nerdygoose: This is **Hibbard deletion**. There's also "lazy deletion" (mark deleted, ignore in search, remove on next major rebuild) used in databases. There's "Hibbard with random choice" — sometimes use the successor, sometimes the predecessor — which keeps trees more balanced under workload than always-successor (which biases the tree leftward over time).

**$\Theta(h)$ time** — find the node, then find the successor, both walks bounded by $h$.

## Why Random Inserts Stay Balanced (Mostly)

Surprising fact: if you insert $n$ keys *in random order* into a BST, the expected height is $\Theta(\log n)$. The expected average depth of all nodes is about $1.39 \log_2 n$ — only 39% worse than a perfectly balanced tree.

The proof goes through quicksort recurrence. Building a BST by random insertion does the same comparison work as quicksort with random pivots — and the expected depth of an element in the BST equals its expected number of comparisons during a random-pivot quicksort. That's $\Theta(\log n)$ on average.

> :mathgoose: This is one of the most beautiful results in basic algorithms: random BST construction and randomized quicksort are *the same algorithm*, viewed differently. The recurrence $T(n) = (1/n) \sum_{i=0}^{n-1} (T(i) + T(n-1-i)) + \Theta(n)$ has solution $T(n) = \Theta(n \log n)$, and the expected BST height $H(n)$ satisfies an equivalent recurrence solving to $\Theta(\log n)$.

## Why Bad Inserts Are Catastrophic

Insert keys $1, 2, 3, \ldots, n$ in order into an empty BST. Result: every key goes to the right of the previous one. The tree is a linked list. Search degrades to $\Theta(n)$. Insert degrades to $\Theta(n)$. Delete degrades to $\Theta(n)$.

The same disaster happens with any *sorted* or *nearly sorted* input — exactly the input you'd often have in real workloads (database imports, time-series data, stream of monotonically increasing IDs).

This is why unbalanced BSTs are unsuitable for production. The expected case is fine; the realistic case is terrible.

## Range Queries

A BST shines at *range queries* — find all keys in $[\text{lo}, \text{hi}]$ — that hash tables cannot handle.

```c
typedef void (*range_visit_fn)(int key, void *ctx);

static void bst_range_recursive(const bst_node_t *n, int lo, int hi,
                                 range_visit_fn f, void *ctx) {
    if (!n) return;
    if (n->key > lo)         bst_range_recursive(n->left,  lo, hi, f, ctx);
    if (n->key >= lo && n->key <= hi) f(n->key, ctx);
    if (n->key < hi)         bst_range_recursive(n->right, lo, hi, f, ctx);
}
```

Time: $\Theta(h + k)$ where $k$ is the number of keys reported. The "$h$" is the cost of finding the boundaries; "$k$" is the cost of reporting. For $h = \Theta(\log n)$, this is "very fast" for any reasonable $k$.

> :sharpgoose: This is why databases use B-trees (a generalized balanced search tree) for indexes, not hash tables. SELECT * FROM users WHERE age BETWEEN 25 AND 40 is a range query. A hash index can't help. A tree index walks $\Theta(\log n + k)$ rows.

## Iterators (the Right Way)

Iterating a BST in sorted order without recursion (so iteration can pause and resume):

```c
typedef struct bst_iter {
    stack_t *stack;          // stack of bst_node_t *
} bst_iter_t;

bst_iter_t *bst_iter_new(const bst_t *t) {
    bst_iter_t *it = malloc(sizeof *it);
    if (!it) return nullptr;
    it->stack = stack_new();
    bst_node_t *cur = t->root;
    while (cur) {
        (void)stack_push(it->stack, (intptr_t)cur);
        cur = cur->left;
    }
    return it;
}

bool bst_iter_next(bst_iter_t *it, int *out) {
    intptr_t v;
    if (!stack_pop(it->stack, (int *)&v)) return false;
    bst_node_t *n = (bst_node_t *)v;
    *out = n->key;

    bst_node_t *cur = n->right;
    while (cur) {
        (void)stack_push(it->stack, (intptr_t)cur);
        cur = cur->left;
    }
    return true;
}
```

This is the same explicit-stack traversal from Chapter 10, refactored as an iterator. Each `bst_iter_next` is amortized $\Theta(1)$: the inner `while` loop has total work $\Theta(n)$ across the entire iteration (each node is pushed exactly once).

## Duplicates: Three Choices

Real workloads sometimes need duplicate keys. Three ways to handle them:

1. **Reject duplicates.** What our `bst_insert` does. Simplest, what the algorithms textbook usually shows.
2. **Bucket duplicates per node.** Each node has a count or a list of values. Effectively a multiset.
3. **Allow duplicates with a tie-break.** Send equal keys to one side (right, conventionally). Now the tree is a *multiset*; search returns one occurrence; range queries work.

Option 3 is the most common in production. For sets where duplicates are an error, option 1 is fine. Option 2 is elegant but more memory.

> :nerdygoose: When duplicates go right, a search for `key == x` may find one of several. To find all occurrences, do a range query for `[x, x]` — which then walks all duplicates at $\Theta(k)$. The structure encodes order; multiplicity is handled by traversal.

## Why BSTs Aren't Enough on Their Own

Recap of the problem: BSTs are great when balanced, terrible when not. The expected case under random insertion is fine. But:

- Real workloads often aren't random.
- Even random workloads have bad days (Murphy's law of databases).
- "Mostly balanced" with $h = 1.39 \log n$ is fine; unbounded skew is not.

The next two chapters fix this. **AVL trees** rebalance after every insert/delete to keep $h \leq 1.44 \log_2 n$. **Red-black trees** allow slightly more imbalance but with simpler rebalancing — used in `std::map`, Linux kernel CFS, glibc, the JVM. Both maintain $\Theta(\log n)$ guaranteed.

After those two come **B-trees** (balanced trees with high fanout, used in databases and filesystems), **heaps** (a binary tree variant for priority queues), and **tries** (trees keyed on string prefixes).

## Performance Snapshot

For 1 million integer keys inserted then queried, on a typical x86-64 laptop:

| Structure | Random insert (ns/op) | Sorted insert (ns/op) | Random query (ns/op) |
|---|---|---|---|
| Hash map | ~30 | ~30 | ~25 |
| BST (random) | ~200 | catastrophe | ~150 |
| BST (sorted) | $\Theta(n)$ catastrophe | $\Theta(n)$ catastrophe | $\Theta(n)$ catastrophe |
| AVL tree | ~400 | ~400 | ~250 |
| Red-Black | ~350 | ~350 | ~250 |

The hash map wins on point queries. The balanced trees win on range queries (which the hash map can't do at all) and on ordered iteration. The unbalanced BST under sorted input is the disaster we keep avoiding.

## What's Next

Chapter 12 adds the first balance discipline: **AVL trees**. We'll cover the balance factor invariant, the four rotation cases (LL, LR, RL, RR), and the full insert/delete flow with rebalancing. AVL is the "strict" balanced tree — height never exceeds $1.44 \log_2 n$, but every modification potentially requires rotations up the entire path. Then Chapter 13 covers Red-Black, which loosens the height bound but simplifies the rebalancing — the trade-off that made it the production default.
