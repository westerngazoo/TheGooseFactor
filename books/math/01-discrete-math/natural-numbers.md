---
sidebar_position: 3
sidebar_label: "Natural Numbers"
title: "Natural Numbers: Construction and Arithmetic"
---

# Natural Numbers: Construction and Arithmetic

The natural numbers $\mathbb{N} = \{0, 1, 2, \dots\}$ can be constructed axiomatically (Peano) or set-theoretically (von Neumann ordinals). Both approaches yield the same arithmetic.

## Peano Axioms (simplified)

1. $0 \in \mathbb{N}$
2. Every $n \in \mathbb{N}$ has a unique **successor** $S(n) \in \mathbb{N}$
3. $S(n) \neq 0$ for all $n$
4. $S(m) = S(n) \Rightarrow m = n$ (successor is injective)
5. **Induction axiom**: If $P(0)$ holds, and $P(n) \Rightarrow P(S(n))$ for all $n$, then $P(n)$ holds for all $n \in \mathbb{N}$

Common notation: $S(n) = n+1$, so $1 = S(0), 2 = S(1), \dots$

> :mathgoose: Five axioms. That's all it takes to build arithmetic from nothing. The induction axiom (5) is doing the heavy lifting — it's what lets you prove things about *all* natural numbers, not just finitely many. Without it, you can't even prove $n + 0 = 0 + n$.
>
> :nerdygoose: These axioms map directly to code. In Haskell or Rust, you'd write `enum Nat { Zero, Succ(Box<Nat>) }`. Axiom 3 says `Succ(n)` never equals `Zero`. Axiom 4 says `Succ` is injective. Axiom 5 is structural recursion — pattern matching with a base case and a recursive case.

## Recursive Definitions of Operations

Addition ($+$):
$$
n + 0 = n
$$
$$
n + S(m) = S(n + m)
$$

Multiplication ($\times$):
$$
n \times 0 = 0
$$
$$
n \times S(m) = (n \times m) + n
$$

Exponentiation ($n^m$):
$$
n^0 = 1
$$
$$
n^{S(m)} = n^m \times n
$$

## Example Proof: Associativity of Addition

**Claim**: $(a + b) + c = a + (b + c)$ for all $a,b,c \in \mathbb{N}$.

**Proof** (by induction on $c$):

*Base case* ($c = 0$):
$$
(a + b) + 0 = a + b \quad \text{(def. of +)}
$$
$$
a + (b + 0) = a + b \quad \text{(def. of +)}
$$

*Inductive step*: Assume $(a + b) + c = a + (b + c)$. Show $(a + b) + S(c) = a + (b + S(c))$.
$$
(a + b) + S(c) = S((a + b) + c) \quad \text{(def. of +)}
$$
$$
= S(a + (b + c)) \quad \text{(IH)}
$$
$$
= a + S(b + c) \quad \text{(def. of +)}
$$
$$
= a + (b + S(c)) \quad \text{(def. of +)}
$$

Therefore by induction, associativity holds. $\square$

## Example Proof: Commutativity of Addition

**Claim**: $a + b = b + a$ for all $a,b \in \mathbb{N}$.

This requires two lemmas (both proven by induction):

*Lemma 1*: $0 + n = n$ for all $n$.

*Lemma 2*: $S(m) + n = S(m + n)$ for all $m,n$.

*Proof of commutativity* (by induction on $b$):

*Base*: $a + 0 = a = 0 + a$ (by def. and Lemma 1).

*Step*: Assume $a + b = b + a$. Then:
$$
a + S(b) = S(a + b) = S(b + a) = S(b) + a \quad \text{(by IH and Lemma 2)}
$$

$\square$

## Key Properties (all provable by induction)

- **Identity**: $n + 0 = 0 + n = n$, $n \times 1 = 1 \times n = n$
- **Commutativity**: $a + b = b + a$, $a \times b = b \times a$
- **Associativity**: $(a+b)+c = a+(b+c)$, $(a \times b) \times c = a \times (b \times c)$
- **Distributivity**: $a \times (b + c) = (a \times b) + (a \times c)$
- **Cancellation**: $a + c = b + c \Rightarrow a = b$ (addition); if $ac = bc$ and $c \neq 0$, then $a = b$ (multiplication)

## Set-Theoretic Construction (von Neumann ordinals)

Define $\mathbb{N}$ by:
$$
0 := \emptyset, \quad S(n) := n \cup \{n\}
$$

So:
$$
0 = \emptyset, \quad 1 = \{0\}, \quad 2 = \{0, 1\}, \quad 3 = \{0,1,2\}, \dots
$$

Then $n \in \mathbb{N}$ iff $n$ is the set of all smaller natural numbers. This makes $\in$ behave like $<$.

> :surprisedgoose: Numbers *are* sets? In von Neumann's construction, 3 literally *is* the set $\{0, 1, 2\}$ — it *contains* all smaller numbers. So $2 \in 3$ is true, and it means the same as $2 < 3$. The membership relation $\in$ and the ordering relation $<$ are the *same thing*. This is either beautiful or disturbing, depending on your philosophy.
>
> :sarcasticgoose: "But zero is the empty set? That makes no sense." It makes *perfect* sense — zero is the number with nothing before it, and the empty set is the set with nothing in it. They're the same concept, encoded differently. Welcome to foundations of mathematics, where everything is sets all the way down.

## Well-Ordering of $\mathbb{N}$

Every nonempty subset of $\mathbb{N}$ has a least element. This is crucial for:
- Strong induction (assume $P(k)$ for all $k < n$, prove $P(n)$)
- Definition by recursion
- Existence of gcd, prime factorization, etc.
