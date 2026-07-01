# The Goose Factor

The source for [The Goose Factor](https://the-goose-factor.netlify.app) — a
collection of books on code, mathematics, and writing. The site is built using
[Docusaurus](https://docusaurus.io/), a modern static website generator. Each
book lives under `books/` and is registered in the `books` array in
`docusaurus.config.ts` (the single source of truth for the list below).

## Books

Each book is a separate Docusaurus docs instance. Links point to the live site;
the route in parentheses matches `routeBasePath` in `docusaurus.config.ts`.

| Book | Route | About |
| --- | --- | --- |
| [C++ Algorithms](https://the-goose-factor.netlify.app/book) | `/book` | Modern C++ (C++20/23) data structures and algorithms. Working draft. |
| [Embedded C++/Rust](https://the-goose-factor.netlify.app/embedded-book) | `/embedded-book` | Embedded development with side-by-side C++ and Rust implementations on the same hardware. |
| [Systems Interview](https://the-goose-factor.netlify.app/systems-interview) | `/systems-interview` | Embedded systems interview prep across C, modern C++ (17/20/23), and Rust (`no_std`). |
| [Math Basics](https://the-goose-factor.netlify.app/math) | `/math` | The math behind algorithms — discrete math, real numbers, calculus, modular arithmetic, combinatorics, probability, graph theory, and linear algebra. All eight topics drafted. |
| [Physics Basics](https://the-goose-factor.netlify.app/physics) | `/physics` | Physics through a computational lens. Six topic areas outlined; chapters are early works in progress. |
| [Sci-Fi Novel (*Flyway*)](https://the-goose-factor.netlify.app/scifi) | `/scifi` | *Flyway* — a grounded techno-mythic novel of edge habitats and memory-carrying geese. |
| [Poems](https://the-goose-factor.netlify.app/poems) | `/poems` | A small, growing collection of poems. |
| [GooseOS](https://the-goose-factor.netlify.app/goose-os) | `/goose-os` | A build log of a RISC-V operating system written from scratch in Rust. |
| [Geometric Algebra](https://the-goose-factor.netlify.app/geometric-algebra) | `/geometric-algebra` | A study journal unifying linear algebra's scattered tools under the geometric product. |
| [OS Compared](https://the-goose-factor.netlify.app/os-compared) | `/os-compared` | Linux vs seL4 vs GooseOS, design decision by design decision. Detailed outline in place; chapters not yet written. |
| [C Algorithms](https://the-goose-factor.netlify.app/c-book) | `/c-book` | Classical algorithms and data structures in C (academic edition). Living manuscript. |
| [Physics through GA](https://the-goose-factor.netlify.app/physics-ga) | `/physics-ga` | Classical and quantum physics reformulated with geometric algebra, following Doran & Lasenby. |
| [AI through GA](https://the-goose-factor.netlify.app/ai-ga) | `/ai-ga` | An R&D notebook on geometric algebra in deep learning — equivariant and Clifford/multivector networks. |
| [Physics Universitam](https://the-goose-factor.netlify.app/physics-universitam) | `/physics-universitam` | University-style physics (kinematics, dynamics, gravitation, Kepler). Early work in progress. |
| [Lisp Course](https://the-goose-factor.netlify.app/lisp) | `/lisp` | Lisp built from a single idea — code as data — from scratch. |
| [Build Your Own Compiler](https://the-goose-factor.netlify.app/compiler) | `/compiler` | The full compiler pipeline, stage by stage. |
| [The Rust Book](https://the-goose-factor.netlify.app/rust) | `/rust` | A from-scratch Rust course organized around ownership. Full chapter set drafted. |
| [Databases from Scratch](https://the-goose-factor.netlify.app/database) | `/database` | Build a database engine from bytes on disk up: B-trees, buffer pool, query planner, transactions, WAL, and distribution. |
| [Garust](https://the-goose-factor.netlify.app/garust) | `/garust` | Geometric algebra from the foundations up, built into `garust`, a zero-dependency Rust GA engine. |
| [Rust Algorithms](https://the-goose-factor.netlify.app/rust-book) | `/rust-book` | Algorithms and data structures in Rust. Foundations only so far (introduction chapter). |
| [FPGA for GA Coprocessor](https://the-goose-factor.netlify.app/fpga-ga) | `/fpga-ga` | FPGA programming to accelerate geometric algebra alongside a Rust host. Skeleton with one starter chapter per part. |

## Installation

```bash
yarn
```

## Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

Using SSH:

```bash
USE_SSH=true yarn deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
