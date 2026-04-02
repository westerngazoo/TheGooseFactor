---
sidebar_position: 1
sidebar_label: "Sets, Logic & Relations"
title: "Sets, Logic, and Relations"
---

# Sets, Logic, and Relations

## Intuition
Discrete math is the "type system" for reasoning about algorithms. When you write code, you're usually manipulating:
- Sets of states, nodes, edges, or indices ($S$, $V$, $E$, $\{0,\dots,n-1\}$)
- Predicates/invariants ($P(x)$)
- Relations ("reachable from", "depends on", "is adjacent to")
- Functions (hashes, mappings, transitions)

If you can fluently translate English → symbols → invariant, proofs and correctness become much faster.

## Sets

Notation:
- Membership: $x \in A$, $x \notin A$
- Subset: $A \subseteq B$ (every element of $A$ is in $B$)
- Proper subset: $A \subset B$ (subset and not equal)

Operations:
- Union: $A \cup B$
- Intersection: $A \cap B$
- Difference: $A \setminus B$
- Complement (relative to universe $U$): $A^c = U\setminus A$

Useful identities:
$$
(A \cup B)^c = A^c \cap B^c,\qquad (A \cap B)^c = A^c \cup B^c \quad \text{(De Morgan)}
$$

Power set and counting:
- $\mathcal{P}(A)$ is the set of all subsets of $A$
- If $|A|=n$, then $|\mathcal{P}(A)|=2^n$

> :mathgoose: De Morgan's laws are dual: swap $\cup \leftrightarrow \cap$ and complement everything. This duality runs deep — it connects set theory to Boolean algebra to circuit logic. The AND/OR gates in your CPU obey the exact same laws.
>
> :nerdygoose: $|\mathcal{P}(A)|=2^n$ is why bitmasks work. A set of $n$ elements has exactly $2^n$ subsets — the same as the number of $n$-bit binary strings. Each bit is a yes/no membership decision. This is the connection between sets and bit manipulation in code.

Cartesian product:
- $A \times B = \{(a,b) \mid a \in A, b \in B\}$
- $|A \times B| = |A| \cdot |B|$

## Propositional Logic

Common connectives:
- AND/OR/NOT: $p \land q$, $p \lor q$, $\lnot p$
- Implication: $p \Rightarrow q$
- Equivalence: $p \Leftrightarrow q$
- XOR: $p \oplus q$

Two equivalences you'll use constantly:
$$
p \Rightarrow q \;\equiv\; \lnot p \lor q
$$
Contrapositive (often easiest to prove):
$$
p \Rightarrow q \;\equiv\; \lnot q \Rightarrow \lnot p
$$

## Quantifiers

- "For all": $\forall x \in X,\; P(x)$
- "There exists": $\exists x \in X,\; P(x)$

Negation rules (easy source of bugs in proofs and specs):
$$
\lnot(\forall x\, P(x)) \equiv \exists x\, \lnot P(x),\qquad
\lnot(\exists x\, P(x)) \equiv \forall x\, \lnot P(x)
$$

## Relations

A relation $R$ on a set $X$ is a subset $R \subseteq X \times X$.
We write $x\,R\,y$ when $(x,y) \in R$.

Common properties:
- Reflexive: $\forall x\in X,\; xRx$
- Symmetric: $xRy \Rightarrow yRx$
- Antisymmetric: $(xRy \land yRx) \Rightarrow x=y$
- Transitive: $(xRy \land yRz) \Rightarrow xRz$

**Equivalence relation** ($\sim$): reflexive + symmetric + transitive.
It partitions $X$ into equivalence classes:
$$
[x] = \{y \in X : y \sim x\}
$$

**Partial order** ($\preceq$): reflexive + antisymmetric + transitive.

### Operations on relations

Given relations $R, S \subseteq X \times X$:

**Inverse**: $R^{-1} = \{(y,x) : (x,y) \in R\}$

**Composition**: $S \circ R = \{(x,z) : \exists y,\; (x,y)\in R \land (y,z)\in S\}$
- Read as "first apply $R$, then $S$".
- Transitive means $R \circ R \subseteq R$.

**Transitive closure** $R^+$: smallest transitive relation containing $R$.
- Reachability in a directed graph is the transitive closure of the edge relation.

**Reflexive-transitive closure** $R^*$: $R^+ \cup \{(x,x) : x \in X\}$.

## Algorithmic touchpoints
- **Set operations** show up in BFS/DFS visited sets, interval unioning, "seen" hashes.
- **Implication as $\lnot p \lor q$** mirrors guard clauses: `if (p) { require(q); }`.
- **Quantifier negation** is the difference between "All inputs pass" ($\forall$) and "Find a counterexample" ($\exists$).
- **Equivalence relations** are exactly what DSU/Union-Find maintains.
- **Partial orders** model dependency graphs, topological sort, and "dominates" relations.

> :happygoose: This section is the payoff. Every abstract concept above has a direct algorithmic counterpart. Once you see "equivalence relation → Union-Find" and "partial order → topological sort," the math stops feeling abstract and starts feeling like a tool.
>
> :surprisedgoose: The contrapositive equivalence ($p \Rightarrow q \equiv \lnot q \Rightarrow \lnot p$) is surprisingly powerful in debugging. Instead of proving "if input is valid, output is correct," prove the contrapositive: "if output is wrong, input was invalid." Sometimes one direction is much easier to verify.

## Quick sanity checks
- If your proof says "for all", try to produce a counterexample (negate it to an $\exists$).
- If you're debugging an invariant, rewrite $p \Rightarrow q$ as $\lnot p \lor q$ and see what case makes it false.
- If you define a relation, test reflexive/symmetric/transitive with tiny examples.
