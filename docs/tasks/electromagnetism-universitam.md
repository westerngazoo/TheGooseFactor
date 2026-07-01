# Tasks — Electromagnetism Universitam

**Book:** `books/electromagnetism-universitam` · **Route:** `/electromagnetism-universitam`
**GA angle:** Maxwell's equations unified via spacetime algebra / the GA vector derivative ($\nabla F = J$).

## Style References (read before writing)

- **Exemplar / quality bar:** `books/calculus-universitam/unit-1-limits-continuity.md`.
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

## Unit I — Electrostatics

- **File:** `books/electromagnetism-universitam/unit-1-electrostatics.md`
- **status: todo**
- **Issue title:** `Electromagnetism Universitam: write Unit I — Electrostatics`
- **Labels:** `universitam`, `electromagnetism`, `content`, `unit`
- **Scope / outline:**
  - Charge and Coulomb's law.
  - Electric field $\mathbf{E}$.
  - Gauss's law (integral + differential $\nabla\cdot\mathbf{E}=\rho/\varepsilon_0$).
  - Potential, work, energy.
  - Conductors and boundary conditions.
- **Acceptance:** shared criteria + the vector derivative $\nabla$ introduced as the unifying operator.

## Unit II — Magnetostatics

- **File:** `books/electromagnetism-universitam/unit-2-magnetostatics.md`
- **status: todo**
- **Issue title:** `Electromagnetism Universitam: write Unit II — Magnetostatics`
- **Labels:** `universitam`, `electromagnetism`, `content`, `unit`
- **Scope / outline:**
  - Steady currents; continuity.
  - Biot–Savart law.
  - Magnetic field as a bivector ($\mathbf{B}$ as axial-vector artifact).
  - Ampère's law (no cross product).
  - Vector potential.
- **Acceptance:** shared criteria + explicit argument for $\mathbf{B}$ as a bivector.

## Unit III — Electromagnetic Induction

- **File:** `books/electromagnetism-universitam/unit-3-induction.md`
- **status: todo**
- **Issue title:** `Electromagnetism Universitam: write Unit III — Induction`
- **Labels:** `universitam`, `electromagnetism`, `content`, `unit`
- **Scope / outline:**
  - Faraday's law; Lenz's law.
  - Motional EMF; flux rule.
  - Time-varying fields; $\mathbf{E}$–$\mathbf{B}$ coupling.
  - Inductance; magnetic energy.
  - Displacement current (foreshadow Maxwell).
- **Acceptance:** shared criteria + coupling shown as mixing of vector/bivector parts of $F$.

## Unit IV — Maxwell Unified in GA

- **File:** `books/electromagnetism-universitam/unit-4-maxwell-unified.md`
- **status: todo**
- **Issue title:** `Electromagnetism Universitam: write Unit IV — Maxwell Unified in GA`
- **Labels:** `universitam`, `electromagnetism`, `content`, `unit`, `keystone`
- **Scope / outline:**
  - Spacetime algebra: $\gamma_\mu$, the metric.
  - Assembling the field bivector $F$.
  - The spacetime vector derivative $\nabla$.
  - $\nabla F = J$ and projection back to the four equations.
  - Charge conservation $\nabla\cdot J = 0$ as a corollary.
- **Acceptance:** shared criteria + all four Maxwell equations recovered from $\nabla F = J$.

## Unit V — Electromagnetic Waves

- **File:** `books/electromagnetism-universitam/unit-5-em-waves.md`
- **status: todo**
- **Issue title:** `Electromagnetism Universitam: write Unit V — EM Waves`
- **Labels:** `universitam`, `electromagnetism`, `content`, `unit`
- **Scope / outline:**
  - Source-free $\nabla F = 0$; wave equation.
  - Plane waves; null vectors in STA.
  - Polarization via the field bivector.
  - Energy density, Poynting vector, field momentum.
  - Reflection/refraction; boundary conditions.
- **Acceptance:** shared criteria + waves derived as source-free solutions of the unified equation.
