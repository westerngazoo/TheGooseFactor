---
sidebar_position: 1
sidebar_label: "Units as a Type System"
title: "Units, Dimensions, and Dimensional Homogeneity"
---

# Units, Dimensions, and Dimensional Homogeneity

Dimensional analysis is the physicist's type checker. Every physical quantity carries a *dimension* — a type — and the rules for combining them are as strict as a compiler's. Master this and you'll catch a huge class of errors before plugging in a single number, derive formulas up to a constant without solving anything, and sanity-check results from across the codebase of physics.

## Base Dimensions

Most mechanical quantities are built from three base dimensions:

```math
[\text{length}] = \mathsf{L}, \qquad [\text{mass}] = \mathsf{M}, \qquad [\text{time}] = \mathsf{T}.
```

(The full SI set adds current $\mathsf{I}$, temperature $\Theta$, amount $\mathsf{N}$, and luminous intensity $\mathsf{J}$.) The notation $[Q]$ means "the dimension of $Q$." Every derived quantity is a product of powers of the base dimensions:

| Quantity | Dimension | SI unit |
|---|---|---|
| velocity | $\mathsf{L}\,\mathsf{T}^{-1}$ | m/s |
| acceleration | $\mathsf{L}\,\mathsf{T}^{-2}$ | m/s² |
| force | $\mathsf{M}\,\mathsf{L}\,\mathsf{T}^{-2}$ | N |
| energy | $\mathsf{M}\,\mathsf{L}^2\,\mathsf{T}^{-2}$ | J |
| power | $\mathsf{M}\,\mathsf{L}^2\,\mathsf{T}^{-3}$ | W |
| pressure | $\mathsf{M}\,\mathsf{L}^{-1}\,\mathsf{T}^{-2}$ | Pa |
| momentum | $\mathsf{M}\,\mathsf{L}\,\mathsf{T}^{-1}$ | kg·m/s |

> :nerdygoose: Think of a dimension as a type signature. Force has type `M·L·T⁻²`. Just as you can't add a `String` to an `int` without an explicit cast, you can't add a force to an energy. The SI unit (N, J, …) is like a concrete *representation* of that type — newtons and pound-force are two encodings of the same dimensional type, the way `int32` and `int64` are two encodings of "integer."

## Units as a Type System

The analogy is exact and worth taking literally:

- **Quantities are typed values.** $5\,\text{m}$ has type $\mathsf L$; $9.8\,\text{m/s}^2$ has type $\mathsf L\mathsf T^{-2}$.
- **Multiplication/division combine types.** $\text{force} \times \text{distance} = \text{energy}$ is $(\mathsf{ML}\mathsf{T}^{-2})(\mathsf L) = \mathsf{ML}^2\mathsf{T}^{-2}$ ✓.
- **Addition requires matching types.** $a + b$ is only legal if $[a] = [b]$. This is the type-check.
- **Transcendental functions require *dimensionless* arguments.** $\sin(x)$, $e^x$, $\ln(x)$ are only defined when $x$ is a pure number — because their Taylor series $1 + x + x^2/2 + \cdots$ would otherwise add different dimensions.

> :angrygoose: $e^{kt}$ only makes sense if $kt$ is dimensionless, so $[k] = \mathsf{T}^{-1}$. Likewise the argument of $\sin(\omega t + \phi)$ must be dimensionless, forcing $[\omega] = \mathsf{T}^{-1}$. If you ever find yourself taking the log or exponential of something with units, **stop** — you've dropped a constant or mis-derived a formula. This is the single most reliable bug detector in all of physics, and it costs nothing.

## Dimensional Homogeneity

A physically meaningful equation must be **dimensionally homogeneous**: every additive term has the same dimension. This is the formal statement of "you can't add apples to oranges."

Check the projectile equation $x = x_0 + v_0 t + \tfrac{1}{2}a t^2$:

```math
[x] = \mathsf{L}, \quad [v_0 t] = (\mathsf{L}\mathsf{T}^{-1})(\mathsf{T}) = \mathsf{L}, \quad [a t^2] = (\mathsf{L}\mathsf{T}^{-2})(\mathsf{T}^2) = \mathsf{L}. \;\checkmark
```

All three terms are lengths — the equation type-checks. The dimensionless $\tfrac12$ is invisible to this analysis, which is exactly its limitation: **dimensional analysis never determines pure numbers.**

> :mathgoose: Homogeneity is a *necessary* but not *sufficient* condition for correctness. A dimensionally consistent equation can still be wrong (wrong coefficient, wrong sign, missing dimensionless factor). But a dimensionally *inconsistent* equation is *certainly* wrong. So it's a one-sided test — like a type checker that catches type errors but can't verify your logic. Cheap to run, and a failure is a guaranteed bug.

## Converting Units

A unit conversion is multiplication by a cleverly disguised "1." To convert $90\,\text{km/h}$ to m/s:

```math
90\,\frac{\text{km}}{\text{h}} \times \frac{1000\,\text{m}}{1\,\text{km}} \times \frac{1\,\text{h}}{3600\,\text{s}} = 25\,\frac{\text{m}}{\text{s}}.
```

Each factor equals 1 (numerator and denominator are the same physical quantity), so the value is unchanged while the units cancel by the type rules. Treating units as algebraic objects you cancel like variables is the whole method.

> :surprisedgoose: Unit-mismatch bugs are not academic. The \$327M Mars Climate Orbiter was lost in 1999 because one team used pound-force·seconds and another assumed newton·seconds for the same thrust data — a missing unit conversion. A dimensional/units type system would have flagged it instantly. Several modern languages and libraries (F#, `pint` in Python, `unitful` in Julia) implement units as actual types for exactly this reason.

## Computational / Algorithmic Touchpoints

- **Units libraries** (`pint`, `astropy.units`, `unitful.jl`, Boost.Units, F# units of measure) attach dimensions to numeric values and check them at runtime or compile time — literally a type system for physics code.
- **Property-based testing**: a fast smoke test for any physics function is to feed it inputs and assert the output's dimension matches expectation, independent of the numeric value.
- **Symbolic CAS** tools (SymPy, Mathematica) can carry dimensions through derivations and flag inhomogeneous equations automatically.
- **Defensive computing**: storing quantities together with their units (rather than bare floats) prevents the entire Mars-Orbiter class of errors at the cost of a wrapper type.

```python
# A minimal "dimension vector" as (L, M, T) exponents — the type signature.
def mul(a, b):  return tuple(x + y for x, y in zip(a, b))   # multiply -> add exponents
def div(a, b):  return tuple(x - y for x, y in zip(a, b))
def add(a, b):
    assert a == b, f"dimension mismatch: {a} + {b}"          # the type check
    return a

FORCE  = (1, 1, -2)   # L^1 M^1 T^-2
LENGTH = (1, 0,  0)
ENERGY = mul(FORCE, LENGTH)   # -> (2, 1, -2), i.e. M L^2 T^-2  ✓
```

## Quick Sanity Checks

- Before trusting any derived formula, check that both sides have the same dimension. A mismatch is a guaranteed error.
- The argument of any $\sin$, $\cos$, $\exp$, or $\log$ must be dimensionless. If it isn't, a constant is missing.
- When you multiply/divide quantities, *add/subtract* the dimension exponents. When you add/subtract quantities, the exponents must already match.
- Ratios of like quantities (efficiency, Mach number, strain) are dimensionless — and those are exactly the variables Buckingham Pi (next chapter) will organize a problem around.
- A conversion factor must equal 1 as a physical quantity (e.g. $1000\,\text{m}/1\,\text{km}$). If your "conversion" changes the physical value, it isn't a conversion.
