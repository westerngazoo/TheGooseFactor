---
sidebar_position: 5
title: "Scattering and Diffraction"
---

# Scattering and Diffraction

> *Doran-Lasenby §7.5.* Light interacting with matter. Thomson and
> Rayleigh scattering from the bound-electron picture, then Kirchhoff
> diffraction in STA.

How EM waves interact with charges, slits, and apertures. The
underlying physics is everywhere already in [Chapters 13–16](/physics-ga/part-4-electromagnetism/maxwell-equations) —
this chapter applies it.

## 1. Thomson scattering

A free electron in an EM wave's field oscillates and re-radiates.
The driving force is

$$\mathbf{F} = -e\mathbf{E}_0\cos(\omega t)$$

so the electron's acceleration is $\mathbf{a} = (eE_0/m)\cos(\omega t)$.

From the Larmor formula ([Ch 14 §9](/physics-ga/part-4-electromagnetism/integral-conservation-theorems)),
the time-averaged radiated power is

$$\langle P\rangle = \frac{e^2\langle a^2\rangle}{6\pi\epsilon_0 c^3} = \frac{e^4 E_0^2}{12\pi\epsilon_0 m^2 c^3}$$

Dividing by the incident wave's intensity $\langle u c\rangle = \tfrac{1}{2}\epsilon_0 E_0^2 c$
gives the **Thomson cross-section**:

$$\boxed{\; \sigma_T = \frac{8\pi}{3}r_e^2, \qquad r_e := \frac{e^2}{4\pi\epsilon_0 m c^2} \;}$$

$r_e \approx 2.82\times 10^{-15}$ m is the **classical electron radius**.
Thomson scattering is **frequency-independent** — every incident
photon scatters with the same probability regardless of $\omega$
(as long as we're in the low-energy classical limit).

> :nerdygoose: Thomson scattering is the dominant interaction of
> X-rays and gamma-rays with matter at modest energies. At very
> high energies ($\hbar\omega > mc^2 \approx 511$ keV), the
> Compton effect takes over — the photon's momentum becomes
> non-negligible and the cross-section drops as $1/\omega$.

## 2. Rayleigh scattering

For atomic electrons bound at frequency $\omega_0$, the equation
of motion is

$$\ddot{\mathbf{x}} + \omega_0^2\mathbf{x} = -e\mathbf{E}_0\cos(\omega t)/m$$

Solving (steady state):

$$\mathbf{x}(t) = -\frac{eE_0}{m(\omega_0^2 - \omega^2)}\cos(\omega t)$$

The induced dipole oscillates and radiates. The scattering
cross-section is

$$\sigma_R = \sigma_T\,\left(\frac{\omega^2}{\omega_0^2 - \omega^2}\right)^2$$

For $\omega \ll \omega_0$ (visible light on atomic electrons,
$\omega_0$ in UV):

$$\sigma_R \approx \sigma_T\,\left(\frac{\omega}{\omega_0}\right)^4$$

— the famous **$\omega^4$** scaling. Blue light scatters $\sim 10\times$
more than red, explaining why the sky is blue.

> :surprisedgoose: The sky is blue and sunsets are red because of
> $\omega^4$. Same physics — Rayleigh scattering off atmospheric
> molecules. Tyndall calculated this in 1869; Rayleigh derived
> it more rigorously in 1881. The full GA derivation is one
> equation of motion plus the Larmor formula.

## 3. Coherent vs incoherent scattering

For $N$ scatterers with random phases, the **incoherent**
scattered power is just $N\sigma_R \cdot I_{\rm inc}$ — like
adding intensities. For $N$ scatterers in a **coherent**
arrangement (e.g., periodically spaced atoms in a crystal), the
scattered amplitudes add, and the power scales as $N^2$ in
certain directions (Bragg peaks).

This is the principle of:

- **X-ray crystallography** — coherent X-ray scattering off
  crystal planes gives sharp diffraction peaks at
  $2d\sin\theta = n\lambda$.
- **Synchrotron radiation** — coherent emission from many
  electrons in a bunch.

The transition between incoherent and coherent depends on the
**coherence length** of the scatterers' arrangement compared to
the wavelength.

## 4. The Kirchhoff diffraction integral

For a wave passing through an aperture, the field beyond the
aperture is given by the **Kirchhoff integral**:

$$F(\mathbf{x}) = \frac{1}{4\pi}\oint_{\text{aperture}} \left(F_0\frac{\partial G}{\partial n} - G\frac{\partial F_0}{\partial n}\right) dS$$

where $G$ is the (free-space) Green's function and $F_0$ is the
incident field at the aperture. In the **paraxial** limit (small
aperture, far-field), this simplifies to the Fraunhofer integral:

$$F(\mathbf{x}_{\rm screen}) \propto \int A(\mathbf{x}_a)\,e^{-i\mathbf{k}\cdot\mathbf{x}_a}\,d^2 x_a$$

— the **Fourier transform** of the aperture function $A(\mathbf{x}_a)$.
This is why a single slit gives a sinc-pattern: the Fourier
transform of a rectangular aperture is sinc. Why a double slit
gives fringes: Fourier transform of two delta-functions is a
cosine.

GA's contribution here is mostly notational — the integral
formalism is the same. What GA buys is the clean way of writing
the bivector amplitude $F_0$ propagating through, with polarization
information preserved automatically.

## 5. Fraunhofer single-slit diffraction

For a slit of width $a$ illuminated by a plane wave at normal
incidence, the diffraction pattern on a far screen is

$$I(\theta) = I_0\,\mathrm{sinc}^2\left(\frac{a\sin\theta}{\lambda}\right)$$

where $\mathrm{sinc}(x) = \sin(\pi x)/(\pi x)$ and $\theta$ is the
angle from straight-ahead.

**Central maximum**: at $\theta = 0$, the brightest spot.
**First minima**: at $\sin\theta = \lambda/a$. The angular width
of the central peak is approximately $2\lambda/a$.

For a wide slit ($a \gg \lambda$): narrow central peak, sharp
geometric shadow on the sides — light goes through "straight."
For a narrow slit ($a \approx \lambda$): broad central peak, light
spreads out — the wave-nature dominates.

The **Rayleigh criterion** for resolution: two point sources can
be distinguished if their angular separation exceeds
$\theta_{\rm Rayleigh} = 1.22\lambda/D$ for a circular aperture of
diameter $D$. This sets the diffraction-limited resolution of
telescopes, microscopes, and your own eye.

## 6. Double-slit interference

For two slits separated by $d$, each of negligible width, the
intensity is

$$I(\theta) = 4 I_0 \cos^2\left(\frac{\pi d\sin\theta}{\lambda}\right)$$

**Bright fringes** at $d\sin\theta = n\lambda$ for integer $n$.
The fringe spacing is $\lambda L/d$ on a screen at distance $L$.

For real slits of finite width $a$, the pattern is the **product**:

$$I(\theta) = I_0\,\mathrm{sinc}^2\left(\frac{a\sin\theta}{\lambda}\right)\cos^2\left(\frac{\pi d\sin\theta}{\lambda}\right)$$

— the single-slit envelope modulated by the double-slit fringes.

> :happygoose: The double-slit experiment is the iconic
> demonstration of wave-particle duality, the founding observation
> for quantum mechanics, etc. But the classical interference
> pattern itself — bright and dark fringes for $E$-field
> superposition — is straightforward 19th-century optics, fully
> within the GA treatment of classical EM. Quantum mechanics
> enters only when you ask "what if the light arrives one photon
> at a time?" and find the interference pattern still builds up.

## 7. Polarization-dependent scattering

For polarized light scattering off charges, the **angular
distribution** depends on the incident polarization:

- **Unpolarized incident light**, perpendicular-axis observation:
  scatters with intensity factor $\tfrac{1}{2}(1 + \cos^2\theta)$.
- **Polarized incident light**, observation in plane of $\mathbf{E}$:
  factor $\sin^2\theta$.
- **Polarized incident light**, perpendicular to $\mathbf{E}$:
  full intensity, no $\theta$ dependence.

Skylight at $90°$ from the Sun is **highly polarized** because of
this — Rayleigh scattering preferentially scatters light polarized
perpendicular to the scattering plane. Polaroid filters exploit
this to darken the sky in photographs.

In GA the polarization-dependence is automatic in the bivector
formulation — the scattered $F$ inherits the orientation of the
incident $F_0$ and the geometry of the scattering vertex.

## 8. Beyond classical: Compton scattering preview

For X-rays and gamma-rays, the photon's momentum becomes
non-negligible and the **Compton effect** takes over. The
scattered wavelength shifts:

$$\lambda' - \lambda = \frac{h}{m c}(1 - \cos\theta) = \lambda_C(1 - \cos\theta)$$

with $\lambda_C = h/(mc) \approx 2.43\times 10^{-12}$ m the
**Compton wavelength** of the electron. Compton's 1923 experiment
was the first direct demonstration of the photon's particle nature
(in the relativistic regime where $\hbar\omega \approx mc^2$).

The full QED treatment uses Dirac spinors (next chapter for us, in
spirit — [Part V](/physics-ga/part-5-quantum/coming-soon)). The
classical-EM Thomson result is the low-energy limit.

> :weightliftinggoose: Thomson, Rayleigh, Compton: three limits of
> the same physics — light scattering off electrons. Low-energy
> free: Thomson. Low-energy bound: Rayleigh. High-energy: Compton.
> GA gives a unified framework for the classical ones; QED via
> Dirac spinors handles the relativistic case. All threads of the
> same calculation.

## What we covered

- Thomson scattering: free-electron cross section $\sigma_T = \frac{8\pi}{3}r_e^2$,
  frequency-independent.
- Rayleigh scattering: bound electrons, $\sigma \propto \omega^4$,
  blue sky / red sunset.
- Coherent vs incoherent scattering; X-ray crystallography.
- Kirchhoff diffraction integral; Fraunhofer limit gives the
  Fourier-transform relation between aperture and pattern.
- Single-slit (sinc²) and double-slit (cos²) patterns.
- Rayleigh resolution criterion $\theta = 1.22\lambda/D$.
- Polarization dependence of scattering — sky polarized at 90°
  from Sun.
- Compton effect as the high-energy limit (QED required).

## What's next

That closes Part IV — electromagnetism. [Part V](/physics-ga/part-5-quantum/coming-soon)
introduces **spinors** and quantum mechanics in STA. Pauli spin,
Dirac equation, hydrogen atom, multi-particle states — all in the
GA framework, where spinors are even-grade multivectors and the
Dirac equation is a vector equation in the algebra.
