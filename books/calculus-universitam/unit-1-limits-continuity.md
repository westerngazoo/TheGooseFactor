---
id: unit-1-limits-continuity
title: Unit I - Limits & Continuity
sidebar_position: 2
---

# Unit I: Limits & Continuity Through Geometric Algebra

Calculus is the mathematics of *change* and *accumulation*, but both of those ideas rest on a single, more primitive notion: the **limit**. Before we can differentiate or integrate anything, we must say precisely what it means for one quantity to *approach* another. This unit builds that foundation, and it does so in a way that will pay off immediately: by phrasing limits in terms of *distance* rather than *coordinates*, the same definition will serve us for scalars, for vectors, and later for full multivector-valued fields.

## 1. The Idea of Approach

Informally, we say

$$ \lim_{x \to a} f(x) = L $$

means "as $x$ gets arbitrarily close to $a$, the value $f(x)$ gets arbitrarily close to $L$." The trouble with this sentence is the word "close." Close how? Closer than what? Calculus only became rigorous once mathematicians replaced this hand-waving with a challenge–response game, the **$\varepsilon$–$\delta$ definition**.

The key conceptual move — and the one that makes Geometric Algebra fit so naturally — is that "closeness" is measured by a **magnitude**, never by a coordinate. In GA the magnitude of any object $A$ is

$$ |A| = \sqrt{\langle A^\dagger A \rangle_0}, $$

where $\langle \cdot \rangle_0$ extracts the scalar part and $A^\dagger$ is the reverse. For an ordinary vector $\mathbf{v}$ this collapses to the familiar $|\mathbf{v}| = \sqrt{\mathbf{v}\cdot\mathbf{v}}$. The point is that the *definition* of a limit will reference only $|f(x) - L|$ and $|x - a|$ — magnitudes — so it transfers verbatim from the real line to any geometric space.

> :happygoose: Notice what we gained for free: by writing the limit in terms of $|\cdot|$, we never have to rewrite the definition when $f$ starts returning vectors or bivectors. One definition, every grade.

## 2. The $\varepsilon$–$\delta$ Definition

Let $f$ be defined on an open neighborhood of $a$ (except possibly at $a$ itself). We say $\lim_{x \to a} f(x) = L$ if:

$$ \forall\, \varepsilon > 0,\ \exists\, \delta > 0 \ \text{ such that } \ 0 < |x - a| < \delta \ \implies\ |f(x) - L| < \varepsilon. $$

Read this as a game between two players:

1. **The skeptic** picks a tolerance $\varepsilon > 0$ — "I bet you can't get $f(x)$ within $\varepsilon$ of $L$."
2. **You** respond with a radius $\delta > 0$ — "Stay within $\delta$ of $a$ (but don't sit *on* $a$) and I guarantee you land within $\varepsilon$ of $L$."

If you can always answer *every* $\varepsilon$, the limit exists and equals $L$.

The clause $0 < |x - a|$ is doing real work: it excludes the point $a$ itself. The limit describes the *approach*, not the value at the destination. A function can have a perfectly good limit at a point where it is undefined — which is exactly the situation every derivative will exploit.

> :mathgoose: The order of quantifiers is the entire subject. It is $\forall \varepsilon\, \exists \delta$, never $\exists \delta\, \forall \varepsilon$. The skeptic moves first; your $\delta$ is allowed to depend on $\varepsilon$ (and usually shrinks as $\varepsilon$ does). Swap the order and you have defined something far stronger (and usually false).

### Worked Example 1: A linear limit

Let us prove rigorously that $\lim_{x\to 3}(2x - 1) = 5$.

**Scratch work (find $\delta$).** We need $|(2x-1) - 5| < \varepsilon$. Simplify the left side:

$$ |(2x - 1) - 5| = |2x - 6| = 2\,|x - 3|. $$

We want this below $\varepsilon$, i.e. $|x-3| < \varepsilon/2$. So choosing $\delta = \varepsilon/2$ should work.

**Proof.** Given any $\varepsilon > 0$, choose $\delta = \varepsilon/2$. Then whenever $0 < |x - 3| < \delta$,

$$ |(2x-1) - 5| = 2|x-3| < 2\delta = 2\cdot \frac{\varepsilon}{2} = \varepsilon. $$

Since $\varepsilon$ was arbitrary, the limit is $5$. $\blacksquare$

### Worked Example 2: A nonlinear limit

Prove $\lim_{x\to 2} x^2 = 4$.

**Scratch work.** We need $|x^2 - 4| = |x-2|\,|x+2| < \varepsilon$. The factor $|x-2|$ is the one we control; $|x+2|$ must be *bounded*. Pre-restrict $\delta \le 1$, so $|x - 2| < 1$ gives $1 < x < 3$ and hence $|x + 2| < 5$. Then $|x^2 - 4| < 5|x-2|$, which is below $\varepsilon$ if $|x - 2| < \varepsilon/5$.

**Proof.** Given $\varepsilon > 0$, choose $\delta = \min\{1,\ \varepsilon/5\}$. If $0 < |x-2| < \delta$, then $|x+2| < 5$ and

$$ |x^2 - 4| = |x-2|\,|x+2| < \delta \cdot 5 \le \frac{\varepsilon}{5}\cdot 5 = \varepsilon. \qquad \blacksquare $$

> :nerdygoose: The $\min\{1, \varepsilon/5\}$ trick is the workhorse of nonlinear $\varepsilon$–$\delta$ proofs. You "spend" part of $\delta$ to bound the wild factor and the rest to beat $\varepsilon$. The constant $1$ is arbitrary; any fixed cushion works.

## 3. Limit Laws

Once a few limits are established from the definition, we rarely return to $\varepsilon$–$\delta$. Instead we compose known limits with the **limit laws**. Suppose $\lim_{x\to a} f(x) = L$ and $\lim_{x\to a} g(x) = M$. Then:

$$
\begin{aligned}
\lim_{x\to a}\bigl(f(x) + g(x)\bigr) &= L + M, \\[2pt]
\lim_{x\to a}\bigl(c\,f(x)\bigr) &= c\,L, \\[2pt]
\lim_{x\to a}\bigl(f(x)\,g(x)\bigr) &= L\,M, \\[2pt]
\lim_{x\to a}\frac{f(x)}{g(x)} &= \frac{L}{M} \quad (M \neq 0).
\end{aligned}
$$

The first two laws — additivity and scaling — are exactly the statement that *taking a limit is a linear operation*. That linearity is why the laws survive intact when $f$ and $g$ become vector- or multivector-valued: addition and scalar multiplication are defined grade-by-grade.

The product law needs a word of caution in GA. For multivector-valued maps $F, G$ with $F \to A$ and $G \to B$, the geometric product also passes through the limit,

$$ \lim_{x\to a} F(x)\,G(x) = A\,B, $$

**but you must keep the factors in order**, because the geometric product is not commutative. $AB \neq BA$ in general.

> :angrygoose: Do not "simplify" $\lim F G$ to $\lim G F$ because it looks tidier. For vectors $\mathbf{u}\mathbf{v} = \mathbf{u}\cdot\mathbf{v} + \mathbf{u}\wedge\mathbf{v}$, while $\mathbf{v}\mathbf{u} = \mathbf{u}\cdot\mathbf{v} - \mathbf{u}\wedge\mathbf{v}$. Swapping the order flips the sign of the bivector part. The limit law respects order; so must you.

## 4. The Squeeze Theorem and a Famous Limit

If $g(x) \le f(x) \le h(x)$ near $a$, and $\lim_{x\to a} g(x) = \lim_{x\to a} h(x) = L$, then $\lim_{x\to a} f(x) = L$. The function $f$ is "squeezed" to the common value.

The canonical application is the limit that powers all of trigonometric calculus:

$$ \lim_{\theta \to 0} \frac{\sin\theta}{\theta} = 1. $$

A geometric argument bounds the area of a circular sector between two triangles, yielding $\cos\theta \le \frac{\sin\theta}{\theta} \le 1$ for small $\theta > 0$. Since $\cos\theta \to 1$ as $\theta \to 0$, the squeeze forces $\frac{\sin\theta}{\theta}\to 1$.

> :weightlifinggoose: This limit is the "warm-up set" before differentiating $\sin$. Skip it and your form collapses later: every derivative of a trig function ultimately leans on $\sin\theta/\theta \to 1$. Train it now, lift heavier proofs later.

## 5. One-Sided and Infinite Limits

Sometimes the approach matters. The **left limit** $\lim_{x\to a^-} f(x)$ restricts to $x < a$; the **right limit** $\lim_{x\to a^+} f(x)$ to $x > a$. A (two-sided) limit exists **iff** both one-sided limits exist and agree:

$$ \lim_{x\to a} f(x) = L \iff \lim_{x\to a^-} f(x) = \lim_{x\to a^+} f(x) = L. $$

Consider the sign-step function

$$ f(x) = \frac{|x|}{x} = \begin{cases} -1 & x < 0,\\ +1 & x > 0. \end{cases} $$

Here $\lim_{x\to 0^-} f = -1$ and $\lim_{x\to 0^+} f = +1$. They disagree, so $\lim_{x\to 0} f$ **does not exist**, even though both one-sided limits are perfectly well behaved.

> :surprisedgoose: A function can be bounded, defined everywhere except one point, and have *both* one-sided limits — and still have no limit there. Existence of the parts does not imply agreement of the parts.

## 6. Continuity

A function $f$ is **continuous at $a$** when the limit exists, the value exists, and they coincide:

$$ \lim_{x\to a} f(x) = f(a). $$

Equivalently, three conditions must all hold: (i) $f(a)$ is defined, (ii) $\lim_{x\to a} f(x)$ exists, and (iii) the two are equal. Failing any one produces a discontinuity:

- **Removable** — the limit exists but doesn't equal $f(a)$ (or $f(a)$ is undefined). A single point is "wrong"; you could patch it.
- **Jump** — the one-sided limits exist but differ (our sign-step at $0$).
- **Infinite** — the function blows up, as $1/x$ does at $0$.

### Continuity in the geometric setting

For a vector-valued map $\mathbf{f}: \mathbb{R} \to \mathbb{R}^n$, continuity at $a$ means $|\mathbf{f}(x) - \mathbf{f}(a)| \to 0$ as $x \to a$ — the *same* $\varepsilon$–$\delta$ statement, now with the GA magnitude. A beautiful fact follows immediately: **a vector map is continuous iff each of its components is continuous**. The geometric definition and the component-wise one agree, because

$$ |\mathbf{f}(x) - \mathbf{f}(a)|^2 = \sum_{i} \bigl(f_i(x) - f_i(a)\bigr)^2, $$

and a sum of squares tends to $0$ iff each term does.

> :mathgoose: This is why the magnitude-based definition is the *right* primitive. Continuity, defined once via $|\cdot|$, is automatically coordinate-free yet recovers the component test on demand. The geometry is the invariant; the components are merely a chosen basis.

### Worked Example 3: Patching a removable discontinuity

The function $f(x) = \dfrac{x^2 - 1}{x - 1}$ is undefined at $x = 1$. But for $x \neq 1$,

$$ f(x) = \frac{(x-1)(x+1)}{x-1} = x + 1, $$

so $\lim_{x\to 1} f(x) = 2$. The discontinuity is removable: defining $f(1) := 2$ makes $f$ continuous everywhere. Note we *may* cancel $(x-1)$ precisely because the limit ignores $x = 1$ itself — the clause $0 < |x - 1|$ guarantees $x - 1 \neq 0$.

## 7. Why This Matters for the Rest of the Course

Every later idea is a limit in disguise:

- The **derivative** (Unit II) is the limit of a difference quotient — and we will read it as the limit of a *linear map*, which is exactly why the magnitude-based definition above was worth the effort.
- The **integral** (Unit III) is the limit of directed Riemann sums.
- **Convergence of series** (Unit IV) is the limit of partial sums.
- The **vector derivative** $\nabla$ (Unit V) is built from directional limits in every direction at once.

Master the $\varepsilon$–$\delta$ game and the continuity trichotomy here, and the rest of calculus becomes bookkeeping on top of a foundation you can trust.

## Summary

- A limit is a challenge–response game: $\forall \varepsilon\, \exists \delta$, with $\delta$ allowed to depend on $\varepsilon$.
- Phrasing limits via the magnitude $|\cdot|$ makes the definition work unchanged for scalars, vectors, and multivectors.
- Limit laws make taking limits a *linear* operation; the product law extends to the geometric product **but order must be preserved**.
- A two-sided limit exists iff both one-sided limits exist and agree.
- $f$ is continuous at $a$ iff $\lim_{x\to a} f(x) = f(a)$; failures are removable, jump, or infinite.
- A vector map is continuous iff all its components are — the geometric and component definitions coincide.

## Exercises

1. Using $\varepsilon$–$\delta$, prove $\lim_{x\to 4}(3x + 2) = 14$.
2. Prove $\lim_{x\to 1} x^3 = 1$ using the $\min$ trick to bound the nonlinear factor.
3. Determine whether $\lim_{x\to 0} \dfrac{|x|}{x}$ exists, and classify the discontinuity at $0$.
4. Show that $f(x) = \dfrac{\sin(3x)}{x}$ has a removable discontinuity at $0$ and find the patched value. (Hint: relate it to $\sin\theta/\theta$.)
5. Let $\mathbf{f}(t) = (\cos t)\,\mathbf{e}_1 + (\sin t)\,\mathbf{e}_2$. Argue from the magnitude definition that $\mathbf{f}$ is continuous everywhere, then confirm via the component test.
