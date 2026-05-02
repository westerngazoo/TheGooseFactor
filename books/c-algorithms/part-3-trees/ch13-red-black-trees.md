---
sidebar_position: 4
sidebar_label: "Ch 13: Red-Black Trees"
title: "Chapter 13: Red-Black Trees — The Production Default"
---

# Chapter 13: Red-Black Trees

If you opened the source of `std::map`, `java.util.TreeMap`, the Linux kernel's CFS scheduler, the Linux memory manager's interval tree, glibc's `tsearch`, or essentially any ordered associative container shipped in the last 30 years, you would find a **red-black tree** (or a close variant). It is the production default for self-balancing BSTs.

Red-Black trees relax AVL's strict balance: the height bound is $2 \log_2(n+1)$ rather than $1.44 \log_2 n$. In exchange, the rebalancing logic is simpler — fewer rotations on average per modification, and delete (the painful AVL operation) is much cleaner. The constant factors on insert/delete are lower, even though the worst-case height is taller. For mixed-workload code, the trade-off favors Red-Black; for lookup-only code, AVL still wins.

This chapter covers the five Red-Black properties, the insert cases, the delete cases (the hardest delete in basic algorithms), and the engineering reasons every standard library picked this structure.

## The Five Properties

A Red-Black tree is a BST where every node has a *color*, red or black, and the tree satisfies five invariants:

1. Every node is red or black.
2. The root is black.
3. Every leaf (a `nullptr` link, conceptually) is black.
4. If a node is red, both its children are black. (No two reds in a row.)
5. Every path from any node to a descendant leaf has the same number of black nodes.

The combination is what bounds the height. Property 5 (the *black-height invariant*) keeps every root-to-leaf path roughly the same length. Property 4 keeps red nodes from doubling the path. Together: no path is more than twice as long as any other.

```c
// include/algo/rbtree.h
typedef enum rb_color : uint8_t { RB_RED = 0, RB_BLACK = 1 } rb_color_t;

typedef struct rb_node {
    int key;
    struct rb_node *left;
    struct rb_node *right;
    struct rb_node *parent;        // we'll need this for delete
    rb_color_t color;
} rb_node_t;
```

> :nerdygoose: The classic Red-Black tree from Sedgewick uses a *sentinel NIL* node — a single shared black leaf that all "null" pointers point at. This eliminates null checks: every node has non-null children. It costs one extra node per tree but simplifies the code by removing $\Theta(1)$ branches per access. The tree we show here uses real `nullptr` for clarity; production code uses sentinels.

## The Height Bound

**Claim.** A Red-Black tree with $n$ internal nodes has height at most $2 \log_2(n+1)$.

**Proof sketch.** Define the *black-height* of a node as the number of black nodes on any path from that node to a descendant leaf (not counting the node itself). By property 5, this is well-defined.

Lemma: a subtree rooted at a node with black-height $b$ contains at least $2^b - 1$ internal nodes. Induction on $b$:

- $b = 0$: the node has no descendants, so the subtree has 0 internal nodes. $2^0 - 1 = 0$. ✓
- $b > 0$: each child has black-height $b$ (if it's red) or $b - 1$ (if it's black). Worst case both are $b - 1$, giving $2 (2^{b-1} - 1) + 1 = 2^b - 1$ nodes including the root.

The tree's root has black-height $b$. Since the height $h \leq 2b$ (property 4 forbids two reds in a row), we have:

```math
n \geq 2^b - 1 \geq 2^{h/2} - 1
```

Solving for $h$: $h \leq 2 \log_2(n+1)$. $\square$

> :mathgoose: Compare to AVL's $1.44 \log_2 n$. Red-Black is taller — in the worst case nearly $40$% taller — but every modification is cheaper. This is the canonical *time-space-on-paper-vs-time-in-practice* trade. Real workloads care about average modification cost more than worst-case lookup depth.

## Insert: Three Cases

The skeleton: insert as a regular BST, color the new node **red**, and fix violations.

A red node has two children that should be black (property 4). The new node is a leaf, so its `nullptr` children are conceptually black — fine. But if the new node's *parent* is red, we now have a red-red violation. The fix depends on the *uncle*'s color:

**Case 1: Uncle is red.** Recolor: parent and uncle become black; grandparent becomes red. The grandparent is now red, possibly violating property 4 with *its* parent. Recurse upward.

**Case 2: Uncle is black, new node is "outside" (LL or RR shape).** Rotate at the grandparent toward the uncle. Recolor: parent becomes black, grandparent becomes red. Done.

**Case 3: Uncle is black, new node is "inside" (LR or RL shape).** Rotate at the parent away from the uncle to convert to Case 2, then proceed.

```c
static void rb_insert_fixup(rb_t *t, rb_node_t *n) {
    while (n->parent && n->parent->color == RB_RED) {
        rb_node_t *p = n->parent;
        rb_node_t *gp = p->parent;
        if (p == gp->left) {
            rb_node_t *u = gp->right;
            if (u && u->color == RB_RED) {              // Case 1
                p->color = RB_BLACK;
                u->color = RB_BLACK;
                gp->color = RB_RED;
                n = gp;
            } else {
                if (n == p->right) {                     // Case 3 (LR)
                    n = p;
                    rb_rotate_left(t, n);
                }
                p = n->parent;                            // Case 2 (LL)
                gp = p->parent;
                p->color = RB_BLACK;
                gp->color = RB_RED;
                rb_rotate_right(t, gp);
            }
        } else {
            // Mirror image: parent is right child of grandparent.
            rb_node_t *u = gp->left;
            if (u && u->color == RB_RED) {
                p->color = RB_BLACK;
                u->color = RB_BLACK;
                gp->color = RB_RED;
                n = gp;
            } else {
                if (n == p->left) {
                    n = p;
                    rb_rotate_right(t, n);
                }
                p = n->parent;
                gp = p->parent;
                p->color = RB_BLACK;
                gp->color = RB_RED;
                rb_rotate_left(t, gp);
            }
        }
    }
    t->root->color = RB_BLACK;       // property 2
}
```

**Insert performs at most 2 rotations** (a recoloring cascade up to the root may happen, but rotations are bounded). This is faster than AVL's worst-case insert.

## Delete: The Hard Part

Red-Black delete is the most complex routine in basic algorithms. It's not because rotations are hard — it's because the cases multiply: deletion can violate property 5 (black-height), and fixing that requires *six* cases, mirrored on left and right.

### The Setup

Standard BST delete: find the node, replace it with its successor if it has two children, then physically remove a node with at most one child. Call the removed node $z$ and its replacement (which moves into $z$'s position) $x$ (possibly null). Save $z$'s color.

If $z$ was red, no invariant is broken. Done.

If $z$ was black, removing it shortens every path through $z$'s position by one black node, violating property 5. We must fix.

### The Six Delete Cases

Track the violator $x$ (the replacement) and its sibling $w$. Six cases, each fixing the imbalance with rotations and recolorings:

**Case 1: $w$ is red.** Rotate at parent toward $x$, recolor sibling and parent. Now $w$ is black and we proceed with one of the other cases.

**Case 2: $w$ is black, both $w$'s children are black.** Recolor $w$ red. Move $x$ up to its parent. The "extra blackness" propagates up.

**Case 3: $w$ is black, $w$'s far child is black, $w$'s near child is red.** Rotate at $w$ to convert to Case 4, recolor.

**Case 4: $w$ is black, $w$'s far child is red.** Rotate at parent toward $x$, recolor parent / sibling / far-child appropriately. Done.

(Cases 5-6 are mirror images of cases 3-4 on the other side. Some texts label them 1-4 with mirroring; the count of "logical" cases is four.)

```c
static void rb_delete_fixup(rb_t *t, rb_node_t *x, rb_node_t *parent) {
    // x may be nullptr (the deleted slot); we pass its parent explicitly.
    while ((!x || x->color == RB_BLACK) && x != t->root) {
        if (x == parent->left || (!x && parent->left == nullptr)) {
            rb_node_t *w = parent->right;
            if (w->color == RB_RED) {                         // Case 1
                w->color = RB_BLACK;
                parent->color = RB_RED;
                rb_rotate_left(t, parent);
                w = parent->right;
            }
            if ((!w->left  || w->left->color == RB_BLACK) &&  // Case 2
                (!w->right || w->right->color == RB_BLACK)) {
                w->color = RB_RED;
                x = parent;
                parent = x->parent;
            } else {
                if (!w->right || w->right->color == RB_BLACK) {  // Case 3
                    if (w->left) w->left->color = RB_BLACK;
                    w->color = RB_RED;
                    rb_rotate_right(t, w);
                    w = parent->right;
                }
                w->color = parent->color;                       // Case 4
                parent->color = RB_BLACK;
                if (w->right) w->right->color = RB_BLACK;
                rb_rotate_left(t, parent);
                x = t->root;        // terminate
                break;
            }
        } else {
            // Mirror image on the right.
            // ... 60 more lines, symmetric.
        }
    }
    if (x) x->color = RB_BLACK;
}
```

> :angrygoose: This is the chapter where students give up. The case analysis is real and unforgiving. The good news: you only need to write this once, then never again. Library implementations are gold-plated and the algorithm is correct since 1972. If you find yourself writing a Red-Black tree from scratch in production code in 2026, ask why you aren't using `std::map` or a proven C library.

> :nerdygoose: An *augmented* version of Red-Black delete due to Sedgewick (the "left-leaning" Red-Black tree, or LLRB) reduces the case count to about half by enforcing a stronger invariant: red links always lean left. The trade-off is more constraints during insert. Modern implementations often prefer the standard CLRS version because the case proliferation is mostly text — branches are predictable enough at runtime.

## Total Rotations Per Operation

| Operation | Maximum rotations |
|---|---|
| Insert (Red-Black) | 2 |
| Delete (Red-Black) | 3 |
| Insert (AVL) | 2 |
| Delete (AVL) | $\Theta(\log n)$ |

Red-Black delete is constant rotations; AVL delete is logarithmic rotations. This is the central reason Red-Black is the production default for mixed workloads.

## A Worked Example

Insert keys $10, 20, 30, 15, 25, 5, 1$ into an empty Red-Black tree:

After 10: `[10:B]`

After 20:
```text
   10:B
       \
        20:R
```

After 30: red-red violation between 20 and 30. Uncle is null (black). LL/RR? It's RR. Rotate left at 10, recolor:
```text
       20:B
      /    \
   10:R    30:R
```

After 15: insert under 10, on the right.
```text
       20:B
      /    \
   10:R    30:R
       \
        15:R
```
Red-red between 10 and 15. Uncle (30) is red — Case 1: recolor. 10 becomes black, 30 becomes black, 20 becomes red... but 20 is the root, so it must be black. Set it back to black:
```text
       20:B
      /    \
   10:B    30:B
       \
        15:R
```

After 25: under 30, on the left.
```text
            20:B
           /    \
        10:B    30:B
            \   /
           15:R 25:R
```

No violation. After 5: under 10, on the left.
```text
            20:B
           /    \
        10:B    30:B
        /  \    /
      5:R 15:R 25:R
```

No violation. After 1: under 5, on the left. Red-red between 5 and 1. Uncle (15) is red — Case 1: recolor. 5 becomes black, 15 becomes black, 10 becomes red. 10's parent is 20:B, no violation:
```text
              20:B
             /    \
         10:R    30:B
         /  \    /
       5:B 15:B 25:R
       /
      1:R
```

The tree is balanced; all five properties hold; total work was three recolorings and zero rotations across seven inserts.

> :sharpgoose: Hand-tracing a Red-Black tree once for ten or twenty inserts is the fastest way to internalize the algorithm. Pen and paper, eight cases, twenty minutes. Then you can read the standard library code without flinching.

## Why Standard Libraries Picked Red-Black

C++ STL's `std::map` was specified to require $\Theta(\log n)$ on every operation. That's a *worst-case* requirement, not an average. AVL and Red-Black both qualify; the reasons Red-Black won:

- **Iterator stability.** Red-Black insertion does at most 2 rotations; AVL's may cascade. Iterators are pointers to nodes; fewer rotations means fewer iterators-going-stale concerns. This is largely an implementation detail, but it influenced the early choices.

- **Delete cost.** AVL's $\Theta(\log n)$ rotations on delete is real and noticeable on workloads that delete a lot. Red-Black's bounded delete keeps the constants down.

- **Library momentum.** `std::map` was Red-Black; everyone who built compatible containers followed. Once a structure is in libraries everyone uses, alternative structures need a major win to displace it. AVL's win on lookup-heavy code wasn't decisive enough.

The Linux kernel uses Red-Black trees in many places — most notably the CFS (Completely Fair Scheduler), where each runnable task is a node keyed on its virtual runtime. Insertion, removal, and finding-the-leftmost (next task to run) are all $\Theta(\log n)$. The kernel's `lib/rbtree.c` implementation is intrusive (no allocations) and uses sentinel-free real null pointers — a textbook case of the production-grade form.

## Performance vs AVL vs Hash Map

For 1 million operations on integer keys, mixed insert/lookup/delete, on a typical x86-64 laptop:

| Structure | Insert | Lookup | Delete | Range query (1000 keys) |
|---|---|---|---|---|
| Hash map (open addressing) | ~25 ns | ~15 ns | ~20 ns | not supported |
| Red-Black tree | ~250 ns | ~180 ns | ~280 ns | ~70 µs |
| AVL tree | ~280 ns | ~140 ns | ~400 ns | ~70 µs |
| BST (random) | ~200 ns | ~150 ns | ~200 ns | ~70 µs |
| BST (sorted) | $\Theta(n)$ | $\Theta(n)$ | $\Theta(n)$ | $\Theta(n)$ |

Red-Black is faster than AVL on insert and delete (the latter dramatically). AVL is faster on lookup. Both are 5-10× slower than the hash map on point queries — that's the cost of pointer-chasing through a tree instead of a flat array — but they support order-aware queries the hash map cannot.

> :weightliftinggoose: When you don't need order: hash map. When you need order, range queries, or predecessor/successor: balanced tree. Red-Black for general use, AVL for read-heavy. This is the same advice every algorithms textbook gives, and it remains correct in 2026.

## What's Next

Chapter 14 covers **B-trees** — generalized self-balancing search trees with high fanout per node. They are how databases and filesystems store indexes: each node holds many keys (typically dozens to hundreds) and many children, packing more data into each disk block. Same $\Theta(\log n)$ lookup complexity, but with massively reduced *number of disk reads* — the metric that actually matters for storage. After that: heaps, then tries.
