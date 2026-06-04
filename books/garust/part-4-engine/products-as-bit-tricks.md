---
sidebar_position: 2
title: "The Products as Bit Tricks"
---

# The Products as Bit Tricks

> The hot path, demystified. Because a blade is a bitmask
> ([Chapter 2](/garust/part-1-foundations/the-multivector)), the geometric
> product of two blades is **XOR + a parity sign + a metric factor** — all
> computable in `const fn`s, at compile time. This chapter dissects
> `garust`'s product loop, the involutions as cheap grade-pattern sign
> flips, the versor inverse, and the closed-form `exp` whose three branches
> *are* rotation, boost, and translation. It's where the algebra meets the
> machine.

[Chapter 12](/garust/part-4-engine/generic-over-scalar-and-signature) gave
the architecture; this is the engine room. Every expensive operation in
`garust` reduces to bit manipulation on blade indices, and seeing exactly
how is both the key to the engine's speed and a satisfying payoff to the
bitmask convention you've carried since Part I.

## 1. The blade product, recomputed at compile time

The kernel is `blade_product` ([Chapter 3](/garust/part-1-foundations/the-geometric-product)):
the geometric product of two basis blades, from their bitmask indices, is

- **result index** $= a \oplus b$ (XOR — shared generators cancel),
- **a reordering sign** from the inversion parity (`swap_sign`),
- **a metric factor** $\in \{+1, -1, 0\}$ from each shared generator's group.

The crucial engineering detail: these are all **`const fn`s**.

```rust
pub const fn grade_of(i: usize) -> usize { i.count_ones() as usize }
pub const fn swap_sign(a: usize, b: usize) -> i32 { /* popcount inversions */ }
pub const fn blade_product(a: usize, b: usize, p: usize, q: usize) -> (usize, i32) { /* … */ }
```

`const fn` means the compiler *can* evaluate them at compile time — a blade
multiplication is, in principle, a constant. The whole multiplication
structure of any algebra is computable before the program runs, from pure
integer bit-twiddling. No floating point, no tables shipped — just
`count_ones`, shifts, and XOR.

## 2. The geometric product loop

The full product lifts the blade kernel bilinearly — a double loop over the
$\text{DIM}$ coefficients, routing each pair through `blade_product`:

```rust
impl<T: Scalar, /* consts */> Mul for Multivector<T, P, Q, R, DIM> {
    fn mul(self, rhs: Self) -> Self {
        let mut out = Self::zero();
        for a in 0..DIM {
            for b in 0..DIM {
                let (idx, sign) = blade_product(a, b, P, Q);   // XOR + parity + metric
                if sign != 0 {
                    let term = self.coeffs[a] * rhs.coeffs[b];
                    if sign > 0 { out.coeffs[idx] += term; }
                    else        { out.coeffs[idx] -= term; }
                }
            }
        }
        out
    }
}
```

That's it — the entire geometric product, for *every* algebra, in a dozen
lines. The signature enters only through `blade_product`'s `(p, q)`
arguments; change them and the same loop computes a different algebra. Note
the `sign != 0` guard skips null products (degenerate metrics) cheaply, and
results accumulate in place (multiple blade pairs can land on the same
output index).

## 3. Honest performance: O(DIM²)

The double loop is $O(\text{DIM}^2)$ — for two $\text{DIM}=16$ PGA
multivectors, $256$ blade products; for $\text{DIM}=32$ conformal,
$1024$. `garust` states this scope plainly: *fine for the algebras a human
writes by hand, not tuned for large $N$.*

Is $O(\text{DIM}^2)$ "slow"? For the target regime, **no** — it's a tight,
branch-light loop over small contiguous arrays, exactly what a CPU
devours, and $\text{DIM}$ never exceeds $32$. The quadratic factor only
bites if $N$ grows large (a $Cl(8)$ has $\text{DIM}=256$, so $65{,}536$
products) — but those algebras are rare and would want a different
representation entirely
([Chapter 12](/garust/part-4-engine/generic-over-scalar-and-signature)).
The lesson, again: *the right complexity is the one that wins on your
actual input sizes*, and for hand-sized GA, the simple quadratic loop beats
anything cleverer.

> :nerdygoose: There's a faster product — precompute a **Cayley table**: a
> `DIM × DIM` lookup of `(result_index, sign)` for the fixed signature, so
> each blade product is a table read instead of a `blade_product` call. For
> a hot inner loop over one algebra it's a real win. `garust` *deliberately
> doesn't*, for three reasons worth weighing in your own designs: (1) the
> `const fn` is already cheap and may inline/fold; (2) a table per
> signature complicates the "one generic loop, all algebras" simplicity;
> (3) it's a premature optimization for a teaching/hand-sized library. The
> point isn't that Cayley tables are bad — they're standard in
> performance-tuned GA libs — it's that **`garust` optimizes for clarity
> and genericity at its scale, and names the optimization it's leaving on
> the table.** Knowing *which* optimizations you're declining, and why, is
> as much a design skill as applying them.

## 4. The involutions: sign flips by grade

The involutions ([Chapter 5](/garust/part-1-foundations/reflections-rotors-and-exp))
are even cheaper — a single $O(\text{DIM})$ pass that flips signs by a
*grade pattern*. The grade is `count_ones(i)`, and each involution has a
parity rule:

```rust
// reverse ~M: flip when (k/2) is odd  →  (-1)^(k(k-1)/2)
pub fn reverse(&self) -> Self {
    let mut out = *self;
    for i in 0..DIM {
        if (grade_of(i) / 2) & 1 == 1 { out.coeffs[i] = -out.coeffs[i]; }
    }
    out
}
```

The three involutions differ only in the parity test on the grade $k$:

| operation | flip when | exponent |
|-----------|-----------|----------|
| reverse $\tilde M$ | $(k/2)$ odd | $(-1)^{k(k-1)/2}$ |
| grade involution $\hat M$ | $k$ odd | $(-1)^{k}$ |
| conjugation $\bar M$ | $((k{+}1)/2)$ odd | $(-1)^{k(k+1)/2}$ |

(and conjugation $= $ reverse $\circ$ grade-involution). These power
`norm_squared` and the versor inverse next. Cheap, signature-independent,
pure integer parity — the same bitmask discipline as the product.

## 5. Norm and the versor inverse

`norm_squared` is $\langle M\tilde M\rangle_0$ — the scalar product of $M$
with its reverse:

```rust
pub fn norm_squared(&self) -> T { self.scalar_product(&self.reverse()) }
```

The **versor inverse** generalizes "$a^{-1} = a/|a|^2$"
([Chapter 3](/garust/part-1-foundations/the-geometric-product)) to any
*versor* (a multivector whose $M\tilde M$ is a pure scalar — vectors,
rotors, motors, products of vectors): $M^{-1} = \tilde M / \langle M\tilde
M\rangle_0$. `garust` checks the versor condition before dividing, and
offers both a fallible and a panicking form:

```rust
pub fn try_versor_inverse(&self) -> Option<Self> {
    let prod = *self * self.reverse();
    let scalar = prod.scalar_part();
    let tol = T::from_f64(1e-10) * max(scalar.abs(), T::ONE);
    for i in 1..DIM {                         // every non-scalar part must vanish…
        if prod.coeffs[i].abs() > tol { return None; }   // …or it's not a versor
    }
    if scalar == T::ZERO { return None; }     // …and the norm must be nonzero
    Some(self.reverse() * (T::ONE / scalar))
}
```

The `try_`/panicking split is good API hygiene
([the Rust book's error handling](/garust/table-of-contents)): callers who
*know* they hold a versor use `versor_inverse()`; callers who don't use
`try_versor_inverse()` and handle `None`. The **relative tolerance**
(`1e-10 × max(|scalar|, 1)`) is the kind of numerical pragmatism real
geometry code needs — floating-point sandwiches leak tiny non-scalar dust,
and a naive exact check would reject genuine versors.

## 6. The sandwich, in two products

The sandwich ([Chapter 5](/garust/part-1-foundations/reflections-rotors-and-exp))
— the universal transformation — is just two geometric products and a
reverse:

```rust
pub fn sandwich(&self, x: &Self) -> Self { *self * *x * self.reverse() }
```

$M x \tilde M$: reflect (with a vector), rotate (with a rotor), move (with
a motor) — all the same three-symbol expression
([Chapter 8](/garust/part-2-geometry/motors)). It's $O(\text{DIM}^2)$ twice
(two products), which for $\text{DIM} \le 32$ is trivial. One method, every
orthogonal transformation in every algebra — and it's *literally* the
formula, no special cases.

## 7. exp: where the metric chooses the geometry

The jewel of the engine is the closed-form `exp` — the bivector-to-rotor
bridge ([Chapter 5](/garust/part-1-foundations/reflections-rotors-and-exp)).
It works for any element whose **square is a scalar** (simple bivectors,
vectors, …), and it branches on the *sign* of that square:

```rust
pub fn exp(&self) -> Self {
    let sq = *self * *self;
    debug_assert!(/* sq is (approximately) a scalar */);
    let c = sq.scalar_part();
    if c < T::ZERO {                                   // elliptic: a rotation
        let s = (-c).sqrt();
        Self::scalar(s.cos()) + *self * (s.sin() / s)
    } else if c > T::ZERO {                            // hyperbolic: a boost
        let s = c.sqrt();
        Self::scalar(s.cosh()) + *self * (s.sinh() / s)
    } else {                                           // null: a translation
        Self::one() + *self
    }
}
```

Look at what those three branches *are*, geometrically:

- **$c < 0$** ($B^2 = -1$): $\cos + \sin$ — a **rotation** (Euclidean
  rotors).
- **$c > 0$** ($B^2 = +1$): $\cosh + \sinh$ — a **boost** (the Lorentz
  transformations of spacetime, [Physics through GA](/physics-ga/)).
- **$c = 0$** ($B^2 = 0$): $1 + B$, truncated — a **translation** (PGA
  motors, [Chapter 8](/garust/part-2-geometry/motors)).

*One function*, and the **sign of the generator's square** — i.e. the
**metric** — decides whether the motion curves, hyperbolically diverges, or
runs straight. Rotation, relativity, and translation are three branches of
one `exp`. The `debug_assert` guards the precondition (the formula needs a
*simple* element; `e12 + e34` in 4D isn't, and would need a product over
commuting parts). This is, in nine lines, the deepest unification in the
engine.

## 8. Numerical hygiene and the whole hot path

Two last practical pieces. Floating-point sandwiches and `exp`s leave
$\sim 10^{-16}$ noise in coefficients that *should* be exactly zero; the
`cleaned(tol)` method zeroes sub-tolerance coefficients before printing or
comparing — which is why the rotor examples end in `.cleaned(1e-10)`. And
`normalized` rescales to unit magnitude (for unit vectors, rotors, and the
lines fed to `rotation_about`).

Step back at the whole hot path, and notice how *little* there is:

- **Products** ($*$, wedge, inner, scalar): $O(\text{DIM}^2)$ loops over
  `blade_product` (XOR + parity + metric, all `const fn`).
- **Involutions** (reverse, grade involution, conjugation): $O(\text{DIM})$
  grade-parity sign flips.
- **Norm / inverse / sandwich**: built from the above.
- **`exp`**: square, branch on the sign, closed form.

The entire computational engine of a library that does complex numbers,
quaternions, projective geometry, rigid motions, and (in the right
signature) relativity, is *bitmask arithmetic plus a handful of loops*.
That economy — profound capability from minimal, transparent code — is
`garust`'s real lesson, and the next chapter shows how to *extend* it.

> :weightliftinggoose: The engine room is smaller than you'd guess.
> **Products** are an $O(\text{DIM}^2)$ loop over `blade_product` — **XOR +
> reordering parity + metric**, all `const fn` (compile-time). **$O(\text{DIM}^2)$
> is right here** because $\text{DIM} \le 32$; the faster **Cayley table**
> is *deliberately declined* for clarity (know which optimizations you're
> skipping, and why). **Involutions** are $O(\text{DIM})$ grade-parity sign
> flips; **inverse** is $\tilde M/\langle M\tilde M\rangle_0$ with a versor
> check + relative tolerance; **sandwich** is literally $M x \tilde M$. And
> **`exp`** is the gem: its three branches (`cos/sin`, `cosh/sinh`,
> `1+B`) *are* rotation, boost, and translation — the **metric picks the
> geometry**. Bit tricks plus a few loops, and you have all of GA.

## What we covered

- The blade product is **XOR + reordering parity + metric**, all in
  **`const fn`s** (`grade_of`, `swap_sign`, `blade_product`) — computable at
  compile time.
- The **geometric product** is an $O(\text{DIM}^2)$ double loop over
  `blade_product`; the signature enters only via `(P, Q)`.
- **$O(\text{DIM}^2)$** is appropriate for hand-sized algebras
  ($\text{DIM} \le 32$); the **Cayley-table** speedup is consciously
  declined for clarity and genericity.
- **Involutions** (reverse, grade involution, conjugation) are
  $O(\text{DIM})$ sign flips keyed on **grade parity**.
- **`norm_squared`** $= \langle M\tilde M\rangle_0$; the **versor inverse**
  is $\tilde M / \langle M\tilde M\rangle_0$ with a versor check, a
  relative tolerance, and a `try_`/panicking split.
- The **sandwich** is literally $M x \tilde M$ — two products and a
  reverse, every transformation in one method.
- **`exp`** branches on the sign of $M^2$: $\cos/\sin$ (**rotation**),
  $\cosh/\sinh$ (**boost**), $1+M$ (**translation**) — the **metric chooses
  the geometry**; `cleaned`/`normalized` handle numerical hygiene.

## What's next

[Chapter 14](/garust/part-4-engine/extending-garust) — extending garust.
The payoff of "generic over the scalar": implement `Scalar`/`Real` for your
*own* number type and the whole algebra runs over it — including **dual
numbers for automatic differentiation**, which makes every GA computation
*differentiable* for free. Plus a tour of the full API and the design
principles worth stealing.
