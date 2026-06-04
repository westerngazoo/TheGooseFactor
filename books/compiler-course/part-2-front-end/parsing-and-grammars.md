---
sidebar_position: 2
title: "Parsing and Grammars"
---

# Parsing and Grammars

> Tokens become structure. A grammar defines what programs are valid;
> the parser builds a tree reflecting that structure. This chapter
> covers grammars, parse trees, and the parsing problem.

The **parser** takes the lexer's flat token stream and builds a
**tree** that reflects the program's grammatical structure. To do
that, we first need a precise definition of "valid program" — a
**grammar**. This chapter is grammars and the parsing problem;
[Chapter 6](/compiler/part-2-front-end/recursive-descent-and-pratt)
builds the parser.

## 1. Why we need grammars

The token stream `INT(2) PLUS INT(3) STAR INT(4)` is flat, but it has
*structure*: does it mean `(2 + 3) * 4` or `2 + (3 * 4)`? The two
group differently and compute differently (20 vs 14). The parser must
recover the intended structure — and "intended" is defined by the
language's **grammar** plus precedence rules.

A grammar is a formal specification of which token sequences are valid
programs and how they're structured. It's the spec the parser
implements.

## 2. Context-free grammars (CFGs)

Languages are defined by **context-free grammars** — a set of
**production rules**. Each rule says how a "nonterminal" (a structural
category) can be built from terminals (tokens) and other nonterminals.
A taste, for arithmetic expressions:

```
expr   → expr "+" term
       | expr "-" term
       | term
term   → term "*" factor
       | term "/" factor
       | factor
factor → "(" expr ")"
       | NUMBER
       | IDENT
```

Read `→` as "can be." An `expr` is an `expr + term`, or an `expr -
term`, or just a `term`. A `term` is a `term * factor`, etc. A `factor`
is a parenthesized expression, a number, or an identifier.

This grammar *encodes precedence and associativity*:

- `*`/`/` are in `term`, "below" `+`/`-` in `expr` → multiplication
  **binds tighter** (it's deeper in the tree).
- The left-recursive form (`expr → expr + term`) makes `+`
  **left-associative** (`1 - 2 - 3` = `(1-2)-3`).

The grammar's *shape* determines how expressions group. This is the
key insight: precedence isn't a separate rule bolted on — it's built
into the grammar's structure.

> :nerdygoose: "Context-free" means a nonterminal's expansion doesn't
> depend on its surroundings — `expr` expands the same way everywhere.
> This is more powerful than the regular languages of lexing
> ([Chapter 4](/compiler/part-2-front-end/lexing)) because CFGs can
> express **nesting** (balanced parentheses, arbitrarily deep) — which
> finite automata can't (they can't count). CFGs are recognized by
> **pushdown automata** (a finite automaton + a stack), and the stack
> is exactly what tracks nesting depth. The Chomsky hierarchy in
> action.

## 3. Parse trees vs ASTs

Applying the grammar to a token stream produces a **parse tree** (or
"concrete syntax tree") — every grammar rule used becomes a node:

```
            expr
          /  |   \
       term  *   factor   ← wait, this isn't quite right; see below
```

The full parse tree for `2 + 3 * 4` includes every nonterminal
(`expr`, `term`, `factor`) the grammar passed through — it's verbose,
mirroring the grammar exactly. We rarely want that. Instead we build
an **abstract syntax tree** (AST), which keeps only the essential
structure:

```
parse tree:  expr → expr(term→factor→2) + term(term→factor→3 * factor→4)
AST:         Add(2, Mul(3, 4))
```

The AST drops the intermediate `expr`/`term`/`factor` nodes and keeps
just the operations and operands. It's what the rest of the compiler
works with ([Chapter 7](/compiler/part-2-front-end/ast-and-semantic-analysis)).
The parser conceptually follows the grammar (parse tree) but *builds*
the AST directly, skipping the verbose intermediate nodes.

## 4. EBNF: a practical grammar notation

In practice we write grammars in **EBNF** (Extended BNF), which adds
convenient operators: `*` (zero or more), `+` (one or more), `?`
(optional), `|` (alternative), `()` (grouping). Goolang's grammar in
EBNF (excerpt):

```ebnf
program    = function* ;
function   = "fn" IDENT "(" params? ")" "->" type block ;
params     = param ("," param)* ;
param      = IDENT ":" type ;
block      = "{" statement* "}" ;
statement  = letStmt | ifStmt | whileStmt | returnStmt | exprStmt ;
letStmt    = "let" IDENT "=" expr ";" ;
ifStmt     = "if" expr block ("else" block)? ;
whileStmt  = "while" expr block ;
returnStmt = "return" expr ";" ;
expr       = ... (precedence-structured, as in §2) ;
```

This reads cleanly: a program is zero or more functions; a function is
`fn name(params) -> type { ... }`; a block is `{ statements }`; and so
on. EBNF is the standard way to *document* a language's syntax and the
blueprint the parser follows.

## 5. The parsing problem

Given a grammar and a token stream, **parsing** answers: is this token
stream a valid program, and if so, what's its structure (tree)?

Two broad strategies:

- **Top-down**: start from the top rule (`program`) and try to match
  the input, expanding rules as you go. Builds the tree from the root
  down. **Recursive descent** (the most popular hand-written method,
  [Chapter 6](/compiler/part-2-front-end/recursive-descent-and-pratt))
  is top-down.
- **Bottom-up**: start from the tokens and combine them into larger
  structures until you reach the top rule. Builds the tree from leaves
  up. **LR parsers** (generated by tools like yacc/bison) are
  bottom-up.

Top-down is intuitive and easy to hand-write; bottom-up handles a
larger class of grammars and is usually generated by tools. We'll
hand-write a top-down (recursive descent + Pratt) parser
([Chapter 6](/compiler/part-2-front-end/recursive-descent-and-pratt)) —
it's clear, debuggable, and gives great error messages.

## 6. Ambiguity and how grammars resolve it

A grammar is **ambiguous** if some token stream has *more than one*
parse tree. The classic: `2 + 3 * 4` with a naive grammar
`expr → expr op expr | NUMBER` could parse as `(2+3)*4` or `2+(3*4)` —
ambiguous, bad. We resolve ambiguity by:

- **Structuring the grammar** by precedence level (§2): separate
  `expr`/`term`/`factor` rules force `*` below `+`. This *eliminates*
  the ambiguity grammatically.
- **Precedence/associativity declarations**: some parser generators
  let you declare `*` binds tighter than `+` and is left-associative,
  keeping the grammar simple while resolving ambiguity.

The famous remaining ambiguity is the **dangling else**: in `if a if b
x else y`, does `else` attach to the first or second `if`? The standard
rule: `else` binds to the *nearest* `if`. Languages either structure
the grammar to enforce this or require braces (Goolang uses braces, so
no ambiguity — another reason we chose a braces-based syntax).

> :surprisedgoose: Precedence and associativity *are* grammar
> structure, not separate concepts. "Multiplication binds tighter than
> addition" means "multiplication is lower in the expression grammar,
> so it ends up deeper in the tree, so it's evaluated first." When you
> understand that the grammar's *shape* encodes precedence, the whole
> mystery of "why does `2 + 3 * 4` equal 14" dissolves into tree
> structure. The Pratt parser
> ([Chapter 6](/compiler/part-2-front-end/recursive-descent-and-pratt))
> makes this even cleaner with explicit precedence numbers.

## 7. Grammar classes: LL, LR, and friends

Grammars (and the parsers that handle them) come in classes:

- **LL(k)**: parseable top-down with k tokens of lookahead. Recursive
  descent handles LL(1) (and a bit more with tricks). Intuitive.
- **LR(k)**: parseable bottom-up with k tokens of lookahead. More
  powerful (handles left recursion directly, more grammars). What
  yacc/bison generate (specifically LALR).
- **PEG** (Parsing Expression Grammars): the basis of "packrat"
  parsers; unambiguous by construction (ordered choice).

For hand-written parsers, you arrange your grammar to be LL(1)-ish
(no left recursion, predictable with one token of lookahead) and use
recursive descent. Parser *generators* accept more powerful classes.
We'll make Goolang's grammar recursive-descent-friendly.

## 8. From grammar to parser

The payoff: a well-structured grammar **maps almost mechanically** to a
recursive-descent parser. Each nonterminal becomes a function; each
production becomes the function's body:

```
// grammar: ifStmt = "if" expr block ("else" block)?
function parse_if():
    expect("if")
    cond = parse_expr()
    then = parse_block()
    els = null
    if peek() == "else":
        consume("else")
        els = parse_block()
    return IfNode(cond, then, els)
```

The grammar rule and the parse function are nearly line-for-line
correspondent. This direct mapping is why recursive descent is so
popular — write the grammar, transcribe it into functions.
[Chapter 6](/compiler/part-2-front-end/recursive-descent-and-pratt)
does this fully, including the trickier expression-precedence part via
Pratt parsing.

> :weightliftinggoose: Write your grammar in EBNF before writing the
> parser — it's the spec, and a good grammar makes the parser almost
> write itself (each rule → one function). Structure expression rules
> by precedence level so the tree shape encodes the math. Keep it
> LL(1)-friendly (no left recursion) for hand-written recursive
> descent. The grammar is the contract; the parser is its
> transcription.

## What we covered

- A **grammar** defines valid programs and their structure; the parser
  recovers structure from the flat token stream.
- **Context-free grammars** (production rules) express nesting that
  regular languages can't; recognized by pushdown automata (FA +
  stack).
- A grammar's **structure encodes precedence and associativity** (`*`
  below `+` → binds tighter; left recursion → left associative).
- **Parse tree** (every rule) vs **AST** (essential structure only);
  the compiler uses the AST.
- **EBNF** notation (`* + ? | ()`) documents grammars practically.
- Parsing strategies: **top-down** (recursive descent, hand-written)
  vs **bottom-up** (LR, generated).
- **Ambiguity** resolved by precedence-structured grammars or
  declarations; dangling-else by nearest-`if` (or braces).
- Grammar classes: LL(k), LR(k), PEG.
- A clean grammar maps **mechanically** to a recursive-descent parser
  (rule → function).

## What's next

[Chapter 6](/compiler/part-2-front-end/recursive-descent-and-pratt) —
recursive descent and Pratt parsing. We build Goolang's parser:
recursive descent for statements and declarations, and Pratt (operator-
precedence) parsing for expressions — the cleanest way to handle
precedence by hand.
