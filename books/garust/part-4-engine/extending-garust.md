---
sidebar_position: 3
title: "Extending garust: Custom Scalars, Autodiff, and the API"
---

# Extending garust

> The seam that makes `garust` open-ended: because the whole library is
> generic over the scalar `T`, you can run *all* of Geometric Algebra over
> a number type **you** invent — and the headline example is **dual
> numbers**, which make every GA computation **automatically
> differentiable** for free. This closing chapter shows that extension
> point, tours the full API, and distills the design principles worth
> stealing for any library you build.

[Chapters 12–13](/garust/part-4-engine/generic-over-scalar-and-signature)
covered the architecture and the hot path. This chapter is about *growth* —
how `garust` is meant to be extended (the theme of this whole part: the
book and the engine evolve together), what its surface looks like, and the
transferable lessons. It's the capstone of everything the engine currently
is.

## 1. The extension seam: bring your own scalar

`garust`'s coefficient type is a generic `T: Scalar`
([Chapter 12](/garust/part-4-engine/generic-over-scalar-and-signature)).
That single decision means: **implement the `Scalar` trait (and `Real`, if
you want `exp`) for your own number type, and the entire library — every
product, rotor, motor, PGA constructor — works over it, unchanged.**

```rust
pub trait Scalar { const ZERO: Self; const ONE: Self;
    fn from_f64(x: f64) -> Self; fn abs(self) -> Self; /* + arithmetic ops */ }
pub trait Real: Scalar { fn sqrt(self)->Self; fn sin(self)->Self; /* cos,sinh,cosh */ }
```

`f32` and `f64` ship in the box. But the trait is the *only* contract the
algebra needs, so anything that behaves like an ordered field can plug in:

- **Fixed-point** types — deterministic arithmetic for embedded/lockstep
  simulation (no floating-point divergence across machines).
- **Interval arithmetic** — rigorous error bounds carried through every
  product.
- **Exact / symbolic** types (rationals) — implement `Scalar` but *not*
  `Real`, and you still get the full product algebra (just no `exp`); the
  trait split ([Chapter 12](/garust/part-4-engine/generic-over-scalar-and-signature))
  exists precisely for this.
- **Dual numbers** — automatic differentiation (§2–3), the killer example.

One generic over `T`, and `garust` becomes a GA engine over *any* numeric
backend you can define. That's the leverage of "generic over the scalar."

## 2. Dual numbers: autodiff for free

The most exciting extension. A **dual number** is $a + b\,\varepsilon$
where $\varepsilon \ne 0$ but $\varepsilon^2 = 0$ (a *nilpotent*
infinitesimal). Carry one through any function and the second component
emerges as the **derivative**, because the Taylor series truncates:

$$
f(a + b\,\varepsilon) = f(a) + f'(a)\,b\,\varepsilon.
$$

So if you make `T` a dual number, **every arithmetic operation `garust`
performs automatically computes its derivative alongside its value** —
forward-mode automatic differentiation, with no change to `garust` at all.
The "primal" part rides in $a$, the "tangent" (derivative) in $b$.

> :surprisedgoose: This is the moment "generic over the scalar" stops being
> a tidiness feature and becomes *magic*. You want the derivative of a
> rotor's action with respect to its angle — for inverse kinematics,
> trajectory optimization, or training a model with a GA layer. Normally
> you'd hand-derive it (painful, error-prone) or bolt on an autodiff
> framework. With dual numbers as `T`, you do **nothing**: build the rotor,
> sandwich the point, and the result is a dual multivector whose tangent
> part *is* $\frac{d}{d\theta}$ of the output, exact to machine precision.
> The same `exp`, `sandwich`, and `*` you've read all book — unmodified —
> now differentiate themselves, because $\varepsilon^2 = 0$ makes the chain
> rule fall out of ordinary multiplication. A GA engine that's
> differentiable for free is exactly what geometric *deep learning*
> ([AI through GA](/ai-ga/)) wants — and it costs one trait impl.

## 3. Implementing the dual scalar (a sketch)

Concretely, you'd define a `Dual` type and implement the two traits. The
arithmetic is pair arithmetic; the transcendentals are the **chain rule**:

```rust
#[derive(Clone, Copy)]
struct Dual { re: f64, eps: f64 }   // value + derivative

// Scalar: arithmetic on (value, derivative) pairs
//   (a,b) + (c,d) = (a+c, b+d)
//   (a,b) * (c,d) = (a·c, a·d + b·c)     ← product rule, since ε²=0
//   ZERO = (0,0)   ONE = (1,0)   from_f64(x) = (x, 0)   abs = (|a|, sign(a)·b)

impl Real for Dual {
    fn sin(self)  -> Self { Dual { re: self.re.sin(),  eps: self.re.cos() * self.eps } }
    fn cos(self)  -> Self { Dual { re: self.re.cos(),  eps: -self.re.sin() * self.eps } }
    fn sqrt(self) -> Self { let r = self.re.sqrt(); Dual { re: r, eps: self.eps / (2.0*r) } }
    // sinh, cosh likewise
}
```

Each transcendental's `eps` component is `(derivative of f) × (incoming
tangent)` — the chain rule, written once. Seed a variable's tangent to $1$
(`Dual { re: theta, eps: 1.0 }`), run *any* `garust` computation over
`Multivector<Dual, …>`, and read the derivative out of the `eps` of the
result. **`garust` never knew it was being differentiated** — the genericity
did all the work. (This is why `scalar.rs` explicitly names "dual numbers
for autodiff" as an intended use: the design anticipates it.)

## 4. The API, at a glance

A map of `garust`'s surface — everything is a method on `Multivector` (or
the `Motor` newtype), grouped by what it does:

- **Construct**: `zero`, `one`, `scalar(s)`, `basis(i)`,
  `pseudoscalar`; PGA `point`, `plane`, `line_through`; `Motor::identity`,
  `rotor`, `translator`, `rotation_about`.
- **Linear**: `+`, `-`, unary `-`, scalar `*` (both sides for `f32`/`f64`).
- **Products**: geometric `*`; `wedge` ($\wedge$, join); `inner` ($\cdot$);
  `scalar_product` ($\langle ab\rangle_0$); `regressive` ($\vee$, meet).
- **Grades & involutions**: `grade(k)`; `reverse`, `grade_involution`,
  `conjugate`.
- **Versor ops**: `sandwich`; `versor_inverse` / `try_versor_inverse`;
  `exp` (requires `Real`); `norm_squared`, `norm`, `normalized`.
- **Utility**: `scalar_part`, `coeffs` (the raw array), `cleaned(tol)`,
  `Display` / `display_pga`.
- **Motor**: `apply`, `compose` (`*`), `inverse`, `versor`, `norm_squared`.

That's the *entire* public vocabulary — compact enough to hold in your
head, which is itself a design goal. (See the [appendix](/garust/table-of-contents)
for the full reference.)

## 5. Design principles worth stealing

`garust` is a small library that does a lot, and its decisions generalize.
If you're building any mathematical or systems library in Rust:

- **Zero dependencies, own your traits.** Define the minimal interface you
  need (`Scalar`/`Real`) rather than pulling a framework. Smaller, clearer,
  no version churn — and it makes *your* type the extension point.
- **Put configuration in the type** via `const` generics (the signature),
  so distinct configurations are distinct, compile-checked types.
- **Be generic over the numeric backend.** One `T` parameter buys `f32`,
  `f64`, fixed-point, intervals, and autodiff — for free.
- **Fit the data structure to the real size regime.** Dense for small $N$;
  don't pay for sparse cleverness your inputs never need.
- **Prefer combinatorial definitions that survive degeneracy** — `garust`'s
  metric-free complements work in PGA where the textbook dual divides by
  zero ([Chapter 6](/garust/part-2-geometry/duality-and-the-meet)).
- **Push work to compile time** — `const fn` bit tricks for blade products.
- **Stay in safe Rust.** `garust` uses **zero `unsafe`** — a from-scratch
  GA engine, entirely safe, because the dense-array design never needs raw
  pointers. Safety wasn't sacrificed for the math.
- **Make examples the spec.** The README/doc examples are *tested*
  doctests, so the documentation can't drift from the code.

These are the transferable lessons — the reason this book spent a whole
part on the engine, not just the algebra.

## 6. How it's tested (and how to contribute)

`garust`'s correctness rests on two layers, both worth imitating:

- **Doctests** — the examples in the README and module docs are real,
  compiled, *run* on every `cargo test`
  ([the Rust book's testing](/garust/table-of-contents)). The rotor that
  sends $e_2 \to e_3$, the three planes meeting at a point — those aren't
  illustrations, they're assertions. Documentation that can't go stale.
- **Per-module unit tests** — every module (`signature`, `products`,
  `dual`, `pga`, `motor`, …) carries a `#[cfg(test)]` block checking the
  algebra against known results (e.g. $e_{12}^2 = -1$, the meet of two
  planes, a translator moving the origin). Each chapter of this book quoted
  several.

Plus the numerical discipline you've seen: relative tolerances in the
versor check, `cleaned` for floating dust, and the `_DIM_CHECK` const
assertion catching signature mistakes at compile time. To extend `garust`,
the rhythm is the same: add the method, prove it with a doctest *and* a
unit test against a hand-worked example — and (the theme of this whole
book) **as the engine grows a feature, the corresponding chapter grows with
it.**

## 7. What the engine is — and isn't

An honest accounting of `garust` as it stands:

- **It is**: a complete, generic, zero-dependency, all-safe GA engine
  covering multivectors, the full product algebra, grades and involutions,
  rotors and `exp`, duality and the meet, Projective GA (points/lines/
  planes), and rigid-body motors — over any scalar you supply.
- **It isn't (yet)**: the *constructors* for Conformal GA (circles,
  spheres) or Spacetime Algebra objects — the signatures exist as aliases
  (`Cga3`, `Sta`), but their named geometry is roadmapped
  ([Part III](/garust/table-of-contents)). Nor is it tuned for large $N$
  (Cayley tables, SIMD, sparsity) — by design
  ([Chapter 13](/garust/part-4-engine/products-as-bit-tricks)).

Naming the boundary is part of good engineering — and part of why this
book's roadmap honestly marks Part III as ahead of the code. The engine and
the book advance together; each new module gets its chapter.

## 8. The foundation, complete

That closes Part IV — and the foundation the whole *Garust* book set out to
build. Look back at the arc:

- **[Part I](/garust/part-1-foundations/why-garust)** — the algebra: the
  multivector, the geometric product, wedge/inner, rotors.
- **[Part II](/garust/part-2-geometry/duality-and-the-meet)** — the
  geometry: duality and the meet, Projective GA, motors.
- **Part IV** — the engine: generic-over-scalar-and-signature design, the
  products as bit tricks, and extension (custom scalars, autodiff, the
  API).

You now understand Geometric Algebra *and* own a complete, extensible Rust
engine that implements it, **line by line** — including the seam that makes
it differentiable for free. That foundation is exactly what the companion
books stand on: **[Physics through GA](/physics-ga/)** puts mass, velocity,
and force onto these motors (with angular velocity as the bivector it
always was), and **[AI through GA](/ai-ga/)** builds geometric, equivariant
learning on the same algebra. `garust` is the bedrock; this book built it.
As the engine grows — conformal constructors, spacetime objects,
performance — the book grows with it.

> :weightliftinggoose: The capstone lesson: **"generic over the scalar" is
> a superpower.** Implement `Scalar`/`Real` for your own type and all of GA
> runs over it — fixed-point, intervals, exact, and especially **dual
> numbers**, which make every `garust` computation **autodiff** for free
> ($\varepsilon^2=0$ turns the product rule into ordinary multiplication).
> Keep the design principles: **zero-dep, own-traits, type-level config,
> generic backend, dense-small-N, combinatorial duality, `const fn` bit
> tricks, all-safe Rust, doctests-as-spec.** You now hold the whole engine —
> the algebra (Part I), the geometry (Part II), and the design (Part IV) —
> and the seam to extend it. The physics and the AI build from here.

## What we covered

- The **extension seam**: implement **`Scalar`** (and **`Real`** for `exp`)
  for any number type and *all* of `garust` runs over it — fixed-point,
  intervals, exact/symbolic (Scalar-but-not-Real), and **dual numbers**.
- **Dual numbers** ($a+b\varepsilon$, $\varepsilon^2=0$) give **forward-mode
  autodiff for free**: every operation computes its derivative in the
  tangent part, with **no change to `garust`** — the chain rule falls out
  of $\varepsilon^2=0$.
- A **dual `Scalar`/`Real` impl** is pair arithmetic (product rule) plus
  chain-rule transcendentals; seed a tangent to $1$ and read derivatives
  from the result.
- The **API** is a compact set of methods on `Multivector`/`Motor`:
  construct, linear, products, grades/involutions, versor ops, utility,
  PGA, Motor.
- **Design principles to steal**: zero-dep + own-traits, type-level config,
  generic-over-scalar, dense-small-$N$, **combinatorial duality**, `const
  fn` bit tricks, **all-safe Rust** (zero `unsafe`), doctests-as-spec.
- **Testing**: tested **doctests** (docs can't drift) + per-module unit
  tests + numerical discipline (tolerances, `cleaned`, `_DIM_CHECK`).
- The engine **is** a complete generic GA core; it **isn't yet** CGA/STA
  *constructors* or large-$N$ tuned — boundaries named honestly.

## What's next

That completes the foundation. From here the *Garust* book grows with the
engine: [Part III](/garust/table-of-contents) — **the wider algebras**
(Conformal GA's circles and spheres, Spacetime Algebra's objects, a
signature cookbook) — fills in as those constructors are implemented. And
the **physics** built on this foundation — kinematics, the rigid body,
Maxwell's equations, relativity — is the companion
**[Physics through GA](/physics-ga/)**, with geometric learning in
**[AI through GA](/ai-ga/)**. The algebra and the engine are yours; go build
on them.
