---
title: "Euler's Equation Is Beautiful — But Only If You Plug In Tau, Not Pi"
description: "Pi is wrong. Not the number — the choice. Tau is the real circle constant, and switching to it eliminates half the cognitive overhead in trigonometry, calculus, and physics. Here's the technical argument."
authors: [geese]
tags: [math]
---

# Euler's Equation Is Beautiful — But Only If You Plug In Tau, Not Pi

Define $\tau = 2\pi \approx 6.283185\ldots$

That's it. One full turn. The circumference of a unit circle. The period of sine and cosine. The thing that $2\pi$ has been awkwardly standing in for across every equation in mathematics, physics, and engineering for 300 years.

This isn't aesthetic preference. It's a technical argument. Every formula that contains $2\pi$ is evidence that we picked the wrong constant. And it's a lot of formulas.

<!-- truncate -->

> :angrygoose: Let me get this out of the way: I'm not here to debate. $\pi$ is wrong. Not the number — the *choice*. If you're still writing $2\pi$ everywhere and thinking "that's fine, it's just convention," you've been gaslit by 300 years of mathematical tradition. Strap in.

## The Core Problem

The circle constant should be the ratio of circumference to **radius**, not circumference to diameter:

```math
\tau = \frac{C}{r} = 6.283185\ldots
```

We use radius everywhere. Radius defines the unit circle. Radius parameterizes polar coordinates. Radius appears in every distance formula, every norm, every metric space. The diameter is a derived quantity — two radii glued together. Yet $\pi = C/d$ is defined in terms of the diameter.

This means every time the circle constant appears in its natural context, we write $2\pi$ instead of $\tau$. The factor of 2 is bookkeeping for a historical accident. It adds no information. It just sits there, cluttering equations and creating opportunities for sign errors.

> :nerdygoose: Historically, some early mathematicians *did* use $\tau$-like constants. William Jones introduced $\pi$ in 1706, but Euler popularized it in 1736 — and he actually used $\pi$ to mean different things in different papers, sometimes $3.14...$, sometimes $6.28...$. The standardization on the half-turn constant was essentially arbitrary. We've been living with the consequences ever since.

## Angles: Where It's Most Obvious

A full turn around the circle is $\tau$ radians. A half turn is $\tau/2$. A quarter turn is $\tau/4$.

| Fraction of turn | With $\tau$ | With $\pi$ |
|---|---|---|
| Full turn | $\tau$ | $2\pi$ |
| Half turn | $\tau/2$ | $\pi$ |
| Third turn | $\tau/3$ | $2\pi/3$ |
| Quarter turn | $\tau/4$ | $\pi/2$ |
| Sixth turn | $\tau/6$ | $\pi/3$ |
| Eighth turn | $\tau/8$ | $\pi/4$ |
| Twelfth turn | $\tau/12$ | $\pi/6$ |

With $\tau$, the fraction of a turn is literally the denominator. One-quarter turn is $\tau/4$. One-twelfth turn is $\tau/12$. The notation maps directly to the geometry.

With $\pi$, a quarter turn is $\pi/2$ — which looks like "half of something." Half of what? Half of $\pi$, which is half a turn. So a quarter turn is half of a half turn. Two levels of indirection to express the simplest geometric concept.

> :sarcasticgoose: "But I already memorized the unit circle with $\pi$!" Great. Now explain to a student why a quarter turn is $\pi/2$ without using the word "half" twice in one sentence. I'll wait.

Students spend weeks building intuition for radian measure. Most of that time is fighting the factor of 2, not learning the geometry.

## The Unit Circle Values

With tau, the standard angles become transparent:

| Angle | $\tau$ form | $\sin$ | $\cos$ |
|---|---|---|---|
| $0$ | $0$ | $0$ | $1$ |
| $\tau/12$ | 30 degrees | $1/2$ | $\sqrt{3}/2$ |
| $\tau/8$ | 45 degrees | $\sqrt{2}/2$ | $\sqrt{2}/2$ |
| $\tau/6$ | 60 degrees | $\sqrt{3}/2$ | $1/2$ |
| $\tau/4$ | 90 degrees | $1$ | $0$ |
| $\tau/2$ | 180 degrees | $0$ | $-1$ |
| $\tau$ | 360 degrees | $0$ | $1$ |

At $\tau/4$ you've gone a quarter turn. At $\tau/2$ you've gone half. At $\tau$ you're back. The angle is the fraction of a turn, directly. No mental conversion.

> :mathgoose: Here's the mnemonic with $\tau$. The sine values at $0, \tau/12, \tau/8, \tau/6, \tau/4$ are $\sqrt{0}/2, \sqrt{1}/2, \sqrt{2}/2, \sqrt{3}/2, \sqrt{4}/2$. That's $0, 1/2, \sqrt{2}/2, \sqrt{3}/2, 1$. Cosine is the same sequence reversed. Clean. Now try to see that pattern through the $\pi$ notation. You can't, because the denominators are lying to you.

## Periodicity

Sine and cosine are periodic with period $\tau$:

```math
\sin(\theta + \tau) = \sin\theta, \qquad \cos(\theta + \tau) = \cos\theta
```

The period of the fundamental circular functions is the circle constant. As it should be. Writing $\sin(\theta + 2\pi) = \sin\theta$ obscures this by making the period look like a derived quantity.

## Euler's Identity — The Real One

The "most beautiful equation in mathematics" is usually stated as:

```math
e^{i\pi} + 1 = 0
```

> :surprisedgoose: Quick — what does this equation actually *mean* geometrically? "$e$ to the $i$ times half a turn equals negative one." Okay, sure, going halfway around the unit circle in the complex plane lands you at $-1$. That's... a special case. A pretty special case, but a special case.

The deeper identity is Euler's formula applied to a full turn:

```math
e^{i\tau} = 1
```

Raising $e$ to a full turn in the complex plane brings you back to where you started. *That's* the fundamental statement. The identity $e^{i\pi} = -1$ is the corollary, not the other way around.

> :angrygoose: The $\pi$ version gets called "beautiful" because it has $e$, $i$, $\pi$, $1$, and $0$ in one equation. Cool, so we're optimizing for Scrabble points now? The $\tau$ version, $e^{i\tau} = 1$, *says something*: a full rotation is the identity transformation. That's not just pretty — it's the definition of what "full turn" means in the complex plane. Beauty is truth, not symbol-collecting.

The $\tau$ form also generalizes cleanly. The $n$-th roots of unity are:

```math
e^{i k\tau/n}, \qquad k = 0, 1, \ldots, n-1
```

Evenly spaced points on the unit circle, parameterized by fractions of $\tau$. With $\pi$, you write $e^{2\pi i k/n}$ — the factor of 2 is back, adding nothing.

## Circumference and Area

**Circumference**: $C = \tau r$. Clean. One constant, one radius.

With $\pi$: $C = 2\pi r$. The factor of 2 is algebraic noise.

**Area**: $A = \frac{1}{2}\tau r^2$.

> :sarcasticgoose: "Aha! The $1/2$ is ugly! $\pi r^2$ is cleaner!" I knew you'd say that. This is the one argument $\pi$ advocates have, and it's wrong. Keep reading.

Look at the structure. $A = \frac{1}{2}\tau r^2$ has exactly the same form as:

```math
\frac{1}{2}mv^2 \quad\text{(kinetic energy)}, \qquad \frac{1}{2}kx^2 \quad\text{(spring energy)}, \qquad \frac{1}{2}at^2 \quad\text{(distance under constant acceleration)}
```

These all come from integrating a linear function. The area of a circle is $\int_0^r \tau\rho\,d\rho = \frac{1}{2}\tau r^2$ — the integral of the circumference at radius $\rho$, accumulated from 0 to $r$. The $1/2$ isn't awkward — it's the signature of a quadratic that arises from integration. Hiding it with $\pi$ obscures the calculus.

> :mathgoose: This is the killer argument. The $1/2$ in $\frac{1}{2}\tau r^2$ tells you *where the formula comes from* — it's the antiderivative of a linear function. Every physics student knows $\frac{1}{2}mv^2$ is kinetic energy from integrating momentum. Same structure. $\pi r^2$ memorizes the answer but destroys the derivation. It's the mathematical equivalent of a magic number in code.

## Gaussian Distribution

The normal distribution:

```math
f(x) = \frac{1}{\sqrt{\tau}\,\sigma}\,e^{-\frac{(x-\mu)^2}{2\sigma^2}}
```

With $\pi$: $\frac{1}{\sqrt{2\pi}\,\sigma}$. The $\sqrt{2\pi}$ is really $\sqrt{\tau}$. Every statistics textbook carries $\sqrt{2\pi}$ as an opaque normalization constant. With $\tau$, it's transparent: the normalizing factor for the Gaussian is $\sqrt{\tau}$.

> :nerdygoose: If you've ever wondered why the normal distribution has a $\sqrt{2\pi}$ in it — it's because the Gaussian integral $\int_{-\infty}^{\infty} e^{-x^2/2}\,dx = \sqrt{2\pi} = \sqrt{\tau}$. The $2\pi$ isn't two separate constants multiplied. It's one constant — the circle constant — under a square root. We just wrote it with the wrong symbol.

## Fourier Transform

```math
\hat{f}(\xi) = \int_{-\infty}^{\infty} f(x)\,e^{-i\tau\xi x}\,dx
```

The natural frequency variable pairs with $\tau$, not $2\pi$. Every signal processing textbook fights with where to put the $2\pi$ — in the forward transform? The inverse? Split as $\sqrt{2\pi}$? These are all symptoms of using the wrong constant. With $\tau$, the convention is unambiguous.

> :angrygoose: The Fourier convention wars have wasted more collective hours than any other notational dispute in applied mathematics. There are at least four common conventions for where to put the $2\pi$. With $\tau$, there's one: put it in the exponent. Done. Every convention is trying to say "use $\tau$" while being forced to write "$2\pi$."

## Cauchy's Integral Formula

```math
f(a) = \frac{1}{i\tau}\oint_\gamma \frac{f(z)}{z - a}\,dz
```

Residue theorem: $\oint f(z)\,dz = i\tau \sum \text{Res}$. The factor that appears in complex analysis when you go around a contour is $\tau$ — one full turn in the complex plane. Writing $2\pi i$ everywhere is just writing $i\tau$ with extra steps.

## Physics

The pattern is everywhere in physics:

| Formula | With $\tau$ | With $\pi$ |
|---|---|---|
| Angular frequency | $\omega = \tau f$ | $\omega = 2\pi f$ |
| Reduced Planck constant | $\hbar = h/\tau$ | $\hbar = h/(2\pi)$ |
| Coulomb's law | $\frac{1}{\tau\varepsilon_0}\frac{2q}{r}$ (per unit length) | $\frac{1}{2\pi\varepsilon_0}\frac{q}{r}$ |
| Magnetic permeability | $\mu_0 = \tau \times 2 \times 10^{-7}$ H/m | $\mu_0 = 4\pi \times 10^{-7}$ H/m |

> :happygoose: $\hbar$ exists because $h$ was defined with $\pi$ instead of $\tau$. If we'd used $\tau$ from the start, $\hbar$ would just be $h$, and every quantum mechanics textbook would be slightly shorter. We invented an entire symbol — $\hbar$ — as a patch for picking the wrong circle constant. Let that sink in.

## The Conversion Cost Is Zero

Switching from $\pi$ to $\tau$ in your own work costs nothing:

1. Define $\tau = 2\pi$ at the top of your notebook or codebase
2. Replace $2\pi$ with $\tau$ everywhere
3. Replace bare $\pi$ (half turns) with $\tau/2$

Python: `from math import tau` — it's been in the standard library since 3.6.
Rust: `std::f64::consts::TAU` — available since 1.47.
C++: `std::numbers::pi * 2` or define your own constant.
JavaScript: `Math.PI * 2` or define `const TAU = 2 * Math.PI`.

The languages already know. The textbooks are catching up.

> :sarcasticgoose: "But all the textbooks use $\pi$!" All the textbooks used to say the Earth was the center of the universe too. Popularity is not correctness. The right constant is the one that makes every formula simpler, and that constant is $\tau$. Your compiler already supports it. Your notation should too.

## Why This Matters

This isn't about aesthetics. It's about cognitive load.

Every time a student writes $2\pi$ and has to remember that it means "one full turn," that's a unit of attention spent on convention instead of mathematics. Every time a physicist writes $\hbar$ instead of $h$ and explains "it's $h$ divided by $2\pi$," that's a sentence spent on historical baggage instead of physics.

Tau doesn't make math easier. It makes the notation faithful to the geometry. A quarter turn looks like a quarter. A full period looks like one constant. The normalization factors in Fourier analysis and probability come out clean. The factor of $1/2$ in the circle area reveals the calculus instead of hiding it.

We picked the wrong constant 300 years ago. We've been patching around it with factors of 2 ever since. The patch is $\tau$.

> :mathgoose: Every page on The Goose Factor uses $\tau$. Not because we're contrarian — because we care about students actually understanding the geometry behind the symbols. If you're reading our calculus material and you see $\tau/4$, you *know* it's a quarter turn. No translation layer. No factor-of-2 tax. Just math that says what it means.
>
> :angrygoose: And if you still think $e^{i\pi} + 1 = 0$ is more beautiful than $e^{i\tau} = 1$, ask yourself: is it the math you find beautiful, or the mystery? Because $\tau$ removes the mystery and keeps the math. That's the whole point.

---

*All math content on The Goose Factor uses $\tau$ as the circle constant. Because once you see it, you can't unsee it.*
