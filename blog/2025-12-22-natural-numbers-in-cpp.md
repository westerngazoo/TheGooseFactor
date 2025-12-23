---
title: Building Natural Numbers from Scratch in C++
description: A type-safe implementation of Peano arithmetic showing how to construct the natural numbers using modern C++
---

# Building Natural Numbers from Scratch in C++

Ever wondered what natural numbers *really* are? Not just "1, 2, 3..." but their fundamental construction? Let's build them from first principles using C++ and Peano's axioms.

> For the mathematical foundation, see the [Natural Numbers section](/math#natural-numbers-construction-and-arithmetic) of our math reference.

## Why Bother?

Understanding how to construct natural numbers teaches us:
- **Type-level programming**: Using the type system to encode mathematical properties
- **Recursive thinking**: Everything builds from one simple rule
- **Proof by construction**: If it compiles, it's correct (to a degree)

## Peano's Axioms in C++

The natural numbers are defined by:
1. **Zero exists**: There's a starting point
2. **Successor function**: Given any natural number $n$, we can construct $S(n)$ (its successor)
3. **Zero is not a successor**: $0 \neq S(n)$ for any $n$
4. **Successor is injective**: $S(n) = S(m) \implies n = m$
5. **Induction**: If $P(0)$ holds and $P(n) \implies P(S(n))$, then $P$ holds for all naturals

## The Type-Safe Implementation

```cpp
#include <iostream>
#include <type_traits>
#include <concepts>

// Base case: Zero
struct Zero {
    static constexpr size_t value = 0;
    
    constexpr Zero() = default;
    
    // Zero is not a successor of anything
    static constexpr bool is_zero = true;
};

// Recursive case: Successor of N
template<typename N>
struct Succ {
    using predecessor = N;
    static constexpr size_t value = N::value + 1;
    
    constexpr Succ() = default;
    
    static constexpr bool is_zero = false;
};

// Concept: Is this a natural number type?
template<typename T>
concept NaturalNumber = requires {
    { T::value } -> std::convertible_to<size_t>;
    { T::is_zero } -> std::convertible_to<bool>;
} && (std::is_same_v<T, Zero> || requires {
    typename T::predecessor;
    requires NaturalNumber<typename T::predecessor>;
});

// Type aliases for readability
using One   = Succ<Zero>;
using Two   = Succ<One>;
using Three = Succ<Two>;
using Four  = Succ<Three>;
using Five  = Succ<Four>;

// Display a natural number
template<NaturalNumber N>
void display() {
    std::cout << "Value: " << N::value << "\n";
}
```

### Testing Basic Construction

```cpp
int main() {
    display<Zero>();   // Value: 0
    display<One>();    // Value: 1
    display<Three>();  // Value: 3
    display<Five>();   // Value: 5
    
    return 0;
}
```

## Addition: Recursive Definition

Addition follows the recursive definition from Peano arithmetic:
- $n + 0 = n$ (base case)
- $n + S(m) = S(n + m)$ (recursive case)

```cpp
// Addition: Add<N, M> computes N + M
template<NaturalNumber N, NaturalNumber M>
struct Add;

// Base case: N + 0 = N
template<NaturalNumber N>
struct Add<N, Zero> {
    using result = N;
};

// Recursive case: N + Succ(M) = Succ(N + M)
template<NaturalNumber N, NaturalNumber M>
struct Add<N, Succ<M>> {
    using result = Succ<typename Add<N, M>::result>;
};

// Helper alias
template<NaturalNumber N, NaturalNumber M>
using add_t = typename Add<N, M>::result;
```

### Addition Examples

```cpp
// 2 + 3 = 5
using TwoPlusThree = add_t<Two, Three>;
static_assert(TwoPlusThree::value == 5);
static_assert(std::is_same_v<TwoPlusThree, Five>);

// 0 + 4 = 4
using ZeroPlusFour = add_t<Zero, Four>;
static_assert(ZeroPlusFour::value == 4);
static_assert(std::is_same_v<ZeroPlusFour, Four>);

// Addition is commutative (at value level, not type level!)
using FivePlusTwo = add_t<Five, Two>;
using TwoPlusFive = add_t<Two, Five>;
static_assert(FivePlusTwo::value == TwoPlusFive::value);
```

## Multiplication: Repeated Addition

Multiplication is defined recursively:
- $n \times 0 = 0$
- $n \times S(m) = n + (n \times m)$

```cpp
// Multiplication: Mult<N, M> computes N * M
template<NaturalNumber N, NaturalNumber M>
struct Mult;

// Base case: N * 0 = 0
template<NaturalNumber N>
struct Mult<N, Zero> {
    using result = Zero;
};

// Recursive case: N * Succ(M) = N + (N * M)
template<NaturalNumber N, NaturalNumber M>
struct Mult<N, Succ<M>> {
    using result = add_t<N, typename Mult<N, M>::result>;
};

// Helper alias
template<NaturalNumber N, NaturalNumber M>
using mult_t = typename Mult<N, M>::result;
```

### Multiplication Examples

```cpp
// 3 * 2 = 6
using ThreeTimesTwo = mult_t<Three, Two>;
static_assert(ThreeTimesTwo::value == 6);

// 0 * 5 = 0
using ZeroTimesFive = mult_t<Zero, Five>;
static_assert(ZeroTimesFive::value == 0);
static_assert(std::is_same_v<ZeroTimesFive, Zero>);

// Identity: N * 1 = N
using FourTimesOne = mult_t<Four, One>;
static_assert(FourTimesOne::value == 4);
static_assert(std::is_same_v<FourTimesOne, Four>);
```

## Runtime Conversion

For practical use, we need to convert between compile-time types and runtime values:

```cpp
// Convert runtime value to natural number type (template)
template<size_t N>
struct ToNat {
    using type = Succ<typename ToNat<N-1>::type>;
};

template<>
struct ToNat<0> {
    using type = Zero;
};

template<size_t N>
using to_nat_t = typename ToNat<N>::type;

// Example: Create type representing 7
using Seven = to_nat_t<7>;
static_assert(Seven::value == 7);

// Runtime computation using our natural numbers
template<NaturalNumber N, NaturalNumber M>
constexpr size_t runtime_add() {
    return add_t<N, M>::value;
}

template<NaturalNumber N, NaturalNumber M>
constexpr size_t runtime_mult() {
    return mult_t<N, M>::value;
}

int main() {
    // Compile-time computation, runtime display
    constexpr auto result = runtime_mult<to_nat_t<6>, to_nat_t<7>>();
    std::cout << "6 * 7 = " << result << "\n";  // 6 * 7 = 42
    
    return 0;
}
```

## Comparison Operations

Let's add less-than comparison using structural recursion:

```cpp
// LessThan<N, M>: Is N < M?
template<NaturalNumber N, NaturalNumber M>
struct LessThan;

// 0 < Succ(M) is true
template<NaturalNumber M>
struct LessThan<Zero, Succ<M>> {
    static constexpr bool value = true;
};

// 0 < 0 is false
template<>
struct LessThan<Zero, Zero> {
    static constexpr bool value = false;
};

// Succ(N) < 0 is false
template<NaturalNumber N>
struct LessThan<Succ<N>, Zero> {
    static constexpr bool value = false;
};

// Succ(N) < Succ(M) iff N < M
template<NaturalNumber N, NaturalNumber M>
struct LessThan<Succ<N>, Succ<M>> {
    static constexpr bool value = LessThan<N, M>::value;
};

template<NaturalNumber N, NaturalNumber M>
constexpr bool less_than_v = LessThan<N, M>::value;

// Examples
static_assert(less_than_v<Two, Five>);
static_assert(!less_than_v<Five, Two>);
static_assert(!less_than_v<Three, Three>);
```

## Complete Working Example

Here's a full program showcasing the implementation:

```cpp
#include <iostream>

// [Include all the code above: Zero, Succ, Add, Mult, LessThan, etc.]

template<NaturalNumber N>
void print_nat(const char* label) {
    std::cout << label << N::value << "\n";
}

int main() {
    std::cout << "=== Peano Natural Numbers in C++ ===\n\n";
    
    // Basic numbers
    print_nat<Zero>("Zero = ");
    print_nat<Five>("Five = ");
    
    // Addition
    std::cout << "\nAddition:\n";
    print_nat<add_t<Two, Three>>("2 + 3 = ");
    print_nat<add_t<Four, Five>>("4 + 5 = ");
    
    // Multiplication
    std::cout << "\nMultiplication:\n";
    print_nat<mult_t<Three, Four>>("3 * 4 = ");
    print_nat<mult_t<Five, Five>>("5 * 5 = ");
    
    // Comparison
    std::cout << "\nComparison:\n";
    std::cout << "2 < 5? " << (less_than_v<Two, Five> ? "true" : "false") << "\n";
    std::cout << "5 < 2? " << (less_than_v<Five, Two> ? "true" : "false") << "\n";
    
    // Complex expression: (2 + 3) * 4 = 20
    using ComplexResult = mult_t<add_t<Two, Three>, Four>;
    print_nat<ComplexResult>("(2 + 3) * 4 = ");
    
    return 0;
}
```

**Output:**
```
=== Peano Natural Numbers in C++ ===

Zero = 0
Five = 5

Addition:
2 + 3 = 5
4 + 5 = 9

Multiplication:
3 * 4 = 12
5 * 5 = 25

Comparison:
2 < 5? true
5 < 2? false
(2 + 3) * 4 = 20
```

## Compilation

```bash
# Using g++ with C++20
g++ -std=c++20 -Wall -Wextra natural_numbers.cpp -o natural_numbers

# Using clang++ with C++20
clang++ -std=c++20 -Wall -Wextra natural_numbers.cpp -o natural_numbers

# Run
./natural_numbers
```

## What We've Learned

1. **Types as values**: We encoded numbers in the type system, making computations happen at compile time
2. **Structural recursion**: Every operation follows the recursive structure of natural numbers
3. **Proof by compilation**: Type constraints enforce mathematical properties (e.g., `NaturalNumber` concept)
4. **Zero-cost abstraction**: All computation happens at compile time; runtime code is just the results

## Limitations and Extensions

**Template depth**: Deep recursion hits compiler limits (~900 on most compilers). Use `-ftemplate-depth=N` to increase.

**No subtraction**: We'd need integers (with negative numbers) or bounded subtraction that returns `std::optional<Nat>`.

**Performance**: For actual arithmetic, use built-in integers! This is for understanding, not production.

**Possible extensions**:
- Implement exponentiation: $n^0 = 1$, $n^{S(m)} = n \times n^m$
- Add modular arithmetic
- Define prime number predicate at type level
- Implement division with remainder

## The Big Picture

This exercise shows that:
- Numbers aren't primitive—they can be constructed
- Type systems can encode mathematics
- Recursion is the foundation of computation
- C++ templates form a Turing-complete compile-time language

For the full mathematical treatment with proofs of associativity, commutativity, and well-ordering, check out the [Natural Numbers section](/math#natural-numbers-construction-and-arithmetic) in our math reference.

---

**Related Topics**: Type theory, template metaprogramming, proof assistants (Coq/Agile), dependent types

