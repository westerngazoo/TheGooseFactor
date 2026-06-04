---
sidebar_position: 3
title: "Learning Rotors Directly — Parameterization Choices"
---

# Learning Rotors Directly

> How should a network output a rotation? Matrices, quaternions,
> Euler angles, or bivectors-via-exp? The parameterization choice
> has real consequences for trainability.

Many tasks require a network to **output a rotation** — predicting a
molecule's orientation, a robot's pose, a camera's attitude. The
naive choices (matrices, Euler angles) have well-known pathologies.
The GA choice (predict a bivector, exponentiate to a rotor) avoids
them. This chapter is the comparison.

## 1. The problem

The network needs to output an element of $SO(3)$ — a 3D rotation.
But $SO(3)$ is a curved manifold, not a vector space. A network
naturally outputs vectors in $\mathbb{R}^k$. How do we map
$\mathbb{R}^k \to SO(3)$?

The map should be:

- **Surjective**: able to represent every rotation.
- **Smooth**: small changes in output = small changes in rotation
  (no discontinuities).
- **Well-conditioned**: no singular configurations where gradients
  blow up or vanish.

The candidate parameterizations differ in how well they meet these.

## 2. Rotation matrices (9 numbers)

Output a $3\times3$ matrix directly. Problems:

- **6 redundant parameters** (9 numbers, 3 DOF).
- **Constraint violation**: the network's raw output isn't
  orthogonal. You need to project (Gram-Schmidt or SVD) onto $SO(3)$,
  which adds cost and can be ill-conditioned.
- The projection's gradient can be unstable near degenerate matrices.

The "6D representation" (Zhou et al. 2019) improves on this: output 6
numbers, Gram-Schmidt to a rotation. Continuous and surjective, but
still requires the orthogonalization step.

## 3. Euler angles (3 numbers)

Output three angles $(\alpha, \beta, \gamma)$. Problems:

- **Gimbal lock**: at certain configurations, two axes align and a
  DOF is lost. The map is singular there.
- **Discontinuity**: angles wrap around ($2\pi = 0$), so the
  representation is discontinuous — a network can't smoothly cross
  the wrap.
- **Convention hell**: 12 different Euler conventions, all
  incompatible.

Euler angles are almost never the right choice for learning. Avoid.

## 4. Quaternions (4 numbers)

Output a 4-vector, normalize to a unit quaternion. Better:

- Only 1 constraint (unit norm), easy to enforce by normalization.
- No gimbal lock.
- Smooth almost everywhere.

But the **double-cover problem**: $q$ and $-q$ represent the same
rotation. The map $S^3 \to SO(3)$ is two-to-one. This causes:

- **Sign ambiguity**: the network can output $q$ or $-q$ for the same
  target, and the loss must handle both (e.g., $\min(\|q - \hat{q}\|, \|q + \hat{q}\|)$).
- **Discontinuity in naive losses**: a regression loss on quaternion
  components has discontinuities at the antipodal identification.

Quaternions are a solid choice if you handle the double cover
carefully.

## 5. Bivectors via the exponential map (3 numbers)

The GA choice: output a **bivector** $B$ (3 real numbers in 3D, no
constraints) and exponentiate to a rotor:

$$R = \exp(B/2)$$

Properties:

- **Minimal**: 3 numbers for 3 DOF, no redundancy.
- **No constraints**: the network outputs an unconstrained bivector;
  $\exp$ maps it onto the rotor group exactly. No projection, no
  normalization.
- **Smooth**: $\exp$ is smooth everywhere.
- **Surjective**: every rotation is $\exp(B/2)$ for some $B$ (within
  $|B| < 2\pi$).

The double cover is still there (as it must be — it's intrinsic to
$SO(3)$), but it's handled gracefully: $\exp$ is locally injective,
and the wrap-around happens at $|B| = 2\pi$, far from typical
outputs.

> :happygoose: Predict in the Lie algebra (bivectors), exponentiate
> to the Lie group (rotors). This is the [Chapter 3](/ai-ga/part-1-why/group-theory-in-30-minutes)
> exponential map used as a network output head. Unconstrained input,
> exactly-on-manifold output, smooth and minimal. It's the cleanest
> rotation parameterization, and it generalizes to any dimension and
> to $SE(3)$ (predict a full bivector including translation
> generators).

## 6. The tangent-space trick for losses

Even with a good parameterization, the **loss** matters. Comparing two
rotations $R$ and $\hat{R}$:

- **Naive**: Frobenius distance between matrices, or quaternion
  distance — both have the double-cover issue.
- **Geodesic**: the rotation angle of $R\tilde{\hat{R}}$ — the
  "amount of rotation" between them. This is the natural metric on
  $SO(3)$.

In GA, the geodesic distance is

$$d(R, \hat{R}) = 2\,|\log(R\tilde{\hat{R}})|$$

where $\log$ is the inverse of $\exp$ (extract the bivector). This
is the **bi-invariant metric** on the rotation group — the correct
distance for rotation regression.

## 7. Predicting $SE(3)$ poses

For rigid-body poses (rotation + translation), the GA approach
extends to **conformal GA** (CGA), where translations are also
rotors. The network outputs a full bivector in $\mathcal{Cl}(4,1)$
(including translation-generator components), and $\exp$ gives a
**motor** (screw motion):

$$M = \exp(B_{\rm rot}/2 + B_{\rm trans}/2)$$

This unifies rotation and translation prediction in one exponential
map — no separate "predict rotation, then predict translation" with
mismatched representations. [Chapter 16](/ai-ga/part-5-robotics/why-ga-for-robotics)
develops this for robotics.

## 8. Practical recommendation

The decision tree:

- **Need a 3D rotation, want simplicity**: bivector + exp (GA) or
  6D representation. Both continuous and well-behaved.
- **Already in a quaternion pipeline**: quaternions, with careful
  double-cover handling.
- **Need $SE(3)$ poses**: CGA motors (bivector + exp in conformal
  algebra).
- **Never**: Euler angles, raw 9-number matrices.

The GA parameterization (bivector + exp) is the most principled and
generalizes most cleanly, but the 6D representation is a fine,
widely-used alternative if you don't want the GA machinery.

> :weightliftinggoose: Rotation parameterization is one of those
> "boring infrastructure" choices that silently determines whether
> your model trains well. Get it wrong (Euler angles, raw matrices)
> and you fight discontinuities and singularities forever. Get it
> right (bivector + exp) and the rotation head just works. Predict in
> the algebra, exponentiate to the group.

## What we covered

- The problem: map $\mathbb{R}^k \to SO(3)$ (a curved manifold).
- Matrices (9 numbers): redundant, need orthogonalization.
- Euler angles (3): gimbal lock, discontinuity — avoid.
- Quaternions (4): good, but double-cover needs care.
- **Bivector + exp (GA, 3 numbers)**: minimal, unconstrained, smooth,
  exactly on-manifold.
- Geodesic loss via $\log(R\tilde{\hat{R}})$.
- $SE(3)$ via CGA motors.
- Recommendation: GA (bivector+exp) or 6D; never Euler/raw-matrix.

## What's next

[Chapter 11](/ai-ga/part-3-clifford-networks/equivariance-proofs-for-ga-layers) —
equivariance proofs for GA layers. The rigorous arguments that the
operations in this Part actually are equivariant, and the precise
dictionary between GA grades and $SO(3)$ irreps.
