---
sidebar_position: 3
title: "Building a Real Project"
---

# Building a Real Project

> From REPL snippets to a structured program: files, modules,
> dependencies, and tests. Turning Lisp knowledge into a shippable
> thing.

The REPL ([Chapter 22](/lisp/part-6-practical/the-repl-workflow)) is
where you *develop*, but real software lives in files, uses libraries,
and has tests. This chapter bridges from interactive snippets to a
structured project. We'll keep it dialect-aware but practical.

## 1. From the REPL to files

REPL exploration is great for *discovering* a design, but you persist
your code in **source files** (`.scm`, `.rkt`, `.lisp`, `.clj`). The
workflow:

1. Explore and prototype at the REPL.
2. As functions stabilize, move them into a source file.
3. Keep developing by *loading the file into the REPL* and continuing
   interactively — edit the file, re-send changed functions
   ([Chapter 22](/lisp/part-6-practical/the-repl-workflow)).

The file is the durable artifact; the REPL is the live workspace
connected to it. You don't choose one — you use both together: the
file holds the code, the REPL runs and tests it as you edit.

## 2. Project structure

A typical Lisp project has a conventional shape (varies by dialect):

```
my-project/
├── src/            ; source files
│   ├── core.lisp
│   └── utils.lisp
├── tests/          ; test files
│   └── core-test.lisp
├── <project file>  ; dependency/build spec (see below)
└── README.md
```

The **project/dependency file** declares the project and its libraries:

- **Common Lisp**: an **ASDF** system definition (`my-project.asd`)
  lists components and dependencies; **Quicklisp** fetches libraries.
- **Racket**: an `info.rkt` for packages; `raco pkg` manages
  dependencies.
- **Clojure**: a `deps.edn` (or `project.clj` for Leiningen) declares
  dependencies; the Clojure CLI or Leiningen builds.

These play the role of `package.json` / `Cargo.toml` / `pom.xml` in
other ecosystems: declare what your project is and what it depends on,
let the tool fetch and build.

## 3. Modules and namespaces

As projects grow, you organize code into **modules/namespaces** to
avoid name clashes and clarify structure:

- **Common Lisp**: **packages** (`defpackage`, `in-package`) — a
  package is a namespace of symbols. You `:export` the public API and
  `:use` other packages.
- **Racket/Scheme**: **modules** (`#lang racket`, `(provide ...)`,
  `(require ...)`) — each file is a module exporting selected
  bindings.
- **Clojure**: **namespaces** (`(ns my.project.core (:require ...))`)
  — one namespace per file, with explicit requires.

The common idea: each unit declares what it **provides** (its public
API) and what it **requires** (its dependencies). This is standard
modular programming; the syntax differs but the concept is universal.

```clojure
;; Clojure example
(ns my-project.core
  (:require [my-project.utils :as utils]
            [clojure.string :as str]))

(defn process [data]
  (utils/clean (str/trim data)))
```

## 4. Using libraries

You rarely build from scratch — you stand on libraries. Finding and
using them:

- **Common Lisp**: **Quicklisp** is the de-facto package manager.
  `(ql:quickload "library-name")` fetches and loads. Thousands of
  libraries (web — Hunchentoot, JSON, DB, etc.).
- **Racket**: the package catalog (pkgs.racket-lang.org); `raco pkg
  install`. Racket ships batteries-included, so you often need few
  externals.
- **Clojure**: Maven/Clojars via `deps.edn`. Full access to the *Java*
  ecosystem too — any JVM library is usable. This is a major Clojure
  advantage.

Declare the dependency in your project file, require it in your
namespace, call its functions. The same pattern as any modern
language's package management.

## 5. A worked mini-project: a JSON-ish config reader

To make it concrete, sketch a small project: read a config
(association-list format), validate it, and query it. The pieces:

```lisp
;; src/config.lisp  (Common-Lisp-flavored sketch)

;; Parse: read a config file's S-expression into an alist
(defun load-config (path)
  (with-open-file (stream path)
    (read stream)))         ; the reader parses S-expressions for free!

;; Query: look up a key with a default
(defun config-get (config key &optional default)
  (let ((pair (assoc key config)))
    (if pair (cdr pair) default)))

;; Validate: ensure required keys are present
(defun validate-config (config required-keys)
  (every (lambda (k) (assoc k config)) required-keys))
```

A config file is just an S-expression:

```lisp
;; config.lisp (the data file)
((host . "localhost")
 (port . 8080)
 (debug . t))
```

Note the payoff: **the reader parses the config for free**
([Chapter 2](/lisp/part-1-core-idea/s-expressions)) — `read` turns the
file into an alist ([Chapter 3](/lisp/part-1-core-idea/atoms-lists-cons)),
no parser needed. Using S-expressions as a data format (instead of
JSON/YAML) means your config language is *already parsed* by Lisp.
This is a classic Lisp trick: data files in S-expression syntax are
free to read.

## 6. Testing

Real projects have tests. Each dialect has frameworks:

- **Common Lisp**: **FiveAM**, **Prove**, others. `(test my-feature
  (is (= 4 (add 2 2))))`.
- **Racket**: **RackUnit** built in. `(check-equal? (add 2 2) 4)`.
- **Clojure**: **clojure.test** built in. `(deftest add-test (is (=
  4 (add 2 2))))`.

These testing DSLs are themselves built with **macros**
([Chapter 16](/lisp/part-4-macros/building-a-dsl)) — `deftest`, `is`,
`check-equal?` are macros that expand into test-runner calls. Writing
tests, you're using a DSL someone grew into the language.

```clojure
;; tests/core_test.clj
(ns my-project.core-test
  (:require [clojure.test :refer :all]
            [my-project.core :refer :all]))

(deftest process-test
  (is (= "hello" (process "  hello  "))))
```

The REPL-driven style applies to tests too: run a single test at the
prompt, get instant feedback, iterate.

## 7. Building and deploying

Turning the project into something runnable/shippable:

- **Common Lisp**: SBCL can **dump an image** — save the entire
  running Lisp (your code + state) as an executable. Fast startup,
  self-contained.
- **Racket**: `raco exe` compiles to a standalone executable;
  `raco distribute` bundles it.
- **Clojure**: build an **uberjar** (a self-contained JVM jar) with
  `tools.build` or Leiningen; or compile to a native image with
  GraalVM for fast startup.

Each ecosystem can produce a deployable artifact. Image dumping (CL)
and uberjars (Clojure) are the common routes to "a thing you can run
on a server."

## 8. The bottom-up Lisp design style

A philosophical note on *how* Lispers build projects. The classic Lisp
approach is **bottom-up**: instead of designing a rigid top-down
architecture first, you build small, general, reusable functions at
the REPL, then combine them into larger capabilities, growing the
language toward your problem
([Chapters 1](/lisp/part-1-core-idea/why-lisp),
[16](/lisp/part-4-macros/building-a-dsl)).

You write utility functions, test them live, find the right
abstractions through experimentation, and assemble the application
from these well-tested pieces. Macros and DSLs let you raise the
language to meet the domain. The program and the language it's written
in grow together. This bottom-up, REPL-driven, language-extending
style is the Lisp way — and it's why Lispers often build flexible
systems remarkably fast.

> :weightliftinggoose: The jump from "REPL snippets" to "real project"
> is mostly mundane infrastructure — files, a dependency manager,
> namespaces, tests — the same in any language, with Lisp-flavored
> tools (ASDF/Quicklisp, deps.edn, RackUnit). The *Lisp-specific* wins
> are real though: S-expression config files parse for free, testing
> DSLs are macros, image-based deployment, and the bottom-up
> REPL-driven design style. Build one real thing — a CLI tool, a tiny
> web service, a parser — and the course's ideas become working
> software.

## What we covered

- Develop at the **REPL**, persist in **source files**, then load
  files into the REPL and keep developing interactively.
- Project structure: `src/`, `tests/`, a **dependency/build file**
  (ASDF/Quicklisp for CL, `info.rkt` for Racket, `deps.edn` for
  Clojure).
- **Modules/namespaces** (CL packages, Racket modules, Clojure
  namespaces): declare what you *provide* and *require*.
- **Libraries** via package managers (Quicklisp, raco, Maven/Clojars);
  Clojure adds the whole JVM ecosystem.
- S-expression **config files parse for free** with `read` — a classic
  Lisp data-format trick.
- **Testing** frameworks (FiveAM, RackUnit, clojure.test) are macro
  DSLs; REPL-driven testing applies.
- **Deployment**: CL image dumps, Racket `raco exe`, Clojure uberjars
  / GraalVM native images.
- The **bottom-up, REPL-driven, language-extending** Lisp design
  style.

## What's next

[Chapter 24](/lisp/part-6-practical/where-to-go-next) — where to go
next. The course's send-off: the canonical books and resources, the
deeper topics we didn't cover, and how to keep growing as a Lisp
programmer.
