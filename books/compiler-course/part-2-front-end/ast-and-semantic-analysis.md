---
sidebar_position: 4
title: "The AST and Semantic Analysis"
---

# The AST and Semantic Analysis

> Designing the tree, then giving it meaning. We design the AST data
> structures, then do **name resolution** with scopes and symbol
> tables — answering "which declaration does each name refer to?"

The parser produces an **AST** ([Chapter 5](/compiler/part-2-front-end/parsing-and-grammars)).
This chapter designs that AST well, then begins **semantic analysis**:
the stage that checks the program *makes sense* beyond mere syntax.
We focus on **name resolution** (scope); type checking is
[Chapter 8](/compiler/part-3-types-and-ir/type-checking).

## 1. Designing the AST

The AST is the compiler's central data structure for the front end —
every later stage reads it. Design it as a tree of **node types**, one
per syntactic construct:

```
// Expressions
IntLit(value)
BoolLit(value)
Var(name)
Binary(op, left, right)         // 2 + 3
Call(callee, args)              // factorial(n)

// Statements
Let(name, type, value)          // let x = ...
Assign(name, value)             // x = ...
If(cond, then_block, else_block)
While(cond, body)
Return(value)
ExprStmt(expr)
Block(statements)

// Top level
Function(name, params, return_type, body)
Program(functions)
```

Each node carries its children and any attributes (operator, name,
literal value). In a typed language (Rust, etc.), these are an enum/
sum type; in others, a class hierarchy or tagged structs. The shape
mirrors the grammar, minus the noise (parens, intermediate
nonterminals — [Chapter 5](/compiler/part-2-front-end/parsing-and-grammars)).

## 2. Nodes carry source locations and (later) types

Every AST node should carry its **source location** (from the tokens,
[Chapter 4](/compiler/part-2-front-end/lexing)) so later stages can
report errors precisely. And nodes will gain a **type** field, filled
in by type checking ([Chapter 8](/compiler/part-3-types-and-ir/type-checking)):

```
struct Node {
    kind: NodeKind,       // Binary, Var, If, ...
    location: SourceSpan, // where in the source (for errors)
    type: Type?,          // filled in by the type checker
    ... kind-specific fields ...
}
```

The AST is *progressively annotated*: the parser fills structure +
location; the analyzer fills resolution + types. By the time IR
generation reads it ([Chapter 10](/compiler/part-3-types-and-ir/lowering-to-ir)),
every node knows its type and every name knows its declaration.

## 3. What semantic analysis checks

Syntax (parsing) ensures the program is *grammatically* valid.
**Semantic analysis** ensures it's *meaningfully* valid — things the
grammar can't express:

- **Name resolution**: every used name refers to a visible
  declaration. (`return x;` — is `x` declared and in scope?)
- **Type checking**: operations are applied to compatible types.
  (`2 + true` — error.) — [Chapter 8](/compiler/part-3-types-and-ir/type-checking).
- **Other rules**: `return` only inside functions; no duplicate
  parameter names; functions called with the right number of
  arguments; etc.

These are **context-sensitive** — they depend on the surrounding
program (what's declared where), which context-free grammars
([Chapter 5](/compiler/part-2-front-end/parsing-and-grammars)) can't
capture. That's *why* they're a separate stage after parsing.

> :nerdygoose: The grammar can't express "x must be declared before
> use" — that requires *context* (knowing what's been declared), and
> grammars are *context-free* by definition. This is the principled
> reason semantic analysis exists as its own phase: it handles exactly
> the correctness conditions that are beyond a context-free grammar's
> reach. Syntax is context-free; semantics is context-sensitive.

## 4. Scopes

A **scope** is a region of the program where a set of names is visible.
Goolang (like most languages) has **nested lexical scopes**: a function
body is a scope, each `{ }` block is a nested scope, function parameters
form a scope. Inner scopes can see outer names; a name declared in an
inner scope **shadows** an outer one of the same name and is invisible
outside.

```c
fn f(a: int) -> int {       // scope 1: a
    let b = a + 1;          // scope 1: a, b
    if b > 0 {
        let c = b * 2;      // scope 2 (nested): a, b, c
        return c;
    }                       // c out of scope here
    return b;               // a, b visible; c is not
}
```

Name resolution must respect this nesting: when resolving `c`, search
the innermost scope first, then enclosing scopes outward. (If this
sounds like the environment model of an interpreter — it is exactly
that structure, used at compile time instead of runtime.)

## 5. The symbol table

The data structure for scopes is the **symbol table**: a stack of
scopes, each mapping names to information about their declaration
(type, kind, location). The operations:

```
enter_scope()         — push a new empty scope (entering a block)
exit_scope()          — pop the current scope (leaving a block)
declare(name, info)   — add a binding to the current scope
resolve(name)         — search scopes inner→outer for the name
```

```
function resolve(name):
    for scope in scopes (innermost first):
        if name in scope:
            return scope[name]      // found the declaration
    error("undefined name", name)   // not in any enclosing scope
```

This is a chain of hash maps (one per scope), searched outward —
mirroring lexical nesting. `declare` adds to the top; `resolve`
searches down the stack. Shadowing falls out: an inner `declare`
hides an outer binding because `resolve` finds the inner one first.

## 6. The resolution pass

Name resolution is a **tree walk** over the AST, maintaining the symbol
table. Entering a scope-introducing node (function, block) pushes a
scope; declarations add bindings; uses resolve:

```
function resolve_node(node):
    match node:
        Function(name, params, _, body):
            declare(name, function_info)
            enter_scope()
            for p in params: declare(p.name, param_info)
            resolve_node(body)
            exit_scope()
        Block(stmts):
            enter_scope()
            for s in stmts: resolve_node(s)
            exit_scope()
        Let(name, _, value):
            resolve_node(value)        // resolve RHS first
            declare(name, var_info)    // then declare (so `let x = x` uses outer x)
        Var(name):
            decl = resolve(name)       // link this use to its declaration
            node.declaration = decl
        Binary(_, l, r):
            resolve_node(l); resolve_node(r)
        ... etc ...
```

The walk threads the symbol table through the tree, pushing/popping
scopes at block boundaries, declaring names, and linking each `Var` use
to its declaration. After this pass, every name use *knows* what it
refers to. Order matters: in `Let`, resolve the RHS *before* declaring
the name, so `let x = x` refers to an outer `x` (or errors), matching
most languages' semantics.

> :surprisedgoose: Name resolution at compile time uses the *exact same*
> structure as variable lookup at runtime in an interpreter — a stack
> of scope frames searched inner-to-outer. The compiler resolves names
> *once*, at compile time, recording the answer on each `Var` node, so
> the runtime doesn't have to search at all. This is a recurring
> compiler theme: do work once at compile time so it's free at runtime.
> The interpreter searches every time; the compiler searches once.

## 7. Resolution errors

The resolution pass catches a class of errors:

- **Undefined name**: `resolve` finds nothing — "undefined variable
  `foo`."
- **Use before declaration** (in languages that require it): name used
  but not yet declared in scope.
- **Duplicate declaration**: `declare` finds the name already in the
  current scope — "`x` already declared."

Each is reported with the source location ([Chapter 4](/compiler/part-2-front-end/lexing))
of the offending name. These are among the most common errors users
hit, so clear messages matter ("undefined variable `lenght` — did you
mean `length`?" with a suggestion is the gold standard).

## 8. After resolution: the annotated AST

The output of this stage is an AST where:

- Every scope boundary has been processed.
- Every name use is **linked to its declaration** (so we know `x` in
  `return x` is the parameter `x`, with its type and location).
- Resolution errors have been reported.

This resolved AST feeds **type checking**
([Chapter 8](/compiler/part-3-types-and-ir/type-checking)), which uses
the declaration links to know each name's type. Resolution and type
checking are sometimes one combined pass; we separate them for clarity.
Together they complete the front end's "understanding" of the program —
after them, the AST is fully meaningful and ready to lower to IR.

> :weightliftinggoose: Design your AST cleanly (one node type per
> construct, with location and a type slot), then resolve names with a
> scope stack (symbol table) walked over the tree. The key operations —
> enter/exit scope, declare, resolve-inner-to-outer — are the same
> ones you'd use for an interpreter's environment, run at compile time.
> After this pass, every name knows its declaration, and the tree is
> ready for type checking. The front end is nearly done.

## What we covered

- Design the **AST** as one node type per construct (expressions,
  statements, top-level), mirroring the grammar minus noise.
- Nodes carry **source location** (for errors) and a **type** slot
  (filled by type checking) — the AST is progressively annotated.
- **Semantic analysis** checks context-sensitive correctness the
  grammar can't (name resolution, types, misc rules).
- **Scopes**: nested lexical regions; inner scopes see outer names and
  **shadow** them.
- The **symbol table**: a stack of scopes (hash maps), with
  enter/exit/declare/resolve; `resolve` searches inner→outer.
- The **resolution pass** walks the AST, pushing/popping scopes,
  declaring names, linking each use to its declaration (resolve RHS
  before declaring in `let`).
- Compile-time resolution mirrors runtime interpreter lookup — done
  once, recorded on nodes.
- Catches undefined-name, use-before-decl, duplicate-decl errors.

## What's next

[Chapter 8](/compiler/part-3-types-and-ir/type-checking) — type
checking. Using the declaration links from resolution, we infer and
check types across the AST, catching `2 + true` and friends, and
annotating every node with its type — completing the front end.
