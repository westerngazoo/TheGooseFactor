---
sidebar_position: 1
title: "Scaling GA Networks — What Breaks at Billion-Parameter Scale"
---

# Scaling GA Networks

> The open question of the field: do GA/equivariant networks scale?
> What breaks, what holds, and whether the inductive bias still pays
> when you have billions of parameters and oceans of data.

The deep-learning lesson of the last decade is that **scale wins** —
bigger models, more data, more compute. This poses a sharp question
for geometric/equivariant ML: as scale grows, does the geometric
inductive bias still help, or does a big enough unconstrained model
just learn the symmetry anyway?

## 1. The bitter lesson tension

Sutton's "bitter lesson": general methods that leverage computation
beat hand-crafted structure as compute grows. Equivariance is
hand-crafted structure. Does it survive the bitter lesson?

The counterargument: equivariance isn't a heuristic, it's an **exact
symmetry of the problem**. A model that respects it isn't
constrained suboptimally — it's correctly constrained. The symmetry
is true regardless of scale.

The tension is real and unresolved. Two camps:

- **Structure camp**: equivariance is a correct prior; it always
  helps, especially in low-data regimes, and never hurts.
- **Scale camp**: with enough data, an unconstrained model learns the
  symmetry and gains flexibility the constrained model lacks.

The empirical evidence so far: equivariance clearly helps at small-to-
medium scale (the [Chapter 1](/ai-ga/part-1-why/the-case-for-ga)
10–100× data efficiency). At the largest scales, the picture is
murkier.

> :nerdygoose: This is *the* open question of geometric deep
> learning, and it's not settled. AlphaFold-3 notably moved away from
> the strict equivariance of AlphaFold-2 toward a more flexible
> (augmentation-based) approach at scale — a data point for the scale
> camp. But molecular force fields (NequIP, MACE) remain strictly
> equivariant and dominate their benchmarks — a data point for the
> structure camp. The truth is probably "it depends on the data
> regime," which satisfies no one.

## 2. What breaks computationally

Beyond the philosophical question, there are concrete scaling
bottlenecks for GA/equivariant networks:

**Clebsch-Gordan cost** (irrep methods): the CG tensor products scale
as $O(\ell_{\max}^6)$ in the maximum irrep degree. High-degree
features are expensive, capping practical $\ell_{\max}$.

**Geometric-product cost** (GA methods): the geometric product is
$O(2^n \cdot 2^n)$ in the algebra dimension $n$. For 3D it's a fixed
$8\times8$ operation (cheap), but high-dimensional GA blows up.

**Memory**: multivector/irrep features are larger than scalar
features (8× for 3D multivectors), increasing activation memory.

**Kernel optimization**: standard ML hardware is optimized for dense
matmuls; the structured sparsity of geometric products needs custom
kernels to be competitive (the Brandstetter group's CUDA work).

## 3. What holds

Some things scale well:

- **Low-degree GA** (types 0, 1) has fixed, cheap operations that
  parallelize on GPUs.
- **The equivariance constraint itself** adds no runtime cost — it's a
  restriction on weights, not extra computation.
- **Data efficiency** persists: even at scale, equivariant models
  often need less data, which matters when data is the bottleneck
  (expensive simulations, real-robot samples).

So the scaling story isn't "GA doesn't scale" — it's "low-degree GA
scales fine, high-degree features and high-dimensional algebras get
expensive, and whether the inductive bias keeps paying at extreme
scale is data-regime-dependent."

## 4. Hybrid approaches

The pragmatic frontier: **hybrid** architectures that use equivariance
where it's cheap and beneficial, and flexibility where scale wins.

- **Soft/relaxed equivariance**: layers that are mostly equivariant
  but can break the symmetry slightly when data demands.
- **Equivariant backbone + flexible head**: equivariant feature
  extraction, unconstrained task head.
- **Augmentation + partial equivariance**: combine the two symmetry
  strategies.

AlphaFold-3's design (less strict than AF-2) is a high-profile example
of trading some equivariance for scale and flexibility. Whether this
is the future or a special case of the protein domain is debated.

> :surprisedgoose: AlphaFold-2 was strictly equivariant (invariant
> point attention); AlphaFold-3 relaxed this, using a diffusion
> model with augmentation instead. DeepMind found that at their
> scale, the flexibility was worth more than the strict symmetry.
> This is the single most-cited data point for "scale beats
> structure" in geometric ML — but it's one domain, one model, and
> the generalization is contested.

## 5. The data-regime axis

The cleanest way to think about it: equivariance's value depends on
the **data-to-symmetry ratio**.

- **Little data, exact symmetry** (molecular force fields, real-robot
  RL): equivariance is decisive. The symmetry is exact, data is
  scarce, the constraint is pure benefit.
- **Abundant data, approximate symmetry** (large vision/protein
  models): augmentation can learn the (approximate) symmetry, and
  flexibility may win.

GA networks live at the "little data, exact symmetry" end most
comfortably. The fields where they dominate (molecular dynamics,
robotics) are exactly those where data is expensive and symmetry is
exact.

## 6. Scaling laws for equivariant models

A research direction: do equivariant models have different **scaling
laws** (loss vs parameters/data/compute) than unconstrained ones?

Preliminary findings suggest equivariant models have **better
constants** (lower loss at fixed scale, especially low data) but
possibly similar **exponents** (the rate of improvement with scale).
If true, this means equivariance gives a persistent offset advantage
that doesn't vanish but doesn't grow either — a fixed head start.

This is under active study; the scaling-law characterization of
equivariant models is incomplete.

## 7. Where GA specifically stands

For the GA-native approach (vs general equivariant methods):

- **Advantage**: uniform, dimension-agnostic operations; cheap
  low-degree products; the geometric product as a fixed primitive.
- **Disadvantage**: native grades cover low types; high-type features
  (where some accuracy lives) need extensions.
- **Open**: whether GA's uniformity translates to better scaling than
  irrep methods, or whether it's a wash, isn't established.

GA's scaling story is tied to the broader equivariant-scaling
question, with the additional wrinkle of the grade-vs-irrep
expressiveness trade-off.

## 8. The honest summary

Where things stand:

- Equivariance/GA clearly helps at small-medium scale and in
  low-data, exact-symmetry regimes.
- At extreme scale with abundant data, the benefit is contested;
  some high-profile models relaxed equivariance.
- Computational scaling is fine for low-degree GA, expensive for
  high-degree/high-dimensional.
- The field hasn't converged; this is a live research frontier.

> :weightliftinggoose: Don't believe anyone who tells you the
> scaling question is settled — in either direction. Equivariance is
> a correct prior that demonstrably helps in the data regimes where
> GA networks are used (molecules, robots). Whether it survives to
> billion-parameter, ocean-of-data scale is genuinely open, and the
> evidence cuts both ways. Train on your data regime, measure, and
> don't cargo-cult either camp.

## What we covered

- The bitter-lesson tension: does hand-crafted symmetry survive
  scale?
- Structure camp (equivariance is a correct, scale-independent prior)
  vs scale camp (big models learn symmetry, gain flexibility).
- Computational bottlenecks: CG cost, geometric-product cost,
  memory, kernels.
- What holds: low-degree GA scales, data efficiency persists.
- Hybrid/relaxed-equivariance approaches (AlphaFold-3 as the example).
- The data-regime axis: equivariance wins when data is scarce and
  symmetry exact.
- Scaling laws: possibly better constants, similar exponents
  (unsettled).
- The honest summary: live frontier, evidence cuts both ways.

## What's next

[Chapter 21](/ai-ga/part-6-frontiers/interpretability-of-multivector-activations) —
interpretability of multivector activations. Whether the geometric
structure of GA features makes them more interpretable than opaque
scalar activations.
