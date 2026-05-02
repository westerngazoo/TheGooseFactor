---
sidebar_position: 3
sidebar_label: "Ch 12: AVL Trees"
title: "Chapter 12: AVL Trees — Strict Balance Through Rotations"
---

# Chapter 12: AVL Trees

An **AVL tree** is a binary search tree with one extra invariant: for every node, the heights of its two subtrees differ by at most 1. This bounds the tree's height to about $1.44 \log_2 n$, guaranteeing $\Theta(\log n)$ for search, insert, and delete — no degenerate cases, no "expected case" hand-waving, no quadratic disasters under sorted input.

The cost of the guarantee is *rotations*: small constant-time tree-restructurings that fix imbalances after each insert and delete. Four cases (LL, LR, RL, RR), all of them constant-time, all of them needing to be applied while walking back up the modification path.

This chapter covers the invariant, the rotations, and the full insert/delete flow. AVL trees are the cleanest example of a self-balancing BST — the algorithms are short, the proofs are direct, and once you've internalized rotations, every other balanced tree (Red-Black, B-tree, splay) makes more sense.

## The Balance Factor

For each node, define:

```math
\text{balance}(v) = \text{height}(v.\text{right}) - \text{height}(v.\text{left})
```

The AVL invariant: $|\text{balance}(v)| \leq 1$ for every node.

Three legal values per node: $-1$ (left subtree taller), $0$ (equal), $+1$ (right subtree taller). After an insert or delete, balance may temporarily reach $\pm 2$ — at which point we *rotate* to restore the invariant.

```c
// include/algo/avl.h
typedef struct avl_node {
    int key;
    struct avl_node *left;
    struct avl_node *right;
    int height;          // cached height of the subtree
} avl_node_t;
```

We cache the height per node rather than recomputing — height computation would itself be $\Theta(n)$, defeating the point. Update on every modification.

```c
static int avl_height(const avl_node_t *n) {
    return n ? n->height : 0;
}

static int avl_balance(const avl_node_t *n) {
    return n ? avl_height(n->right) - avl_height(n->left) : 0;
}

static void avl_update_height(avl_node_t *n) {
    int lh = avl_height(n->left);
    int rh = avl_height(n->right);
    n->height = 1 + (lh > rh ? lh : rh);
}
```

## Rotations

A **rotation** is a constant-time tree restructuring that preserves the BST invariant while changing the shape (and thus the height). Two primitives: left rotate and right rotate.

### Right Rotation

```text
       y                       x
      / \                     / \
     x   C       ==>         A   y
    / \                         / \
   A   B                       B   C
```

The pivot is $y$; we rotate it right so its left child $x$ takes its place. $A$ stays under $x$ (still on the left), $C$ stays under $y$ (still on the right), $B$ — which was the right child of $x$ — becomes the left child of $y$.

```c
static avl_node_t *rotate_right(avl_node_t *y) {
    avl_node_t *x = y->left;
    avl_node_t *B = x->right;

    x->right = y;
    y->left  = B;

    avl_update_height(y);    // y is now lower; update first
    avl_update_height(x);
    return x;                // new subtree root
}
```

The BST invariant is preserved: every key in $A$ is less than $x$; every key in $B$ is between $x$ and $y$; every key in $C$ is greater than $y$. Same after rotation.

### Left Rotation

The mirror image:

```text
       x                       y
      / \                     / \
     A   y       ==>         x   C
        / \                 / \
       B   C               A   B
```

```c
static avl_node_t *rotate_left(avl_node_t *x) {
    avl_node_t *y = x->right;
    avl_node_t *B = y->left;

    y->left  = x;
    x->right = B;

    avl_update_height(x);
    avl_update_height(y);
    return y;
}
```

> :nerdygoose: A rotation moves $\Theta(1)$ pointers and adjusts $\Theta(1)$ height fields. It changes the *shape* of the tree (and therefore its height) without changing its inorder traversal — the BST invariant is preserved. This is the foundational primitive of every self-balancing BST.

## The Four Imbalance Cases

After an insert or delete in a node $v$, if $|\text{balance}(v)| > 1$, the imbalance falls into one of four cases, named by the direction of descent into the child where the imbalance arose:

**LL** — left subtree of left child is heavy. Single right rotation at $v$.

**RR** — right subtree of right child is heavy. Single left rotation at $v$.

**LR** — right subtree of left child is heavy. Left-rotate $v$'s left child first, then right-rotate $v$.

**RL** — left subtree of right child is heavy. Right-rotate $v$'s right child first, then left-rotate $v$.

```c
// Rebalance the subtree rooted at n. Returns the new root.
static avl_node_t *avl_rebalance(avl_node_t *n) {
    avl_update_height(n);
    int bal = avl_balance(n);

    if (bal < -1) {                          // left-heavy
        if (avl_balance(n->left) > 0) {      // LR
            n->left = rotate_left(n->left);
        }
        return rotate_right(n);              // LL or LR-after-prep
    }
    if (bal > 1) {                           // right-heavy
        if (avl_balance(n->right) < 0) {     // RL
            n->right = rotate_right(n->right);
        }
        return rotate_left(n);               // RR or RL-after-prep
    }
    return n;                                 // no imbalance
}
```

> :sharpgoose: The insight that makes AVL clean: the rebalance function is one routine that handles all four cases by checking the *child's* balance factor when the node is heavy, and applying a pre-rotation only if the imbalance is "zigzag" (LR or RL) rather than "straight" (LL or RR). The straight cases need one rotation; the zigzag cases need two. Same logic as Red-Black, B-tree, splay — once you've seen it, you see it everywhere.

## Insert

```c
static avl_node_t *avl_insert_node(avl_node_t *n, int key, bool *inserted) {
    if (!n) {
        avl_node_t *fresh = malloc(sizeof *fresh);
        if (!fresh) { *inserted = false; return nullptr; }
        *fresh = (avl_node_t){ key, nullptr, nullptr, 1 };
        *inserted = true;
        return fresh;
    }

    if (key < n->key)      n->left  = avl_insert_node(n->left, key, inserted);
    else if (key > n->key) n->right = avl_insert_node(n->right, key, inserted);
    else { *inserted = false; return n; }    // duplicate

    if (!*inserted) return n;
    return avl_rebalance(n);
}

int avl_insert(avl_t *t, int key) {
    bool inserted;
    avl_node_t *new_root = avl_insert_node(t->root, key, &inserted);
    if (!new_root && !t->root) return -1;     // OOM
    t->root = new_root;
    if (inserted) ++t->count;
    return 0;
}
```

After the recursive call returns, we rebalance on the way back up. Each ancestor's height may have changed; each may now violate the AVL invariant; each gets rebalanced. **At most one rotation cascade** happens during an insert — once a level rebalances, the heights of higher levels are restored to what they were before the insert, and no further rebalancing is needed.

That's a key efficiency: even though we walk the entire path on the way down (to find where to insert) and walk it back on the way up (to rebalance), the total number of *actual rotations* in any single insert is at most 2.

## Delete

Delete in an AVL tree is the BST delete from Chapter 11, plus rebalancing on the way back up.

```c
static avl_node_t *avl_min(avl_node_t *n) {
    while (n->left) n = n->left;
    return n;
}

static avl_node_t *avl_remove_node(avl_node_t *n, int key, bool *removed) {
    if (!n) { *removed = false; return nullptr; }

    if (key < n->key) {
        n->left = avl_remove_node(n->left, key, removed);
    } else if (key > n->key) {
        n->right = avl_remove_node(n->right, key, removed);
    } else {
        // Found.
        *removed = true;
        if (!n->left || !n->right) {
            avl_node_t *c = n->left ? n->left : n->right;
            free(n);
            return c;
        }
        // Two children: replace with successor's key, delete from right subtree.
        avl_node_t *succ = avl_min(n->right);
        n->key = succ->key;
        bool dummy;
        n->right = avl_remove_node(n->right, succ->key, &dummy);
    }

    if (!*removed) return n;
    return avl_rebalance(n);
}
```

**Delete may trigger up to $\Theta(\log n)$ rotations.** Unlike insert, the rotations don't necessarily stop after one cascade. A rotation during delete may *reduce* the height of the rotated subtree, propagating the imbalance upward.

In the worst case, every ancestor up to the root may need a rotation. This is still $\Theta(\log n)$ work — bounded by the tree's height — but it's the reason AVL delete has higher constant factors than Red-Black delete.

## Why $1.44 \log n$?

The AVL height bound is one of the prettiest results in basic algorithms.

Define $N(h)$ = the minimum number of nodes in an AVL tree of height $h$ (the "thinnest" possible AVL tree at that height). The recurrence:

```math
N(0) = 0, \quad N(1) = 1, \quad N(h) = 1 + N(h-1) + N(h-2)
```

The thinnest AVL tree of height $h$ has a root, a child of height $h-1$ (the taller side), and a child of height $h-2$ (the shorter side that still satisfies the AVL invariant). Plus one for the root.

This is one off from the Fibonacci recurrence — $F(h) = F(h-1) + F(h-2)$ with $F(1) = F(2) = 1$. In fact, $N(h) = F(h+2) - 1$.

The Fibonacci closed form gives:

```math
F(h) \approx \frac{\varphi^h}{\sqrt{5}}, \quad \varphi = \frac{1 + \sqrt{5}}{2} \approx 1.618
```

So $N(h) \approx \varphi^{h+2} / \sqrt{5}$, which means $h \leq \log_\varphi n + O(1) \approx 1.44 \log_2 n$.

> :mathgoose: AVL trees achieve the *Fibonacci bound* on height. The relationship between AVL height and Fibonacci numbers is not a coincidence — both are recurrences where each step depends on the two previous. The "worst-case" AVL tree at height $h$ has *exactly* $F(h+2) - 1$ nodes; this is sometimes called a *Fibonacci tree*.

This means: an AVL tree with one billion nodes has height at most about 43. Very tight. Search is fast; insert and delete are bounded.

## Iterative vs Recursive

Production AVL implementations are often *iterative* — descent down with an explicit stack, then rebalancing on the stack pop. The reason is the $\Theta(\log n)$ recursion depth (fine on its own) plus the constant factor of function-call overhead per level (significant in tight loops). Most C textbook examples are recursive for clarity; most production code is iterative for speed.

```c
// Sketch of iterative insert with a path stack.
int avl_insert_iter(avl_t *t, int key) {
    avl_node_t **path[64];   // 64 levels supports trees up to ~10^18 nodes
    size_t depth = 0;
    avl_node_t **link = &t->root;

    while (*link) {
        if (key == (*link)->key) return 0;
        path[depth++] = link;
        link = (key < (*link)->key) ? &(*link)->left : &(*link)->right;
    }
    avl_node_t *n = malloc(sizeof *n);
    if (!n) return -1;
    *n = (avl_node_t){ key, nullptr, nullptr, 1 };
    *link = n;
    ++t->count;

    while (depth > 0) {
        --depth;
        avl_node_t *node = *path[depth];
        avl_node_t *new_top = avl_rebalance(node);
        *path[depth] = new_top;
    }
    return 0;
}
```

> :angrygoose: Don't allocate the `path[64]` array dynamically. The bound is real — 64 levels covers any AVL tree that fits in a 64-bit address space — and a fixed-size stack-allocated array is much faster than walking with recursion or heap-allocating a dynamic stack. This is the kind of trick that doubles the throughput of a hot path.

## When to Use AVL

AVL beats Red-Black at:

- **Lookup-heavy workloads.** AVL maintains stricter balance, so the height is consistently 30% lower. For a billion-node tree, AVL is depth ~43 vs Red-Black's depth ~58. That's ~25% faster lookups.
- **Read-mostly databases.** If you insert once and query forever, the upfront cost of stricter balancing pays off.

Red-Black beats AVL at:

- **Mixed workloads.** Red-Black does fewer rotations per modification on average (1.6 vs 2.0), and delete is dramatically cheaper.
- **Concurrent / lock-free trees.** Fewer rotations = fewer atomic operations.

This is why `std::map` (lookup-mixed-with-insert) uses Red-Black; range trees in spatial databases (lookup-heavy) sometimes use AVL.

## Implementation Notes

A few productionization notes if you ever ship one:

- **Use `int8_t` for the balance factor**, not `int height`. You only need ${-1, 0, 1}$ to specify imbalance during traversal; the height information that gets cached can be inferred. This saves memory and keeps node size down — important for cache.
- **Carry a parent pointer.** Skips the recursion or path stack at the cost of a pointer per node. Worth it for large trees.
- **Augmented AVL trees** add subtree statistics (size, sum, min, max). Range queries become $\Theta(\log n)$ instead of $\Theta(\log n + k)$. We touch this in chapter 16 (segment trees, briefly) but the AVL augmentation pattern is the same.

## What's Next

Chapter 13 covers **Red-Black trees** — the production default for ordered associative containers. They allow slightly more imbalance than AVL ($2 \log_2(n+1)$ height vs $1.44 \log_2 n$) but in exchange the rebalancing during delete is dramatically simpler, and the constant factors on insert are smaller. Same complexity class, different trade-off, vastly more deployed in real systems.
