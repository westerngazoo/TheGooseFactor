# Math & Physics

This section will gather concise, high–impact notes, derivations, and problem‑solving patterns that support algorithmic thinking and systems design.

## Focus Areas

### Mathematics
- Discrete math refresh (sets, relations, functions, logic)
- Counting & combinatorics patterns
- Number theory snippets (mod math, inverses, CRT intuition)
- Graph theory concepts tied to algorithms
- Linear algebra primitives for optimization & graphics
- Probability essentials for randomized algorithms

### Physics
- Kinematics & dynamics formulas as reusable building blocks
- Energy / momentum conservation patterns (problem framing)
- Dimensional analysis as a debugging tool
- Computational physics snippets (time stepping, stability intuition)
- Statistical mechanics analogies for search / optimization heuristics

## Goals
- Minimal fluff: definitions → intuition → canonical examples.
- Bridge: show how a math/physics concept maps to an algorithmic technique.
- Reusability: export small LaTeX/Markdown blocks to reuse in other docs.

## Structure (Living Outline)
1. Discrete Math Refresh (Sets, Logic, Relations, Functions)
2. Logic & Proof Micro‑Toolkit
3. Modular Arithmetic & Fast Exponentiation
4. Combinatorics Patterns (Binomial, Stars & Bars, Inclusion–Exclusion)
5. Probability Tricks (Linearity, Indicator RVs, Tail Bounds Intuition)
6. Graph Theory Core (Cuts, Flows, Matchings – intuition first)
7. Linear Algebra Sparks (Rank, Nullity, Projections, Spectral Glimpse)
8. Continuous Math Bridge (Series approximations, smoothness, convexity)
9. Physics Modeling Primitives (F=ma discretized, harmonic oscillator)
10. Energy Methods & Invariants (How to “see” conserved quantities)
11. Dimensional Analysis & Scaling Arguments
12. Monte Carlo & Physical Analogies (Random walks, diffusion, annealing)
13. Optimization Landscapes vs Physical Potentials

## Contribution Guide
If you add content:
1. Keep sections atomic; prefer cross‑linking over duplication.
2. Start with Intuition, then Formal, then Example, then “Algorithmic Touchpoints.”
3. Add quick sanity checks (edge cases / limit behavior).
4. Tag open questions or TODOs with `TODO:` so they surface in search.

## TODO Backlog

---

## 1) Discrete Math Refresh (Sets, Logic, Relations, Functions)

### Intuition
Discrete math is the “type system” for reasoning about algorithms. When you write code, you’re usually manipulating:
- Sets of states, nodes, edges, or indices ($S$, $V$, $E$, $\{0,\dots,n-1\}$)
- Predicates/invariants ($P(x)$)
- Relations (“reachable from”, “depends on”, “is adjacent to”)
- Functions (hashes, mappings, transitions)

If you can fluently translate English → symbols → invariant, proofs and correctness become much faster.

### Formal toolkit

#### Sets
- Membership: $x \in A$, $x \notin A$
- Subset: $A \subseteq B$ (every element of $A$ is in $B$)
- Union/intersection: $A \cup B$, $A \cap B$
- Difference/complement (relative): $A \setminus B$, $A^c$
- Cartesian product: $A \times B$
- Power set: $\mathcal{P}(A)$
- Cardinality: $|A|$

Useful identities:
$$
(A \cup B)^c = A^c \cap B^c,\qquad (A \cap B)^c = A^c \cup B^c \quad \text{(De Morgan)}
$$

#### Propositional logic
- AND/OR/NOT: $p \land q$, $p \lor q$, $\lnot p$
- Implication: $p \Rightarrow q$
- Equivalence: $p \Leftrightarrow q$
- XOR: $p \oplus q$

Truthy equivalences you’ll use constantly:
$$
p \Rightarrow q \;\equiv\; \lnot p \lor q
$$
Contrapositive (often easiest to prove):
$$
p \Rightarrow q \;\equiv\; \lnot q \Rightarrow \lnot p
$$

#### Quantifiers
- “For all”: $\forall x \in X,\; P(x)$
- “There exists”: $\exists x \in X,\; P(x)$

Negation rules (easy source of bugs in proofs and specs):
$$
\lnot(\forall x\, P(x)) \equiv \exists x\, \lnot P(x),\qquad
\lnot(\exists x\, P(x)) \equiv \forall x\, \lnot P(x)
$$

#### Relations
A relation $R$ on a set $X$ is a subset $R \subseteq X \times X$.
We write $x\,R\,y$ when $(x,y) \in R$.

Common properties:
- Reflexive: $\forall x\in X,\; xRx$
- Symmetric: $xRy \Rightarrow yRx$
- Antisymmetric: $(xRy \land yRx) \Rightarrow x=y$
- Transitive: $(xRy \land yRz) \Rightarrow xRz$

Equivalence relation ($\sim$): reflexive + symmetric + transitive.
It partitions $X$ into equivalence classes:
$$
[x] = \{y \in X : y \sim x\}
$$

Partial order ($\preceq$): reflexive + antisymmetric + transitive.

#### Ordering relations

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

#### Cardinality and infinite sets

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

#### Operations on relations

Given relations $R, S \subseteq X \times X$:

**Inverse**: $R^{-1} = \{(y,x) : (x,y) \in R\}$

**Composition**: $S \circ R = \{(x,z) : \exists y,\; (x,y)\in R \land (y,z)\in S\}$
- Read as "first apply $R$, then $S$".
- Transitive means $R \circ R \subseteq R$.

**Transitive closure** $R^+$: smallest transitive relation containing $R$.
- Reachability in a directed graph is the transitive closure of the edge relation.

**Reflexive-transitive closure** $R^*$: $R^+ \cup \{(x,x) : x \in X\}$.

#### Functions
A function $f: A \to B$ assigns each $a\in A$ exactly one value $f(a)\in B$.

Key flavors:
- Injective (one-to-one): $f(a_1)=f(a_2) \Rightarrow a_1=a_2$
- Surjective (onto): $\forall b\in B\; \exists a\in A: f(a)=b$
- Bijective: injective + surjective (invertible)

### Examples

#### Example A: “All neighbors visited” invariant
Let $G=(V,E)$ be a graph, and $S \subseteq V$ be the visited set.

Statement:
- “Every neighbor of $u$ is visited”
$$
\forall v \in V,\; ((u,v) \in E) \Rightarrow (v \in S)
$$

Negation (“there exists an unvisited neighbor”):
$$
\exists v \in V,\; ((u,v) \in E) \land (v \notin S)
$$

#### Example B: Relating mod arithmetic to equivalence classes
Define $a \equiv b \pmod m$ iff $m \mid (a-b)$.
This is an equivalence relation on $\mathbb{Z}$.
Each class is a residue class $[r] = \{ r + km : k \in \mathbb{Z} \}$.

### Algorithmic touchpoints
- **Set operations** show up in BFS/DFS visited sets, interval unioning, “seen” hashes.
- **Implication as $\lnot p \lor q$** mirrors guard clauses: `if (p) { require(q); }`.
- **Quantifier negation** is the difference between:
  - “All inputs pass” ($\forall$) and
  - “Find a counterexample” ($\exists$)
- **Equivalence relations** are exactly what DSU/Union-Find maintains.
- **Partial orders** model dependency graphs, topological sort, and “dominates” relations.

### Quick sanity checks
- If your proof says “for all”, try to produce a counterexample (negate it to an $\exists$).
- If you’re debugging an invariant, rewrite $p \Rightarrow q$ as $\lnot p \lor q$ and see what case makes it false.
- If you define a relation, test reflexive/symmetric/transitive with tiny examples.

---

## 1) Discrete Math Refresh

Goal: reboot the “language” that most algorithm proofs and specs are written in.

### 1.1 Logic in 10 lines

**Propositions** are statements with a truth value ($\mathsf\{T\}$ or $\mathsf\{F\}$).

Common connectives:
- Negation: $\lnot p$
- Conjunction: $p \land q$
- Disjunction: $p \lor q$
- Implication: $p \Rightarrow q$ (read: “if $p$ then $q$”)
- Biconditional: $p \Leftrightarrow q$

Two equivalences you’ll use constantly:
1. $p \Rightarrow q \equiv (\lnot p) \lor q$
2. $p \Rightarrow q \equiv (\lnot q) \Rightarrow (\lnot p)$ (contrapositive)

**Quantifiers**:
- $\forall x\in S\; P(x)$: for all $x$ in $S$, property $P$ holds
- $\exists x\in S\; P(x)$: there exists an $x$ in $S$ such that $P$ holds

Pitfall: $\lnot(\forall x\; P(x))\equiv \exists x\; \lnot P(x)$ and $\lnot(\exists x\; P(x))\equiv \forall x\; \lnot P(x)$.

### 1.2 Sets (the API)

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
- De Morgan: $(A\cup B)^c = A^c \cap B^c$ and $(A\cap B)^c = A^c \cup B^c$

Power set and counting:
- $\mathcal\{P\}(A)$ is the set of all subsets of $A$
- If $|A|=n$, then $|\mathcal\{P\}(A)|=2^n$

Cartesian product:
- $A\times B = \{(a,b)\mid a\in A, b\in B\}$

### 1.3 Relations (structure, not data)

A **relation** $R$ from $A$ to $B$ is any subset of $A\times B$.
When $A=B$, we say $R$ is “on $A$”. We write $aRb$ if $(a,b)\in R$.

Key properties on a set $A$:
- Reflexive: $\forall a\in A,\; aRa$
- Symmetric: $aRb \Rightarrow bRa$
- Antisymmetric: $(aRb \land bRa) \Rightarrow a=b$
- Transitive: $(aRb \land bRc) \Rightarrow aRc$

Two special classes:
- **Equivalence relation**: reflexive + symmetric + transitive
  - Partitions the set into equivalence classes.
- **Partial order**: reflexive + antisymmetric + transitive
  - Think: “can compare some pairs” (e.g., subset relation $\subseteq$).

Algorithmic lens:
- Equivalence relations show up as “same component”, “same state”, “same hash bucket” (conceptually).
- Partial orders show up in scheduling constraints and DAGs.

### 1.4 Functions (the correct mental model)

A **function** $f: A \to B$ assigns each $a\in A$ exactly one value $f(a)\in B$.

Vocabulary:
- Domain: $A$, codomain: $B$, image/range: $f(A)=\{f(a)\mid a\in A\}$
- Injective (one-to-one): $f(a_1)=f(a_2) \Rightarrow a_1=a_2$
- Surjective (onto): $\forall b\in B\; \exists a\in A\; f(a)=b$
- Bijective: injective + surjective (then inverse exists)

Composition:
$$
(g\circ f)(a)=g(f(a))
$$

Common CS pitfall: “invertible” is about being bijective onto the chosen codomain (not “it looks reversible”).

### 1.5 Micro‑proof patterns you’ll reuse

- **Direct**: assume premises, derive conclusion.
- **Contrapositive**: to show $p\Rightarrow q$, show $\lnot q\Rightarrow \lnot p$.
- **Contradiction**: assume $\lnot q$ and derive an impossibility.
- **Induction**: prove base case, assume $n$, prove $n+1$.

Two algorithm-friendly proof ideas:
- **Invariants**: something stays true every iteration.
- **Monovariants**: something strictly moves in one direction (guarantees termination).

### 1.6 Canonical examples (fast checks)

1) Quantifiers + bugs

Statement: “Every input has a valid parse.”
$$
\forall x\in \text\{Inputs\}\; \exists y\in \text\{Parses\}\; \text\{ValidParse\}(x,y)
$$
Negation (what a counterexample looks like):
$$
\exists x\in \text\{Inputs\}\; \forall y\in \text\{Parses\}\; \lnot \text\{ValidParse\}(x,y)
$$

2) Relation as “reachability”

Let $aRb$ mean “there is a path from $a$ to $b$ in a directed graph”. Then $R$ is transitive.

3) Function types

Hash functions are typically not injective on the full input set (pigeonhole principle), so collisions are inevitable.

### 1.7 Algorithmic touchpoints

- **Specifications**: preconditions ($p$), postconditions ($q$), and proving $p\Rightarrow q$.
- **Data modeling**: sets for state spaces; relations for transitions; functions for deterministic transforms.
- **Graphs**: reachability is a transitive closure of a relation.
- **Complexity**: many “it can’t be injective” arguments are pigeonhole arguments (counting).

### 1.8 Mini checklist (when reading a proof)

- What are the sets? What is the universe?
- Are we mixing up “for all” and “there exists”?
- Is the function’s codomain chosen correctly?
- If a relation is claimed to be an equivalence/partial order, which property is doing the work?

---
Next: a compact Logic & Proof toolkit (with 3–4 reusable templates).
