---
sidebar_position: 4
title: "Conformal GA for Transformer Geometry — Speculative"
---

# Conformal GA for Transformer Geometry

> The speculative finale. Could the attention mechanism itself be
> reformulated geometrically? A deliberately exploratory look at the
> edge of the field — clearly labeled as speculation.

This chapter is different from the rest of the book. Everything before
it described established or emerging work. This is **speculation** —
ideas at the edge that may or may not pan out. Read it as
provocation, not instruction.

## 1. The premise

Transformers dominate modern AI. Their core operation, attention, is
usually described in linear-algebra terms: queries, keys, values, dot
products, softmax. But attention has **geometric structure** — it
computes similarities, aggregates by relevance, transports information
between positions. Could a geometric-algebra reformulation reveal
something?

This is speculative because, unlike molecules or robots, language and
general sequences **don't have an obvious spatial symmetry group**.
There's no $SO(3)$ acting on tokens. So the equivariance argument that
drove the rest of the book doesn't directly apply. The question is
whether GA offers something else here.

## 2. Attention as geometric transport

One angle: attention **transports** value vectors from source
positions to target positions, weighted by query-key similarity. In
GA terms, you could imagine the transport as a **rotor** — each
attention edge applies a learned geometric transformation to the
value as it moves.

Standard attention: $\text{out}_i = \sum_j \alpha_{ij}\,v_j$ (weighted
sum). A GA version:
$\text{out}_i = \sum_j \alpha_{ij}\,T_{ij}\,v_j\,\tilde{T}_{ij}$,
where $T_{ij}$ is a learned rotor transporting $v_j$'s geometric
content into position $i$'s frame.

This is exactly the geometric value transport of
[Chapter 6](/ai-ga/part-2-equivariance/equivariant-attention-with-rotors),
but applied to **abstract** (non-spatial) features. Whether the
geometric transport helps when there's no spatial symmetry is the
open question.

> :nerdygoose: The honest issue: geometric value transport earns its
> keep when there's a *real* geometry to be equivariant to (molecular
> 3D space, robotic $SE(3)$). For language tokens, the "geometry" is
> learned and abstract — there's no ground-truth symmetry the rotor
> must respect. So the GA structure becomes just a different
> parameterization, not a correctness constraint. It might still help
> as an inductive bias, but the strong argument (exact symmetry)
> isn't available.

## 3. Positional encoding as conformal embedding

A more concrete speculation: **positional encodings**. Transformers
encode token positions, and rotary positional embeddings (RoPE) — now
standard in LLMs — encode relative position as **rotations** in
feature space.

RoPE is, structurally, a GA operation: it applies position-dependent
rotors to query/key vectors, so that the dot product depends on
relative position. The "rotation in feature space" of RoPE is exactly
a rotor action.

Could **conformal** GA extend this? Conformal embeddings encode not
just position but distance, scale, and hierarchical structure
([Chapter 15](/ai-ga/part-4-representations/conformal-embeddings-for-graphs)).
A conformal positional encoding might capture richer positional
relationships — relative distance, hierarchy, multi-scale structure —
in a single algebraic framework.

This is speculative but **grounded**: RoPE already proves that
rotor-based positional encoding works at scale. Whether conformal
extensions add value is testable.

> :surprisedgoose: RoPE — rotary positional embeddings, used in
> essentially every modern LLM — is geometric algebra that the field
> adopted without calling it that. It applies rotors to encode
> relative position. This is the one place where GA-flavored
> structure is already in the largest-scale models, just under a
> different name. The conformal extension is the natural next
> speculation.

## 4. Multivector token representations

Another speculation: represent tokens as **multivectors** rather than
plain vectors. The grade structure could encode different aspects of
meaning — scalar (magnitude/salience), vector (semantic direction),
bivector (relational/contextual structure).

The geometric product between token multivectors would then be a
richer interaction than the dot product — capturing not just
similarity (scalar part) but relational structure (bivector part) in
one operation.

This is very speculative — there's no evidence that language has the
geometric structure to make this pay, and the extra parameters might
just add cost. But it's the kind of idea the GA framework naturally
suggests.

## 5. Why this is hard

The fundamental obstacle: **language has no obvious geometric
symmetry**. The whole power of GA in molecules and robotics came from
exact symmetries ($SO(3)$, $SE(3)$) that the algebra respects. Text
doesn't have these.

What text *does* have:

- **Approximate, learned structure**: semantic relationships,
  syntactic hierarchy, compositional meaning. But these aren't a
  group action with a clean algebraic realization.
- **Sequential/positional structure**: which RoPE already handles
  rotor-style.

So the GA pitch for transformers can't be "equivariance to a known
symmetry." It would have to be "the geometric product is a useful
inductive bias even without an exact symmetry" — a much weaker,
unproven claim.

## 6. The honest verdict

Where this speculation stands:

- **RoPE**: real, deployed, rotor-based positional encoding. The one
  solid foothold.
- **Conformal positional encoding**: plausible extension, testable,
  unproven.
- **Geometric attention transport for language**: speculative,
  lacks the symmetry argument, might be just reparameterization.
- **Multivector tokens**: very speculative, no evidence yet.

The chapter title says "speculative" and means it. GA's strong
results are in domains with exact geometric symmetry. Transformers on
general sequences don't obviously have that. The honest position:
RoPE shows rotor structure *can* help at scale; the rest is open
provocation.

## 7. Why include speculation at all

If it's unproven, why end the book here? Because **the edge of a
field is where the interesting questions live**, and because the
history of GA in physics ([physics-ga](/physics-ga)) shows that
ideas can wait decades before their moment. Hestenes argued for GA in
physics in the 1960s; it took until the 2020s to reach ML.

Maybe GA-structured transformers are a 2030s idea whose moment hasn't
come. Maybe they're a dead end. The point of ending on speculation is
to mark the frontier honestly — here's where the solid ground ends
and the open ocean begins.

> :weightliftinggoose: This is the cool-down stretch, not a working
> set. The solid lifts — molecules, robotics, equivariant networks —
> are behind us. This chapter points at the horizon: could GA reshape
> the architectures that don't have obvious symmetry? RoPE says
> "maybe, a little." The rest is for you to explore or dismiss.
> Either way, you now know the algebra well enough to judge.

## 8. Closing the book

That's *AI through GA*. The arc:

- **Part I**: why geometry matters for ML (symmetry, equivariance).
- **Part II**: equivariant networks (EGNN, SE(3)-Transformers, rotor
  attention).
- **Part III**: GA-native architectures (Clifford layers, GCAN,
  rotor outputs, the proofs).
- **Part IV**: representations (molecules, point clouds, graphs).
- **Part V**: robotics (motors, planning, policies, gafro).
- **Part VI**: frontiers (scaling, interpretability, open problems,
  this speculation).

The thesis throughout: **geometric algebra is the natural language
for ML on geometric data**, because grades carry representations, the
geometric product does Clebsch-Gordan, and rotors handle
transformations — all uniformly, all without coordinate bookkeeping.

Where exact geometric symmetry exists (molecules, robots), this is a
demonstrated advantage. Where it doesn't (language), it's an open
question. The field is young, the strongholds are real, and the
frontier is wide open.

> :happygoose: You started this book wondering why a 19th-century
> algebra shows up at NeurIPS. Now you know: because symmetry is the
> skeleton of geometric ML, and geometric algebra is the language
> symmetry was waiting for. Go build something equivariant.

## What we covered

- Speculation: could GA reformulate transformer attention?
- The obstacle: language lacks an obvious geometric symmetry group.
- Attention as geometric (rotor) transport — but without exact
  symmetry, it's reparameterization, not correctness.
- RoPE: real, deployed rotor-based positional encoding — the solid
  foothold.
- Conformal positional encoding: plausible, testable extension.
- Multivector tokens: very speculative.
- Honest verdict: RoPE works, the rest is open provocation.
- Why end on speculation: the frontier is where the questions are;
  GA ideas can wait decades for their moment.
- Closing the book: the arc and the thesis.

## What's next

The [Appendix](/ai-ga/appendix/reading-list) — reading list, library
tour, and glossary. Reference material for going deeper.
