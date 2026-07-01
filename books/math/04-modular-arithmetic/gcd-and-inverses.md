---
sidebar_position: 2
sidebar_label: "GCD & Modular Inverses"
title: "GCD, Euclid, and Modular Inverses"
---

# GCD, the Euclidean Algorithm, and Modular Inverses

To "divide" in modular arithmetic you need the **modular inverse**. Everything here rests on one ancient algorithm: Euclid's method for the greatest common divisor.

## The Euclidean Algorithm

The **greatest common divisor** $\gcd(a, b)$ is the largest integer dividing both $a$ and $b$. Euclid's insight:

```math
\gcd(a, b) = \gcd(b,\; a \bmod b), \qquad \gcd(a, 0) = a.
```

Repeatedly replace the larger by the remainder until one becomes zero.

```python
def gcd(a, b):
    while b:
        a, b = b, a % b
    return a
```

**Example.** $\gcd(48, 18)$: $48 = 2\cdot18 + 12$, $18 = 1\cdot12 + 6$, $12 = 2\cdot6 + 0$. So $\gcd = 6$.

> :mathgoose: Why does this terminate fast? Each two steps at least halve the smaller number, so the number of iterations is $O(\log \min(a,b))$. The worst case is consecutive Fibonacci numbers — that is Lamé's theorem, the first practical analysis of an algorithm's running time in history.

The **least common multiple** falls out for free:

```math
\operatorname{lcm}(a,b) = \frac{a \cdot b}{\gcd(a,b)}.
```

Divide before multiplying — `a // gcd(a,b) * b` — to avoid overflow.

## Bézout's Identity and the Extended Euclidean Algorithm

**Bézout's identity:** for any integers $a, b$ there exist integers $x, y$ with

```math
ax + by = \gcd(a, b).
```

The **extended Euclidean algorithm** computes those coefficients $x, y$ alongside the gcd.

```python
def ext_gcd(a, b):
    if b == 0:
        return a, 1, 0          # gcd, x, y  with a*1 + b*0 = a
    g, x1, y1 = ext_gcd(b, a % b)
    return g, y1, x1 - (a // b) * y1
```

The recursion unwinds the gcd steps, back-substituting to express the gcd as a combination of the originals.

**Example.** For $a=240, b=46$: $\gcd = 2$ and $240\cdot(-9) + 46\cdot 47 = -2160 + 2162 = 2$. ✓

> :nerdygoose: Bézout is the bridge from "gcd exists" to "I can actually solve linear Diophantine equations." The equation $ax + by = c$ has integer solutions **iff** $\gcd(a,b) \mid c$. Scale a Bézout solution by $c/\gcd$ to get one, then add multiples of $(b/g,\,-a/g)$ to get all of them.

## The Modular Inverse

The **inverse** of $a$ modulo $m$ is an integer $a^{-1}$ with

```math
a \cdot a^{-1} \equiv 1 \pmod m.
```

It exists **iff** $\gcd(a, m) = 1$ (we say $a$ is a *unit*). This is why prime moduli are convenient: every nonzero residue is a unit.

### Method 1 — Extended Euclid (works for any modulus)

If $\gcd(a, m) = 1$, then Bézout gives $ax + my = 1$, so reducing mod $m$:

```math
ax \equiv 1 \pmod m \implies a^{-1} \equiv x \pmod m.
```

```python
def inverse(a, m):
    g, x, _ = ext_gcd(a % m, m)
    if g != 1:
        raise ValueError("inverse does not exist")
    return x % m
```

**Example.** Inverse of $3$ mod $7$: $3 \cdot 5 = 15 \equiv 1$, so $3^{-1} \equiv 5 \pmod 7$.

### Method 2 — Fermat's Little Theorem (prime modulus only)

For prime $p$ and $\gcd(a,p)=1$, since $a^{p-1} \equiv 1 \pmod p$:

```math
a^{-1} \equiv a^{p-2} \pmod p.
```

Compute $a^{p-2}$ with fast exponentiation (next chapter). This is the go-to when $m$ is a fixed prime like $10^9 + 7$.

> :happygoose: Two tools, one job. Use **Fermat** ($a^{p-2}$) when the modulus is a known prime — it's a one-liner on top of fast exponentiation. Use **extended Euclid** when the modulus is composite or not known to be prime — it's the only one of the two that still works.

### Euler's theorem (the general version)

Fermat is a special case of **Euler's theorem**: if $\gcd(a, m) = 1$,

```math
a^{\varphi(m)} \equiv 1 \pmod m,
```

where $\varphi(m)$ (Euler's totient) counts integers in $\{1,\dots,m\}$ coprime to $m$. For prime $p$, $\varphi(p) = p-1$, recovering Fermat. So $a^{-1} \equiv a^{\varphi(m) - 1} \pmod m$ whenever $a$ is a unit.

## Dividing in Modular Arithmetic

To compute $b / a \pmod m$ when $\gcd(a,m)=1$, multiply by the inverse:

```math
\frac{b}{a} \equiv b \cdot a^{-1} \pmod m.
```

This is exactly how you handle binomial coefficients mod a prime: precompute factorials and their inverses, then $\binom{n}{k} \equiv n!\,(k!)^{-1}\,((n-k)!)^{-1} \pmod p$.

> :angrygoose: If $\gcd(a, m) \neq 1$ there is **no** inverse, and "dividing by $a$" is meaningless mod $m$. Don't paper over it — either the modulus should be prime, or the division shouldn't be happening mod $m$ at all. Silent garbage here produces hashes that collide and crypto that leaks.

## Algorithmic Touchpoints

- **Modular division** for combinatorics tables: precompute $i!^{-1}$ via one inverse plus a backward sweep.
- **RSA** decryption exponent $d$ is the inverse of $e$ modulo $\varphi(n)$ — extended Euclid in action.
- **Solving $ax \equiv b \pmod m$** reduces to a gcd check plus one inverse (or Bézout when $\gcd \mid b$).
- **Rational reconstruction** recovers a fraction from its modular image using the Euclidean algorithm's intermediate remainders.

## Quick Sanity Checks

- After computing $a^{-1}$, verify $a \cdot a^{-1} \equiv 1 \pmod m$ — one multiply.
- An inverse exists only if $\gcd(a,m)=1$; if your gcd isn't $1$, stop.
- Euclid should finish in $O(\log)$ steps; if it loops, you likely passed a negative or zero where you didn't mean to.
- Bézout coefficients satisfy $ax + by = \gcd$; plug them back in to check.
