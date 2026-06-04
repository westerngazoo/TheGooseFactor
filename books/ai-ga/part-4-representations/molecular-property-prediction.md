---
sidebar_position: 1
title: "Molecular Property Prediction With Multivectors"
---

# Molecular Property Prediction With Multivectors

> The flagship application domain. Why molecules are the perfect
> testbed for equivariant GA networks, and how multivector encodings
> map onto chemical structure.

Molecular machine learning is where equivariant networks earn their
keep. A molecule is a set of atoms in 3D space, and almost every
property of interest has a clean symmetry: energy is invariant,
forces are equivariant, dipole moments are equivariant. This chapter
maps molecular structure onto multivector representations.

## 1. The molecular ML problem

Given a molecule — atoms with positions $x_i \in \mathbb{R}^3$ and
types $z_i$ — predict properties:

- **Energy** $E$: a scalar, rotation/translation **invariant**.
- **Forces** $F_i = -\nabla_i E$: vectors, rotation **equivariant**.
- **Dipole moment** $\mu$: a vector, equivariant.
- **Polarizability** $\alpha$: a rank-2 tensor, equivariant
  (transforms as type-0 ⊕ type-2).
- **HOMO-LUMO gap, atomization energy, etc.**: scalars, invariant.

The benchmark datasets — QM9 (134k small molecules), MD17
(molecular dynamics trajectories), OC20 (catalysis) — drove much of
the equivariant-network development.

## 2. Multivector atom features

Encode each atom's state as a multivector $\psi_i \in \mathcal{Cl}(3,0)$:

- **Scalar part** (grade 0): atom-type embedding, partial charge,
  other invariant scalars.
- **Vector part** (grade 1): local directional features — bond
  directions, force estimates, displacement from neighbors.
- **Bivector part** (grade 2): local rotational/orientational
  features — useful for chirality and angular structure.
- **Pseudoscalar** (grade 3): a signed-volume feature — the chirality
  indicator.

This packs the atom's full geometric context into one 8-component
object. As the network's Clifford layers
([Chapter 8](/ai-ga/part-3-clifford-networks/clifford-layers)) process
these, information flows between grades respecting the geometry.

## 3. Predicting invariant properties

For energy (invariant), extract the **scalar part** of the final
multivector features and sum/pool:

$$E = \sum_i \langle\psi_i^{\rm final}\rangle_0 \quad\text{(or an MLP on the scalar parts)}$$

Because the scalar part is invariant and summation is
permutation-invariant, the predicted energy is correctly invariant to
rotations, translations, and atom reordering. The forces then come
**for free** by autodifferentiation: $F_i = -\partial E/\partial x_i$,
and because $E$ is invariant, the forces are automatically
equivariant (a gradient of an invariant scalar is an equivariant
vector).

> :happygoose: Predicting forces as the gradient of an invariant
> energy is the cleanest trick in molecular ML. You never train on
> forces directly — you train on energy, take the gradient, and the
> forces are equivariant by construction and energy-conserving by
> construction. The physics (forces are conservative) is baked into
> the architecture.

## 4. Predicting equivariant properties

For the dipole moment (a vector), extract the **vector part** of the
pooled multivector:

$$\mu = \sum_i \langle\psi_i^{\rm final}\rangle_1$$

This is equivariant — rotate the molecule, the predicted dipole
rotates with it. For polarizability (type-0 ⊕ type-2), you need the
scalar part plus a symmetric-tensor construction (recall GA's grades
don't natively give type-2, [Chapter 11 §6](/ai-ga/part-3-clifford-networks/equivariance-proofs-for-ga-layers))
— so polarizability prediction with pure GA requires the
symmetric-product extension.

## 5. Chirality

Chirality — the handedness of a molecule — is a stereochemical
property that affects biological activity profoundly (one
enantiomer of a drug heals, the mirror image may harm). Distinguishing
enantiomers requires **reflection-sensitivity**.

The pseudoscalar (grade 3) is the chirality detector: it's the signed
volume, which **flips sign under reflection**. A network that uses
the pseudoscalar can distinguish a molecule from its mirror image; an
$SO(3)$-only network that discards it cannot.

EGNN ([Chapter 4](/ai-ga/part-2-equivariance/egnn)) discards
chirality (it uses only scalars and vectors). A Clifford network that
retains the pseudoscalar handles it natively. For chirality-sensitive
tasks (drug discovery, asymmetric catalysis), this is a decisive
advantage.

> :surprisedgoose: Thalidomide is the cautionary tale: one
> enantiomer treats morning sickness, the mirror image causes birth
> defects. A molecular property predictor that can't distinguish
> enantiomers is dangerous for drug discovery. The GA pseudoscalar —
> the signed volume that flips under reflection — is exactly the
> feature that detects chirality. Use it.

## 6. Local frames vs global equivariance

Two strategies for handling rotation:

**1. Global equivariance** (the Clifford / SE(3)-Transformer way):
the whole network is equivariant; features transform with the
molecule. Principled, exact.

**2. Local frames** (the "canonical orientation" way): assign each
atom a local coordinate frame from its neighbors, express features in
that frame (making them invariant), process with a standard network.
Simpler but requires a canonical frame, which can be ambiguous or
discontinuous.

GA bridges these: a local frame is a **rotor** that aligns the
global frame with the atom's local geometry, and expressing features
in the local frame is a rotor sandwich. The GA formulation makes the
local-frame approach equivariant-by-construction when done right.

## 7. The benchmark landscape

On QM9 (predicting 12 molecular properties), the equivariant
approaches cluster:

- **SchNet, DimeNet**: invariant networks with distance/angle
  features. Strong baselines.
- **PaiNN, NequIP, Allegro**: equivariant message passing with
  vector/tensor features. State of the art for energies/forces.
- **Clifford / GCAN networks**: competitive, with the efficiency and
  uniformity advantages discussed in [Part III](/ai-ga/part-3-clifford-networks/clifford-layers).

The frontier (NequIP, Allegro) uses high body-order interactions and
careful irrep design. GA methods are competitive and simpler but
haven't dominated the leaderboards — the field is still sorting out
where each approach wins.

## 8. Molecular dynamics and the energy-conservation prize

For molecular dynamics — simulating how molecules move over time —
the network must predict forces that **conserve energy** over long
trajectories. Non-conservative force fields drift, heating or cooling
the simulation unphysically.

The energy-gradient trick (§3) guarantees conservation: if forces are
$-\nabla E$ for a learned scalar $E$, the dynamics conserve $E$
exactly (up to integration error). Equivariant networks that predict
energy and differentiate are the gold standard for ML force fields
(NequIP, MACE, Allegro all do this).

> :weightliftinggoose: Molecular ML is the domain that proves
> equivariance pays. Energy invariance + force equivariance + chirality
> sensitivity + energy conservation — every one is a symmetry that a
> GA/equivariant network gets by construction and a plain network has
> to learn (imperfectly) from data. This is the home turf of the
> whole field.

## What we covered

- Molecular properties have clean symmetries: invariant energy,
  equivariant forces/dipoles.
- Multivector atom features pack scalar (type), vector (direction),
  bivector (orientation), pseudoscalar (chirality).
- Invariant properties from the scalar part; forces from the energy
  gradient (equivariant + conservative for free).
- Equivariant properties (dipole) from the vector part.
- Chirality from the pseudoscalar — decisive for drug discovery.
- Global equivariance vs local frames (GA bridges them via rotors).
- Benchmark landscape: GA competitive, frontier uses high-order
  irreps.

## What's next

[Chapter 13](/ai-ga/part-4-representations/equiformer) — Equiformer,
the equivariant transformer for atomistic systems, and how attention
combines with irreps/multivectors for molecular modeling.
