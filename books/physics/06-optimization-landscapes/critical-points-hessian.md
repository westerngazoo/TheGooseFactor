---
sidebar_position: 3
sidebar_label: "Critical Points & the Hessian"
title: "Critical Points, the Hessian, and Curvature"
---

# Critical Points, the Hessian, and Curvature

A vanishing gradient locates a critical point, but it can't tell you *which kind*. That job belongs to the **Hessian** — the matrix of second derivatives encoding the landscape's curvature. Reading the Hessian is how you distinguish a minimum from a maximum from a saddle, and in high dimensions it overturns the naive picture of optimization: the real enemy isn't local minima, it's saddles.

## Critical Points

A **critical point** $\mathbf{x}^\star$ is where the gradient vanishes:

```math
\nabla U(\mathbf{x}^\star) = \mathbf{0}.
```

It comes in three flavors, decided by curvature:

- **Local minimum**: curves *up* in every direction (a bowl).
- **Local maximum**: curves *down* in every direction (a dome).
- **Saddle point**: curves up in some directions, down in others (a mountain pass / Pringle).

## The Hessian

The **Hessian** is the matrix of second partial derivatives:

```math
H_{ij} = \frac{\partial^2 U}{\partial x_i\,\partial x_j}, \qquad H = \nabla^2 U.
```

It is the multivariable second derivative — the local quadratic curvature. The second-order Taylor expansion about a critical point ($\nabla U = \mathbf 0$ there) is governed entirely by $H$:

```math
U(\mathbf{x}^\star + \delta) \approx U(\mathbf{x}^\star) + \tfrac{1}{2}\,\delta^\top H\,\delta.
```

For smooth $U$ the Hessian is **symmetric** ($\partial^2 U/\partial x_i\partial x_j = \partial^2 U/\partial x_j\partial x_i$), so it has real eigenvalues and orthogonal eigenvectors.

> :mathgoose: The eigenvectors of $H$ are the **principal axes** of the landscape's local curvature, and the eigenvalues are the curvatures along them — exactly the "effective stiffness" $k = U''$ that made every potential minimum a harmonic oscillator back in the Kinematics book. Diagonalizing the Hessian decomposes the bowl into independent 1-D springs, one per eigenvector. High-D curvature is just a basis change away from a pile of simple oscillators.

## The Second-Derivative Test

Classify a critical point by the **eigenvalues** of $H$ there:

| All eigenvalues | Critical point is a |
|---|---|
| $> 0$ (positive definite) | **local minimum** |
| $< 0$ (negative definite) | **local maximum** |
| mixed signs (indefinite) | **saddle point** |
| some $= 0$ | inconclusive (degenerate) |

This generalizes the 1-D test ($U'' > 0 \Rightarrow$ min) from the Calculus book: a minimum requires *upward* curvature in *every* direction, i.e. all eigenvalues positive.

## Curvature Sets the Optimizer's Pace

The eigenvalues don't just classify — they control convergence:

- **Large eigenvalue** = steep, sharply-curved direction → small stable step size required (a stiff spring).
- **Small eigenvalue** = shallow, gently-curved direction → slow progress.
- Their ratio is the **condition number** $\kappa = \lambda_{\max}/\lambda_{\min}$, which (from the previous chapter) governs how badly gradient descent zigzags.

**Newton's method** uses the Hessian to rescale the step, taking the curvature into account:

```math
\mathbf{x}_{k+1} = \mathbf{x}_k - H^{-1}\nabla U(\mathbf{x}_k).
```

By multiplying by $H^{-1}$, Newton turns any quadratic bowl into a perfectly round one and converges in a *single step* on a quadratic — at the cost of forming and inverting $H$ ($O(n^3)$, prohibitive for large $n$).

> :nerdygoose: This is why second-order methods (Newton, quasi-Newton like BFGS, L-BFGS) converge so much faster *per step* than gradient descent: they see the curvature and step accordingly, immune to the conditioning that cripples first-order methods. The catch is cost — the Hessian is $n\times n$, hopeless to invert for billion-parameter models. The entire zoo of optimizers (Adam, RMSProp, Shampoo, K-FAC) consists of cheap *approximations* to $H^{-1}$, trading exactness for scalability.

## Saddle Points Dominate High Dimensions

The folk worry about optimization is "getting stuck in a bad local minimum." In high dimensions that worry is largely misplaced. For a critical point to be a minimum, *all* $n$ eigenvalues must be positive — and if each eigenvalue's sign were a coin flip, that probability is $2^{-n}$, astronomically small for large $n$. Almost every critical point is therefore a **saddle**.

> :surprisedgoose: This flips the textbook intuition. In a billion-dimensional loss landscape, true local minima are exponentially rare and tend to be nearly as good as the global one; the *real* obstacles are saddle points, where the gradient is tiny and progress stalls even though you're nowhere near optimal. This is why momentum and stochastic noise matter so much — they push the iterate off the saddle's flat ridge and down an escape direction. "Escaping saddles," not "avoiding local minima," is the central challenge of high-dimensional optimization.

> :angrygoose: Because the gradient is *small* near a saddle, a stopping rule like "halt when $\|\nabla U\|$ is tiny" will confidently terminate on a saddle and report a terrible solution as converged. Check the Hessian's smallest eigenvalue (or use the noise/momentum that naturally escapes): a negative eigenvalue means there's still a downhill direction you haven't taken. Small gradient $\ne$ done.

## Computational / Algorithmic Touchpoints

- **Hessian-vector products** ($Hv$) can be computed in roughly the cost of one gradient via automatic differentiation, *without* forming $H$ — the basis of Hessian-free optimization and Lanczos curvature estimation.
- **Quasi-Newton (BFGS, L-BFGS)** builds an approximate $H^{-1}$ from gradient history; L-BFGS is the default for medium-scale smooth optimization (`scipy.optimize`).
- **Curvature diagnostics**: the eigenvalue spectrum of the Hessian (or its extremes via power iteration) measures conditioning and detects saddles during training.
- **Trust-region and saddle-free Newton** methods explicitly handle negative-curvature directions to step *off* saddles rather than toward them.

```python
import numpy as np
def hessian(U, x, eps=1e-4):
    n = len(x); H = np.zeros((n, n))
    for i in range(n):
        for j in range(n):
            ei = np.zeros(n); ei[i] = eps
            ej = np.zeros(n); ej[j] = eps
            H[i, j] = (U(x+ei+ej) - U(x+ei-ej) - U(x-ei+ej) + U(x-ei-ej)) / (4*eps*eps)
    return H

def classify(H):
    w = np.linalg.eigvalsh(H)        # symmetric Hessian -> real eigenvalues
    if np.all(w > 0):  return "minimum"
    if np.all(w < 0):  return "maximum"
    return "saddle"
```

## Quick Sanity Checks

- A minimum requires *all* Hessian eigenvalues positive. One negative eigenvalue means saddle (or maximum) — there's a downhill escape direction.
- The Hessian of a smooth function is symmetric. If your computed $H$ isn't (beyond round-off), the mixed partials are wrong.
- Newton's method solves a quadratic in one step. If yours doesn't, the Hessian or its inverse is miscomputed.
- A near-zero gradient with a negative Hessian eigenvalue is a saddle, *not* a solution — don't stop there.
- Condition number $\kappa = \lambda_{\max}/\lambda_{\min} \ge 1$ always; $\kappa \approx 1$ is a round, easy bowl, while $\kappa \gg 1$ predicts slow first-order convergence.
