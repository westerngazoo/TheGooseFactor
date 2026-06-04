---
sidebar_position: 1
title: "Type Checking"
---

# Type Checking

> Catching `2 + true` before it runs. Using the declaration links from
> name resolution, the type checker infers and verifies types across
> the AST, annotating every node and rejecting ill-typed programs.

**Type checking** is the semantic-analysis stage that verifies
operations are applied to compatible types. It uses the resolved AST
([Chapter 7](/compiler/part-2-front-end/ast-and-semantic-analysis)) —
where each name links to its declaration — to know every value's type,
and checks the program is consistent. This completes the front end.

## 1. What a type is, to a compiler

A **type** classifies values and the operations valid on them. For
Goolang: `int`, `bool`, and function types like `(int) -> int`. The
type checker assigns a type to every expression and verifies:

- Operators get operands of the right type (`+` wants two `int`s).
- Assignments match (`let x: int = ...` wants an `int` RHS).
- Function calls match the signature (right argument types and count).
- `if`/`while` conditions are `bool`.
- `return` matches the function's declared return type.

Types are a *static* (compile-time) approximation of what values can
appear, letting the compiler reject whole classes of errors before the
program ever runs.

## 2. The typing rules

Type checking implements **typing rules** — one per construct — stating
how to compute a node's type from its children's types. Written
informally:

- A literal `42` has type `int`; `true` has type `bool`.
- A variable has the type recorded at its declaration (via the
  resolution link).
- `e1 + e2`: if `e1 : int` and `e2 : int`, then `e1 + e2 : int`; else
  error.
- `e1 == e2`: if `e1` and `e2` have the same type, then `: bool`; else
  error.
- `f(args)`: if `f : (T1, ..., Tn) -> R` and each `arg_i : Ti`, then
  `f(args) : R`; else error.
- `if cond { ... }`: `cond` must be `bool`.

These rules are typically written as **inference rules** in PL theory
("if the premises above the line hold, the conclusion below holds"),
but in code they're just a recursive function computing types.

> :nerdygoose: Typing rules have a beautiful formal notation —
> inference rules with premises over a line and a conclusion under it,
> like $\frac{\Gamma \vdash e_1 : \text{int} \quad \Gamma \vdash e_2 :
> \text{int}}{\Gamma \vdash e_1 + e_2 : \text{int}}$. The $\Gamma$
> ("gamma") is the *typing context* — the map from names to types, i.e.
> our symbol table. Reading "$\Gamma \vdash e : T$" as "in context
> gamma, expression e has type T," the whole type system is a set of
> these rules. Your type-checker code is a direct transcription of
> them, just as the parser transcribed the grammar.

## 3. The type-checking pass

Type checking is another **tree walk** (like resolution,
[Chapter 7](/compiler/part-2-front-end/ast-and-semantic-analysis)),
computing each node's type bottom-up and checking consistency:

```
function type_of(node) -> Type:
    match node:
        IntLit(_):   node.type = INT;  return INT
        BoolLit(_):  node.type = BOOL; return BOOL
        Var(name):
            t = node.declaration.type   // from resolution
            node.type = t; return t
        Binary(op, l, r):
            tl = type_of(l)
            tr = type_of(r)
            t = check_binary(op, tl, tr)   // rule for this operator
            node.type = t; return t
        Call(callee, args):
            sig = type_of(callee)          // a function type
            check_arity_and_types(sig, args)
            node.type = sig.return_type; return sig.return_type
        If(cond, then, els):
            require(type_of(cond) == BOOL, "condition must be bool")
            type_of(then); type_of(els)
            ...
```

`check_binary` encodes the operator rules: `+ - * /` require two
`int`s and yield `int`; comparisons require matching operands and yield
`bool`; etc. Each node gets its `type` field filled in — the AST is now
fully type-annotated, which IR generation
([Chapter 10](/compiler/part-3-types-and-ir/lowering-to-ir)) relies on.

## 4. Type errors

When a rule's premises fail, the checker reports a **type error** with
the source location:

```c
let x = 2 + true;     // error: cannot add int and bool
if 5 { ... }          // error: condition must be bool, found int
factorial(true);      // error: argument 1 has type bool, expected int
return;               // error: function returns int, but no value given
```

Good type errors say *what* types were involved and *where* — "expected
`int`, found `bool`, at line 8" — and ideally *why*. Type errors are
among the most valuable things a compiler does: they catch real bugs at
compile time that would otherwise be runtime crashes or silent
corruption.

## 5. Type inference (a glimpse)

Goolang requires type annotations (`n: int`), so the checker mostly
*verifies* declared types. But many languages **infer** types — you
write `let x = 2 + 3` and the compiler deduces `x : int` without an
annotation.

Simple inference (like ours) is local: compute the RHS type, assign it
to the variable. Powerful inference (ML, Haskell, Rust) uses
**Hindley-Milner** type inference: generate type *variables* and
*constraints* from the program, then **unify** the constraints to solve
for concrete types — inferring even polymorphic types with no
annotations. That's a deeper topic (see
[further reading](/compiler/appendix/further-reading)); for Goolang,
local inference of `let` suffices.

> :surprisedgoose: Hindley-Milner inference can take a completely
> unannotated functional program and deduce the most general type of
> every expression — including generics — and it's *decidable* and
> efficient. `let id = fn(x) { x }` infers `id : forall a. (a) -> a`
> with no hints. This 1970s algorithm is why ML, Haskell, OCaml, and
> increasingly Rust/Swift let you omit most type annotations while
> staying fully statically typed. It feels like the compiler reads
> your mind; it's really just constraint solving (unification).

## 6. Static vs dynamic typing

A design axis worth placing:

- **Static typing** (Goolang, C, Rust, Java): types checked at compile
  time. Catches type errors before running; types are erased or used
  for codegen. The type checker is this whole chapter.
- **Dynamic typing** (Python, JavaScript, Lisp): types checked at
  *runtime*; values carry their type, operations check it as they
  execute. No compile-time type checker (or an optional one); type
  errors surface as runtime exceptions.

Static typing front-loads error detection (compile time) for safety
and speed (the compiler can use types to generate better code, omit
runtime checks). Dynamic typing trades that for flexibility and
simplicity. Many languages now blend them (gradual typing,
TypeScript). For a *compiler*, static types are also an optimization
input — knowing `x` is an `int` lets codegen emit integer instructions
directly.

## 7. Types drive code generation

Beyond catching errors, types **inform the back end**. The type
checker's annotations tell codegen:

- **Which operation to emit**: `a + b` on `int`s → integer add; on
  floats → float add; on strings → concatenation. Same syntax,
  different instructions, chosen by type.
- **How much memory**: an `int` is 8 bytes, a `bool` 1 byte; layout
  and register choices depend on type.
- **Calling conventions**: argument types determine how they're passed
  ([Chapter 19](/compiler/part-5-back-end/targeting-real-machines)).

So type checking isn't only a gatekeeper — it produces the type
annotations that later stages *need* to generate correct, efficient
code. This is why we run it before IR generation: the IR is built from
typed nodes.

## 8. Completing the front end

With type checking done, the **front end is complete**. We have:

1. **Lexer** ([Ch 4](/compiler/part-2-front-end/lexing)): text →
   tokens.
2. **Parser** ([Ch 5–6](/compiler/part-2-front-end/parsing-and-grammars)):
   tokens → AST.
3. **Resolver** ([Ch 7](/compiler/part-2-front-end/ast-and-semantic-analysis)):
   names → declarations.
4. **Type checker** (this chapter): AST → typed, verified AST.

The output is a **fully analyzed AST**: syntactically valid,
names resolved, types checked and annotated, all errors reported. This
is the clean, meaningful representation the back end consumes. The next
stage ([Chapter 9](/compiler/part-3-types-and-ir/intermediate-representation))
lowers it to IR, beginning the journey to machine code.

> :weightliftinggoose: The type checker is a tree walk that computes
> each node's type bottom-up and verifies the typing rules (operands
> match operators, conditions are bool, calls match signatures). Its
> two products: **error reports** (catching bugs at compile time) and
> **type annotations** (which the back end needs to pick the right
> instructions). Transcribe the typing rules into a recursive
> `type_of` function, just as you transcribed the grammar into the
> parser. With this done, the front end is finished — and you turn to
> the back end.

## What we covered

- A **type** classifies values and valid operations; the checker
  assigns a type to every expression and verifies consistency.
- **Typing rules** (one per construct) compute a node's type from its
  children's — formally inference rules over a context $\Gamma$ (the
  symbol table).
- The **type-checking pass** is a tree walk computing types bottom-up
  and annotating each node's `type` field.
- **Type errors** (`2 + true`, non-bool conditions, arity/type
  mismatches) reported with locations.
- **Type inference**: local (Goolang's `let`) vs Hindley-Milner
  (constraint generation + unification, full inference).
- **Static vs dynamic** typing: compile-time vs runtime checking.
- Types **drive codegen** (which instruction, how much memory, calling
  convention) — not just error-catching.
- This **completes the front end**: a fully analyzed, typed AST.

## What's next

[Chapter 9](/compiler/part-3-types-and-ir/intermediate-representation) —
intermediate representation. We design the IR: why compilers use a
middle representation, what three-address code and SSA look like, and
how the IR decouples the front end from the back end.
