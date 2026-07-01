---
sidebar_position: 1
sidebar_label: "Congruences & Rules"
title: "Congruences and Modular Arithmetic"
---

# Congruences and Modular Arithmetic

Modular arithmetic is "clock arithmetic": you fix a modulus $m$ and only care about remainders after dividing by $m$. It is the algebra of wrap-around — hash tables, ring buffers, checksums, and cryptography all live here.

## Definition

For an integer $m \ge 1$, we say $a$ is **congruent** to $b$ modulo $m$, written

```math
a \equiv b \pmod{m},
```

when $m \mid (a - b)$ (read "$m$ divides $a - b$"). Equivalently, $a$ and $b$ leave the same remainder when divided by $m$.

The **residue** of $a$ mod $m$ is the unique $r \in \{0, 1, \dots, m-1\}$ with $a \equiv r \pmod m$. The set of all residues $\mathbb{Z}_m = \{0, 1, \dots, m-1\}$ is the playground.

> :mathgoose: Congruence mod $m$ is an *equivalence relation*: reflexive, symmetric, transitive. It partitions the integers into $m$ residue classes. Every fact about modular arithmetic is really a fact about these classes, which is why you can freely replace any number by its remainder at any point in a computation.

## The Arithmetic Rules

Congruence is compatible with addition, subtraction, and multiplication. If $a \equiv b \pmod m$ and $c \equiv d \pmod m$, then:

```math
a + c \equiv b + d \pmod m
```
```math
a - c \equiv b - d \pmod m
```
```math
ac \equiv bd \pmod m
```

By induction this extends to powers: $a \equiv b \pmod m \implies a^k \equiv b^k \pmod m$ for all $k \ge 0$.

> :happygoose: The practical consequence: **reduce early, reduce often.** Instead of computing a giant product and then taking the remainder, take the remainder after every multiplication. The answer is identical, but the intermediate numbers stay small. This is the single most important habit in competitive programming math.

### Worked example

Compute $17 \cdot 23 \pmod 5$. Reduce first: $17 \equiv 2$ and $23 \equiv 3$, so $17 \cdot 23 \equiv 2 \cdot 3 = 6 \equiv 1 \pmod 5$. Check: $17 \cdot 23 = 391 = 78 \cdot 5 + 1$. ✓

### What you may NOT do

> :angrygoose: Division does **not** work like the others. From $ac \equiv bc \pmod m$ you **cannot** in general conclude $a \equiv b \pmod m$. Example: $2 \cdot 3 \equiv 2 \cdot 0 \pmod 6$ (both are $0$), but $3 \not\equiv 0 \pmod 6$. Cancellation only works when $\gcd(c, m) = 1$ — and then it works via the *modular inverse*, not ordinary division. We build that machinery in the next chapter.

## Negative numbers and the programming pitfall

Mathematically the residue is always in $\{0, \dots, m-1\}$. But in most languages the `%` operator returns a result with the sign of the dividend:

```python
-7 % 3      # Python: 2   (math-correct, non-negative)
```
```c
-7 % 3      /* C/C++/Java: -1  (sign of dividend) */
```

> :angrygoose: In C, C++, Java, and Go, `(-7) % 3 == -1`, not `2`. If you need a true non-negative residue, write `((a % m) + m) % m`. Forgetting this is a classic off-by-a-modulus bug in hashing and rolling-hash code.

## Modular Arithmetic as a Ring

The structure $(\mathbb{Z}_m, +, \cdot)$ is a commutative **ring**: addition forms a group, multiplication is associative and distributes over addition, and there is a multiplicative identity $1$. It is a **field** (every nonzero element is invertible) exactly when $m$ is prime.

| Property | Holds in $\mathbb{Z}_m$? |
|---|---|
| Additive inverses | Always ($-a \equiv m-a$) |
| Multiplicative identity | Always ($1$) |
| Multiplicative inverses for all nonzero | Only if $m$ is prime |
| No zero divisors | Only if $m$ is prime |

> :nerdygoose: A *zero divisor* is a nonzero $a$ with $ab \equiv 0$ for some nonzero $b$. In $\mathbb{Z}_6$, $2 \cdot 3 \equiv 0$. Zero divisors are exactly why cancellation fails for composite moduli, and why prime moduli are so beloved: $\mathbb{Z}_p$ is a field with none of these landmines.

## Fermat's Little Theorem (preview)

For a prime $p$ and any $a$ with $\gcd(a, p) = 1$:

```math
a^{p-1} \equiv 1 \pmod p.
```

This is the workhorse for computing inverses and reducing huge exponents modulo a prime. We use it heavily in the next two chapters.

## Algorithmic Touchpoints

- **Hash tables** map keys to buckets via `hash(key) % numBuckets`.
- **Cyclic / ring buffers** advance an index with `i = (i + 1) % capacity`.
- **Checksums and CRCs** are modular reductions over polynomial rings.
- **Hashing strings** (Rabin–Karp, polynomial hashing) lives entirely in $\mathbb{Z}_m$, almost always with a prime $m$ to avoid zero divisors.
- **Overflow control**: reducing mod a fixed prime after each operation keeps 64-bit arithmetic from overflowing.

## Quick Sanity Checks

- $a \equiv b \pmod m$ iff $a$ and $b$ have the same remainder — test with tiny numbers.
- After any add/multiply, the result should still be in $\{0, \dots, m-1\}$ if you reduced correctly.
- If you "divided" mod $m$, double check $\gcd(\text{divisor}, m) = 1$; otherwise you needed an inverse and probably have a bug.
- In a compiled language, print `(-1) % m` once to remind yourself of the sign convention.
