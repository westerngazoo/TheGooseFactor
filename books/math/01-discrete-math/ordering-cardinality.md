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

> :angrygoose: Maximal ≠ greatest. This trips up everyone. In the poset of subsets of $\{1,2\}$ ordered by $\subseteq$, the sets $\{1\}$ and $\{2\}$ are both maximal in $\{\{1\}, \{2\}\}$ — but neither is greatest because they're incomparable. Mixing these up leads to incorrect proofs about dependency graphs and scheduling.
>
> :sharpgoose: Well-ordering of $\mathbb{N}$ is what makes induction work. The "every nonempty subset has a least element" property guarantees that induction terminates — your descent must stop somewhere. If you try to do induction on $\mathbb{Z}$, it fails because you can keep going to $-1, -2, -3, \dots$ forever.

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

> :surprisedgoose: $\mathbb{Q}$ is countable but $\mathbb{R}$ is not — even though $\mathbb{Q}$ is dense in $\mathbb{R}$ (between any two reals there's a rational). Density and cardinality are completely independent properties. This is one of the most counterintuitive results in mathematics.
>
> :mathgoose: Cantor's diagonal argument is worth memorizing. Assume a list of all reals in $[0,1]$. Construct a new real by making digit $n$ different from the $n$-th listed number's $n$-th digit. This new real isn't in the list — contradiction. The argument generalizes: $|A| < |\mathcal{P}(A)|$ for any set, so there's no "largest infinity."
>
> :nerdygoose: Inclusion-exclusion ($|A \cup B| = |A| + |B| - |A \cap B|$) generalizes to $n$ sets and is the foundation of the Sieve of Eratosthenes, combinatorial counting, and probability of union of events. Learn the two-set version by heart; the general form follows.
