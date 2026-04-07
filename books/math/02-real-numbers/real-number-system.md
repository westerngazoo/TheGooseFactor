---
sidebar_position: 1
sidebar_label: "The Real Number System"
title: "The Real Number System"
---

# The Real Number System

Apostol's *Calculus* begins with the real numbers axiomatically. You don't construct them from scratch — you assume a set $\mathbb{R}$ satisfying three groups of axioms: **field axioms**, **order axioms**, and the **completeness axiom**. Everything in calculus rests on these.

## The Field Axioms

$\mathbb{R}$ has two operations, addition ($+$) and multiplication ($\cdot$), satisfying:

**Addition axioms:**
1. **Closure**: $a + b \in \mathbb{R}$
2. **Commutativity**: $a + b = b + a$
3. **Associativity**: $(a + b) + c = a + (b + c)$
4. **Identity**: there exists $0$ such that $a + 0 = a$
5. **Inverse**: for each $a$, there exists $-a$ such that $a + (-a) = 0$

**Multiplication axioms:**
6. **Closure**: $a \cdot b \in \mathbb{R}$
7. **Commutativity**: $a \cdot b = b \cdot a$
8. **Associativity**: $(a \cdot b) \cdot c = a \cdot (b \cdot c)$
9. **Identity**: there exists $1 \neq 0$ such that $a \cdot 1 = a$
10. **Inverse**: for each $a \neq 0$, there exists $a^{-1}$ such that $a \cdot a^{-1} = 1$

**Connecting axiom:**
11. **Distributivity**: $a \cdot (b + c) = a \cdot b + a \cdot c$

> :mathgoose: These 11 axioms define a **field**. $\mathbb{Q}$ is also a field. $\mathbb{Z}$ is not (no multiplicative inverses for most elements). The field axioms alone don't distinguish $\mathbb{R}$ from $\mathbb{Q}$ — that's the completeness axiom's job.
>
> :nerdygoose: If you've used floating-point arithmetic, you've worked with something that *almost* satisfies these axioms but doesn't. Floating-point addition isn't associative: `(1e20 + -1e20) + 1.0 = 1.0` but `1e20 + (-1e20 + 1.0) = 0.0`. Every numerical bug trace starts here.

## Consequences of the Field Axioms

These follow from the axioms above (all provable):

- **Uniqueness of 0 and 1**: The additive and multiplicative identities are unique.
- **Cancellation**: $a + c = b + c \Rightarrow a = b$
- **Zero product**: $a \cdot b = 0 \Rightarrow a = 0$ or $b = 0$
- **Negation rules**: $(-a)(-b) = ab$, $-(- a) = a$
- **No zero divisors**: If $ab = 0$, then $a = 0$ or $b = 0$

**Subtraction and division** are defined as:

```math
a - b := a + (-b), \qquad \frac{a}{b} := a \cdot b^{-1} \;\;(b \neq 0)
```

## The Order Axioms

There exists a subset $\mathbb{R}^+$ (the positive reals) satisfying:

1. **Trichotomy**: For every $a \in \mathbb{R}$, exactly one holds: $a \in \mathbb{R}^+$, $a = 0$, or $-a \in \mathbb{R}^+$
2. **Closure under addition**: $a, b \in \mathbb{R}^+ \Rightarrow a + b \in \mathbb{R}^+$
3. **Closure under multiplication**: $a, b \in \mathbb{R}^+ \Rightarrow ab \in \mathbb{R}^+$

We define $a < b$ to mean $b - a \in \mathbb{R}^+$.

> :surprisedgoose: Three axioms give you the entire ordering on $\mathbb{R}$. Trichotomy says every real is positive, zero, or negative — no ambiguity. The closure axioms say positives stay positive under addition and multiplication. From this, you can derive everything: $a^2 \geq 0$, $1 > 0$, negative times negative is positive — all of it.

## Key Order Properties

These all follow from the three order axioms. Here are the full proofs.

### Transitivity

*Proof*: $a < b$ means $b - a \in \mathbb{R}^+$. $b < c$ means $c - b \in \mathbb{R}^+$. By closure under addition:

```math
(b - a) + (c - b) \in \mathbb{R}^+
```

Simplify the left side using field axioms:

```math
(b - a) + (c - b) = b - a + c - b = c - a
```

So $c - a \in \mathbb{R}^+$, which means $a < c$. $\square$

### Addition preserves order

*Proof*: $a < b$ means $b - a \in \mathbb{R}^+$. We need $(b + c) - (a + c) \in \mathbb{R}^+$. Simplify:

```math
(b + c) - (a + c) = b + c - a - c = b - a
```

Since $b - a \in \mathbb{R}^+$, we're done. $\square$

### Multiplication by positive preserves order

*Proof*: $a < b$ means $b - a \in \mathbb{R}^+$. $c > 0$ means $c \in \mathbb{R}^+$. By closure under multiplication:

```math
(b - a) \cdot c \in \mathbb{R}^+
```

Distribute using the field axioms:

```math
(b - a) \cdot c = bc - ac
```

So $bc - ac \in \mathbb{R}^+$, which means $ac < bc$. $\square$

### Multiplication by negative reverses order

*Proof*: $c < 0$ means $-c \in \mathbb{R}^+$ (by trichotomy). Since $b - a \in \mathbb{R}^+$ and $-c \in \mathbb{R}^+$, closure under multiplication gives:

```math
(b - a)(-c) \in \mathbb{R}^+
```

Expand:

```math
(b - a)(-c) = -bc + ac = ac - bc
```

So $ac - bc \in \mathbb{R}^+$, which means $bc < ac$, i.e., $ac > bc$. $\square$

### Squares are nonnegative

*Proof*: By trichotomy, exactly one of three cases holds:

**Case 1**: $a = 0$. Then $a^2 = 0 \cdot 0 = 0 \geq 0$. $\checkmark$

**Case 2**: $a \in \mathbb{R}^+$. By closure under multiplication, $a \cdot a = a^2 \in \mathbb{R}^+$, so $a^2 > 0$. $\checkmark$

**Case 3**: $-a \in \mathbb{R}^+$ (i.e., $a < 0$). By closure under multiplication, $(-a)(-a) \in \mathbb{R}^+$. But $(-a)(-a) = a^2$ (proved from field axioms: $(-a)(-a) = (-1)(a)(-1)(a) = (-1)(-1)a^2 = 1 \cdot a^2 = a^2$). So $a^2 \in \mathbb{R}^+$, meaning $a^2 > 0$. $\checkmark$

In all cases, $a^2 \geq 0$. Equality holds iff $a = 0$. $\square$

> :angrygoose: "Multiplication by negative reverses the inequality." This is the single most common algebra mistake in proofs involving inequalities. When you multiply both sides of $a < b$ by $c$, you *must* check the sign of $c$. If $c < 0$, the inequality flips. If $c$ is a variable and you don't know its sign, you must split into cases.

## Absolute Value

The **absolute value** of $a$ is:

```math
|a| = \begin{cases} a & \text{if } a \geq 0 \\ -a & \text{if } a < 0 \end{cases}
```

Equivalent definition: $|a| = \max(a, -a)$, or $|a| = \sqrt{a^2}$.

**Key properties (with proofs):**

### Product rule for absolute value

*Proof*: $|ab|^2 = (ab)^2 = a^2 b^2 = |a|^2 |b|^2 = (|a||b|)^2$. Since both $|ab|$ and $|a||b|$ are nonneg, taking square roots gives $|ab| = |a||b|$. $\square$

### Triangle inequality

*Proof*: We use the fact that $|x| \leq c \iff -c \leq x \leq c$ (for $c \geq 0$), which we prove first.

**Lemma**: $-|a| \leq a \leq |a|$ for all $a$.

If $a \geq 0$: then $|a| = a$, so $a \leq |a|$ is trivially true. And $-|a| = -a \leq 0 \leq a$. $\checkmark$

If $a < 0$: then $|a| = -a > 0 > a$, so $a \leq |a|$. And $-|a| = -(-a) = a$, so $-|a| \leq a$ holds with equality. $\checkmark$

**Now the triangle inequality**: By the lemma:

```math
-|a| \leq a \leq |a| \quad \text{and} \quad -|b| \leq b \leq |b|
```

Add these inequalities (addition preserves order):

```math
-(|a| + |b|) \leq a + b \leq |a| + |b|
```

This means $|a + b| \leq |a| + |b|$. $\square$

### Reverse triangle inequality

*Proof*: From the triangle inequality applied to $a = (a - b) + b$:

```math
|a| = |(a - b) + b| \leq |a - b| + |b|
```

Subtract $|b|$ from both sides:

```math
|a| - |b| \leq |a - b|
```

Now swap $a$ and $b$: $|b| - |a| \leq |b - a| = |a - b|$, so $-(|a| - |b|) \leq |a - b|$.

Combining: $-|a - b| \leq |a| - |b| \leq |a - b|$, which gives $||a| - |b|| \leq |a - b|$. $\square$

### Absolute value equivalence

*Proof ($\Rightarrow$)*: If $|a| \leq c$, then either $a \geq 0$ and $a = |a| \leq c$, or $a < 0$ and $-a = |a| \leq c$ so $a \geq -c$. In both cases, $-c \leq a \leq c$.

*Proof ($\Leftarrow$)*: If $-c \leq a \leq c$ and $a \geq 0$: $|a| = a \leq c$. If $a < 0$: $|a| = -a$ and $-c \leq a$ gives $-a \leq c$, so $|a| \leq c$. $\square$

> :mathgoose: The triangle inequality is the single most used inequality in analysis. It says "the direct path is never longer than a detour." Geometrically: the length of one side of a triangle is at most the sum of the other two. In $\varepsilon$-$\delta$ proofs, you'll use it constantly to bound expressions.
>
> :happygoose: The equivalence $|a| \leq c \iff -c \leq a \leq c$ is your go-to tool for converting absolute value statements into compound inequalities and back. Most absolute value problems in Apostol reduce to this.

## The Completeness Axiom

This is what separates $\mathbb{R}$ from $\mathbb{Q}$.

**Definitions:**
- A set $S \subseteq \mathbb{R}$ is **bounded above** if there exists $M$ such that $s \leq M$ for all $s \in S$. Such $M$ is an **upper bound**.
- The **supremum** (least upper bound) of $S$, written $\sup S$, is the smallest upper bound.
- Similarly: **bounded below**, **infimum** $\inf S$ (greatest lower bound).

**Completeness axiom (least upper bound property):**

> Every nonempty subset of $\mathbb{R}$ that is bounded above has a supremum in $\mathbb{R}$.

> :angrygoose: This axiom is *everything*. Without it, $\mathbb{Q}$ satisfies all the field and order axioms perfectly, but calculus breaks. The set $\{x \in \mathbb{Q} : x^2 < 2\}$ is bounded above in $\mathbb{Q}$ but has no rational supremum — $\sqrt{2}$ doesn't exist in $\mathbb{Q}$. The completeness axiom says $\mathbb{R}$ has no such "holes."
>
> :mathgoose: The completeness axiom is logically equivalent to several other statements: the nested intervals theorem, the Bolzano-Weierstrass theorem, the monotone convergence theorem, the Cauchy criterion. Each is a different way of saying "$\mathbb{R}$ has no gaps." Apostol uses the least upper bound form because it's the most direct.

## Working with Supremum and Infimum

**Characterization of $\sup S = M$:**
1. $M$ is an upper bound: $s \leq M$ for all $s \in S$
2. No smaller upper bound: for every $\varepsilon > 0$, there exists $s \in S$ with $s > M - \varepsilon$

The second condition is the useful one — it says you can get **arbitrarily close** to the supremum from within the set.

**Key properties:**

```math
\sup(A + B) = \sup A + \sup B
```

where $A + B = \{a + b : a \in A, b \in B\}$.

If $c \geq 0$:

```math
\sup(cA) = c \cdot \sup A
```

**Important subtlety**: $\sup S$ may or may not be in $S$.
- $\sup [0, 1] = 1 \in [0,1]$ (it's also the maximum)
- $\sup (0, 1) = 1 \notin (0,1)$ (no maximum exists)

> :sarcasticgoose: "So the supremum is just the maximum?" No. The maximum is the supremum *when it belongs to the set*. Open intervals, sequences that approach but never reach a value — these have suprema but no maxima. If your proof says "let $m$ be the largest element of $S$," you'd better verify $S$ actually attains its supremum.

## The Archimedean Property

**Theorem**: For every $x \in \mathbb{R}$, there exists $n \in \mathbb{N}$ with $n > x$.

Equivalently: there is no infinitely large real number, and for any $\varepsilon > 0$, there exists $n$ with $1/n < \varepsilon$.

*Proof* (by contradiction): Suppose not — suppose there exists $x \in \mathbb{R}$ such that $n \leq x$ for all $n \in \mathbb{N}$. Then $\mathbb{N}$ is bounded above (by $x$).

By the completeness axiom, $\sup \mathbb{N}$ exists. Call it $\alpha$.

Since $\alpha$ is the *least* upper bound, $\alpha - 1$ is not an upper bound. So there exists $n_0 \in \mathbb{N}$ with $n_0 > \alpha - 1$.

But then $n_0 + 1 > \alpha$. And $n_0 + 1 \in \mathbb{N}$ (since $\mathbb{N}$ is closed under successor).

This contradicts $\alpha$ being an upper bound of $\mathbb{N}$. $\square$

**Corollary**: For any $\varepsilon > 0$, there exists $n \in \mathbb{N}$ with $1/n < \varepsilon$.

*Proof*: By the Archimedean property, there exists $n$ with $n > 1/\varepsilon$. Since $n > 0$ and $1/\varepsilon > 0$, multiply both sides by $\varepsilon/n$ (positive, so inequality preserved): $\varepsilon > 1/n$, i.e., $1/n < \varepsilon$. $\square$

## Density of $\mathbb{Q}$ in $\mathbb{R}$

**Theorem**: Between any two distinct reals, there is a rational number.

More precisely: if $a < b$, then there exists $q \in \mathbb{Q}$ with $a < q < b$.

*Proof*: Since $a < b$, we have $b - a > 0$.

**Step 1**: By the Archimedean property, there exists $n \in \mathbb{N}$ with $n > 0$ such that:

```math
\frac{1}{n} < b - a \quad\text{(equivalently, } n(b - a) > 1\text{)}
```

**Step 2**: By the Archimedean property again, there exist positive integers greater than $na$ and positive integers greater than $-na$. So the set $\{m \in \mathbb{Z} : m > na\}$ is nonempty.

By the well-ordering principle (every nonempty subset of positive integers has a least element — applied after shifting), there exists a *least* integer $m$ such that $m > na$. This means:

```math
m - 1 \leq na < m
```

**Step 3**: We show $m < nb$. From $m \leq na + 1$ and Step 1:

```math
m \leq na + 1 < na + n(b - a) = nb
```

So $m < nb$.

**Step 4**: Dividing $na < m < nb$ by $n > 0$:

```math
a < \frac{m}{n} < b
```

So $q = m/n \in \mathbb{Q}$ and $a < q < b$. $\square$

> :nerdygoose: Density of rationals means you can approximate any real number arbitrarily well with rationals. This is why floating-point (which uses rationals with powers-of-two denominators) works at all. But density doesn't mean "same size" — $\mathbb{Q}$ is countable while $\mathbb{R}$ is uncountable. Measure zero versus full measure.

## Algorithmic Touchpoints

- **Binary search** implicitly uses completeness: the nested intervals $[a_n, b_n]$ converge to a point because $\mathbb{R}$ is complete.
- **Floating-point epsilon comparisons** (`|a - b| < eps`) are the computational version of the absolute value characterization.
- **Supremum as limit** is the idea behind `std::upper_bound` in C++ — finding the tightest bound.
- **Archimedean property** guarantees that any loop `while (x > 1/n) n++` terminates.

## Quick Sanity Checks

- If you claim $M = \sup S$, verify both conditions: upper bound AND no smaller one works.
- If your proof uses "let $m$ be the max of $S$," check whether the sup is attained.
- When manipulating inequalities, track the sign of what you multiply by.
- Remember: $|a - b| < \varepsilon$ means $a$ and $b$ are within $\varepsilon$ of each other. This is the language of limits.
