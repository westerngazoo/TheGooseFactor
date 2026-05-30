---
sidebar_position: 1
title: "Lexing: Text to Tokens"
---

# Lexing: Text to Tokens

> The first real stage. The lexer scans raw characters and groups them
> into tokens — the words of the language — discarding whitespace and
> tracking source locations for great error messages.

The **lexer** (also "scanner" or "tokenizer") is the compiler's front
door. It converts a stream of characters into a stream of **tokens**,
turning `let x = 42;` into `LET IDENT(x) EQ INT(42) SEMI`. This chapter
builds one.

## 1. What a token is

A **token** is a meaningful unit — the lexical "word." Each token has:

- A **type/kind**: `KEYWORD`, `IDENT`, `INT`, `PLUS`, `LPAREN`, etc.
- An optional **value/lexeme**: the actual text (`x`, `42`) for tokens
  that carry data.
- A **source location**: line and column, for error reporting.

```
struct Token {
    kind: TokenKind,     // PLUS, IDENT, INT, ...
    lexeme: String,      // the source text, e.g. "42" or "factorial"
    line: int,
    column: int,
}
```

The lexer's job: read characters left to right and emit a `Token` for
each lexical unit, skipping whitespace and comments.

## 2. The token kinds for Goolang

Goolang's tokens fall into categories:

- **Keywords**: `fn`, `let`, `if`, `else`, `while`, `return`, `int`,
  `bool`, `true`, `false`.
- **Identifiers**: names like `x`, `factorial` (letters/digits/
  underscore, not starting with a digit).
- **Literals**: integer literals (`42`), boolean literals.
- **Operators**: `+ - * / == != < > <= >=`.
- **Punctuation**: `( ) { } ; : , -> =`.
- **End-of-file**: a sentinel `EOF` token.

Recognizing each is a small pattern-matching problem on the character
stream.

## 3. The core loop

A lexer is fundamentally a loop: look at the current character, decide
what kind of token starts here, consume characters until the token
ends, emit it, repeat.

```
function lex(source):
    tokens = []
    pos = 0
    while pos < length(source):
        c = source[pos]
        if is_whitespace(c):        pos += 1          # skip
        elif is_digit(c):           tokens.add(lex_number())
        elif is_alpha(c):           tokens.add(lex_ident_or_keyword())
        elif c == '+':              tokens.add(PLUS); pos += 1
        elif c == '(':              tokens.add(LPAREN); pos += 1
        elif c == '=':              tokens.add(lex_eq_or_eqeq())   # = vs ==
        ... etc ...
        else:                       error("unexpected char", c)
    tokens.add(EOF)
    return tokens
```

The loop dispatches on the first character. Single-character tokens
(`+`, `(`) are trivial. Multi-character tokens (numbers, identifiers,
`==`) consume a run of characters via a helper.

## 4. Lexing numbers and identifiers (maximal munch)

For multi-character tokens, the lexer consumes the **longest** run that
forms a valid token — the **maximal munch** rule:

```
function lex_number():
    start = pos
    while pos < len and is_digit(source[pos]):
        pos += 1
    return Token(INT, source[start..pos])   # all consecutive digits

function lex_ident_or_keyword():
    start = pos
    while pos < len and is_alphanumeric(source[pos]):
        pos += 1
    word = source[start..pos]
    if word in KEYWORDS:
        return Token(keyword_kind(word), word)   # fn, let, if, ...
    else:
        return Token(IDENT, word)
```

`123abc` lexes `123` then `abc` (number stops at the non-digit). `letx`
lexes as one identifier `letx`, *not* keyword `let` + `x` — maximal
munch takes the longest run. Keywords are identifiers that happen to be
reserved, so you lex the whole word then check if it's a keyword.

> :nerdygoose: Maximal munch — "always consume the longest valid token"
> — is the rule that resolves most ambiguity. It's why `==` lexes as
> one equality operator, not two assignments; why `>=` is one token;
> why `letx` is one identifier. The lexer is greedy. The one famous
> place this bites: C++'s `>>` in `vector<vector<int>>` used to lex as
> the right-shift operator, requiring `> >` with a space (fixed in
> C++11). Maximal munch is simple but has edge cases.

## 5. Multi-character operators: lookahead

Some operators share a prefix: `=` (assign) vs `==` (equals), `<` vs
`<=`, `-` vs `->`. The lexer **looks ahead** one character to decide:

```
function lex_eq():
    pos += 1                     # consume '='
    if pos < len and source[pos] == '=':
        pos += 1                 # consume second '='
        return Token(EQEQ)       # ==
    else:
        return Token(EQ)         # =
```

One character of lookahead handles Goolang's operators. (Some
languages need more lookahead; most need just one or two. Lexers with
bounded lookahead are efficient — one pass, no backtracking.)

## 6. Whitespace and comments

Whitespace (spaces, tabs, newlines) **separates** tokens but isn't
itself a token — the lexer skips it. Comments (`// ...` to end of
line, `/* ... */` block) are also skipped:

```
if c == '/' and peek() == '/':
    while pos < len and source[pos] != '\n':
        pos += 1                 # skip to end of line
    continue
```

Skipped — they never become tokens. (Exception: languages where
whitespace is significant, like Python's indentation, treat newlines/
indentation as tokens. Goolang is free-form, so whitespace is purely a
separator.)

## 7. Tracking source locations

For good error messages ([Chapter 1](/compiler/part-1-foundations/what-is-a-compiler)),
every token records where it came from. The lexer maintains a current
line and column, incrementing column per character and resetting on
newline:

```
function advance():
    if source[pos] == '\n':
        line += 1
        column = 1
    else:
        column += 1
    pos += 1
```

Each token captures `(line, column)` at its start. When the parser
later finds an error at a token, it can say "unexpected `}` at line 12,
column 4." Threading locations from the lexer onward is what makes
errors *useful*. Do it from the start; retrofitting locations is
painful.

## 8. Theory: regular languages and finite automata

The lexer's job — recognizing tokens — is exactly recognizing a
**regular language**. Each token kind is described by a **regular
expression**: an identifier is `[a-zA-Z_][a-zA-Z0-9_]*`, an integer is
`[0-9]+`. The set of all tokens is a union of these regexes.

A **finite automaton** (DFA) recognizes a regular language — and that's
what a lexer *is*, conceptually: a state machine that reads characters
and transitions between states until it accepts a token. Tools like
**lex/flex** take regex token definitions and *generate* a DFA-based
lexer automatically.

You can hand-write the loop (as above) or generate it from regexes;
both implement the same finite-automaton idea. Hand-writing gives
control and good errors; generators save effort. Understanding the
theory (tokens = regular languages = finite automata) explains *why*
lexing is a clean, efficient, single-pass process.

> :surprisedgoose: The neat layering of language theory: lexing handles
> **regular languages** (finite automata), parsing handles
> **context-free languages** (pushdown automata,
> [Chapter 5](/compiler/part-2-front-end/parsing-and-grammars)). The
> split isn't arbitrary — token structure (words) is regular, but
> nesting structure (balanced parens, nested expressions) is not (a
> finite automaton can't count arbitrary nesting). So we use a lexer
> for the regular part and a parser for the context-free part. The
> Chomsky hierarchy, applied.

## 9. Building and testing the lexer

The lexer is the easiest stage to build and test in isolation:

```
lex("let x = 42;")
=> [LET, IDENT("x"), EQ, INT("42"), SEMI, EOF]
```

Test by feeding source snippets and checking the token list. Edge
cases to cover: empty input (just EOF), whitespace-only, comments,
maximal-munch boundaries (`letx`, `123abc`), multi-char operators
(`==`, `->`), unterminated comments/strings (errors), and location
tracking (right line/column). A well-tested lexer is a solid
foundation for the parser.

> :weightliftinggoose: Build the lexer first — it's the gentlest stage
> and gives immediate, testable output (a token list you can print and
> verify). Hand-write the dispatch loop, use maximal munch, thread
> source locations from day one, and write tests for the edge cases.
> A clean token stream makes the parser's job much easier. This is the
> first real piece of your compiler — make it solid.

## What we covered

- A **token** has a kind, an optional lexeme/value, and a source
  location.
- Goolang tokens: keywords, identifiers, literals, operators,
  punctuation, EOF.
- The lexer's **core loop**: dispatch on the current character, consume
  the token, emit, repeat.
- **Maximal munch**: consume the longest valid run (`==` is one token,
  `letx` is one identifier).
- **Lookahead** disambiguates shared-prefix operators (`=` vs `==`).
- **Whitespace and comments** are skipped (unless significant, like
  Python indentation).
- **Source locations** (line/column) tracked per token for error
  messages.
- Theory: tokens are **regular languages**, recognized by **finite
  automata**; lex/flex generate DFA lexers from regexes.

## What's next

[Chapter 5](/compiler/part-2-front-end/parsing-and-grammars) — parsing
and grammars. We define Goolang's grammar formally (EBNF), introduce
context-free grammars and parse trees, and set up the parser that turns
the token stream into an AST.
