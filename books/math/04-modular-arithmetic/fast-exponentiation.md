---
sidebar_position: 3
sidebar_label: "Fast Exponentiation"
title: "Fast (Binary) Exponentiation"
---

# Fast (Binary) Exponentiation

Computing $a^n$ by multiplying $a$ together $n$ times costs $n-1$ multiplications. **Binary exponentiation** does it in $O(\log n)$ by exploiting the binary expansion of the exponent. It is the engine behind every modular power, and the same trick powers matrix exponentiation.

## The Idea

Write the exponent in binary. Then $a^n$ is a product of the "square powers" $a^{2^k}$ for the bits that are set. The key recurrences:

```math
a^n =
\begin{cases}
1 & n = 0 \\
\left(a^{n/2}\right)^2 & n \text{ even} \\
a \cdot \left(a^{(n-1)/2}\right)^2 & n \text{ odd}
\end{cases}
```

Each step either halves the exponent (square) or peels off one bit (multiply), so we touch $O(\log n)$ values.

> :mathgoose: The trick is *square-and-multiply*. Square to advance to the next bit position; multiply in the base whenever that bit is $1$. Reading $n$'s bits from most significant to least (or least to most) both work — you just maintain the running square differently.

## Iterative Implementation

The least-significant-bit-first version is the cleanest and avoids recursion:

```python
def power_mod(a, n, m):
    a %= m
    result = 1
    while n > 0:
        if n & 1:            # current bit is set
            result = result * a % m
        a = a * a % m        # square the base
        n >>= 1              # next bit
    return result
```

**Trace** $3^{13} \bmod 7$. Binary $13 = 1101_2$.

| step | bit | `a` (base) | `result` |
|---|---|---|---|
| start | — | $3$ | $1$ |
| bit 0 = 1 | mult | $3$ | $3$ |
| | square | $2$ | $3$ |
| bit 1 = 0 | — | $2$ | $3$ |
| | square | $4$ | $3$ |
| bit 2 = 1 | mult | $4$ | $12 \equiv 5$ |
| | square | $2$ | $5$ |
| bit 3 = 1 | mult | $2$ | $10 \equiv 3$ |

Result: $3^{13} \equiv 3 \pmod 7$. (Check: $3^6 = 729 \equiv 1$, so $3^{13} = 3^{12}\cdot 3 \equiv 3$. ✓)

> :angrygoose: **Reduce inside the loop, every time.** Both `result * a % m` and `a * a % m` must take the mod immediately, or the numbers explode. Even in 64-bit, the product of two numbers near $10^9$ overflows; use 128-bit intermediates (`__int128` in C++, or `unsigned long long` with care) or a language with big integers.

## Why It Is $O(\log n)$

The exponent halves each iteration, so the loop runs $\lfloor \log_2 n \rfloor + 1$ times, doing at most two multiplications per iteration. Total: $\Theta(\log n)$ multiplications versus $\Theta(n)$ for naive repeated multiplication. For $n = 10^{18}$ that is ~60 multiplications instead of a quintillion.

## Reducing the Exponent with Fermat / Euler

When the modulus is prime $p$, Fermat lets you shrink the exponent first:

```math
a^n \equiv a^{\,n \bmod (p-1)} \pmod p \quad (\gcd(a,p)=1).
```

More generally Euler gives $a^n \equiv a^{\,n \bmod \varphi(m)} \pmod m$ for $\gcd(a,m)=1$. This matters when $n$ itself is astronomically large (e.g. a tower of exponents).

> :nerdygoose: Combining the two ideas — reduce the exponent mod $p-1$ by Fermat, then square-and-multiply — is exactly how you compute things like $a^{b^c} \bmod p$. Just be careful: the exponent reduction needs $\gcd(a,p)=1$, and for composite moduli with $\gcd \neq 1$ you need the *generalized* Euler theorem with a guard on the exponent size.

## Matrix Exponentiation

The square-and-multiply skeleton works for **any associative product** — replace integer multiplication by matrix multiplication and you get $A^n$ in $O(d^3 \log n)$ for a $d \times d$ matrix. This computes linear recurrences in logarithmic time.

The Fibonacci numbers satisfy

```math
\begin{pmatrix} F_{n+1} \\ F_n \end{pmatrix}
=
\begin{pmatrix} 1 & 1 \\ 1 & 0 \end{pmatrix}^{n}
\begin{pmatrix} 1 \\ 0 \end{pmatrix},
```

so $F_n \bmod m$ is computable in $O(\log n)$ by exponentiating the $2\times 2$ matrix.

> :surprisedgoose: The same five lines that compute $a^n$ compute $A^n$, polynomial powers, and even "powers" in any monoid. Fast exponentiation is not about numbers — it's about associativity. Once you see that, it generalizes everywhere.

## Algorithmic Touchpoints

- **Modular inverse via Fermat**: $a^{-1} \equiv a^{p-2} \pmod p$ is one call to `power_mod`.
- **RSA encrypt/decrypt** is a single modular exponentiation per block.
- **Primality testing** (Miller–Rabin) repeatedly squares and multiplies modulo $n$.
- **Linear recurrences / DP transitions** with huge step counts collapse to matrix powers.
- **Hash recomputation** for repeated base powers in polynomial hashing.

## Quick Sanity Checks

- `power_mod(a, 0, m)` must return $1$ (or $0$ if $m = 1$).
- The loop count should be about $\log_2 n$; if it's $n$, you wrote the naive version.
- Every multiply is followed by `% m` — scan for a missing one if results look huge or wrong.
- Test against a known identity, e.g. $a^{p-1} \equiv 1 \pmod p$ for prime $p$ and $\gcd(a,p)=1$.
