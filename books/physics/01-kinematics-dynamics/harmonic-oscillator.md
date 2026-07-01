---
sidebar_position: 3
sidebar_label: "The Harmonic Oscillator"
title: "The Harmonic Oscillator: SHM, Damping, and Resonance"
---

# The Harmonic Oscillator: SHM, Damping, and Resonance

The harmonic oscillator is the most important model in physics — not because the universe is full of springs, but because *every smooth potential looks like a spring near its minimum*. Taylor-expand any potential about a stable equilibrium and the leading term is quadratic, giving a linear restoring force. Master this one system and you understand small oscillations of everything.

## Simple Harmonic Motion (SHM)

A mass $m$ on a spring with stiffness $k$ feels the restoring force $F = -kx$. Newton's second law gives:

```math
m\ddot{x} = -kx \quad\Longleftrightarrow\quad \ddot{x} + \omega_0^2 x = 0, \qquad \omega_0 = \sqrt{\frac{k}{m}}.
```

The general solution oscillates sinusoidally:

```math
x(t) = A\cos(\omega_0 t + \phi),
```

with **angular frequency** $\omega_0$, **amplitude** $A$, and **phase** $\phi$ set by the initial conditions. The period and frequency are:

```math
T = \frac{2\pi}{\omega_0} = 2\pi\sqrt{\frac{m}{k}}, \qquad f = \frac{1}{T}.
```

> :mathgoose: The defining feature of SHM is that **frequency is independent of amplitude** ($\omega_0$ has no $A$ in it). A big swing and a small swing take the same time. This *isochronism* is special to the linear restoring force; it's why pendulum clocks work — and it breaks for large-angle pendulums where the small-angle approximation $\sin\theta \approx \theta$ fails.

### Why every minimum is a spring

Expand a potential $U(x)$ about a minimum at $x_0$ (where $U'(x_0)=0$):

```math
U(x) \approx U(x_0) + \tfrac{1}{2} U''(x_0)\,(x - x_0)^2.
```

The force is $F = -U'(x) \approx -U''(x_0)(x - x_0)$ — Hooke's law with effective stiffness $k_{\text{eff}} = U''(x_0)$. So small oscillations about any stable equilibrium have $\omega_0 = \sqrt{U''(x_0)/m}$.

> :happygoose: This is the single most reusable idea in the chapter. Molecular vibrations, LC circuits, atoms in a crystal, a marble in a bowl, the price of a commodity near equilibrium — all are harmonic oscillators because the second derivative of the potential is the only thing that matters when you're close to the bottom. The curvature $U''$ *is* the stiffness.

## The Damped Oscillator

Add linear drag $-b\dot x$ (friction, air resistance, electrical resistance):

```math
m\ddot{x} + b\dot{x} + kx = 0 \quad\Longleftrightarrow\quad \ddot{x} + 2\zeta\omega_0\,\dot{x} + \omega_0^2 x = 0,
```

where $\zeta = \dfrac{b}{2\sqrt{mk}}$ is the dimensionless **damping ratio**. The behavior splits into three regimes by the sign of the discriminant:

| Regime | Condition | Behavior |
|---|---|---|
| Underdamped | $\zeta < 1$ | oscillates with decaying amplitude $e^{-\zeta\omega_0 t}$ |
| Critically damped | $\zeta = 1$ | returns to equilibrium fastest, no oscillation |
| Overdamped | $\zeta > 1$ | returns slowly, no oscillation |

The underdamped solution rings at a slightly reduced frequency:

```math
x(t) = A\,e^{-\zeta\omega_0 t}\cos(\omega_d t + \phi), \qquad \omega_d = \omega_0\sqrt{1 - \zeta^2}.
```

> :nerdygoose: **Critical damping** ($\zeta = 1$) is the engineering sweet spot: fastest settling with no overshoot. Car suspensions, door closers, and PID controller tuning all chase it. Underdamped systems oscillate (bouncy, annoying); overdamped systems are sluggish (a screen door that takes forever to close). The whole field of control theory lives in choosing $\zeta$.

## The Driven Oscillator and Resonance

Push the oscillator with a periodic force $F_0\cos(\omega t)$:

```math
m\ddot{x} + b\dot{x} + kx = F_0\cos(\omega t).
```

After transients die out, the steady-state response oscillates at the *drive* frequency $\omega$ with amplitude:

```math
A(\omega) = \frac{F_0/m}{\sqrt{(\omega_0^2 - \omega^2)^2 + (2\zeta\omega_0\omega)^2}}.
```

The amplitude peaks near $\omega \approx \omega_0$ — **resonance**. The lower the damping, the sharper and taller the peak; as $\zeta \to 0$ the response diverges.

> :surprisedgoose: Resonance is how a tiny periodic push builds a huge response: pumping a swing, shattering a glass with sound, an opera singer and a wineglass. It's also a catastrophic failure mode — bridges and buildings have resonant frequencies, and matching them (wind, earthquakes, marching soldiers) is dangerous. The Tacoma Narrows bridge is the textbook cautionary tale, even if the real mechanism was subtler aeroelastic flutter.

> :angrygoose: A common confusion: the steady-state response is at the **drive** frequency $\omega$, *not* the natural frequency $\omega_0$. The system forgets how it "wants" to oscillate and follows the driver. The natural frequency only shows up in the *transient* (which decays) and in *where* the amplitude curve peaks.

## Energy in the Oscillator

For undamped SHM, energy sloshes between kinetic and potential while the total stays constant:

```math
E = \tfrac{1}{2}m\dot{x}^2 + \tfrac{1}{2}kx^2 = \tfrac{1}{2}kA^2 = \text{const}.
```

Damping drains $E$ at rate $-b\dot x^2$ (always negative); driving pumps it back in. At steady state, the average power in from the driver equals the average power dissipated by damping — a balance that *defines* the steady amplitude.

## Computational / Algorithmic Touchpoints

- **Phase-space portrait**: plotting $(x, \dot x)$, undamped SHM traces an ellipse (closed orbit, conserved energy); damping spirals inward to the origin. This picture is the litmus test for whether your integrator conserves energy.
- **Symplectic integrators matter here**: naive explicit Euler *adds* energy to an oscillator and spirals outward even with no driving — a numerical artifact. The harmonic oscillator is the standard benchmark for testing whether an integrator preserves the orbit (covered in the Computational Physics chapter).
- **Resonance = transfer-function peak**: the amplitude formula $A(\omega)$ is the magnitude of a transfer function; engineers read it straight off a Bode plot. Filters, control loops, and signal processing all live in this language.
- **Complex exponentials** simplify everything: writing $x = \text{Re}(z e^{i\omega t})$ turns the driven ODE into algebra, $(-\omega^2 + 2i\zeta\omega_0\omega + \omega_0^2)z = F_0/m$.

```python
def damped_oscillator_rhs(state, t, omega0, zeta):
    # first-order form of x'' + 2 zeta omega0 x' + omega0^2 x = 0
    x, v = state
    a = -2 * zeta * omega0 * v - omega0**2 * x
    return [v, a]
```

## Quick Sanity Checks

- $\omega_0 = \sqrt{k/m}$ has units $\sqrt{(\text{N/m})/\text{kg}} = \sqrt{1/\text{s}^2} = \text{s}^{-1}$. Good — angular frequency is per-second.
- Stiffer spring (bigger $k$) or lighter mass (smaller $m$) ⇒ higher frequency. If your formula says otherwise, you flipped the ratio.
- Set $b = 0$ and the damped solution must reduce to pure SHM; set $F_0 = 0$ and the driven equation must reduce to the damped one.
- For underdamped motion $\omega_d < \omega_0$ — damping always *lowers* the ringing frequency. If you compute $\omega_d > \omega_0$, recheck the sign under the square root.
- Energy of undamped SHM should be constant over a full period; if your simulation's energy drifts, suspect the integrator, not the physics.
