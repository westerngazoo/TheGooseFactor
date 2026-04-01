---
sidebar_position: 4
sidebar_label: "Functions"
title: "Functions"
---

# Functions

A **function** $f: A \to B$ assigns each $a\in A$ exactly one value $f(a)\in B$.

## Vocabulary

- Domain: $A$, codomain: $B$, image/range: $f(A)=\{f(a)\mid a\in A\}$
- **Injective** (one-to-one): $f(a_1)=f(a_2) \Rightarrow a_1=a_2$
- **Surjective** (onto): $\forall b\in B\; \exists a\in A\; f(a)=b$
- **Bijective**: injective + surjective (then inverse exists)

## Composition

$$
(g\circ f)(a)=g(f(a))
$$

Common CS pitfall: "invertible" is about being bijective onto the chosen codomain (not "it looks reversible").

## Canonical Examples

### Example A: "All neighbors visited" invariant
Let $G=(V,E)$ be a graph, and $S \subseteq V$ be the visited set.

Statement -- "Every neighbor of $u$ is visited":
$$
\forall v \in V,\; ((u,v) \in E) \Rightarrow (v \in S)
$$

Negation ("there exists an unvisited neighbor"):
$$
\exists v \in V,\; ((u,v) \in E) \land (v \notin S)
$$

### Example B: Relating mod arithmetic to equivalence classes
Define $a \equiv b \pmod m$ iff $m \mid (a-b)$.
This is an equivalence relation on $\mathbb{Z}$.
Each class is a residue class $[r] = \{ r + km : k \in \mathbb{Z} \}$.

### Example C: Function types
Hash functions are typically not injective on the full input set (pigeonhole principle), so collisions are inevitable.

## Proof Patterns You'll Reuse

- **Direct**: assume premises, derive conclusion.
- **Contrapositive**: to show $p\Rightarrow q$, show $\lnot q\Rightarrow \lnot p$.
- **Contradiction**: assume $\lnot q$ and derive an impossibility.
- **Induction**: prove base case, assume $n$, prove $n+1$.

Two algorithm-friendly proof ideas:
- **Invariants**: something stays true every iteration.
- **Monovariants**: something strictly moves in one direction (guarantees termination).

## Mini Checklist (when reading a proof)

- What are the sets? What is the universe?
- Are we mixing up "for all" and "there exists"?
- Is the function's codomain chosen correctly?
- If a relation is claimed to be an equivalence/partial order, which property is doing the work?
