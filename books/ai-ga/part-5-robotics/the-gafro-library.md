---
sidebar_position: 4
title: "The gafro Library — Practical Introduction"
---

# The gafro Library

> *Löw, Bdeane, et al., "gafro: Geometric Algebra for Robotics."* A
> production-quality C++ library that makes GA robotics implementable.
> The bridge from theory to deployed code.

The chapters of Part V argued that GA is the natural language for
robotics. `gafro` is where that argument becomes runnable code. This
chapter is a practical introduction — what the library provides, how
it's structured, and how to start using it.

## 1. What gafro is

`gafro` (Geometric Algebra For RObotics) is an open-source C++ library
implementing conformal geometric algebra ($\mathcal{Cl}(4,1)$) with a
focus on robot kinematics and dynamics. It provides:

- **Multivector types**: points, lines, planes, spheres, motors,
  rotors — as efficient C++ classes.
- **The geometric product** and the meet/join operations.
- **Robot models**: forward/inverse kinematics, Jacobians, dynamics
  for serial manipulators.
- **Optimization tools**: motor-space objectives for IK and planning.

It's designed for real use — efficiency, integration with robotics
stacks, and numerical robustness — not just pedagogy.

## 2. The core types

gafro's geometric primitives map directly to the CGA blades of
[physics-ga Ch 32](/geometric-algebra):

```cpp
Point<double> p(x, y, z);        // a conformal point (null vector)
Line<double> l = p1 ^ p2 ^ ni;   // line through two points
Plane<double> pl = p1 ^ p2 ^ p3 ^ ni;
Sphere<double> s = p1 ^ p2 ^ p3 ^ p4;
Motor<double> m;                 // a rigid motion (screw-motion rotor)
Rotor<double> r;                 // a pure rotation
```

The `^` operator is the wedge product; `ni` is $n_\infty$ (the point
at infinity). Building geometric primitives is wedging points — the
blade constructions of [physics-ga Ch 32](/geometric-algebra) become
one-liners.

## 3. Forward kinematics

A serial robot's forward kinematics is a motor product. gafro
provides robot models (Franka Emika Panda, UR5, etc.) and computes
the end-effector motor:

```cpp
Franka robot;
Eigen::Vector<double, 7> joint_angles = ...;
Motor<double> ee_pose = robot.getEEMotor(joint_angles);
```

Internally, `getEEMotor` multiplies the per-joint motors —
[Chapter 16 §3](/ai-ga/part-5-robotics/why-ga-for-robotics)'s
$M_1\cdots M_n$. The result is a motor encoding the end-effector pose;
extract position by sandwiching a point, orientation by sandwiching a
frame.

## 4. The Jacobian

gafro computes the geometric Jacobian — relating joint velocities to
the end-effector **twist** (velocity bivector):

```cpp
auto jacobian = robot.getJacobian(joint_angles);
// twist = jacobian * joint_velocities  (a bivector)
```

The bivector twist unifies linear and angular velocity
([Chapter 16 §4](/ai-ga/part-5-robotics/why-ga-for-robotics)). gafro's
Jacobian maps joint rates to this twist directly, which is cleaner
than the conventional split $6\times n$ Jacobian.

## 5. Inverse kinematics

gafro provides IK solvers operating in motor space:

```cpp
Motor<double> target = ...;
auto result = robot.inverseKinematics(target, initial_guess);
```

The solver minimizes the motor geodesic error
$\|\log(\tilde{M}_{\rm current}\,M_{\rm target})\|$
([Chapter 16 §5](/ai-ga/part-5-robotics/why-ga-for-robotics)) using
the GA Jacobian — a smooth, well-conditioned objective that handles
position and orientation error together.

## 6. Integration with learning

For learned robotics ([Chapters 18](/ai-ga/part-5-robotics/policy-networks-with-rotor-outputs)),
gafro provides the motor/bivector machinery that a policy's output
head needs:

- Convert a network's bivector output to a motor (`exp`).
- Compute motor geodesic losses for imitation (`log` and distance).
- Apply motors to point clouds for equivariant processing.

The typical pattern: a PyTorch/JAX policy outputs bivectors, and
gafro (or a GA layer in the ML framework) handles the
exp/log/sandwich operations. Some workflows reimplement the needed
GA operations directly in the autodiff framework for end-to-end
gradients; gafro serves as the reference and for the non-learned
robotics components (kinematics, collision, planning).

> :nerdygoose: The integration story is still maturing. gafro is C++
> and robotics-focused; ML frameworks are Python and autodiff-focused.
> Bridging them — differentiable GA operations in PyTorch/JAX that
> match gafro's conventions — is active work. For now, expect to
> either use gafro for the robotics and a separate GA layer for the
> learning, or to reimplement the handful of GA operations you need
> in your ML framework.

## 7. A complete example sketch

A grasp-and-place pipeline in gafro terms:

1. **Perceive**: process a point cloud into object pose (a motor).
2. **Plan grasp**: an equivariant network outputs a grasp motor
   (bivector → exp).
3. **Plan motion**: screw-motion geodesic from current EE motor to
   grasp motor, collision-checked with blade meets
   ([Chapter 17](/ai-ga/part-5-robotics/ga-based-motion-planning)).
4. **Execute**: IK each waypoint motor to joint angles
   (gafro `inverseKinematics`), send to the robot.
5. **Place**: repeat for the placement pose.

Every geometric step — pose representation, grasp, interpolation,
collision, IK — is a GA operation. gafro provides the non-learned
pieces; the learned pieces (perception, grasp prediction) use the
equivariant networks of Parts II–IV with motor outputs.

## 8. Getting started

Practical pointers:

- **Build**: gafro is header-heavy C++ with Eigen as a dependency.
  CMake-based build.
- **Docs**: the gafro documentation and papers (Löw et al.) cover the
  API and the math.
- **Robot models**: common arms (Panda, UR series) are included; adding
  a new robot means specifying its joint axes as bivectors.
- **Performance**: gafro is optimized for real-time use; the
  motor/blade operations compile to efficient code.

For a first project: load a robot model, compute forward kinematics
for some joint angles, verify against the robot's known geometry, then
try IK to a target pose. That exercises the core motor machinery.

> :weightliftinggoose: gafro is where this whole book touches the
> ground. All the theory — motors, blades, the geometric product,
> equivariant outputs — becomes C++ you can run on a real arm. If
> you're a roboticist curious about GA, gafro is the on-ramp: start
> with forward kinematics, feel how clean the motor product is
> compared to DH-parameter matrices, and build from there.

## What we covered

- gafro: production C++ CGA library for robotics.
- Core types: points, lines, planes, spheres, motors, rotors as
  blades.
- Forward kinematics as motor products; the bivector-twist Jacobian.
- Motor-space IK with geodesic-error objectives.
- Integration with learning (bivector output heads, geodesic losses)
  — maturing.
- A complete grasp-and-place pipeline in GA terms.
- Getting started: build, robot models, a first FK/IK project.

## What's next

That closes Part V. [Part VI](/ai-ga/part-6-frontiers/scaling-ga-networks)
turns to the frontiers — what's unsolved, what's contested, and where
the research is heading: scaling, interpretability, and the
speculative edge.
