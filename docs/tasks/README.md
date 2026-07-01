# Universitam — Team Coordination & Tasks

This folder coordinates the **Universitam** initiative: a university curriculum
reimagined through **Geometric Algebra (GA)**. It is plain repository markdown for the
team — it is **not** part of the Docusaurus site and is not registered as a book.

> Note: the live section landing page is `src/pages/universitam.mdx` (route `/universitam`),
> and the books live under `books/<subject>-universitam/`. This folder only tracks who is
> doing what.

## The Initiative

We are scaffolding four new Universitam course books alongside the existing
**Physics Universitam**, then fleshing them out unit-by-unit in parallel:

| Book | Path | Route | Status |
|------|------|-------|--------|
| Physics Universitam | `books/physics-universitam` | `/physics-universitam` | existing (reference) |
| Calculus Universitam | `books/calculus-universitam` | `/calculus-universitam` | scaffolded; Unit I written |
| Linear Algebra Universitam | `books/linear-algebra-universitam` | `/linear-algebra-universitam` | scaffolded |
| Electromagnetism Universitam | `books/electromagnetism-universitam` | `/electromagnetism-universitam` | scaffolded |
| Chemistry Universitam | `books/chemistry-universitam` | `/chemistry-universitam` | scaffolded |

## Defaults & Assumptions (correct these if wrong)

These were chosen to unblock parallel work. Flag any you want changed:

- **Language:** English. (The site also supports `es` and `zh-Hans`; translation is out of
  scope for the first pass.)
- **Voice:** A clean, formula-forward university lecture in the Universitam style — **GA-first**,
  mirroring `books/physics-universitam/intro.md` and `unit-1-kinematics.md`.
- **Personas:** Goose-persona callouts layered in per `books/cpp-algorithms/writing-style.md`.
  Valid personas: `angrygoose`, `nerdygoose`, `sarcasticgoose`, `happygoose`, `mathgoose`,
  `sharpgoose`, `surprisedgoose`, `weightliftinggoose`. Format: `> :mathgoose: ...`.
- **Math:** KaTeX — `$...$` inline, `$$...$$` (or ```` ```math ````) for display.
- **Curriculum:** Standard 5-unit syllabus per subject (see each task file). Adjust scope per
  subject as needed.
- **Structure:** Flat unit files at the book root (e.g. `unit-1-<topic>.md`), matching the
  physics-universitam pattern — no `_category_.json` needed.
- **Quality bar / exemplar:** `books/calculus-universitam/unit-1-limits-continuity.md` is the
  fully written reference chapter. Match its depth, math density, and persona usage.

## How to Claim a Task

1. Pick an unclaimed unit from a book task file (`status: todo`).
2. Edit that task file: set `status: in-progress` and add your name/handle to the unit row.
3. Write the unit in its scaffold file under `books/<book>/`. Replace the
   `:::info[Work in Progress]` admonition with real content.
4. Open a PR. When merged, set the unit's `status: done` here.
5. (Optional) These task files are written to mirror cleanly into GitHub issues — title,
   body, and `labels` are provided in each task file.

## Definition of Done (per unit)

A unit is **done** when it satisfies all of the following:

- [ ] Meets the **Chapter Completion Checklist** in `books/cpp-algorithms/writing-style.md`
      (invariants stated, edge cases enumerated, complexity/behavior noted where relevant,
      ≥1 persona insight, worked example or boundary case).
- [ ] GA-first lecture voice consistent with the exemplar
      (`books/calculus-universitam/unit-1-limits-continuity.md`).
- [ ] KaTeX math renders (`$...$`, `$$...$$`); no raw LaTeX errors.
- [ ] **At least 2** goose-persona callouts using valid personas and the `> :persona: ...` format.
- [ ] No broken internal links. Do **not** add `](./...)`, `](/...)`, or `](#...)` links to
      pages/anchors that don't exist (`onBrokenLinks: 'throw'`). Reference sibling units in
      prose, or use the sidebar.
- [ ] The book index still has `slug: /` so the route root resolves.
- [ ] Frontmatter present (`id`, `title`, ascending `sidebar_position`).

## Master Status Table

Legend: `todo` = unclaimed · `in-progress` = claimed · `done` = merged.

| Book | Unit | File | Status | Owner |
|------|------|------|--------|-------|
| Calculus | I — Limits & Continuity | `books/calculus-universitam/unit-1-limits-continuity.md` | **done** (exemplar) | — |
| Calculus | II — The Derivative as a Linear Map | `books/calculus-universitam/unit-2-derivatives.md` | todo | — |
| Calculus | III — Directed Integration | `books/calculus-universitam/unit-3-integration.md` | todo | — |
| Calculus | IV — Sequences & Series | `books/calculus-universitam/unit-4-sequences-series.md` | todo | — |
| Calculus | V — Multivariable & Geometric Calculus | `books/calculus-universitam/unit-5-multivariable-geometric-calculus.md` | todo | — |
| Linear Algebra | I — Vectors & Spaces | `books/linear-algebra-universitam/unit-1-vectors-spaces.md` | todo | — |
| Linear Algebra | II — Linear Maps & Matrices | `books/linear-algebra-universitam/unit-2-linear-maps-matrices.md` | todo | — |
| Linear Algebra | III — Determinants & the Outer Product | `books/linear-algebra-universitam/unit-3-determinants-outer-product.md` | todo | — |
| Linear Algebra | IV — Eigenvalues & Eigenstuff | `books/linear-algebra-universitam/unit-4-eigenvalues.md` | todo | — |
| Linear Algebra | V — Inner Products & Orthogonality | `books/linear-algebra-universitam/unit-5-inner-product-orthogonality.md` | todo | — |
| Electromagnetism | I — Electrostatics | `books/electromagnetism-universitam/unit-1-electrostatics.md` | todo | — |
| Electromagnetism | II — Magnetostatics | `books/electromagnetism-universitam/unit-2-magnetostatics.md` | todo | — |
| Electromagnetism | III — Induction | `books/electromagnetism-universitam/unit-3-induction.md` | todo | — |
| Electromagnetism | IV — Maxwell Unified in GA | `books/electromagnetism-universitam/unit-4-maxwell-unified.md` | todo | — |
| Electromagnetism | V — EM Waves | `books/electromagnetism-universitam/unit-5-em-waves.md` | todo | — |
| Chemistry | I — Atomic Structure | `books/chemistry-universitam/unit-1-atomic-structure.md` | todo | — |
| Chemistry | II — Periodic Trends | `books/chemistry-universitam/unit-2-periodic-trends.md` | todo | — |
| Chemistry | III — Bonding & Molecular Geometry | `books/chemistry-universitam/unit-3-bonding-molecular-geometry.md` | todo | — |
| Chemistry | IV — Stoichiometry & Reactions | `books/chemistry-universitam/unit-4-stoichiometry-reactions.md` | todo | — |
| Chemistry | V — Thermochemistry | `books/chemistry-universitam/unit-5-thermochemistry.md` | todo | — |

## Per-Book Task Files

- [`calculus-universitam.md`](./calculus-universitam.md)
- [`linear-algebra-universitam.md`](./linear-algebra-universitam.md)
- [`electromagnetism-universitam.md`](./electromagnetism-universitam.md)
- [`chemistry-universitam.md`](./chemistry-universitam.md)
