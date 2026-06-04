---
sidebar_position: 3
title: "Policy Networks With Rotor Outputs"
---

# Policy Networks With Rotor Outputs

> Reinforcement and imitation learning policies that output motors,
> and why the rotor output head improves learning.

A robot policy maps observations to actions. When the action is a
motion — a target pose, a velocity, a grasp — the policy must output
an element of $SE(3)$. This chapter is about doing that well: rotor
output heads for RL and imitation policies.

## 1. The action-representation problem

A policy $\pi(a | s)$ outputs an action $a$ given state $s$. For
manipulation, the action is often:

- A **target pose** (where to move the gripper) — an $SE(3)$ element.
- A **velocity / twist** (how to move) — a bivector.
- A **delta pose** (incremental motion) — a motor near identity.

The same parameterization question as [Chapter 10](/ai-ga/part-3-clifford-networks/learning-rotors-directly):
how does the network output $SE(3)$? And now there's an extra
consideration — for RL, the action space's geometry affects
exploration and learning dynamics.

## 2. The rotor output head

The recommended design: the policy network outputs a **bivector**
(unconstrained, 6 numbers for $SE(3)$ in conformal GA), and a fixed
exponential map converts it to a motor:

$$a = M = \exp(B/2), \qquad B = \text{network output}$$

For a stochastic policy (needed in RL), output a distribution over
bivectors (e.g., a Gaussian in bivector space) and exponentiate
samples to motors. The bivector space is a vector space, so standard
Gaussian policies work — and the exp map carries the distribution to
the motor manifold.

This avoids:

- Predicting matrices (need orthogonalization, breaks the
  distribution).
- Predicting quaternions (double cover confuses the policy).
- Predicting Euler angles (gimbal lock, discontinuity).

> :happygoose: The bivector output head is the clean answer to "how
> does a policy output a rotation/pose." Output an unconstrained
> bivector (a vector-space quantity — easy for a network, easy to put
> a Gaussian on), exponentiate to a motor (exactly valid $SE(3)$).
> Exploration happens in the well-behaved bivector space; the actions
> are always valid rigid motions. No constraint projection in the
> loop.

## 3. Why the geometry helps RL

In reinforcement learning, the policy explores by perturbing actions.
The **geometry of the action space** affects exploration quality:

- **Matrix actions**: perturbations leave $SE(3)$, need reprojection,
  distorting the exploration distribution.
- **Euler-angle actions**: perturbations near gimbal lock behave
  erratically — the same perturbation means very different motions in
  different configurations.
- **Bivector actions**: perturbations are uniform and well-behaved
  everywhere (the bivector space is flat); exp carries them to
  consistent motions on the manifold.

The bivector parameterization gives **isotropic, consistent
exploration** in motor space — the policy explores rigid motions
evenly, which improves sample efficiency.

## 4. Equivariant policies

A manipulation policy should be **$SE(3)$-equivariant**: if the scene
(object to grasp) is rotated/translated, the policy's action should
transform correspondingly. A grasp that works on an object should
work on the rotated object, transformed by the same rotation.

An equivariant policy ([Part III](/ai-ga/part-3-clifford-networks/clifford-layers)):

- Processes the observation (point cloud, object pose) with
  equivariant multivector layers.
- Outputs a motor that transforms correctly under scene
  transformations.

The payoff (as in [Chapter 16 §7](/ai-ga/part-5-robotics/why-ga-for-robotics)):
train on objects in one pose, generalize to all poses. For RL, this
also means the value function and policy transfer across symmetric
states, dramatically improving sample efficiency on manipulation
tasks.

> :surprisedgoose: Equivariant RL policies can be 10–100× more sample
> efficient on manipulation than non-equivariant ones, because the
> symmetry means experience in one object orientation transfers to
> all orientations. For real-robot RL (where samples are expensive —
> every episode is physical robot time), this is the difference
> between feasible and infeasible.

## 5. Imitation learning with motor actions

For imitation (learning from demonstrations), the policy is trained
to match demonstrated actions. With motor actions:

- **Demonstrations** are sequences of poses (motors).
- **Loss**: the motor geodesic distance
  $\|\log(\tilde{M}_{\rm pred} M_{\rm demo})\|$ between predicted and
  demonstrated motions — a single number capturing both position and
  orientation error.

The geodesic loss (from [Chapter 10 §6](/ai-ga/part-3-clifford-networks/learning-rotors-directly))
is the natural imitation objective for poses. It weights position and
orientation error consistently (no arbitrary scaling between meters
and radians) because it's the intrinsic $SE(3)$ metric.

## 6. Diffusion policies in motor space

A recent direction: **diffusion policies** — generate actions by
denoising, capturing multimodal action distributions (multiple valid
grasps). In motor space:

- The diffusion process operates on bivectors (the Lie algebra).
- Denoising steps are in the flat bivector space; the final sample
  exponentiates to a motor.
- Multimodality (several distinct grasps) is captured naturally by
  the diffusion model's expressiveness.

GA-based diffusion policies (an emerging area) combine the
multimodal-capturing power of diffusion with the clean motor action
representation. The bivector space is the right place to run the
diffusion — flat, unconstrained, with exp mapping to valid motions.

## 7. Sim-to-real and equivariance

Policies trained in simulation must transfer to real robots
(sim-to-real). Equivariance helps: a policy that's equivariant to
$SE(3)$ is robust to the pose variations between sim and real, and to
the arbitrary orientations of real-world objects.

Combined with the clean motor action representation (no
parameterization artifacts that differ between sim and real), GA
policies tend to transfer more robustly. This is an active area —
GA-equivariant sim-to-real for manipulation.

## 8. Status

Rotor-output policies are emerging in robot learning:

- **Equivariant manipulation** (Wang et al., Simeonov et al., and
  others): $SE(3)$-equivariant grasp and manipulation policies, some
  GA-flavored.
- **Neural Descriptor Fields** and relatives: equivariant
  object representations for manipulation.
- **gafro-based policies**: using the GA robotics library for the
  motor machinery.

The advantages (clean exploration, equivariant generalization,
natural losses) are demonstrated; the field is moving fast toward
GA-equivariant manipulation as a standard approach.

> :weightliftinggoose: The rotor output head is the policy-learning
> payoff of the whole robotics part. Output a bivector, exp to a
> motor: clean exploration, valid actions, natural losses, and —
> with equivariant feature processing — generalization across object
> poses and sample-efficient RL. For learned manipulation, this is
> the representation to reach for.

## What we covered

- Policies for manipulation output $SE(3)$ actions (poses, twists,
  deltas).
- The rotor output head: network outputs a bivector, exp to a motor.
- Stochastic policies via Gaussians in bivector space.
- Clean, isotropic exploration in the flat bivector space.
- $SE(3)$-equivariant policies generalize across object poses —
  huge RL sample-efficiency gains.
- Imitation loss = motor geodesic distance (consistent position +
  orientation weighting).
- Diffusion policies in motor space for multimodal actions.
- Equivariance aids sim-to-real transfer.

## What's next

[Chapter 19](/ai-ga/part-5-robotics/the-gafro-library) — the gafro
library. A practical introduction to the C++ geometric-algebra
robotics library that makes all of this implementable in production.
