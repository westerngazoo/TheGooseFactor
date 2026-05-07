---
sidebar_position: 4
title: "Further Reading"
---

# Further Reading

This study journal covered the foundations, the geometry, the
rotor machinery, and a tour of applications. To go deeper, the
literature.

## Textbooks

### *Linear and Geometric Algebra* — Alan Macdonald

The cleanest accessible introduction. Macdonald's book treats GA
as the natural extension of linear algebra, with proofs at an
undergraduate level. Read this first if you want the textbook
treatment.

> :happygoose: If this study journal is the trail of breadcrumbs,
> Macdonald's book is the marked path. Same destination, fewer
> detours.

### *Geometric Algebra for Physicists* — Doran & Lasenby

The standard reference. Cambridge group's textbook treats GA from
the physicist's perspective — STA, gauge theory gravity, quantum
mechanics. Heavier than Macdonald, more rigorous, more applied.
Necessary reading if you're using GA in research physics.

### *Geometric Algebra for Computer Science* — Dorst, Fontijne &
Mann

The graphics and engineering treatment. Includes CGA, computational
algorithms, and implementation discussion. The book to pair with
*Geometric Algebra for Physicists* — they cover different audiences
and barely overlap.

### *Clifford Algebra to Geometric Calculus* — Hestenes & Sobczyk

Hestenes' magnum opus from 1984. The original synthesis that made
modern GA. Dense, rigorous, transformative if you put in the work.
Not the first book to read, but the book everyone else cites.

## Papers

### Hestenes, *A Unified Language for Mathematics and Physics* (1986)

The manifesto. Hestenes argues that GA should be the standard
language for mathematics and physics. Whatever you think of the
politics, the technical content is foundational. Free PDF online.

### Akra & Bazzi, *On the solution of linear recurrence equations*
(1998)

Tangentially related — the recurrence-solving theorem we cited in
the C-algorithms book. GA people sometimes use Akra–Bazzi-style
recurrences when analyzing operations that recurse over different-sized
multivector pieces.

### Lasenby, Doran, Gull, *Gravity, gauge theories and
geometric algebra* (1998)

The definitive paper on Gauge Theory Gravity. If §5.2's mention
of GTG piqued your interest, this paper is the entry point.

### Dorst & Mann, *Geometric Algebra: A Computational Framework
for Geometrical Applications* (2002)

Useful introduction to the implementation side. Pairs well with
the Dorst/Fontijne/Mann book.

## Online Resources

### bivector.net

The community hub. Tutorials, code samples, links to libraries,
research papers, and active discussion forums. Updated regularly.

### *YouTube: sudgylacmoe channel*

The "GA video introduction" series. Clear visuals, modern
pedagogy. Excellent for learning the geometric intuition before
diving into texts.

### *GA Lecture Notes — Eric Chisolm*

Self-published, freely available. A comprehensive treatment with a
problem-set focus. Useful as a workbook.

### *Scott Walter's Geometric Algebra Notes*

Aerospace engineering perspective. Covers spacecraft dynamics
applications.

## Software / Libraries

### `clifford` (Python)

Pip-installable Python library. Slow for serious work but
excellent for learning — interactive REPL exploration is a great
way to build intuition.

```bash
pip install clifford
```

### `ganja.js` (JavaScript)

Browser-based GA. Lets you build interactive demos. The
[bivector.net visualizations](https://bivector.net) are mostly
ganja.js under the hood.

### `Versor` (C++)

Production-quality C++ library. Used in graphics research and
some industrial robotics applications. Steeper learning curve
than `clifford` but real performance.

### `gafro` (C++ for robotics)

Robotics-focused CGA library. Forward/inverse kinematics, motion
planning, screw-theory primitives. Newer, growing.

## Communities

- **bivector.net Discord** — active, friendly, mix of
  practitioners and students.
- **r/geometric_algebra** — reddit forum, slower but searchable.
- **GA Conference** — biennial academic conference (Applications
  of Geometric Algebra in Computer Science and Engineering, AGACSE).

## Where to Go Next

If you want **theoretical depth**: Hestenes & Sobczyk, then the
Doran-Lasenby book.

If you want **graphics applications**: Dorst-Fontijne-Mann.

If you want **physics applications**: *Geometric Algebra for
Physicists*, then the GTG paper.

If you want **robotics**: gafro library + Dorst-Fontijne-Mann.

If you just want to **build intuition**: bivector.net + sudgylacmoe
videos + the `clifford` Python library for hands-on play.

> :weightliftinggoose: This journal got you to the doorway. The
> body of GA literature is large and growing — fifty years of
> research and pedagogy. There are still open problems (efficient
> CGA implementations, GA-based numerical analysis, gauge theory
> gravity verification). It's a live field.

## Closing the Book

We started with "the cross product only works in 3D" and ended
with "translations are rotors in CGA." Along the way:

- The geometric product, defined by two axioms, generated everything.
- Multivectors, blades, and grade structure organized the algebra.
- Inner, outer, geometric products, and duality gave us four
  operations that compose into all the rest.
- Reflections, projections, and rigid motions became sandwiches.
- Rotors unified rotations across dimensions, dissolved Euler-angle
  pathologies, and absorbed quaternions and complex numbers.
- CGA extended the framework to handle translations, points,
  spheres, and rigid motions natively.

The framework is consistent, dimension-agnostic, and computationally
practical. The main barrier to wider adoption is curricular —
existing textbooks, existing courses, existing tools all favor
the fragmented prior toolkit. That's slowly changing. If you've
read this far, you're part of the change.

> :happygoose: That's the journal. Take what's useful, leave what
> isn't, and go build something with it.
