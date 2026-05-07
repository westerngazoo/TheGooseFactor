---
sidebar_position: 1
title: "Computer Graphics"
---

# Computer Graphics

Computer graphics is rotation, reflection, and projection at scale.
Every framework already has working tools for those — matrices,
quaternions, sometimes both jammed together. GA replaces the toolset
with one consistent machinery.

## Rotations

The standard graphics pipeline uses rotation matrices (in OpenGL /
DirectX) or quaternions (in game engines like Unity and Unreal,
internally). With rotors:

- **Object orientation:** stored as a rotor (4 floats in 3D).
- **Combining transforms:** rotor multiplication.
- **Rotating vertices:** sandwich product, or convert the rotor to
  a matrix once per frame and reuse.
- **Smooth animation:** rotor SLERP for keyframe blending.

A common engine pattern is "matrix for shaders, quaternion for
keyframe storage and interpolation." Rotors collapse this — *one*
representation handles both. You only convert to a matrix at the
GPU shader boundary, and even there it's optional (compute shaders
can do the sandwich directly).

> :angrygoose: Game engines store quaternions, build rotation
> matrices each frame, blend the matrices, and pray nothing drifts.
> Rotors are the same data, do the work in-place, and you only
> matrix-ize at the very last step. The conversion *was* the
> redundant step.

## Reflections (Easy Mode)

A reflection across a hyperplane perpendicular to $\hat{\mathbf{n}}$:

```
v' = -n.dot(v.dot(n).inv())  // ad-hoc LA approach, awkward
```

vs.

```
v' = -n * v * n              // GA, one line
```

For specular shading, environment-map sampling, and any mirror-axis
trick — reflections are the cheap operation in GA. Matrix-based
graphics treats reflections as awkward special cases. Rotor-based
graphics treats them as the simplest case.

## Camera Projection — Looking Through a Plane

The camera frustum is a 3D-to-2D projection. The mathematical
content is "intersect rays with the image plane."

In GA, a ray is a vector; the image plane is a bivector. The
intersection is the **meet** (from §3.4):

$$\text{pixel} = \text{ray} \vee \text{plane}$$

You don't need a separate "projection matrix" with carefully-baked
clip-space conventions. Meet does it.

Of course, in production renderers the GPU expects a 4×4 matrix in
clip space. You convert *at the boundary*. But the math you reason
about is the meet, not the matrix.

## Skeletal Animation

A character has a bone hierarchy. Each bone has a local-space
rotor, and parent-of-bone transforms compose multiplicatively
through the chain. In GA:

```
world_rotor[i] = parent_rotor * local_rotor[i]
```

— same recurrence as quaternions or matrices, just simpler types.

Skinning weights interpolate between bones. With rotors, this is
trivially SLERP between two (or weighted log-sum across many).
Compare to **dual quaternions** — a hack-on-a-hack that mainstream
animation systems use to do "rotation + translation in one type."
GA's CGA (next chapter) does this natively without the hack.

> :surprisedgoose: Dual quaternions are popular in skinning *because*
> regular quaternions can't represent translations. CGA represents
> translations as rotors in a higher-dimensional space.
> Dual-quaternion skinning is a workaround for not knowing CGA.

## Projecting onto a Plane (Shadow Mapping)

To project a 3D point onto a ground plane, you compute the
shadow-ray intersection with the plane. In GA: meet of the ray and
the bivector. Same pattern.

For directional shadows (parallel rays), the ray *direction* and
the plane *bivector* meet at the projection point. For point-source
shadows, the meet of the *line through point and light* with the
ground bivector gives the shadow point.

## Reflection-Based Reflections (Mirror Worlds)

For a planar mirror in a level (think Portal-style mirrors), the
reflection of the world across the mirror plane is one application
of the sandwich:

```
mirrored_world_rotor = M * world_rotor * M-tilde
```

where $M$ is the rotor that flips across the mirror plane.

This is one line. In matrix-land it's "build the reflection
matrix, multiply on the left of the world matrix, hope the
handedness flip doesn't break the renderer." Engineers know the
ritual; the ritual is unnecessary.

## A Caveat: The GPU Doesn't Care

GPUs eat 4×4 matrices. The driver doesn't accept rotors. So at the
end of every frame, you convert your rotor scene graph to matrices
and ship them. The matrices are shaped the same as classical
graphics matrices.

What you gain is **upstream**: the application code reasons about
geometry algebraically, with no drift, no quaternion-to-matrix
ritual, no separate "rotation" and "translation" types. The matrix
generation happens once per frame in a layer of code thinner than
the typical "math utility" library a graphics engine ships.

> :weightliftinggoose: The application math is GA. The runtime
> shipping format is matrices. That separation is healthy — high-level
> reasoning in the cleanest framework, low-level execution in
> whatever the hardware wants.

## The Trickle-Up Effect

Once a pipeline is GA-native, additional features land cheaper:

- **Inverse kinematics** — a Lie-algebra optimization on bivectors,
  not on Euler-angle parameterizations that gimbal-lock.
- **Procedural geometry** — meet/join for clean BSP-tree-style
  operations.
- **Particle effects** — rotor exponentials give smooth angular
  velocity integration.
- **Physics couplings** — angular and linear motion in one
  framework via CGA.

The next chapter covers physics specifically — including a
particularly satisfying observation about Maxwell's equations.
