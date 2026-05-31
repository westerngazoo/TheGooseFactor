---
sidebar_position: 3
title: "Lifetimes"
---

# Lifetimes

> How the compiler tracks "this reference must stay valid." A
> **lifetime** is the span during which a reference is usable. Most are
> inferred; occasionally you *annotate* them to tell the compiler how the
> lifetimes of inputs and outputs relate. Lifetimes don't change what the
> code does — they let the borrow checker prove it's safe.

[Chapter 5](/rust/part-2-ownership/borrowing-and-references) said
references must never outlive their data. **Lifetimes** are the
machinery that enforces that. They have a reputation as Rust's scariest
feature; in truth most lifetimes are invisible, and the explicit ones
follow a small set of rules. This chapter demystifies them.

## 1. The problem lifetimes solve

Consider a function that returns one of its two reference arguments:

```rust
fn longest(x: &str, y: &str) -> &str {   // which one comes back?
    if x.len() > y.len() { x } else { y }
}
```

The compiler can't tell *how long* the returned reference is valid — it
depends on which argument is returned, and the two arguments might live
for different spans. If the caller keeps the result after one of the
inputs is dropped, that's a dangling reference. The compiler needs you to
**relate** the output's lifetime to the inputs', and that relation is
spelled with a lifetime annotation.

## 2. Lifetimes are descriptive, not prescriptive

The key mental shift: **a lifetime annotation does not change how long
anything lives.** It *describes* a relationship the compiler then checks.
Writing `'a` doesn't make a value live longer; it tells the borrow
checker "these references share a lifetime, so the result is valid only
as long as *both* inputs are." Lifetimes are constraints you state and
the compiler verifies — never instructions that alter runtime behavior.

> :nerdygoose: This is why lifetimes feel different from everything else.
> They're pure *static* information — erased entirely before the program
> runs, exactly like the ownership and borrow rules. A lifetime is a
> proof obligation: you (or elision) state how reference lifetimes relate,
> and the borrow checker confirms no reference is ever used past the
> validity of its data. Nothing about `'a` exists at runtime. It's a
> compile-time label on a region of code, no more.

## 3. The syntax: 'a

Lifetime parameters are named with an apostrophe and a (usually short)
name: `'a`, `'b`, `'input`. They're declared in angle brackets like
generic type parameters and attached to references:

```rust
&i32          // a reference
&'a i32       // a reference with an explicit lifetime 'a
&'a mut i32   // a mutable reference with lifetime 'a
```

On their own these look cryptic; they only mean something in a signature
that ties several of them together.

## 4. Lifetimes in functions

Here's `longest`, annotated. The lifetime `'a` says: all three
references (`x`, `y`, and the return) share one lifetime — so the result
is valid for the *smaller* of the two inputs' spans:

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
```

Read it as: "for some lifetime `'a`, given two `&str` that both live at
least `'a`, the returned `&str` also lives at least `'a`." The compiler
now rejects misuse:

```rust
let r;
{
    let s2 = String::from("short");
    r = longest(&long_lived, &s2);   // r borrows from s2 too...
}                                    // s2 dropped here
// println!("{}", r);                // ERROR: r would dangle (borrowed s2)
```

The annotation made the danger visible to the compiler. Without `'a` it
couldn't reason about the relationship; with it, it proves safety.

## 5. Lifetime elision

If you wrote `'a` on every reference, Rust would be unbearable. So the
compiler applies **elision rules** — patterns common enough that it fills
in the lifetimes for you. The three rules:

1. Each reference parameter gets its **own** lifetime.
2. If there's **exactly one** input lifetime, it's assigned to **all**
   outputs.
3. If one of the parameters is `&self` or `&mut self`, **`self`'s
   lifetime** is assigned to all outputs (the common method case).

```rust
fn first_word(s: &str) -> &str { /* ... */ }
// elided; the compiler reads it as:
fn first_word<'a>(s: &'a str) -> &'a str { /* ... */ }
```

Because there's one input reference, rule 2 applies and you write no
lifetimes at all. Elision covers the overwhelming majority of code —
which is why you rarely *see* lifetimes despite them being everywhere.
You write them only when the relationship is genuinely ambiguous (like
`longest`'s two inputs).

## 6. Lifetimes in structs

A struct that *holds a reference* must declare a lifetime, promising the
struct can't outlive the data it borrows:

```rust
struct Excerpt<'a> {
    part: &'a str,        // borrows a string slice that lives at least 'a
}

let novel = String::from("Call me Ishmael. Some years ago...");
let first = novel.split('.').next().unwrap();
let e = Excerpt { part: first };   // e cannot outlive `novel`
```

The `<'a>` says "an `Excerpt` is valid only as long as the `&str` it
holds." If `novel` were dropped while `e` lived, the compiler would
reject it — the struct's lifetime is bounded by its borrowed field. This
is how Rust lets you build types that *reference* data without owning it,
safely.

## 7. The 'static lifetime

One special lifetime: **`'static`** means "lives for the entire program."
String literals have it, because they're baked into the binary:

```rust
let s: &'static str = "I live forever";   // literal: stored in the program
```

`'static` is the longest possible lifetime. It shows up in error messages
and trait bounds (a value that must be valid indefinitely, e.g. data sent
to a thread — [Chapter 16](/rust/part-5-concurrency/threads-send-sync)).
Beware the trap: seeing `'static` in an error usually does *not* mean
"add `'static`" — it means a reference doesn't live long enough, and the
real fix is restructuring ownership, not slapping on the biggest lifetime.

## 8. The mental model

When do you need to *write* a lifetime? When the compiler can't infer how
output references relate to inputs — most often a function returning a
reference derived from **multiple** reference parameters, or a struct
**holding** a reference. The rest of the time, elision handles it.

Don't fight lifetime errors by randomly adding annotations. Instead ask
the real question: *what data does this reference point into, and does it
live long enough?* A lifetime error is the borrow checker telling you a
reference could outlive its data — the cure is usually to clone, to
restructure who owns what, or to shorten how long you hold the reference,
not to decorate the signature.

> :weightliftinggoose: Lifetimes are the part of ownership that looks
> hardest and is mostly automatic. Internalize three things: (1) a
> lifetime *describes* a relationship, it never changes how long data
> lives; (2) **elision** writes them for you in the common cases, so
> you'll rarely type `'a`; (3) when you *do* hit a lifetime error, it
> means "this reference might outlive its data" — fix the ownership, not
> the annotation. Write `longest` and a struct-holding-a-reference by
> hand once each; after that, lifetimes stop being scary and become just
> another thing the compiler quietly checks.

## What we covered

- A **lifetime** is the span a reference is valid; lifetimes let the
  borrow checker prove no reference outlives its data.
- Annotations are **descriptive, not prescriptive** — they state a
  relationship the compiler checks; they don't change runtime behavior
  and are erased before runtime.
- Syntax: `'a` declared in `<...>` and attached to references (`&'a T`).
- In functions, a shared lifetime (`longest<'a>`) relates inputs to
  outputs so the compiler can reject dangling results.
- **Elision rules** infer lifetimes in the common cases (one input
  lifetime; or `&self`), so you rarely write them.
- A **struct holding a reference** needs a lifetime parameter; it can't
  outlive the borrowed data.
- **`'static`** = "lives for the whole program" (string literals); seeing
  it in an error usually means "doesn't live long enough," not "add
  `'static`."

## What's next

[Chapter 7](/rust/part-2-ownership/slices-and-strings) — slices and
strings. Slices are *borrowed views* into a sequence (`&[T]`, `&str`) —
a direct application of references and lifetimes — and they explain
Rust's two string types (`String` vs `&str`) and its strict, UTF-8-safe
handling of text.
