---
sidebar_position: 1
title: "Cheat Sheet"
---

# Rust Cheat Sheet

> The core of the language on one page — syntax, the ownership and
> borrowing rules, and the idioms you'll reach for daily. For recall while
> you build, not for first learning (the chapters explain *why*).

## Variables and types

```rust
let x = 5;                 // immutable by default
let mut y = 5;             // mutable
let z: f64 = 3.14;         // explicit type
const MAX: u32 = 100_000;  // compile-time constant
let x = x + 1;             // shadowing (new binding, may change type)
```

Primitives: `i8..i128`/`u8..u128`/`isize`/`usize` (ints), `f32`/`f64`,
`bool`, `char`, unit `()`. Compound: tuples `(i32, f64)`, arrays
`[i32; 5]`. ([Ch 3](/rust/part-1-getting-started/basic-syntax))

## Functions and control flow

```rust
fn add(a: i32, b: i32) -> i32 { a + b }   // last expr (no ;) is the return

let n = if cond { 5 } else { 6 };          // if is an expression
let r = match x {
    0 => "zero",
    1 | 2 => "few",
    3..=9 => "some",
    _ => "many",
};
for i in 0..10 { }         // 0..9; 0..=10 is inclusive
while cond { }
loop { break value; }
```

## Ownership (the three rules)

> 1. Each value has **one owner**.
> 2. **One owner at a time** — assignment/passing **moves** (heap types).
> 3. Value **dropped** when its owner goes out of scope.

```rust
let s1 = String::from("hi");
let s2 = s1;               // MOVE: s1 now invalid
let s3 = s2.clone();       // explicit deep copy: both valid
let n = 5; let m = n;      // Copy (stack types): both valid
```
([Ch 4](/rust/part-2-ownership/ownership-and-moves))

## Borrowing (the rules)

> Either **one** `&mut T` **xor** any number of `&T` — never both.
> References must never outlive their data.

```rust
fn read(s: &String) {}         // shared borrow (read)
fn write(s: &mut String) {}    // mutable borrow (exclusive)
let r = &x;                    // many shared refs OK
let m = &mut x;                // one mutable ref, no others alive
```
([Ch 5](/rust/part-2-ownership/borrowing-and-references))

## Slices and strings

```rust
let slice = &arr[1..4];        // &[T] view, no copy
let part = &s[0..5];           // &str slice
fn f(s: &str) {}               // take &str, not &String (more general)
fn g(v: &[i32]) {}             // take &[T], not &Vec<T>
for c in s.chars() {}          // no integer indexing on strings
```
([Ch 7](/rust/part-2-ownership/slices-and-strings))

## Structs and enums

```rust
struct User { name: String, age: u32 }
struct Point(i32, i32);        // tuple struct
struct Marker;                 // unit struct

impl User {
    fn new(name: String) -> Self { User { name, age: 0 } }  // assoc. fn
    fn greet(&self) -> String { format!("Hi {}", self.name) } // method
}

enum Shape {
    Circle { radius: f64 },
    Rect(f64, f64),
    Empty,
}
#[derive(Debug, Clone, PartialEq)]
struct P { x: i32 }
```
([Ch 8](/rust/part-3-types/structs-and-enums))

## Pattern matching

```rust
match shape {
    Shape::Circle { radius } => *radius,
    Shape::Rect(w, h) => w * h,
    Shape::Empty => 0.0,
}
if let Some(n) = opt { }       // one-pattern match
while let Some(x) = it.next() { }
let Some(n) = opt else { return; };   // bind-or-bail
```
([Ch 9](/rust/part-3-types/pattern-matching))

## Traits and generics

```rust
trait Summary {
    fn summarize(&self) -> String;
    fn preview(&self) -> String { self.summarize() }   // default method
}
impl Summary for Article { fn summarize(&self) -> String { /* */ } }

fn notify<T: Summary>(x: &T) {}        // trait bound
fn notify2(x: &impl Summary) {}        // impl Trait
fn pick(v: &[Box<dyn Draw>]) {}        // trait object (dynamic dispatch)

struct Pair<T> { a: T, b: T }          // generic struct
fn largest<T: PartialOrd>(v: &[T]) -> &T { /* */ }
```
([Ch 10](/rust/part-3-types/traits), [Ch 11](/rust/part-3-types/generics))

## Error handling

```rust
fn read() -> Result<String, io::Error> {
    let s = fs::read_to_string("f.txt")?;   // ? : unwrap or return Err
    Ok(s.trim().to_string())
}
let n = "5".parse::<i32>().unwrap_or(0);    // default on error
let v = opt.ok_or("missing")?;              // Option -> Result, propagate
// Box<dyn Error> accepts any error; ? converts via From.
```
([Ch 12](/rust/part-4-data/error-handling))

## Collections

```rust
let mut v = vec![1, 2, 3];
v.push(4); v.pop();
v.get(0);                       // Option<&T> (safe)
let mut m = HashMap::new();
m.insert("k", 1);
*m.entry("k").or_insert(0) += 1;   // get-or-insert-and-update
```
([Ch 13](/rust/part-4-data/collections))

## Iterators and closures

```rust
let add = |a, b| a + b;                 // closure
let owned = move || data;               // move-capture

let r: Vec<i32> = v.iter()
    .filter(|&&x| x % 2 == 0)
    .map(|&x| x * x)
    .collect();                          // lazy adapters + consumer
let sum: i32 = v.iter().sum();
let total = v.iter().fold(0, |a, &x| a + x);
```
([Ch 14](/rust/part-4-data/iterators-and-closures))

## Smart pointers

```rust
Box::new(x)          // heap; recursive types; trait objects
Rc::new(x)           // shared ownership (single-thread, read-only)
RefCell::new(x)      // interior mutability (runtime borrow check)
Rc<RefCell<T>>       // shared + mutable (single-thread)
Arc<Mutex<T>>        // shared + mutable (multi-thread)
Weak<T>              // non-owning ref (breaks Rc cycles)
```
([Ch 15](/rust/part-4-data/smart-pointers))

## Concurrency

```rust
let h = thread::spawn(move || { /* */ });   // spawn; move captures
h.join().unwrap();                            // wait

let (tx, rx) = mpsc::channel();               // channel
tx.send(v).unwrap();  let got = rx.recv().unwrap();

let c = Arc::new(Mutex::new(0));
let n = c.lock().unwrap();  *n += 1;          // lock; guard auto-unlocks

async fn f() -> T { g().await }               // async/await (needs a runtime)
```
([Ch 16–18](/rust/part-5-concurrency/threads-send-sync))
`Send` = movable across threads; `Sync` = shareable by `&` across threads.

## Modules and Cargo

```rust
mod foo { pub fn bar() {} }   // private by default; pub to expose
use std::collections::HashMap;
pub use inner::Item;          // re-export
```
```bash
cargo new / build / run / check / test / fmt / clippy / add <crate>
```
([Ch 20](/rust/part-6-ecosystem/modules-crates-cargo))

## Testing

```rust
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn it_works() { assert_eq!(add(2, 2), 4); }
    #[test] #[should_panic] fn bad() { panic!(); }
}
```
Doc examples in `///` comments run as tests.
([Ch 22](/rust/part-6-ecosystem/testing-and-tooling))

> :weightliftinggoose: Pin this page while you build. The two boxes that
> matter most are **ownership** (one owner, move on assign, drop at scope
> end) and **borrowing** (one `&mut` xor many `&`). Almost every
> compiler error traces back to those two — recall the rule, read the
> error, fix the ownership.

See the [glossary](/rust/appendix/glossary) for terms and
[further reading](/rust/appendix/further-reading) for resources.
