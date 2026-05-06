---
sidebar_position: 3
sidebar_label: "Ch 3: Big-O in Plain English"
title: "Chapter 3: Big-O in Plain English"
---

# Chapter 3: Big-O in Plain English

You've heard people say "this is $O(n)$" or "that's $O(\log n)$" in
interviews and code reviews. This chapter is about what those phrases
*mean* — and, just as important, what they don't mean.

## The DMV question

You walk into the DMV. There are 100 people in line. You want to find
the one named Jordan.

**Strategy A:** Walk the line, asking each person their name until
you find Jordan. Worst case, you ask 100 people. If the line had been
1000 people, you'd ask up to 1000.

**Strategy B:** Everyone's already sorted alphabetically. You go
straight to the J's. You scan a handful of names, find Jordan in
seconds. Doesn't matter if the line is 100 or 1000 — your work
barely changes.

That difference — *how much harder does this get when the input
gets bigger?* — is the whole question Big-O answers.

> :happygoose: That's it. Big-O is "how does the work scale when
> the input grows?" Everything else is bookkeeping.

## A scale of growth rates

Algorithms tend to land in one of a few common growth rates. From
fastest to slowest:

| Big-O | Name | Real-world feel |
|---|---|---|
| $O(1)$ | Constant | "Same time no matter what." Looking up a value in an array by index. |
| $O(\log n)$ | Logarithmic | "Doubling the input adds *one* step." Binary search. |
| $O(n)$ | Linear | "Twice the input, twice the work." Walking a list. |
| $O(n \log n)$ | Linearithmic | "Twice the input, slightly more than twice the work." Good sorting. |
| $O(n^2)$ | Quadratic | "Twice the input, four times the work." Comparing every pair. |
| $O(2^n)$ | Exponential | "One more item *doubles* the work." Brute-force subset enumeration. |
| $O(n!)$ | Factorial | "Try every permutation." Travelling salesman naïvely. |

Memorize this table. You'll cite it in every interview.

> :sharpgoose: $O(\log n)$ doesn't say "slow." For $n = 1{,}000{,}000$,
> $\log_2 n \approx 20$. Twenty steps, regardless of input size. That's
> *fast*.

## What "$O$" actually means (informally)

When we say "this algorithm is $O(n)$," we mean: as $n$ gets large,
the work grows *no faster than* a constant times $n$. We don't care
about constants ($5n$ is still $O(n)$). We don't care about smaller
terms ($n^2 + 100n$ is $O(n^2)$, not $O(n^2 + 100n)$). We care
about the *shape* of the growth.

Why drop the constants? Because hardware varies. A loop that takes
3 nanoseconds per iteration on your laptop takes 30 nanoseconds on
a Raspberry Pi. The constant changes. The shape — linear, quadratic,
logarithmic — doesn't.

> :nerdygoose: **Formal definition (for when you need it):**
> $f(n) \in O(g(n))$ iff there exist constants $c > 0$ and $n_0$
> such that $0 \le f(n) \le c \cdot g(n)$ for all $n \ge n_0$.
>
> Translation: past some point, $f$ never grows more than a constant
> multiple of $g$. Don't memorize this — memorize the table above.

## $\Theta$ vs $O$ vs $\Omega$

Three siblings. You'll hear all three:

- **$O(g)$** — "no worse than $g$." Upper bound. Loose.
- **$\Omega(g)$** — "no better than $g$." Lower bound. Loose.
- **$\Theta(g)$** — "exactly $g$, ignoring constants." Tight bound,
  both upper and lower.

In day-to-day speech, people say "$O(n \log n)$" when they technically
mean "$\Theta(n \log n)$." Nobody cares unless you're writing a paper.
Use $O$ in prose, drop to $\Theta$ when you need to be precise.

> :sarcasticgoose: Yes, "$O(2^n)$" is technically also $O(3^n)$.
> Saying so makes you correct and useless.

## What Big-O is NOT

Three traps:

**Big-O isn't running time.** It's how running time *grows*. An
$O(n^2)$ algorithm with tiny constants can beat an $O(n \log n)$
algorithm with huge constants for small $n$. That's why
`std::sort` switches strategies internally for small arrays.

**Big-O ignores constants — which sometimes matters a lot.** Cache
behavior, branch prediction, memory layout — none of that shows up
in Big-O, all of it shows up in your benchmark. We'll talk about
this in Ch 7 when we hit dynamic arrays.

**Big-O is about asymptotics.** It tells you what happens for *large*
input. For $n = 5$, the asymptotic answer is irrelevant. For $n = 5
\text{ million}$, it's everything.

> :surprisedgoose: Counterexample to "always pick the better Big-O":
> insertion sort beats merge sort for arrays under ~30 elements.
> Cache wins. Real `qsort` implementations exploit this.

## The recurrence shortcut: master theorem (the recipe)

You'll often see code like this — a recursive function that splits
its input in pieces:

```c
int solve(int *arr, int n) {
    if (n <= 1) return arr[0];
    int half = n / 2;
    int left  = solve(arr,        half);
    int right = solve(arr + half, n - half);
    return combine(left, right);  // O(n) work
}
```

Splits the input into two halves. Solves each half recursively.
Does $O(n)$ work to combine. What's the total runtime?

You could trace it out. Or you could use the **master theorem**, which
is just a recipe for recurrences of the form

$$T(n) = a \cdot T(n/b) + f(n)$$

where $a$ subproblems each of size $n/b$, plus $f(n)$ work to combine.

The recipe says compare $f(n)$ against $n^{\log_b a}$:

| Case | Condition | Result |
|---|---|---|
| **1** | $f(n) = O(n^{\log_b a - \epsilon})$ — combine is small | $T(n) = \Theta(n^{\log_b a})$ |
| **2** | $f(n) = \Theta(n^{\log_b a})$ — combine matches | $T(n) = \Theta(n^{\log_b a} \log n)$ |
| **3** | $f(n) = \Omega(n^{\log_b a + \epsilon})$ — combine dominates | $T(n) = \Theta(f(n))$ |

For our example: $a = 2$, $b = 2$, $f(n) = n$. So $n^{\log_2 2} = n$,
which matches $f(n)$. Case 2. Total: $T(n) = \Theta(n \log n)$.

This is exactly merge sort. Most divide-and-conquer algorithms
(merge sort, quicksort, FFT, closest-pair-of-points) plug into this.

> :mathgoose: The proof of the master theorem is a recursion-tree
> argument that's pretty but not lighting-up-anyone's-brain. It's in
> Appendix C if you want it. For day-to-day work, the recipe above
> is all you need.

> :weightliftinggoose: When you see a recurrence in an interview,
> identify $a$, $b$, $f$ — then look up which case. Practice that
> reflex now.

## The "ignore lower-order terms" rule

Three expressions, all equivalent in Big-O:

- $5n$ → $O(n)$ (drop the 5)
- $n + 100$ → $O(n)$ (drop the 100)
- $3n^2 + 17n + 9$ → $O(n^2)$ (drop everything below the dominant term)

The intuition: as $n$ gets huge, the dominant term swallows the rest.
For $n = 1{,}000{,}000$, $3n^2$ is $3 \times 10^{12}$ — the $17n$ adds
about a millionth of one percent.

> :sharpgoose: This rule applies *to the analysis*, not to your code.
> A factor of 5 still matters when you're staring at a profiler.
> "Big-O equivalent" doesn't mean "interchangeable in production."

## Quick gut-check for code

When you read code in an interview, walk through this checklist:

1. **Are there nested loops?** Each loop dimension multiplies. Two
   nested loops over $n$ → $O(n^2)$.
2. **Is the work halving each step?** ($n \to n/2 \to n/4 \to \ldots$)
   That's $O(\log n)$.
3. **Is there a recursive call inside a loop?** Probably bad — could
   be exponential.
4. **What does the inner work cost?** A loop over $n$ that does
   $O(\log n)$ work per iteration is $O(n \log n)$.
5. **Are you growing a structure?** Push to a vector $n$ times — could
   be amortized $O(n)$ total. (We'll see this in Ch 7.)

> :happygoose: Step 5 is the one most people miss. "I called `push_back`
> $n$ times so it's $O(n^2)$, right?" No — amortized $O(1)$ per push,
> $O(n)$ total. Chapter 7 explains why.

## Practice

### Try it

**3.1** For each snippet, name the Big-O of its runtime in $n$:

```c
// (a)
for (int i = 0; i < n; i++) printf("%d\n", i);

// (b)
for (int i = 0; i < n; i++)
    for (int j = 0; j < n; j++)
        printf("%d %d\n", i, j);

// (c)
int x = 0;
for (int i = n; i > 1; i /= 2) x++;

// (d)
for (int i = 0; i < n; i++)
    for (int j = i; j < n; j++)
        printf("%d %d\n", i, j);
```

**3.2** Which is asymptotically faster, $1000n$ or $n^2$? For what
value of $n$ does $n^2$ first become slower? (Yes, you can do this
by hand.)

### Stretch

**3.3** Apply the master theorem:

- $T(n) = 4T(n/2) + n$
- $T(n) = T(n/2) + 1$
- $T(n) = 9T(n/3) + n^2$

Identify $a$, $b$, $f$, and which case applies.

**3.4** Write the simplest C function you can think of that runs in
$O(n^3)$. Then write one that runs in $O(\sqrt{n})$.

### Deep dive (optional)

**3.5** Why is the *amortized* cost of `push_back` on a doubling array
$O(1)$ but the *worst-case* cost of a single `push_back` $O(n)$?
You don't have to prove anything formally. Just sketch the intuition
in your own words.

## What's next

Chapter 4 introduces **loop invariants** — the everyday tool you'll
use to convince yourself (and an interviewer) that your code is
actually correct. Chapter 5 wraps up Part I with **amortized
analysis**, where the dynamic-array trick from Question 3.5 gets
its proper explanation. Then Part II — the data structures.

> :weightliftinggoose: Big-O is the vocabulary. Loop invariants are
> the grammar. Together they're how you'll talk about every algorithm
> in this book.
