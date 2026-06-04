---
sidebar_position: 4
title: "Central Potentials and the Hydrogen Atom"
---

# Central Potentials and the Hydrogen Atom

> *Doran-Lasenby §8.5–8.6.* The exact solution of the Dirac equation
> in a central potential, with the hydrogen atom as the marquee example.

The hydrogen atom is the calibration target of quantum mechanics —
the system whose energy levels can be derived in closed form and
checked against experiment to 10+ significant figures. The
GA-flavored derivation of the **Dirac hydrogen** brings out the
geometric structure of the angular momentum eigenstates.

## 1. The Dirac equation in a central potential

For a potential $V(r)$, the Dirac equation becomes

$$\nabla\psi\, I\gamma_0 = m\psi - eA\psi/\hbar c, \quad A = (V/c)\gamma_0$$

Substitute and rearrange:

$$\left[\nabla I\gamma_0 + \frac{e V}{\hbar c^2}\gamma_0\right]\psi = m\psi$$

For the Coulomb potential $V = -k/r$ (with $k = e^2/(4\pi\epsilon_0)$),
this is the **hydrogen Dirac equation**.

## 2. Separation of variables

Use the spherical-coordinate ansatz

$$\psi(\mathbf{r}, t) = R(r)\,\Omega(\hat{\mathbf{r}})\,e^{-IEt/\hbar}$$

with $R(r)$ a radial function and $\Omega(\hat{\mathbf{r}})$ an
angular function (both multivector-valued). The Dirac equation
separates into:

- **Angular**: $\hat{\mathbf{r}}\nabla_\Omega\,\Omega = k_\Omega\,\Omega$
- **Radial**: $\left(\partial_r - k_\Omega/r + \frac{m c^2 - E}{\hbar c} - \frac{e V}{\hbar c^2}\right)R = 0$

The angular eigenvalue $k_\Omega$ is the "**spinor angular**
**momentum quantum number**" — it takes integer values in 1D and
half-integer-shifted values in spin-1/2. Specifically:

$$k_\Omega = \pm(j + 1/2)$$

with $j$ the total angular momentum.

## 3. The angular wavefunctions

The eigenfunctions of the angular Dirac operator are **spinor
spherical harmonics**. In GA they're built from:

- Pauli spinor "up" / "down" eigenstates of $\boldsymbol{\sigma}_3$.
- Spherical harmonics $Y_\ell^m(\hat{\mathbf{r}})$.

Combined as Clebsch-Gordan combinations to give eigenstates of
total angular momentum $\hat{J}^2$ and $\hat{J}_z$. For each
$(j, m)$, there are 2 angular eigenstates corresponding to the
two values $\ell = j \pm 1/2$ (orbital quantum number = $j$ plus
or minus 1/2 for spin alignment).

The GA expressions are compact:

$$\Omega^+_{j,m} = \cos\theta\,Y_\ell^m\,\xi_+ - \sin\theta\,Y_\ell^{m-1}\,\xi_-$$

(schematic) for the $\ell = j - 1/2$ states, with $\xi_\pm$ the
Pauli up/down states. The full expressions involve standard
Clebsch-Gordan coefficients.

## 4. The radial equation and its solutions

The radial Dirac equation reduces to a confluent hypergeometric
equation, with solutions involving **Laguerre polynomials**:

$$R_{n,\kappa}(r) = N_{n,\kappa}\,r^{\gamma - 1}\,e^{-r/a}\,L_{n}^{(2\gamma)}(2r/a)$$

with $\gamma = \sqrt{\kappa^2 - \alpha^2}$, $\kappa = j + 1/2$,
and the Bohr radius (modified) $a$. The normalization $N$ and
exact form of the Laguerre polynomial depend on the principal
quantum number $n$ (= $n_r + |\kappa|$ with $n_r$ the radial
quantum number).

The key fact: the energy eigenvalue depends on **both** $n$ and
$j$ (via $\kappa$):

$$\boxed{\; E_{n,j} = m c^2\left[1 + \frac{\alpha^2}{(n - |\kappa| + \sqrt{\kappa^2 - \alpha^2})^2}\right]^{-1/2} \;}$$

This is the **exact Dirac hydrogen energy** — the formula that
gives 12-decimal-place agreement with experiment after the QED
corrections are subtracted.

## 5. The fine structure

Expanding $E_{n,j}$ in powers of $\alpha$:

$$E_{n,j} \approx mc^2\left[1 - \frac{\alpha^2}{2n^2} - \frac{\alpha^4}{2n^4}\left(\frac{n}{j+1/2} - \frac{3}{4}\right) + O(\alpha^6)\right]$$

The first correction is the non-relativistic **Bohr energy**
$-\alpha^2 mc^2/(2n^2)$. The second correction is the **fine
structure**:

- Depends on $j$ (not just $n$, as in Schrödinger): each principal
  level $n$ splits into a set of $j$-dependent levels.
- Scales as $\alpha^4$ — small corrections, but observable in
  modern spectroscopy.

The famous **$2P_{1/2}$ and $2P_{3/2}$** splitting in hydrogen
is the fine structure: same $n$, same $\ell$, different $j$,
slightly different energies.

> :nerdygoose: The fine-structure constant $\alpha \approx 1/137$
> is the small parameter of QED. It's so small that perturbation
> theory works for the precision frontier of physics — the
> $\alpha^4$ corrections are measurable but small, and you can
> push to higher orders before non-perturbative effects matter.

## 6. The Lamb shift (preview)

Beyond Dirac's prediction, the $2S_{1/2}$ and $2P_{1/2}$ states
have slightly **different** energies — split by the **Lamb shift**
$\sim 1$ GHz. This is **not** predicted by the Dirac equation.

The Lamb shift comes from **QED radiative corrections** —
photon-loop diagrams in quantum electrodynamics. It's calculable
in QED but requires the full machinery of renormalization. We
won't derive it here, but it's the reason Dirac hydrogen isn't
the final answer — QED corrections matter at $\alpha^5$ and beyond.

## 7. The hyperfine structure

Within fine-structure splittings, **hyperfine** structure arises
from the interaction of electron spin with nuclear spin. The
proton has spin 1/2 and a magnetic moment; the electron's spin
interacts with the nuclear magnetic field, producing additional
splittings.

The most famous hyperfine line: the **21-cm line** of atomic
hydrogen ($1S_{1/2}$, $F = 0 \to F = 1$ transition). This is the
emission line that radio astronomers use to map the structure
of the Milky Way — galactic-hydrogen mapping at radio wavelengths.

In GA, the hyperfine interaction is the **spin-spin coupling**
between electron and proton bivectors, plus an isotropic Fermi-
contact term that activates when the electron wavefunction
overlaps the nucleus.

## 8. The Bohr-Sommerfeld limit

In the non-relativistic limit and large quantum numbers, the
Dirac hydrogen recovers the Bohr-Sommerfeld semi-classical
levels:

$$E_n \approx -\frac{\alpha^2 mc^2}{2n^2}$$

This is the "classical orbit" answer that Bohr proposed in 1913 —
remarkably accurate considering it came from elementary
quantization conditions, not the full Dirac equation.

The reason it works: the quantum corrections to Bohr's answer
appear at higher order in $\alpha$, and Bohr's accidentally-correct
expression captures the leading large-$n$ behavior.

## 9. Pair production and the Klein paradox revisited

For a strong Coulomb field ($Z\alpha > 1$, i.e., $Z > 137$ for
the bare Coulomb potential), the Dirac hydrogen energy formula
becomes imaginary — the binding energy exceeds $2mc^2$. This is
the **diving** of bound states into the negative-energy continuum,
predicting **pair production** from a sufficiently strong field.

Real heavy nuclei don't quite reach this threshold (uranium has
$Z = 92$, finite-size corrections push the diving threshold up),
but the prediction has been studied in heavy-ion collisions where
$Z_{\rm effective}$ can exceed 137 transiently.

> :angrygoose: The "diving" of bound states is one of the
> non-obvious phenomena predicted by the Dirac equation that has
> no analog in non-relativistic quantum mechanics. It's also a
> hint that the single-particle Dirac equation isn't the right
> object for strong fields — you need **quantum field theory**
> with both particle and antiparticle creation built in.

## What we covered

- The Dirac equation in a central potential separates into
  radial + spinor-spherical-harmonic equations.
- Angular eigenstates are spinor spherical harmonics; eigenvalue
  $\kappa = j + 1/2$.
- Radial equation gives Laguerre-polynomial solutions and the
  exact Dirac hydrogen energy.
- Fine structure: levels depend on $(n, j)$, scaling as $\alpha^4$.
- Lamb shift, hyperfine structure, and pair-production threshold
  are beyond the scope of single-particle Dirac.

## What's next

[Chapter 22](/physics-ga/part-5-quantum/multiparticle-sta-and-entanglement) —
multiparticle STA. Tensor products of GA spinors, the two-particle
Dirac equation, entanglement, Bell states, and the GA-native
description of multipartite quantum systems.
