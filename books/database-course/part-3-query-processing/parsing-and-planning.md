---
sidebar_position: 2
title: "Parsing and Planning"
---

# Parsing and Planning

> From text to a plan. The first stage of query processing turns raw SQL
> **text** into a structured **syntax tree**, checks it against the schema
> (does this table exist? is this column the right type?), and translates
> it into a **logical query plan** — a tree of relational-algebra
> operators that the optimizer will then reshape.

[Chapter 8](/database/part-3-query-processing/relational-model-and-sql)
gave us SQL and the algebra it maps to. This chapter is the machinery that
*does* the mapping: parsing, semantic analysis, and logical planning. It's
the front end of the query layer — and if you've read about compilers, it
will feel familiar, because a query engine *is* a little compiler for SQL.

## 1. The query is compiled

A query engine compiles SQL much like a programming-language compiler
compiles code:

```
SQL text → [lexer] → tokens → [parser] → syntax tree
         → [binder/analyzer] → validated logical plan
         → [optimizer] → physical plan → [executor] → results
```

The parallel is exact: lexing, parsing, semantic analysis, an
intermediate representation (the logical plan ≈ the algebra), optimization,
and execution. The difference is the "source language" is SQL and the
"target" is operations on the storage engine. Keeping the compiler analogy
in mind makes this whole part click.

## 2. Lexing and parsing

**Lexing** breaks the SQL string into **tokens**: keywords (`SELECT`,
`FROM`), identifiers (`users`, `name`), literals (`42`, `'Berlin'`),
operators (`=`, `>`), punctuation. **Parsing** then matches the token
stream against SQL's **grammar** to build an **abstract syntax tree**
(AST):

```
SELECT name FROM users WHERE city = 'Berlin'

        Select
        ├── projections: [ name ]
        ├── from: users
        └── where: Eq( col(city), lit('Berlin') )
```

The parser enforces **syntax**: `SELECT FROM WHERE name` is rejected
(missing the column list, malformed). A syntax error ("near 'FROM':
syntax error") comes from this stage. The output AST is a faithful tree of
*what the text says*, not yet checked for *meaning*.

## 3. Semantic analysis: binding

A syntactically valid query can still be nonsense: `SELECT age FROM users`
when `users` has no `age` column, or `WHERE name > 5` comparing text to a
number. **Semantic analysis** (binding) checks the AST against the
**catalog** (the database's schema metadata):

- **Name resolution**: do `users`, `name`, `city` exist? Bind each
  reference to the actual table/column.
- **Type checking**: are the operand types compatible (`city = 'Berlin'`
  is text = text ✓; `city > 5` is suspect)?
- **Ambiguity**: with a join, does `id` mean `users.id` or `orders.id`?
  Resolve or demand qualification.

This stage produces a **validated, resolved** query — every name bound to
a real schema object, every expression type-checked. Errors here are
"column does not exist," "ambiguous column," "type mismatch." The
**catalog** (system tables describing tables, columns, indexes, types) is
the database's self-knowledge that makes this possible.

## 4. The logical plan

The validated query is translated into a **logical query plan**: a tree of
**relational-algebra operators** ([Chapter 8](/database/part-3-query-processing/relational-model-and-sql))
describing *what* to compute, independent of *how*:

```
SELECT u.name FROM users u JOIN orders o ON o.user_id = u.id
WHERE o.total > 100

         Project[ u.name ]
              │
          Filter[ o.total > 100 ]
              │
            Join[ o.user_id = u.id ]
            /        \
        Scan[users]  Scan[orders]
```

Each node is a logical operator (project, filter, join, scan). This is the
query's **intermediate representation** — like a compiler's IR. It says
*compute this join, then this filter, then this projection*, but **not**
which join algorithm, which index, or what order — those are physical
decisions for the optimizer. The logical plan is the clean,
implementation-free statement of the query's meaning.

## 5. Logical vs physical plans

A crucial distinction the rest of Part III hinges on:

- A **logical plan** says *what* relational operations to perform (join,
  filter, project) — the algebra.
- A **physical plan** says *how* to perform each — *which* join algorithm
  (hash join? merge join?), *which* access path (index scan? sequential
  scan?), in *what* order.

```
logical:  Join[users, orders]
physical: HashJoin( IndexScan[users], SeqScan[orders] )
```

One logical plan has **many** equivalent physical plans, differing wildly
in cost. Turning the logical plan into the *cheapest* physical plan is the
**optimizer**'s job ([Chapter 10](/database/part-3-query-processing/query-optimization)).
Parsing and planning produce the logical plan; optimization chooses the
physical one.

## 6. Early rewrites and normalization

Before (and during) optimization, the planner applies **rewrites** —
transformations that produce a simpler or more canonical logical plan
without changing results:

- **Predicate normalization**: simplify `WHERE` expressions, fold
  constants (`WHERE 1 = 1` → drop), canonicalize.
- **Subquery flattening**: turn a correlated subquery into a join where
  possible (often far cheaper).
- **View expansion**: replace a view reference with its definition.
- **Projection pruning**: drop columns never used downstream so less data
  flows through.

These rewrites rely on the **algebraic equivalences** of
[Chapter 8](/database/part-3-query-processing/relational-model-and-sql) —
they're valid precisely because relational algebra has provable laws.
Rewriting straddles planning and optimization; some engines treat it as a
distinct "logical optimization" phase before the cost-based "physical
optimization."

## 7. Prepared statements and plan caching

Parsing, binding, and planning aren't free — for a query run thousands of
times, redoing them each time is waste. **Prepared statements** parse and
plan a query *once* (with placeholders for parameters) and reuse the plan:

```sql
PREPARE q AS SELECT name FROM users WHERE city = $1;
EXECUTE q('Berlin');     -- reuse the cached plan, just bind the parameter
```

Beyond speed, prepared statements are the primary defense against **SQL
injection**: parameters are bound as *values*, never spliced into the SQL
text, so user input can't become executable SQL. Engines also keep a
**plan cache** for repeated ad-hoc queries. (The catch: a cached plan
chosen for one parameter value may be poor for another with very different
selectivity — a real-world tuning gotcha called parameter-sniffing.)

## 8. The front end, assembled

Put the stage together. Parsing and planning take you from a string to a
validated logical plan:

- **Lex + parse**: text → tokens → AST (syntax checked).
- **Bind/analyze**: AST checked against the **catalog** — names resolved,
  types checked (semantics checked).
- **Plan**: produce a **logical plan** of relational-algebra operators
  (the IR), with early **rewrites** for canonical form.

This is the query compiler's front end. Its output — a clean logical plan
— is the input to the optimizer, which decides the *physical* plan, which
the executor runs. We've turned "what the user wrote" into "what the engine
should compute"; next we decide the *cheapest way* to compute it.

> :weightliftinggoose: A query engine is a **compiler for SQL**: lex →
> parse → an **AST**, then **bind** it against the **catalog** (resolve
> names, check types), then build a **logical plan** of relational-algebra
> operators. Burn in the **logical vs physical** split — *what* operations
> vs *how* (which algorithm, which index, what order) — because the
> optimizer lives in that gap. And know that **prepared statements** cache
> the plan *and* stop SQL injection by binding parameters as values. This
> front end produces the IR everything downstream optimizes and runs.

## What we covered

- A query engine **compiles SQL** like a programming-language compiler:
  lex → parse → analyze → IR → optimize → execute.
- **Lexing/parsing** turns text into tokens and an **AST**, enforcing
  **syntax**.
- **Semantic analysis (binding)** checks the AST against the **catalog**:
  resolve names, type-check, disambiguate — enforcing **meaning**.
- The result is translated into a **logical plan**: a tree of
  relational-algebra operators (the IR) saying *what*, not *how*.
- **Logical vs physical** plans: one logical plan maps to **many**
  physical plans (join algorithms, access paths, orders) — the optimizer's
  search space.
- **Rewrites** (predicate normalization, subquery flattening, view
  expansion, projection pruning) simplify the logical plan via algebraic
  laws.
- **Prepared statements** parse/plan once and reuse the plan — faster and
  the main defense against **SQL injection** (parameters bound as values).

## What's next

[Chapter 10](/database/part-3-query-processing/query-optimization) — query
optimization. Given a logical plan and its many possible physical
implementations, how does the optimizer use **cost estimates** and
**statistics** to choose a fast one — picking access paths, join
algorithms, and join order?
