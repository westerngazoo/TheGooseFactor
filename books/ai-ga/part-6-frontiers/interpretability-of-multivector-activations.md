---
sidebar_position: 2
title: "Interpretability of Multivector Activations"
---

# Interpretability of Multivector Activations

> Does the geometric structure of GA features make them more
> interpretable than opaque scalar activations? A speculative but
> appealing frontier.

Neural network activations are notoriously opaque — a vector of
numbers with no inherent meaning. GA features have **geometric type**:
a grade-1 part is a direction, a grade-2 part is a plane, the
pseudoscalar is a signed volume. Does this geometric grounding make
GA networks more interpretable? This chapter explores the case — and
its limits.

## 1. The interpretability problem

In a standard network, an activation $h \in \mathbb{R}^d$ is a list of
$d$ numbers. What do they mean? Usually nothing inspectable — they're
whatever the optimization found useful. Interpretability research
(probing, feature visualization, mechanistic interpretability) tries
to reverse-engineer meaning from these opaque vectors.

The hope for GA: if activations are **multivectors** with geometric
type, their meaning is partly **built in**. A vector activation *is* a
direction in space; you can plot it, see where it points, relate it to
the input geometry.

## 2. The case for GA interpretability

Several structural features support interpretability:

**Grade has meaning.** The grade-1 part of an activation is a genuine
geometric vector — you can visualize it as an arrow in the input
space. The grade-2 part is a plane/rotation. The pseudoscalar is a
chirality/volume indicator. Unlike a raw scalar activation, these have
inherent geometric semantics.

**Equivariance constrains meaning.** Because the network is
equivariant, an activation's geometric type is preserved through the
network — a vector activation stays a vector, transforming
predictably under input rotation. This consistency makes the
activations trackable: you know how they *should* transform, so
deviations are meaningful.

**Rotors are inspectable.** When a network outputs or uses rotors,
those rotors have direct interpretation — an axis and angle of
rotation. A learned rotor is a learned rotation, which you can
examine geometrically.

> :happygoose: The interpretability pitch is real at the type level:
> a grade-1 activation in a molecular network is a direction you can
> draw on the molecule, a grade-2 activation is a plane you can
> visualize. Compare to a 256-dim scalar activation, which is just
> opaque. GA features come with a geometric "type signature" that
> grounds their meaning in the input space.

## 3. The limits of the case

The optimism has limits:

**Channels are still opaque.** A GA network has many channels, each a
multivector. *Which* geometric feature each channel encodes is still
learned and not labeled — you know channel 17's grade-1 part is *a*
direction, but not *what* direction means semantically (a bond? a
force? a learned abstraction?).

**Mixing obscures meaning.** Deep networks mix features across layers.
By layer 10, a multivector activation is a complex function of the
input, geometrically typed but semantically tangled. The type is
clear; the *meaning* is not.

**Geometric type ≠ semantic meaning.** Knowing an activation is a
bivector tells you how it transforms, not what it represents. The gap
between "transforms like a plane" and "represents the
hydrogen-bond-acceptor plane" is the same interpretability gap as
ever, just with a geometric label attached.

So GA gives **partial** interpretability — the transformation
structure is transparent, the semantic content is not. Better than
opaque scalars, far from solved.

## 4. Probing GA networks

Interpretability techniques adapt to GA features:

- **Geometric probing**: train linear probes that map activations to
  known geometric quantities (bond directions, force vectors). The
  equivariance constraint means the probes must themselves be
  equivariant.
- **Grade analysis**: examine which grades carry signal for a task.
  Does the network use the pseudoscalar (chirality)? The bivectors
  (orientation)? This tells you what geometric information the task
  needs.
- **Rotor visualization**: for networks with explicit rotor
  operations, visualize the learned rotations directly.

These give more traction than probing opaque scalars, because the
geometric type guides what to probe for.

## 5. Mechanistic interpretability and symmetry

Mechanistic interpretability (reverse-engineering circuits) might
benefit from equivariance: a circuit in an equivariant network must
itself respect the symmetry, which constrains the space of possible
circuits. Fewer possible mechanisms = easier to enumerate and
understand.

This is speculative — mechanistic interpretability of equivariant
networks is barely explored — but the principle is sound: symmetry
constraints reduce the hypothesis space for "what is this circuit
doing," which should aid reverse-engineering.

> :nerdygoose: If mechanistic interpretability is "reverse-engineering
> the algorithm a network learned," then equivariance is a strong
> prior on what algorithms are possible — the algorithm must commute
> with the group action. This is unexplored territory, but
> constraining the space of learnable algorithms by symmetry could
> make them more discoverable. A genuinely open research direction.

## 6. Interpretability for science

For scientific ML (molecules, physics), interpretability has a
specific goal: **extract scientific insight** from the trained model.
Did the network discover a known physical principle? An unknown one?

GA features help here because they're in the **same language as the
science**. A molecular network's grade-1 activations are directions
that can be compared to known chemical directionality (dipoles, bond
vectors). If the network's internal geometry aligns with known
chemistry, that's validation; if it uses geometry in unexpected ways,
that might be discovery.

This "interpretability as scientific instrument" is perhaps the most
compelling near-term application — GA networks as tools whose internal
geometry can be read by domain scientists.

## 7. The honest assessment

Where interpretability of GA networks stands:

- **Real advantage**: geometric type grounds activations in the input
  space; transformation structure is transparent.
- **Real limit**: semantic content is still learned and opaque;
  deep mixing tangles meaning.
- **Promising directions**: geometric probing, grade analysis,
  symmetry-constrained mechanistic interpretability,
  interpretability-as-scientific-instrument.
- **Status**: early. Few papers specifically study GA-network
  interpretability; the case is mostly structural argument plus
  scattered empirical hints.

> :weightliftinggoose: The interpretability pitch for GA is honest
> but modest: geometric type makes activations *less* opaque, not
> *transparent*. You get the transformation structure for free and a
> "type signature" that guides probing — real value, especially for
> scientific ML where the features speak the domain's language. But
> the hard interpretability problem (what does this activation *mean*)
> isn't solved by geometry alone. Promising, unfinished.

## What we covered

- Standard activations are opaque; GA activations have geometric type.
- The case: grade has meaning, equivariance constrains transformation,
  rotors are inspectable.
- The limits: channels still opaque, deep mixing tangles meaning,
  type ≠ semantics.
- Probing techniques: geometric probes, grade analysis, rotor
  visualization.
- Symmetry constrains the space of mechanisms (mechanistic-interp
  speculation).
- Interpretability as a scientific instrument: GA features in the
  language of the science.
- Honest assessment: partial advantage, early-stage research.

## What's next

[Chapter 22](/ai-ga/part-6-frontiers/open-problems-and-workshops) —
open problems and workshops to watch. The unsolved questions, the
venues where the field's progress is reported, and how to stay
current.
