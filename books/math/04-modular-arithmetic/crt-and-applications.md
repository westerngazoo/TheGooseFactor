---
sidebar_position: 4
sidebar_label: "CRT & Applications"
title: "Chinese Remainder Theorem and Applications"
---

# The Chinese Remainder Theorem and Applications

The **Chinese Remainder Theorem (CRT)** stitches together congruences with different moduli into a single congruence with a large modulus. It is both a theoretical statement about ring structure and a concrete algorithm for solving simultaneous remainder constraints.

## The Theorem

Let $m_1, m_2, \dots, m_k$ be **pairwise coprime** ($\gcd(m_i, m_j) = 1$ for $i \neq j$). Then the system

```math
x \equiv a_1 \pmod{m_1}, \quad
x \equiv a_2 \pmod{m_2}, \quad \dots, \quad
x \equiv a_k \pmod{m_k}
```

has a **unique** solution modulo $M = m_1 m_2 \cdots m_k$.

> :mathgoose: The deep statement is a ring isomorphism: $\mathbb{Z}_M \;\cong\; \mathbb{Z}_{m_1} \times \cdots \times \mathbb{Z}_{m_k}$. A number mod $M$ is *the same data* as the tuple of its residues mod each $m_i$. CRT is the dictionary translating between the single big modulus and the tuple of small ones — and addition/multiplication go through componentwise.

## The Construction (two moduli)

For $x \equiv a_1 \pmod{m_1}$ and $x \equiv a_2 \pmod{m_2}$ with $\gcd(m_1,m_2)=1$: by Bézout find $p, q$ with $m_1 p + m_2 q = 1$. Then

```math
x \equiv a_1 m_2 q + a_2 m_1 p \pmod{m_1 m_2}.
```

The term $m_2 q \equiv 1 \pmod{m_1}$ and $\equiv 0 \pmod{m_2}$, so it "selects" $a_1$ on the first coordinate; symmetrically for the second.

**Example.** $x \equiv 2 \pmod 3$ and $x \equiv 3 \pmod 5$. Candidates mod 15: testing, $x = 8$ gives $8 \equiv 2 \pmod 3$ and $8 \equiv 3 \pmod 5$. ✓ So $x \equiv 8 \pmod{15}$.

## General Construction

Let $M = \prod m_i$ and $M_i = M / m_i$. Since $\gcd(M_i, m_i) = 1$, let $y_i \equiv M_i^{-1} \pmod{m_i}$. Then

```math
x \equiv \sum_{i=1}^{k} a_i \, M_i \, y_i \pmod{M}.
```

```python
def crt(residues, moduli):
    M = 1
    for m in moduli:
        M *= m
    x = 0
    for a, m in zip(residues, moduli):
        Mi = M // m
        yi = inverse(Mi % m, m)      # from the inverses chapter
        x = (x + a * Mi * yi) % M
    return x                          # unique solution mod M
```

> :nerdygoose: The pairwise-coprime condition is essential. If moduli share a factor, a solution exists **iff** the constraints agree on every common factor: $x \equiv a_i \pmod{m_i}$ and $x \equiv a_j \pmod{m_j}$ are compatible iff $a_i \equiv a_j \pmod{\gcd(m_i,m_j)}$. You can still merge them, but you combine with $\operatorname{lcm}$, not the product, and the simple formula above no longer applies directly.

## Application 1 — Big computations via small primes

To compute something modulo a huge $M$, factor $M$ into coprime pieces (or pick several primes whose product exceeds the true answer), compute mod each piece independently — where arithmetic is cheap and overflow-free — then reassemble with CRT. This is the backbone of **multi-modular arithmetic** in computer algebra systems and fast big-integer multiplication.

> :happygoose: This is "divide and conquer" for number size. Each small modulus is an independent, parallelizable lane. You only pay the reassembly cost once at the end. It's how libraries multiply thousand-digit integers without ever holding a thousand-digit intermediate.

## Application 2 — RSA intuition

RSA picks two large primes $p, q$, sets $n = pq$, and uses exponent $e$ with decryption exponent $d \equiv e^{-1} \pmod{\varphi(n)}$, where $\varphi(n) = (p-1)(q-1)$. Encryption is $c = m^e \bmod n$ and decryption is $m = c^d \bmod n$, which works because

```math
m^{ed} \equiv m^{1 + t\varphi(n)} \equiv m \pmod n
```

by Euler's theorem. Implementations decrypt **via CRT**: compute $m^d$ mod $p$ and mod $q$ separately (smaller exponents thanks to Fermat) and combine. This is roughly a 4× speedup and is standard in every RSA library.

> :angrygoose: RSA's security rests on factoring $n = pq$ being hard. The arithmetic — modular exponentiation, inverses, CRT — is all *easy* and lives in the previous three chapters. Never confuse "the math is simple" with "the scheme is weak": the hardness is in recovering $p, q$, not in the operations.

## Application 3 — Hashing and collision resistance

Polynomial string hashing computes $H(s) = \sum s_i b^i \bmod p$. Using **two** moduli $p_1, p_2$ and comparing both hashes is, by CRT, equivalent to hashing mod $p_1 p_2$ — drastically cutting collision probability while keeping arithmetic in machine words. Double hashing is CRT in disguise.

## Application 4 — Cyclic buffers and scheduling

Index arithmetic in a ring buffer of capacity $c$ is arithmetic mod $c$: `head = (head + 1) % c`. When several periodic events have **coprime** periods, CRT predicts exactly when their phases align again (the combined period is the product) — the same reasoning behind gear ratios, the "as the gears turn" puzzles, and round-robin schedules whose collisions repeat with period $\operatorname{lcm}$ of the individual periods.

## Algorithmic Touchpoints

- **Multi-modular / residue number systems** for overflow-free big-integer arithmetic.
- **RSA-CRT** decryption: split mod $p$ and mod $q$, recombine.
- **Double hashing** to suppress collisions = CRT over two prime moduli.
- **Coprime period alignment** in schedulers, animations, and ring buffers.
- **Garner's algorithm**, an incremental form of CRT used to reconstruct numbers digit-modulus by digit-modulus.

## Quick Sanity Checks

- Confirm moduli are pairwise coprime before using the product formula; otherwise check compatibility on common factors.
- The CRT solution is unique mod $M = \prod m_i$ — verify your answer is reduced into $[0, M)$.
- Plug the solution back into each original congruence; all $k$ must hold.
- Two coprime constraints over moduli $m_1, m_2$ should yield exactly $m_1 m_2$ distinct solutions as $(a_1, a_2)$ ranges over all residue pairs.
