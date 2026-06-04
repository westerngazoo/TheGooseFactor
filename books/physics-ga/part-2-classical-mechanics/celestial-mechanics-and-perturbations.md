---
sidebar_position: 3
title: "Celestial Mechanics and Perturbations"
---

# Celestial Mechanics and Perturbations

> *Doran-Lasenby §3.4.* What happens when the inverse-square law
> gets a small correction. The Laplace-Runge-Lenz vector starts to
> precess — and the rate falls out of a single GA calculation.

The clean Kepler orbits of [Ch 5](/physics-ga/part-2-classical-mechanics/two-body-central-force)
are idealizations. Real planets feel J2 oblateness, third-body
tugs from Jupiter, and a $1/r^3$ correction from general relativity.
Each of these breaks the LRL vector's conservation by a small
amount — and that small amount drives the perihelion precession that
tested Einstein's theory.

## 1. The perturbation framework

Start from the unperturbed Kepler problem with conserved
$L = r\wedge p$, $A = \dot{r}\cdot L - k\hat{r}/\mu$, and energy
$E$. Add a small extra potential:

$$V_{\text{tot}}(r) = -\frac{k}{r} + \epsilon\, V_{\text{pert}}(r), \qquad \epsilon \ll 1$$

The equation of motion gains an extra term:

$$\mu\ddot{r} = -V'(r)\hat{r} - \epsilon\, V'_{\text{pert}}(r)\hat{r}$$

For a central perturbation, $L$ stays conserved ($r\wedge\hat{r} = 0$
still). But $A$ no longer is — the extra force ruins the
cancellation in [Ch 5 §4](/physics-ga/part-2-classical-mechanics/two-body-central-force).
The LRL vector slowly **precesses** in the orbital plane.

## 2. The averaging method

For weak perturbations, the orbit is *almost* a closed ellipse over
each revolution, but the orientation of the ellipse (the direction
of $A$) drifts. The natural quantity to compute is the orbit-averaged
rate $\langle \dot{A} \rangle$.

The averaging is over one orbital period:

$$\langle \dot{A} \rangle = \frac{1}{T}\oint \dot{A}\, dt = \frac{1}{T}\oint \frac{dA}{d\theta}\, d\theta$$

where $\theta$ is the true anomaly (angle from periapsis). Using
$dt = d\theta\,\mu r^2/|L|$:

$$\langle \dot{A} \rangle = \frac{1}{T}\int_0^{2\pi} \frac{dA}{d\theta}\frac{\mu r^2}{|L|}\, d\theta$$

For a perturbation $\epsilon V_{\text{pert}}(r)$, the result has the
form

$$\langle \dot{A} \rangle = \omega_p\, B_\perp \cdot A$$

where $\omega_p$ is the precession rate (the thing we want to
compute) and $B_\perp$ is the unit bivector for the orbital plane.

> :mathgoose: $B_\perp \cdot A$ rotates $A$ by 90° in the orbital
> plane. The averaged rate of change of $A$ is perpendicular to
> $A$ — that's exactly what "precession" means in GA: $A$ stays
> the same length but rotates in the plane $B_\perp$.

## 3. The $1/r^3$ correction (general relativity)

Schwarzschild geometry adds an effective $1/r^3$ term to the
classical inverse-square attraction. For an orbit around a mass $M$,
the effective central potential becomes

$$V_{\text{eff}}(r) = -\frac{GM\mu}{r} + \frac{|L|^2}{2\mu r^2} - \frac{GM\,|L|^2}{c^2\mu r^3}$$

The first two terms are classical (Kepler + centrifugal). The
third is the GR correction.

Treating the GR term as a perturbation
$\epsilon V_{\text{pert}}(r) = -GM|L|^2/(c^2\mu r^3)$ and averaging
(D-L §3.4, also any GR textbook), the LRL-vector precession rate
per orbit is

$$\Delta\theta_{\text{peri}} = \frac{6\pi GM}{c^2 a(1-e^2)}$$

where $a$ is the semi-major axis and $e$ the eccentricity. For
Mercury ($a \approx 5.8\times 10^{10}$ m, $e \approx 0.206$,
$M = M_\odot$, $T = 88$ days, ~415 orbits per Earth-century):

$$\Delta\theta_{\text{century}} \approx 43''/\text{century}$$

The 43-arcsecond discrepancy that puzzled Le Verrier and that
Einstein's theory predicted exactly in 1915. GA gets you to it in
one averaging integral.

> :surprisedgoose: Mercury's anomalous precession was the "smoking
> gun" for general relativity. Before Einstein, Le Verrier had even
> postulated a hidden planet ("Vulcan") interior to Mercury's orbit
> to explain the 43"/century. Vulcan doesn't exist; the $1/r^3$
> term in the Schwarzschild geodesic equation does. The
> calculation, in any formulation, comes down to "what's the
> averaged rate of LRL precession under a $1/r^3$ perturbation."
> GA makes that one boxed result.

## 4. J2 oblateness

The Earth and most planets aren't perfect spheres — they bulge at
the equator. The leading correction to a satellite's potential is
the **J2** term:

$$V_{J_2}(r,\theta) = -\frac{GM\mu R^2}{r^3}\,J_2\,P_2(\cos\theta)$$

with $P_2(x) = (3x^2-1)/2$ the Legendre polynomial and $\theta$
the angle from the rotation axis. For Earth, $J_2 \approx 1.083\times 10^{-3}$.

For a near-equatorial orbit, the J2 perturbation drives two
precessions:

1. **Apsidal precession** — the LRL vector $A$ rotates in the
   orbital plane at rate $\dot\omega_p$.
2. **Nodal precession** — the orbital plane (the bivector $L$)
   rotates around the Earth's rotation axis at rate
   $\dot\Omega$.

Both rates can be derived by averaging $\dot{A}$ and $\dot{L}$
over an orbit. For a circular orbit at altitude $h$:

$$\dot\Omega_J \approx -\frac{3}{2} n\, J_2 \left(\frac{R}{a}\right)^2 \cos i, \qquad \dot\omega_J \approx \frac{3}{4} n\, J_2 \left(\frac{R}{a}\right)^2 (5\cos^2 i - 1)$$

where $n = \sqrt{GM/a^3}$ is the mean motion and $i$ is the orbital
inclination.

**Sun-synchronous orbits** exploit nodal precession: choose
$\dot\Omega_J$ to match Earth's orbital rate around the Sun
($\approx 0.986°/\text{day}$), so the satellite's orbit precesses
to keep the same Sun-orientation year-round. The required
inclination is around $98°$ (slightly retrograde) for typical
low-Earth-orbit altitudes.

> :nerdygoose: Sun-synchronous orbits are how Landsat and most
> Earth-imaging satellites work — they fly over each region of
> Earth at the same local solar time every day. The J2 oblateness
> is the *engine* that makes those orbits possible; without
> Earth's equatorial bulge, you'd have to actively burn fuel to
> maintain Sun-synchronicity.

## 5. Third-body perturbations and the lunar problem

The Moon orbits Earth, but the Sun's gravity perturbs the orbit.
The Earth-Moon-Sun system is a **restricted three-body problem**:
treat the Sun as a fixed perturber (since its mass dominates and
its position is essentially fixed on lunar-month timescales).

The perturbing potential — the difference between the Sun's
attraction on the Moon and on the Earth — drives several
well-known effects:

- **Evection** (Hipparchus, ~150 BCE): periodic variation in
  the eccentricity of the lunar orbit, period ~31.8 days.
- **Variation** (Tycho Brahe): periodic variation in longitude,
  period ~14.8 days.
- **Apsidal precession**: the line of apsides (the major axis)
  rotates with a period of ~8.85 years.
- **Nodal regression**: the line of nodes (intersection of lunar
  and ecliptic planes) regresses with a period of ~18.6 years —
  responsible for the 18.6-year tidal cycle.

Each of these falls out of averaging the third-body perturbation
against the unperturbed Kepler orbit. The GA-native objects are:

- The lunar LRL vector $A_{\rm M}$ — precesses with period
  ~8.85 yr (apsidal motion).
- The lunar angular momentum bivector $L_{\rm M}$ — rotates with
  period ~18.6 yr (nodal motion).

> :angrygoose: The lunar problem ate Newton's brain — he confessed
> in 1684 that it "made his head ache, and kept him awake so often,
> that he would think of it no more." 350 years later, the
> arithmetic is still tedious in any notation. GA at least lets you
> *see* what's happening: two precession rates, one for each
> conserved object of the unperturbed problem.

## 6. The eccentricity and inclination vectors

A practical reparameterization for orbital perturbations uses the
**eccentricity vector** $e := A/|A|$ (a unit vector pointing toward
periapsis) and the **inclination bivector** $L$ (already a bivector).

For long-term orbit evolution under multiple perturbations, the
governing equations are:

$$\dot{e} = (\text{sum of secular and periodic terms})$$
$$\dot{L}/|L| = (\text{sum of secular and periodic terms})$$

This is the **Lagrange planetary equations** in GA form. The
classical formulation uses six Keplerian elements
$(a, e, i, \Omega, \omega, M)$ and writes evolution equations for
each. In GA you track $(a, e\text{-vector}, L\text{-bivector})$ —
fewer variables, no Euler-angle singularities.

## 7. Numerical orbit propagation

For high-precision propagation (deep-space missions, satellite
tracking, asteroid impact analysis), the GA reformulation has a
practical edge: **bivector and rotor states avoid the singularities
of Euler-angle representations**. The configuration
$(r, \dot{r}, R, \Omega)$ — position vector, velocity vector,
attitude rotor, angular velocity bivector — fully parameterizes
both translational and rotational state without any gimbal lock.

Standard orbit-propagation libraries (SPICE, STK, GMAT) still use
Euler angles internally; GA-native implementations are a research
topic (D-L cites a few, but the field hasn't standardized).

> :weightliftinggoose: For the 21st-century deep-space-mission
> engineer, this is where the GA contribution would actually help.
> Modify a standard propagator to carry rotor attitudes instead of
> Euler angles, and one whole class of singularity-related bug
> reports disappears.

## 8. Resonances and chaos

Multi-body systems exhibit **resonances** when orbital periods
have integer ratios. The 3:2 mean-motion resonance between Neptune
and Pluto stabilizes Pluto's orbit; the 2:1 resonance between
Jupiter and asteroids creates the Kirkwood gaps. Resonant dynamics
are well-described by Hamiltonian perturbation theory.

GA's role here is supporting cast: the underlying objects (orbits
parameterized by $(L, A)$) are GA-native, but the resonance
mathematics (action-angle variables, KAM theorem, Arnold diffusion)
isn't a GA story. For that, the standard celestial-mechanics
references (Murray & Dermott, *Solar System Dynamics*) remain the
canonical treatment.

> :sarcasticgoose: GA isn't magic. It cleans up rigid-body
> kinematics, makes the LRL vector explicit, and removes Euler-
> angle singularities. It doesn't make KAM tori easier to compute
> or resonance widths shorter to estimate. Use the right tool for
> each layer.

## What we covered

- Perturbations to inverse-square keep $L$ conserved but break
  $A$; the precession rate is the orbit-averaged $\dot{A}$.
- The GR $1/r^3$ correction predicts $43''$/century for Mercury,
  the historical test of GR.
- J2 oblateness drives apsidal and nodal precessions — exploited
  by sun-synchronous orbits.
- Third-body perturbations drive lunar evection, variation,
  apsidal, and nodal motions.
- The (eccentricity vector, angular-momentum bivector)
  reparameterization avoids Euler-angle singularities; useful for
  high-precision propagation.

## What's next

[Chapter 7](/physics-ga/part-2-classical-mechanics/rigid-body-dynamics-with-rotors) —
the rigid-body problem with rotors. Where GA earns its keep most
visibly: Euler-angle gimbal lock vanishes, the inertia tensor
becomes a linear function on bivectors, and the Euler equations
become a single rotor-bivector equation.
