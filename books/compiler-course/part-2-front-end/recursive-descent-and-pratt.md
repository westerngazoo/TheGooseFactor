---
sidebar_position: 3
title: "Recursive Descent and Pratt Parsing"
---

# Recursive Descent and Pratt Parsing

> Building the parser. Recursive descent for statements (each grammar
> rule becomes a function), and Pratt parsing for expressions (the
> cleanest way to handle operator precedence by hand).

We have a grammar ([Chapter 5](/compiler/part-2-front-end/parsing-and-grammars)).
Now we build the parser. Two techniques combine: **recursive descent**
for the structured parts (statements, declarations) and **Pratt
parsing** for expressions (precedence). Both are hand-written,
debuggable, and produce great errors.

## 1. The parser's interface

A recursive-descent parser maintains a position in the token stream
and offers small helpers:

```
current token:  peek()        — look at the current token (no consume)
consume:        advance()     — return current, move to next
match:          check(kind)   — is current token this kind?
expect:         expect(kind)  — consume if matches, else error
```

Every parse function uses these to inspect and consume tokens, building
AST nodes as it goes. The position advances monotonically — no
backtracking in a clean LL(1) grammar.

## 2. Recursive descent: rule = function

The core idea ([Chapter 5 §8](/compiler/part-2-front-end/parsing-and-grammars)):
**each grammar nonterminal becomes a parse function**, and the
function body mirrors the production. For Goolang statements:

```
function parse_statement():
    if check(LET):     return parse_let()
    if check(IF):      return parse_if()
    if check(WHILE):   return parse_while()
    if check(RETURN):  return parse_return()
    return parse_expr_statement()

function parse_let():        // letStmt = "let" IDENT "=" expr ";"
    expect(LET)
    name = expect(IDENT)
    expect(EQ)
    value = parse_expr()
    expect(SEMI)
    return LetNode(name, value)

function parse_if():         // ifStmt = "if" expr block ("else" block)?
    expect(IF)
    cond = parse_expr()
    then_block = parse_block()
    else_block = null
    if check(ELSE):
        advance()
        else_block = parse_block()
    return IfNode(cond, then_block, else_block)
```

Read `parse_let` against its grammar rule — they're line-for-line. The
"recursive" in recursive descent: `parse_if` calls `parse_expr` and
`parse_block`, which call other parse functions, mirroring the
grammar's recursion. The call stack tracks the nesting (the "pushdown"
of the pushdown automaton, [Chapter 5](/compiler/part-2-front-end/parsing-and-grammars)).

## 3. Parsing blocks and programs

The top levels follow the same pattern:

```
function parse_block():      // block = "{" statement* "}"
    expect(LBRACE)
    statements = []
    while not check(RBRACE) and not check(EOF):
        statements.add(parse_statement())
    expect(RBRACE)
    return BlockNode(statements)

function parse_program():    // program = function*
    functions = []
    while not check(EOF):
        functions.add(parse_function())
    return ProgramNode(functions)
```

The `*` in the grammar (`statement*`, `function*`) becomes a `while`
loop. The `?` (optional `else`) became an `if`. EBNF operators map to
control flow. This mechanical correspondence is recursive descent's
charm.

> :nerdygoose: Recursive descent is the most-used parsing technique in
> real-world compilers — GCC, Clang, Roslyn (C#), TypeScript, Rust's
> parser, and most hand-written compilers use it. Despite parser
> *generators* (yacc/bison/ANTLR) being more theoretically powerful,
> production teams overwhelmingly hand-write recursive-descent parsers
> because they're debuggable, produce excellent error messages, and
> give full control. Theory favors LR; practice favors recursive
> descent.

## 4. The expression problem

Statements are easy because their structure is signaled by leading
keywords (`if`, `while`, `let`). Expressions are harder: `2 + 3 * 4 -
1` has no keywords, and the parser must handle **precedence** (`*`
before `+`) and **associativity** (`-` left-associative).

The grammar-structuring approach from
[Chapter 5](/compiler/part-2-front-end/parsing-and-grammars)
(`expr`/`term`/`factor` levels) *works* but gets unwieldy with many
precedence levels (real languages have 15+). Writing a function per
level — `parse_expr` → `parse_term` → `parse_factor` → ... — is verbose
and rigid. There's a cleaner way: **Pratt parsing**.

## 5. Pratt parsing: precedence as numbers

**Pratt parsing** (or "top-down operator precedence," Vaughan Pratt
1973) handles expressions with *one* function plus a table of
precedence levels. The idea: each operator has a **binding power**
(precedence number); the parser uses these numbers to decide how to
group, instead of separate grammar rules per level.

```
binding power:
    == !=     →  10
    < > <= >= →  20
    + -       →  30
    * /       →  40
```

Higher number = binds tighter. The core algorithm:

```
function parse_expr(min_bp):
    left = parse_atom()               // a number, ident, or (expr)
    while true:
        op = peek()
        if not is_binary_op(op):  break
        bp = binding_power(op)
        if bp < min_bp:  break        // operator binds too loosely; stop
        advance()                     // consume the operator
        right = parse_expr(bp + 1)    // parse RHS with higher min_bp
        left = BinaryNode(op, left, right)
    return left
```

Call it with `parse_expr(0)` to parse a full expression. The
`min_bp` parameter — the minimum binding power this call will accept —
is what enforces precedence: when parsing the right side of a `+`, we
demand binding power `> 30`, so `*` (40) gets grabbed into the right
operand but another `+` (30) doesn't, leaving it for the outer loop.

## 6. Pratt parsing, traced

Parse `2 + 3 * 4` with `parse_expr(0)`:

1. `parse_atom()` → `2`. `left = 2`.
2. See `+` (bp 30) ≥ min_bp 0. Consume. Parse RHS with `min_bp = 31`.
   - `parse_atom()` → `3`. `left = 3`.
   - See `*` (bp 40) ≥ 31. Consume. Parse RHS with `min_bp = 41`.
     - `parse_atom()` → `4`. No more ops ≥ 41. Return `4`.
   - `left = Mul(3, 4)`. No more ops ≥ 31. Return `Mul(3,4)`.
   - Back in the outer call: `left = Add(2, Mul(3,4))`.
3. No more ops. Return `Add(2, Mul(3, 4))`.

The result `Add(2, Mul(3,4))` correctly groups `*` tighter than `+`.
The binding-power numbers did all the work — no per-level grammar
functions. **Associativity** falls out too: for left-associative `-`,
recurse with `bp + 1` (so a second `-` at the same level isn't grabbed,
staying left-grouped); for right-associative (like `^` or `=`), recurse
with `bp` (grabbing same-level operators rightward).

> :surprisedgoose: Pratt parsing feels like magic the first time —
> *one* function with a precedence table handles arbitrarily many
> operators and precedence levels, where the grammar-per-level approach
> needed a function per level. The `min_bp` threshold is the whole
> trick: "only grab operators that bind at least this tightly." It's
> used in real parsers everywhere (Rust's, many JavaScript engines)
> precisely because adding an operator is just adding a table row, not
> restructuring the grammar.

## 7. Combining the two

The full parser combines them: **recursive descent** for statements,
declarations, blocks (keyword-led, structural) and **Pratt** for
expressions (precedence). `parse_statement` calls `parse_expr(0)`
wherever an expression appears (in `let`, `if` conditions, `return`,
etc.). The two techniques compose seamlessly — recursive descent for
the outer structure, Pratt for the expression leaves.

```
parse_program
  → parse_function (recursive descent)
      → parse_block (recursive descent)
          → parse_statement (recursive descent)
              → parse_expr(0) (Pratt) ── for the expressions
```

## 8. Error recovery

A production parser doesn't stop at the first error — it **recovers**
and continues, to report multiple errors per run. The common technique
is **panic-mode recovery**: on an error, skip tokens until a
"synchronization point" (like a `;` or `}` or the start of the next
statement), then resume parsing. This avoids a cascade of spurious
errors from one mistake.

```
function synchronize():
    while not check(EOF):
        if previous() == SEMI:  return    // statement boundary
        if check(IF) or check(WHILE) or ...:  return   // statement start
        advance()
```

Good error recovery is what lets a compiler say "you have 3 errors"
instead of giving up after the first. It's fiddly but important for
usability. Combined with the source locations from the lexer
([Chapter 4](/compiler/part-2-front-end/lexing)), it produces the
helpful, multi-error output users expect.

> :weightliftinggoose: Build the parser in two layers: recursive
> descent (transcribe each grammar rule to a function) for the
> statement/declaration structure, and a single Pratt function with a
> precedence table for expressions. The Pratt approach scales to any
> number of operators — adding one is a table row. Add panic-mode
> recovery so one error doesn't abort the whole parse. The output is
> the AST, which the next chapter analyzes.

## What we covered

- The parser interface: `peek`, `advance`, `check`, `expect` over the
  token stream.
- **Recursive descent**: each grammar nonterminal → a parse function;
  the body mirrors the production; EBNF `*`→loop, `?`→if. The call
  stack tracks nesting.
- It's the most-used technique in real compilers (Clang, Rust, TS) —
  debuggable, great errors.
- **The expression problem**: precedence and associativity without
  keyword signals.
- **Pratt parsing**: assign each operator a **binding power**; one
  `parse_expr(min_bp)` function uses the numbers to group correctly —
  scales to any number of operators.
- Associativity via `bp+1` (left) vs `bp` (right) on the recursive
  call.
- **Combine**: recursive descent for structure, Pratt for expressions.
- **Panic-mode error recovery**: skip to a sync point (`;`, `}`,
  statement start) to report multiple errors.

## What's next

[Chapter 7](/compiler/part-2-front-end/ast-and-semantic-analysis) — the
AST and semantic analysis. We design the AST data structures, then do
**name resolution** (which declaration does each name refer to?) and
set up the scope/symbol-table machinery — the bridge to type checking.
