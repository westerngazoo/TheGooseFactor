---
sidebar_position: 1
sidebar_label: "Ch 10: Binary Trees"
title: "Chapter 10: Binary Trees and Traversal"
---

# Chapter 10: Binary Trees and Traversal

A binary tree is a hierarchy: each node has at most two children, called *left* and *right*. Trees are recursive — each child is itself the root of a subtree. They are how computing represents nesting: parse trees, file systems, object hierarchies, decision processes, search structures.

This chapter covers binary trees in general — terminology, properties, and the four canonical traversals (preorder, inorder, postorder, level-order) in both recursive and iterative form. Everything in the rest of Part III builds on this.

## Terminology

```text
        a            <- root (depth 0)
       / \
      b   c          <- depth 1
     / \   \
    d   e   f        <- depth 2 (leaves: d, e, f)
```

- **Root.** The single node with no parent (here, `a`).
- **Leaf.** A node with no children (`d`, `e`, `f`).
- **Internal node.** A node with at least one child.
- **Parent / child.** Standard family relations along an edge.
- **Sibling.** Two nodes sharing a parent.
- **Ancestor / descendant.** Transitive parent / child.
- **Depth of a node.** Number of edges from the root to that node. Root has depth 0.
- **Height of a node.** Number of edges on the longest path from the node to a leaf. Leaves have height 0; tree height = root's height.
- **Subtree.** A node together with all its descendants.

A binary tree of $n$ nodes has exactly $n - 1$ edges and at least $\lceil \log_2(n+1) \rceil$ height. The tighter the tree (closer to balanced), the smaller its height; the more linear, the larger.

## Properties

A few useful identities:

- A complete binary tree of height $h$ has between $2^h$ and $2^{h+1} - 1$ nodes.
- A *full* binary tree (every internal node has two children) of $n$ leaves has $n - 1$ internal nodes — total $2n - 1$.
- A binary tree of $n$ nodes has height $\Omega(\log n)$ (achieved by balanced trees) and $O(n)$ (achieved by a degenerate "linked list").

The whole point of self-balancing trees (next several chapters) is to keep height at $\Theta(\log n)$. Without that, every operation degrades to $\Theta(n)$.

## The Node Type

```c
// include/algo/btree.h — generic binary tree node, integer payload for clarity.
#ifndef ALGO_BTREE_H
#define ALGO_BTREE_H

#include <stddef.h>
#include <stdbool.h>

typedef struct btree_node {
    int value;
    struct btree_node *left;
    struct btree_node *right;
} btree_node_t;

btree_node_t *btree_node_new(int value);
void          btree_free(btree_node_t *root);

size_t btree_size  (const btree_node_t *root);
size_t btree_height(const btree_node_t *root);   // edges in longest root-to-leaf path

#endif
```

Most operations are recursive. The structure invites it:

```c
btree_node_t *btree_node_new(int value) {
    btree_node_t *n = malloc(sizeof *n);
    if (!n) return nullptr;
    *n = (btree_node_t){ value, nullptr, nullptr };
    return n;
}

void btree_free(btree_node_t *root) {
    if (!root) return;
    btree_free(root->left);    // postorder: free children first
    btree_free(root->right);
    free(root);
}

size_t btree_size(const btree_node_t *root) {
    if (!root) return 0;
    return 1 + btree_size(root->left) + btree_size(root->right);
}

size_t btree_height(const btree_node_t *root) {
    if (!root) return 0;        // empty tree height convention varies; we use 0
    size_t lh = btree_height(root->left);
    size_t rh = btree_height(root->right);
    return 1 + (lh > rh ? lh : rh);
}
```

> :nerdygoose: There are two conventions for the height of an empty tree: $-1$ (so a single-node tree has height $0$) or $0$ (so a single-node tree has height $1$). We use the latter — a counted-size convention that maps directly to "number of nodes on the longest path." Pick one and be consistent. The textbooks contradict each other; your code must not contradict itself.

## The Four Traversals

A traversal visits every node exactly once. Four standard orderings:

| Traversal | Order | Use case |
|---|---|---|
| **Preorder** | root, left, right | Copy tree, prefix-form expressions |
| **Inorder** | left, root, right | Sorted order in BSTs |
| **Postorder** | left, right, root | Free tree, postfix-form expressions |
| **Level-order** | row by row, left to right | BFS, level-aware analyses |

The first three are *depth-first*: they go as deep as possible before backtracking. Level-order is *breadth-first*: it visits all nodes at one depth before any at the next.

### Recursive Depth-First

```c
typedef void (*visit_fn)(int value, void *ctx);

void btree_preorder(const btree_node_t *root, visit_fn f, void *ctx) {
    if (!root) return;
    f(root->value, ctx);
    btree_preorder(root->left, f, ctx);
    btree_preorder(root->right, f, ctx);
}

void btree_inorder(const btree_node_t *root, visit_fn f, void *ctx) {
    if (!root) return;
    btree_inorder(root->left, f, ctx);
    f(root->value, ctx);
    btree_inorder(root->right, f, ctx);
}

void btree_postorder(const btree_node_t *root, visit_fn f, void *ctx) {
    if (!root) return;
    btree_postorder(root->left, f, ctx);
    btree_postorder(root->right, f, ctx);
    f(root->value, ctx);
}
```

The structure is identical; the placement of `f` is the only thing that changes. All three are $\Theta(n)$ in time and $\Theta(h)$ in space (the call stack), where $h$ is the height.

### Iterative Depth-First — Why Bother?

The recursive form is correct, fast, and idiomatic. The iterative form matters when:

- The tree is so deep that the recursion would blow the call stack ($h > $ ~10,000 in C, depending on the system).
- You need to *pause* the traversal and resume it later (a generator/coroutine pattern).
- You need a constant-space variant (Morris traversal).

Iterative inorder using an explicit stack:

```c
#include "algo/stack.h"   // from chapter 6

void btree_inorder_iterative(const btree_node_t *root, visit_fn f, void *ctx) {
    stack_t *s = stack_new();
    if (!s) return;
    const btree_node_t *cur = root;
    while (cur || !stack_empty(s)) {
        while (cur) {
            (void)stack_push(s, (intptr_t)cur);   // push node pointer as int
            cur = cur->left;
        }
        intptr_t top;
        (void)stack_pop(s, (int *)&top);          // simplified: see note
        cur = (const btree_node_t *)top;
        f(cur->value, ctx);
        cur = cur->right;
    }
    stack_free(s);
}
```

> :sharpgoose: The cast through `intptr_t` shows why our int-only stack ADT is limiting — for production code, the stack should hold `void *` or be macroified to take a type parameter. We tackle this in Chapter 22 (generic data structures); for now, the cast does the job for pedagogy.

### Morris Traversal — $\Theta(1)$ Space

The brilliant trick: use the empty `right` pointers of leaves to thread the tree, traverse, then un-thread.

```c
void btree_inorder_morris(btree_node_t *root, visit_fn f, void *ctx) {
    btree_node_t *cur = root;
    while (cur) {
        if (!cur->left) {
            f(cur->value, ctx);
            cur = cur->right;
        } else {
            // Find inorder predecessor: rightmost node in cur's left subtree.
            btree_node_t *pred = cur->left;
            while (pred->right && pred->right != cur) pred = pred->right;
            if (!pred->right) {
                pred->right = cur;     // create thread
                cur = cur->left;
            } else {
                pred->right = nullptr; // remove thread
                f(cur->value, ctx);
                cur = cur->right;
            }
        }
    }
}
```

Time is $\Theta(n)$. Space is $\Theta(1)$ — no stack at all. The trade: we temporarily mutate the tree, so it's not safe in the middle of a traversal to inspect the tree from another thread, and the tree must be writable.

> :nerdygoose: Morris traversal is one of the most elegant algorithms in computing. Each node is visited at most twice (once to install the thread, once to remove it), so the total work is $\Theta(n)$. It's not used often because the recursive or stack-based traversal is fast enough, but it shows up in memory-constrained environments and in "iterate without disturbing the user's stack" use cases.

### Level-Order (Breadth-First)

A queue, not a stack. Nodes come out in the order they were enqueued; each node enqueues its children.

```c
#include "algo/queue.h"

void btree_level_order(const btree_node_t *root, visit_fn f, void *ctx) {
    if (!root) return;
    queue_t *q = queue_new();
    if (!q) return;
    (void)queue_push(q, (intptr_t)root);
    while (!queue_empty(q)) {
        intptr_t v;
        (void)queue_pop(q, (int *)&v);
        const btree_node_t *n = (const btree_node_t *)v;
        f(n->value, ctx);
        if (n->left)  (void)queue_push(q, (intptr_t)n->left);
        if (n->right) (void)queue_push(q, (intptr_t)n->right);
    }
    queue_free(q);
}
```

Time $\Theta(n)$; space $\Theta(w)$ where $w$ is the maximum width of the tree (number of nodes at one level). For a balanced tree, $w = \Theta(n)$ at the bottom, so this is $\Theta(n)$ space — significantly more than depth-first's $\Theta(h) = \Theta(\log n)$.

> :angrygoose: That's the tradeoff people forget: BFS uses *more* memory than DFS for trees of bounded depth. If you're hunting for a node and don't need level-aware order, prefer DFS. The space difference between $\Theta(\log n)$ and $\Theta(n)$ is the difference between "comfortably handles 10M nodes" and "OOMs at 1M."

## Reconstructing a Tree From Traversals

Given two traversals, can you reconstruct the tree?

- **Preorder + inorder**: yes, uniquely.
- **Postorder + inorder**: yes, uniquely.
- **Preorder + postorder**: not in general (ambiguous on trees with single-child nodes).
- **Level-order + inorder**: yes, uniquely.

The reconstruction is recursive: from preorder, the first element is the root; find its position in inorder; everything left of that position is the left subtree, everything right is the right. Recurse on each half.

```c
// From preorder[0..n-1] and inorder[0..n-1], rebuild the tree.
static btree_node_t *build(const int *preorder, const int *inorder, size_t n) {
    if (n == 0) return nullptr;
    btree_node_t *root = btree_node_new(preorder[0]);
    if (!root) return nullptr;

    // Find the root in inorder.
    size_t i = 0;
    while (i < n && inorder[i] != preorder[0]) ++i;

    root->left  = build(preorder + 1, inorder, i);
    root->right = build(preorder + 1 + i, inorder + i + 1, n - i - 1);
    return root;
}
```

Time is $\Theta(n^2)$ in the worst case (the linear scan for the root in each recursive step). Speeding it up to $\Theta(n)$ requires a hash map from value to inorder index — set up once, used $\Theta(n)$ times.

## Tree Properties to Compute

Given any tree, three things you'll be asked to compute:

**Diameter** — longest path between any two nodes. For each node, compute height of left subtree + height of right subtree; the maximum across all nodes is the diameter. $\Theta(n)$ if memoized.

**LCA** — lowest common ancestor of two nodes. For binary trees in general, $\Theta(n)$ with a recursive scan. For special trees (BSTs, balanced trees, trees with parent pointers), faster.

**Balance check** — is every node's left/right height difference at most 1? Recursive: at each node, check children's heights and verify the constraint. $\Theta(n)$ if you return height and bubble up.

```c
// Returns -1 if unbalanced, height otherwise.
static int balance_check(const btree_node_t *root) {
    if (!root) return 0;
    int lh = balance_check(root->left);  if (lh < 0) return -1;
    int rh = balance_check(root->right); if (rh < 0) return -1;
    if ((lh > rh ? lh - rh : rh - lh) > 1) return -1;
    return 1 + (lh > rh ? lh : rh);
}
```

## Trees vs Lists, Revisited

A degenerate binary tree — every node has only a right child — is a singly linked list. It has all the disadvantages of a list (cache-unfriendly traversal, $\Theta(n)$ search) plus the disadvantages of a tree (each node carries a useless `left` pointer). The whole purpose of "tree" is the *bushiness*: branching reduces the height to $\Theta(\log n)$ for balanced trees, which is the entire reason trees exist as a category.

When we move to BSTs and balanced variants, every chapter is fundamentally about one question: **how do we keep the tree bushy?**

## Recursion Stack Depth: A Real Limit

C compilers do not optimize tail recursion reliably. A recursive traversal of a 100,000-node skewed tree blows the default 8 MB Linux stack. Practical limits:

- Recursive `inorder` is safe for trees up to ~$10^4$ depth on Linux defaults.
- Iterative `inorder` with an explicit stack is safe for any depth that fits in heap.
- Morris traversal works at any depth in $\Theta(1)$ space.

For a balanced tree with $n$ nodes, depth is $\log_2 n$ — about 30 for a billion nodes. Recursion is fine. For a degenerate tree (BST built from sorted insertions), depth is $n$. Recursion will fail. This is one motivation for self-balancing.

> :surprisedgoose: Stack overflow in C is undefined behavior. Linux's default behavior is a SIGSEGV when the stack hits the guard page; on some systems it might silently corrupt other memory. ASan with `-fsanitize=address` catches stack overflows but only the first one. The honest engineering: if your tree depth is bounded, prefer the recursive form (cleaner). If it isn't, prefer iterative or guarantee balance.

## What's Next

Chapter 11 makes the leap from "any binary tree" to **binary search trees** — adding the ordering invariant that turns the structure into a sorted dictionary. We'll cover insert, search, the four delete cases, traversal-as-iteration, and exactly why unbalanced BSTs degrade. Chapter 12 (AVL) and Chapter 13 (Red-Black) will then show how to maintain balance.
