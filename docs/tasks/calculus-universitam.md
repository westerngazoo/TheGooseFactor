# Tasks — Calculus Universitam

**Book:** `books/calculus-universitam` · **Route:** `/calculus-universitam`
**GA angle:** geometric/vector calculus, directed integration, the GA vector derivative operator.

## Style References (read before writing)

- **Exemplar / quality bar:** `books/calculus-universitam/unit-1-limits-continuity.md` (fully written).
- **Voice:** `books/physics-universitam/intro.md`, `books/physics-universitam/unit-1-kinematics.md`.
- **Personas & checklist:** `books/cpp-algorithms/writing-style.md`.
- **Coordination & Definition of Done:** [`README.md`](./README.md).

## Shared Acceptance Criteria (every unit)

- GA-first lecture voice matching the exemplar.
- KaTeX math (`$...$`, `$$...$$`); worked examples with full steps.
- ≥2 goose-persona callouts (`> :persona: ...`) using valid personas.
- No broken internal links (`onBrokenLinks: 'throw'`); reference siblings in prose.
- Frontmatter intact (`id`, `title`, ascending `sidebar_position`); index keeps `slug: /`.
- Satisfies the Chapter Completion Checklist in `writing-style.md`.

---

## Unit I — Limits & Continuity ✅

- **File:** `books/calculus-universitam/unit-1-limits-continuity.md`
- **status: done** (exemplar — already written; use as the reference)

---

## Unit II — The Derivative as a Linear Map

- **File:** `books/calculus-universitam/unit-2-derivatives.md`
- **status: todo**
- **Issue title:** `Calculus Universitam: write Unit II — The Derivative as a Linear Map`
- **Labels:** `universitam`, `calculus`, `content`, `unit`
- **Scope / outline:**
  - Difference quotient and the limit definition of $f'(a)$.
  - Differentiability vs. continuity (one direction only).
  - Derivative as best linear approximation: $f(a+h)=f(a)+f'(a)h+o(h)$.
  - Product, quotient, chain rules derived from linearity.
  - Directional derivative → motivate the vector derivative $\nabla$.
- **Acceptance:** shared criteria + the "derivative is a linear map" framing is explicit and used in ≥1 worked example.

## Unit III — Directed Integration

- **File:** `books/calculus-universitam/unit-3-integration.md`
- **status: todo**
- **Issue title:** `Calculus Universitam: write Unit III — Directed Integration`
- **Labels:** `universitam`, `calculus`, `content`, `unit`
- **Scope / outline:**
  - Riemann sums; the definite integral as a limit.
  - Directed measure: why $d\mathbf{x}$ is a vector.
  - Fundamental Theorem of Calculus as a boundary statement.
  - Substitution and integration by parts.
  - Improper integrals.
- **Acceptance:** shared criteria + FTC presented as $\int_a^b f' = f(b)-f(a)$ with the boundary reading made explicit.

## Unit IV — Sequences & Series

- **File:** `books/calculus-universitam/unit-4-sequences-series.md`
- **status: todo**
- **Issue title:** `Calculus Universitam: write Unit IV — Sequences & Series`
- **Labels:** `universitam`, `calculus`, `content`, `unit`
- **Scope / outline:**
  - Sequences and limits; monotone/bounded.
  - Series, partial sums, geometric & telescoping.
  - Convergence tests (comparison, ratio, root, integral, alternating).
  - Power series & radius of convergence.
  - Taylor/Maclaurin; expansion of $e^{B\theta}$ for a bivector $B$ (rotors).
- **Acceptance:** shared criteria + the rotor/exponential-of-a-bivector connection appears.

## Unit V — Multivariable & Geometric Calculus

- **File:** `books/calculus-universitam/unit-5-multivariable-geometric-calculus.md`
- **status: todo**
- **Issue title:** `Calculus Universitam: write Unit V — Multivariable & Geometric Calculus`
- **Labels:** `universitam`, `calculus`, `content`, `unit`
- **Scope / outline:**
  - Partial derivatives; multivariable chain rule.
  - The vector derivative $\nabla$ and $\nabla F = \nabla\cdot F + \nabla\wedge F$.
  - Grad/div/curl as projections of $\nabla F$ (no cross product).
  - Directed integration over curves/surfaces/volumes.
  - Fundamental Theorem of Geometric Calculus; Green/Gauss/Stokes as special cases.
- **Acceptance:** shared criteria + explicit demonstration that grad/div/curl are parts of $\nabla F$.
