---
sidebar_position: 2
sidebar_label: "Ordering & Cardinality"
title: "Ordering Relations and Cardinality"
---

# Ordering Relations and Cardinality

## Ordering Relations

**Partial order (poset)**: A relation $\preceq$ on $X$ that is reflexive, antisymmetric, and transitive.
- Elements $x,y$ are **comparable** if $x \preceq y$ or $y \preceq x$.
- Otherwise they're **incomparable** (written $x \parallel y$).

Example: subset relation $\subseteq$ on $\mathcal{P}(S)$.

**Total order (linear order)**: A partial order where every pair is comparable.
- Example: $\leq$ on $\mathbb{R}$ or $\mathbb{N}$.

**Well-ordering**: A total order where every nonempty subset has a least element.
- Example: $(\mathbb{N}, \leq)$ is well-ordered.
- Non-example: $(\mathbb{Z}, \leq)$ is not (no least element).

**Chains and antichains**:
- **Chain**: subset where all elements are pairwise comparable.
- **Antichain**: subset where all elements are pairwise incomparable.

**Maximal/minimal elements** (in a poset):
- $x$ is **maximal** if there's no $y \succ x$.
- $x$ is **minimal** if there's no $y \prec x$.

**Greatest/least elements** (in a poset):
- $x$ is **greatest** if $\forall y \in X,\; y \preceq x$.
- $x$ is **least** if $\forall y \in X,\; x \preceq y$.

Note: A poset can have multiple maximal elements but at most one greatest element.

## Cardinality and Infinite Sets

Two sets $A$ and $B$ have the same **cardinality** (written $|A| = |B|$) if there exists a bijection $f: A \to B$.

**Finite vs infinite**:
- $A$ is finite if $|A| = n$ for some $n \in \mathbb{N}$.
- $A$ is infinite otherwise.

**Countable**: A set is countable if it's finite or has the same cardinality as $\mathbb{N}$.
- $\mathbb{Z}$, $\mathbb{Q}$ are countable (surprising!).
- $\mathbb{R}$ is uncountable (Cantor's diagonal argument).

**Cardinality arithmetic** (finite case):
$$
|A \cup B| = |A| + |B| - |A \cap B|
$$
$$
|A \times B| = |A| \cdot |B|
$$
$$
|\mathcal{P}(A)| = 2^{|A|}
$$
