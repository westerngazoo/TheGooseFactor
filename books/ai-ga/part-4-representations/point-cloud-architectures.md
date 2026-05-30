---
sidebar_position: 3
title: "Point Cloud Architectures With GA"
---

# Point Cloud Architectures With GA

> Processing raw 3D point clouds — LIDAR, depth sensors, 3D scans —
> with equivariant multivector networks. Where rotation-equivariance
> meets real-world perception.

A point cloud is an unordered set of 3D points, often with features
(color, intensity, normals). They come from LIDAR (self-driving),
depth cameras (robotics), and 3D scanning (graphics, CAD). The
symmetries — rotation, translation, permutation — are exactly what
equivariant GA networks handle.

## 1. The point-cloud problem

A point cloud is $\{(x_i, f_i)\}$ — points $x_i \in \mathbb{R}^3$ with
optional features $f_i$. Tasks:

- **Classification**: what object is this? (Invariant output.)
- **Segmentation**: label each point. (Permutation-equivariant.)
- **Registration**: align two point clouds. (Predict an $SE(3)$
  transform — equivariant.)
- **Normal estimation**: predict surface normals. (Equivariant
  vectors.)
- **Detection**: find objects + poses. (Equivariant.)

The challenges: point clouds are **unordered** (need permutation
invariance), **variable size**, **irregular** (no grid), and often
**arbitrarily oriented** (need rotation equivariance).

## 2. Why rotation equivariance matters here

A LIDAR scan of a car looks different depending on the sensor's
orientation. A non-equivariant network must see the car in every
orientation during training to recognize it robustly. An equivariant
network recognizes it in **any** orientation from training on one —
the rotation symmetry is built in.

For autonomous driving, this is safety-critical: the network must
recognize a pedestrian whether the car is going uphill, banking in a
turn, or on uneven ground. Equivariance gives that guarantee by
construction rather than by hoping the training data covered it.

> :surprisedgoose: Most production point-cloud networks (PointNet,
> PointNet++, and their descendants) are **not** rotation-equivariant
> — they rely on data augmentation. They work because autonomous-
> driving data is mostly gravity-aligned (cars drive on roads). But
> in robotics, where a gripper approaches objects from arbitrary
> angles, the lack of equivariance bites hard, and GA-equivariant
> point networks are gaining ground.

## 3. Multivector point features

Encode each point as a multivector:

- **Scalar** (grade 0): intensity, semantic embedding.
- **Vector** (grade 1): the point's position relative to a local
  reference, estimated normal, color-gradient direction.
- **Bivector** (grade 2): local surface orientation, curvature
  direction.

The network processes these with equivariant Clifford layers,
aggregating over local neighborhoods (k-nearest-neighbors in 3D).

## 4. Equivariant point convolution

The point-cloud analog of convolution: for each point, aggregate
multivector features from its neighbors, weighted by functions of the
relative geometry.

$$\psi_i \leftarrow \sum_{j \in \mathcal{N}(i)} W(x_i - x_j)\cdot\psi_j$$

where $W(x_i - x_j)$ is a geometric-product weight built from the
relative position (a multivector). This injects the local geometry
(directions to neighbors) while preserving equivariance — the same
geometric-transport idea as
[Chapter 6](/ai-ga/part-2-equivariance/equivariant-attention-with-rotors).

Because the relative position $x_i - x_j$ is rotation-equivariant and
translation-invariant, and the geometric product preserves
equivariance, the whole convolution is $SE(3)$-equivariant.

## 5. Permutation invariance

Point clouds are unordered, so the aggregation over neighbors must be
**permutation-invariant**. Sum, mean, or max-pooling over the
neighborhood work for invariant features; for equivariant
(multivector) features, use sum/mean (not max, which breaks
equivariance, [Chapter 7](/ai-ga/part-2-equivariance/equivariant-message-passing)).

Global pooling (for classification) sums/averages over all points —
permutation-invariant, and for the scalar part, also
rotation-invariant. The classification head reads the pooled scalar
features.

## 6. Registration: predicting the transform

**Point cloud registration** — aligning two clouds (e.g., consecutive
LIDAR frames, or a scan to a model) — requires predicting an $SE(3)$
transformation. This is a natural fit for GA:

- The network outputs a **motor** (CGA rotor,
  [Chapter 10](/ai-ga/part-3-clifford-networks/learning-rotors-directly))
  encoding the rigid transform.
- The motor is predicted via a bivector + exponential map —
  unconstrained, on-manifold, smooth.
- Applying the transform is a rotor sandwich on the point cloud.

This avoids the rotation-parameterization pitfalls (Euler angles,
matrix orthogonalization) and gives a clean, differentiable
registration pipeline.

## 7. The local-frame alternative

An influential alternative for rotation-robust point clouds:
**estimate a local reference frame** at each point (from PCA of the
neighborhood, or learned), express features in that frame (making
them invariant), and process with a standard network.

Vector Neurons (Deng et al. 2021) and similar methods take this
route. In GA terms, the local frame is a rotor, and the
"express in local frame" is a sandwich — so GA unifies the
local-frame and global-equivariant views (as in
[Chapter 12 §6](/ai-ga/part-4-representations/molecular-property-prediction)).

The trade-off: local frames can be ambiguous (PCA frames flip sign,
degenerate on symmetric neighborhoods), while global equivariance is
unambiguous but requires equivariant operations throughout.

## 8. Practical status

GA / equivariant point-cloud networks are an active research area:

- **Vector Neurons** (Deng et al. 2021): rotation-equivariant point
  networks via vector features — a GA-adjacent approach.
- **Clifford-based point networks**: emerging, leveraging the full
  multivector structure.
- **SE(3)-equivariant registration**: GA motors for differentiable
  alignment.

For production (autonomous driving), non-equivariant networks +
augmentation still dominate due to maturity and speed. For robotics
and tasks with genuine arbitrary orientation, equivariant methods are
increasingly preferred.

> :weightliftinggoose: Point clouds are where equivariant ML meets
> the physical world through sensors. The symmetry is real (a chair
> is a chair from any angle), the stakes are high (perception for
> autonomy), and the GA machinery — multivector features, motor-based
> registration, rotor local frames — fits the problem structure
> cleanly. This is applied geometric algebra at the sensor level.

## What we covered

- Point clouds: unordered, variable-size, irregular 3D point sets.
- Rotation equivariance matters for robustness (recognize objects at
  any orientation).
- Multivector point features: scalar (intensity), vector (normal),
  bivector (surface orientation).
- Equivariant point convolution via geometric-product weights on
  relative positions.
- Permutation invariance via sum/mean pooling.
- Registration: predict an $SE(3)$ motor (bivector + exp).
- Local-frame alternative (Vector Neurons); GA unifies it with global
  equivariance.
- Production still uses augmentation; equivariant methods rising in
  robotics.

## What's next

[Chapter 15](/ai-ga/part-4-representations/conformal-embeddings-for-graphs) —
conformal embeddings for graphs. Using conformal geometric algebra to
embed graph structure, and the connection to hyperbolic graph
embeddings.
