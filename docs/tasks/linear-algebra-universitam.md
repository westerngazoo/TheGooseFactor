# Tasks — Linear Algebra Universitam

**Book:** `books/linear-algebra-universitam` · **Route:** `/linear-algebra-universitam`
**GA angle:** vectors/bivectors, the outer product vs. determinants, linear maps as GA operations.

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

## Unit I — Vectors & Spaces

- **File:** `books/linear-algebra-universitam/unit-1-vectors-spaces.md`
- **status: todo**
- **Issue title:** `Linear Algebra Universitam: write Unit I — Vectors & Spaces`
- **Labels:** `universitam`, `linear-algebra`, `content`, `unit`
- **Scope / outline:**
  - Vector space axioms; examples.
  - Subspaces, span, linear combinations.
  - Linear independence via the outer product ($\mathbf{a}\wedge\mathbf{b}\wedge\cdots\neq 0$).
  - Basis, dimension, coordinates.
  - Change of basis.
- **Acceptance:** shared criteria + independence-as-nonzero-wedge stated and used.

## Unit II — Linear Maps & Matrices

- **File:** `books/linear-algebra-universitam/unit-2-linear-maps-matrices.md`
- **status: todo**
- **Issue title:** `Linear Algebra Universitam: write Unit II — Linear Maps & Matrices`
- **Labels:** `universitam`, `linear-algebra`, `content`, `unit`
- **Scope / outline:**
  - Definition/properties of linear maps.
  - Matrix as a basis-dependent representation.
  - Composition ↔ matrix multiplication.
  - Kernel and image.
  - Rank–nullity theorem.
- **Acceptance:** shared criteria + the map-vs-matrix distinction is explicit.

## Unit III — Determinants & the Outer Product

- **File:** `books/linear-algebra-universitam/unit-3-determinants-outer-product.md`
- **status: todo**
- **Issue title:** `Linear Algebra Universitam: write Unit III — Determinants & the Outer Product`
- **Labels:** `universitam`, `linear-algebra`, `content`, `unit`
- **Scope / outline:**
  - Outer product of $n$ vectors; the pseudoscalar.
  - Determinant as oriented-volume scaling.
  - Antisymmetry/sign rule/multilinearity from $\wedge$.
  - Cofactor expansion; $\det(fg)=\det f\det g$.
  - Invertibility/rank via vanishing of a wedge.
- **Acceptance:** shared criteria + determinant introduced from $\wedge$, not as an opaque formula.

## Unit IV — Eigenvalues & Eigenstuff

- **File:** `books/linear-algebra-universitam/unit-4-eigenvalues.md`
- **status: todo**
- **Issue title:** `Linear Algebra Universitam: write Unit IV — Eigenvalues & Eigenstuff`
- **Labels:** `universitam`, `linear-algebra`, `content`, `unit`
- **Scope / outline:**
  - Eigenvectors/eigenvalues as invariant directions.
  - Characteristic polynomial.
  - Eigenplanes/bivectors; geometric meaning of complex eigenvalues.
  - Diagonalization.
  - Symmetric maps / spectral picture.
- **Acceptance:** shared criteria + complex eigenvalues explained via invariant planes (bivectors).

## Unit V — Inner Products & Orthogonality

- **File:** `books/linear-algebra-universitam/unit-5-inner-product-orthogonality.md`
- **status: todo**
- **Issue title:** `Linear Algebra Universitam: write Unit V — Inner Products & Orthogonality`
- **Labels:** `universitam`, `linear-algebra`, `content`, `unit`
- **Scope / outline:**
  - Inner product, norms, angles.
  - Orthogonality and orthogonal complements.
  - Projection as a GA contraction.
  - Gram–Schmidt; orthonormal bases.
  - Orthogonal maps as products of reflections; rotors.
- **Acceptance:** shared criteria + "orthogonal map = product of reflections" stated.
