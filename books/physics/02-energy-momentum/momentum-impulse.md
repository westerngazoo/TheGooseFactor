---
sidebar_position: 3
sidebar_label: "Momentum & Impulse"
title: "Momentum, Impulse, and Their Conservation"
---

# Momentum, Impulse, and Their Conservation

Momentum is the "amount of motion" that interactions exchange but never create or destroy. Where energy conservation came from integrating force over *distance*, momentum conservation comes from integrating over *time* — and it holds even when energy is lost to heat. That robustness makes momentum the tool of choice for collisions, rockets, and any problem where the internal forces are too messy to track.

## Momentum and Newton's Second Law, Restated

The **momentum** of a particle is $\mathbf{p} = m\mathbf{v}$. Newton's second law, in its original and most general form, is about momentum:

```math
\mathbf{F}_{\text{net}} = \frac{d\mathbf{p}}{dt}.
```

For constant mass this is the familiar $\mathbf F = m\mathbf a$, but the momentum form also handles variable-mass systems like rockets.

## Impulse

Integrate force over the time it acts and you get the **impulse**, which equals the change in momentum:

```math
\mathbf{J} = \int_{t_i}^{t_f} \mathbf{F}\,dt = \Delta\mathbf{p} = m\mathbf{v}_f - m\mathbf{v}_i.
```

This is the **impulse–momentum theorem** — the time-integrated twin of the work–energy theorem.

> :mathgoose: Work–energy integrates $\mathbf F$ over distance and yields a scalar ($\Delta K$); impulse–momentum integrates the same $\mathbf F$ over time and yields a vector ($\Delta \mathbf p$). For a collision you rarely know the force-vs-time curve in detail, but you *do* know the total impulse from the velocity change — and you don't have to care about the violent details in between.

> :nerdygoose: This is why airbags, crumple zones, and bending your knees on landing work. The momentum change $\Delta p$ is fixed (you're stopping). Impulse $J = \bar F\,\Delta t = \Delta p$ is fixed too. So *lengthening the time* $\Delta t$ of the stop *reduces the peak force* $\bar F$. Safety engineering is just rearranging $\bar F = \Delta p / \Delta t$ to make $\Delta t$ big.

## Conservation of Momentum

For a system of particles, internal forces come in action–reaction pairs (Newton's third law) that cancel in the total. Therefore the total momentum changes *only* due to **external** forces:

```math
\frac{d\mathbf{P}_{\text{total}}}{dt} = \mathbf{F}_{\text{external}}, \qquad \mathbf{P}_{\text{total}} = \sum_i m_i \mathbf{v}_i.
```

If the net external force is zero (an *isolated* system), total momentum is conserved:

```math
\mathbf{P}_{\text{total}} = \text{constant}.
```

> :happygoose: Momentum conservation is *more robust* than energy conservation. In a collision, kinetic energy can vanish into heat and deformation — but momentum is conserved regardless, because it only needs the third law, not the absence of dissipation. When a problem involves a "bang" (collision, explosion, recoil), reach for momentum first; bring in energy only if you know the collision is elastic.

### The Center of Mass

Total momentum is the total mass times the velocity of the **center of mass** (COM):

```math
\mathbf{P}_{\text{total}} = M\mathbf{v}_{\text{COM}}, \qquad \mathbf{R}_{\text{COM}} = \frac{1}{M}\sum_i m_i \mathbf{r}_i.
```

So momentum conservation is the statement that *the COM of an isolated system moves at constant velocity*. An exploding firework's fragments fly everywhere, but their COM continues on the original parabola as if nothing happened.

> :surprisedgoose: This decomposition — COM motion plus motion *relative* to the COM — is a superpower. The COM glides along obeying only external forces; all the complicated internal dynamics (spin, vibration, collisions) happen in the COM frame where total momentum is zero. Switching to the COM frame turns most collision problems into symmetric, easy ones.

## Rockets: Variable Mass

A rocket pushes itself by throwing mass backward. Conserving momentum as it ejects fuel at exhaust speed $u$ gives the **Tsiolkovsky rocket equation**:

```math
\Delta v = u \ln\!\frac{m_i}{m_f}.
```

The logarithm is brutal: doubling your final speed requires *squaring* the mass ratio. This single equation explains why rockets are mostly fuel and why multistage designs exist.

## Computational / Algorithmic Touchpoints

- **Momentum conservation by construction**: in an $N$-body simulation, computing each pairwise force once and applying $+\mathbf F$ to one body and $-\mathbf F$ to the other (Newton's third law) makes total momentum conserved *exactly*, up to round-off — a built-in invariant and correctness check.
- **COM frame transforms** simplify collision code: shift to $\mathbf v_{\text{COM}}$, solve the symmetric problem, shift back.
- **Impulse-based solvers**: real-time physics engines resolve contacts by applying instantaneous impulses $\mathbf J$ to velocities rather than integrating enormous contact forces over tiny times — exactly the impulse–momentum theorem turned into an algorithm.
- **Conserved quantities as invariants**: monitoring total $\mathbf P$ (and energy, and angular momentum) during a simulation is the standard way to detect integrator bugs.

```python
def total_momentum(masses, velocities):
    return sum(m * v for m, v in zip(masses, velocities))

def apply_pair_force(F, i, j, v, m, dt):
    # Newton's third law: equal & opposite -> total momentum conserved
    v[i] += (F / m[i]) * dt
    v[j] -= (F / m[j]) * dt
```

## Quick Sanity Checks

- Momentum is a vector: conserve it *componentwise*. Total $p_x$ and total $p_y$ are each conserved separately.
- Units: $[\text{kg}\cdot\text{m/s}] = [\text{N}\cdot\text{s}]$ — momentum and impulse share units, as they must since $J = \Delta p$.
- For an isolated system, if total momentum changed, you either missed an external force or made an arithmetic slip.
- A recoiling gun and its bullet have equal and opposite momenta; the gun's speed is smaller by the mass ratio. If both move the same way, you flipped a sign.
- The COM of an isolated system can't accelerate. An object can't change its own COM velocity by internal forces alone — "pulling yourself up by your bootstraps" is forbidden by momentum conservation.
