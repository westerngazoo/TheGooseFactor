---
sidebar_position: 2
title: "GA-Based Motion Planning"
---

# GA-Based Motion Planning

> Planning collision-free paths in motor space, with geometric
> primitives as blades for fast collision checking.

Motion planning finds a collision-free path from a start
configuration to a goal. GA contributes on two fronts: **paths in
motor space** (smooth interpolation between poses) and **collision
checking via blades** (geometric primitives as algebraic objects).

## 1. The planning problem

Given a robot, a start pose, a goal pose, and obstacles, find a
continuous, collision-free trajectory connecting start to goal. The
configuration space is $SE(3)$ (for a free-flying body) or the joint
space (for an arm), and obstacles carve out forbidden regions.

The classic methods — RRT (rapidly-exploring random trees), PRM
(probabilistic roadmaps), trajectory optimization (CHOMP, TrajOpt) —
all need two primitives: **interpolation** (connect two
configurations) and **collision checking** (is a configuration
free?). GA improves both.

## 2. Interpolation in motor space

To connect two poses $M_1$ and $M_2$ with a smooth path, interpolate
in the **Lie algebra** (bivectors) and exponentiate:

$$M(t) = M_1\,\exp\big(t\,\log(\tilde{M}_1 M_2)\big), \quad t \in [0, 1]$$

This is the **geodesic** in $SE(3)$ — the screw-motion interpolation
between the two poses. It's the natural "straight line" in motor
space: constant-velocity screw motion from $M_1$ to $M_2$.

Compare to interpolating $4\times4$ matrices (which leaves the group
and needs reprojection) or interpolating quaternion + translation
separately (which decouples rotation and translation unnaturally).
The motor geodesic does both together, smoothly, on-manifold.

> :happygoose: Screw-motion interpolation is the "right" way to move
> between two poses — it's the shortest path in $SE(3)$ under the
> natural metric, and it looks natural (a smooth combined
> rotate-and-translate). Robotics animators rediscover this
> constantly; GA gives it to you directly as
> $M_1\exp(t\log(\tilde{M}_1 M_2))$.

## 3. Collision checking with blades

Collision checking asks: does the robot (at some pose) intersect an
obstacle? In CGA, geometric primitives are **blades**
([physics-ga Ch 32](/geometric-algebra)):

- Points, lines, planes, spheres, circles: each a specific-grade
  blade.
- **Intersection**: the meet operation $A \vee B$ (built from wedges
  and duals) — algebraic, no case analysis.
- **Distance**: from inner products of blades.

So checking whether a spherical bounding volume (a blade) intersects
a plane obstacle (a blade) is an algebraic operation. Whether a line
(robot link axis) pierces a sphere (obstacle) is the meet of a line
blade and a sphere blade. The geometric tests reduce to blade
arithmetic.

This is faster and cleaner than the conventional
primitive-pair-specific collision routines (sphere-sphere,
sphere-plane, line-sphere, each a separate formula). In CGA, **one
meet operation** handles all primitive pairs.

> :nerdygoose: The CGA "meet" operation $A \vee B = (A^* \wedge B^*)^*$
> (dual of the wedge of duals) computes the intersection of any two
> geometric primitives — point, line, plane, sphere, circle — with
> one formula. Conventional collision libraries have a quadratic
> number of primitive-pair routines; CGA has one. This is the
> computational-geometry payoff of the conformal model.

## 4. Trajectory optimization in motor space

Optimization-based planners (CHOMP, TrajOpt) minimize a cost
(path length + obstacle penalty + smoothness) over the trajectory.
In motor space:

- **Path length**: integrate the motor-velocity (twist) norm along
  the path.
- **Smoothness**: penalize twist derivatives (acceleration in motor
  space).
- **Obstacle cost**: blade-based distance to obstacles, differentiable.

The optimization variable is a sequence of motors (or, equivalently,
the bivector "velocities" between them). Because motors form a smooth
manifold and the bivector parameterization is unconstrained, gradient
descent works cleanly — no constraint maintenance, no chart-switching.

## 5. Sampling-based planning with motors

RRT/PRM sample random configurations and connect them. In motor
space:

- **Sampling**: sample random bivectors (within bounds), exponentiate
  to random motors — uniform-ish sampling of $SE(3)$.
- **Nearest-neighbor**: motor distance $\|\log(\tilde{M}_1 M_2)\|$ as
  the metric.
- **Local connection**: screw-motion geodesic between nearby motors,
  collision-checked via blades.

The motor metric gives a principled notion of "nearest" that
accounts for both position and orientation, avoiding the
arbitrary-weighting problem of separate position/orientation metrics.

## 6. Learned planning

Modern planning increasingly uses learning — neural networks that
propose configurations, predict collision, or directly output
trajectories. GA fits:

- **Collision prediction**: an $SE(3)$-equivariant network predicting
  collision probability — equivariant because rotating the scene
  rotates the collision geometry.
- **Trajectory generation**: networks that output sequences of motors
  (bivector + exp per waypoint), trained on demonstrations.
- **Learned distance metrics**: networks that learn a planning cost
  in motor space.

The equivariance principle ([Part III](/ai-ga/part-3-clifford-networks/clifford-layers))
applies: a planner that's $SE(3)$-equivariant generalizes across
scene orientations, which a non-equivariant planner must learn by
augmentation.

## 7. Dynamic and constrained planning

Real robots have dynamics (momentum, torque limits) and constraints
(joint limits, stay-upright). GA handles these:

- **Dynamics**: the rigid-body equations of motion in GA
  ([physics-ga Ch 7](/geometric-algebra)) — Euler's equation in
  bivector form — give the dynamics constraints in motor space.
- **Constraints**: joint limits and orientation constraints are
  conditions on the motors/bivectors, often expressible as blade
  conditions.

Constrained trajectory optimization in motor space respects the
dynamics and constraints while planning, all in the unified algebraic
framework.

## 8. Status and tooling

GA-based planning is a research area with growing tooling:

- **`gafro`** ([Chapter 19](/ai-ga/part-5-robotics/the-gafro-library)):
  provides the motor/blade primitives for building planners.
- Academic planners using CGA collision checking and motor
  interpolation exist but aren't yet in mainstream stacks (MoveIt,
  OMPL are matrix-based).
- The advantages (unified primitives, clean metrics, equivariant
  learning) are clear; the adoption is gated by tooling maturity and
  the establishment's matrix inertia.

> :weightliftinggoose: Motion planning in GA: interpolate with
> screw-motion geodesics, collision-check with the blade meet
> operation, optimize in unconstrained bivector space, and learn with
> $SE(3)$-equivariant networks. Every piece of the planning stack has
> a cleaner GA formulation. The robotics establishment will get there
> when the tooling catches up — and gafro is pushing that.

## What we covered

- Motion planning needs interpolation + collision checking; GA
  improves both.
- Motor-space interpolation = screw-motion geodesic
  $M_1\exp(t\log(\tilde{M}_1 M_2))$.
- Collision checking via blade meet operation (one formula for all
  primitive pairs).
- Trajectory optimization in unconstrained bivector space.
- Sampling-based planning with the motor distance metric.
- Learned planning: $SE(3)$-equivariant collision prediction and
  trajectory generation.
- Dynamics/constraints via GA rigid-body equations.
- Research-stage tooling; gafro is the bridge.

## What's next

[Chapter 18](/ai-ga/part-5-robotics/policy-networks-with-rotor-outputs) —
policy networks with rotor outputs. Reinforcement-learning and
imitation-learning policies that output motors, and why the rotor
output head improves learning.
