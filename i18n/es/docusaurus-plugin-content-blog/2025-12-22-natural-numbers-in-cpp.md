---
title: Construyendo los Números Naturales Desde Cero en C++
description: Una implementación type-safe de la aritmética de Peano que muestra cómo construir los números naturales usando C++ moderno
---

# Construyendo los Números Naturales Desde Cero en C++

¿Alguna vez te has preguntado qué *son* realmente los números naturales? No sólo "1, 2, 3..." sino su construcción fundamental. Vamos a construirlos desde primeros principios usando C++ y los axiomas de Peano.

> Para la base matemática, mira la sección de [Números Naturales](/math/discrete-math/natural-numbers) de nuestra referencia de matemáticas.

## ¿Por Qué Molestarse?

Entender cómo construir los números naturales nos enseña:
- **Programación a nivel de tipos**: Usar el sistema de tipos para codificar propiedades matemáticas
- **Pensamiento recursivo**: Todo se construye desde una regla simple
- **Prueba por construcción**: Si compila, es correcto (hasta cierto punto)

## Los Axiomas de Peano en C++

Los números naturales se definen por:
1. **El cero existe**: Hay un punto de partida
2. **Función sucesor**: Dado cualquier natural $n$, podemos construir $S(n)$ (su sucesor)
3. **El cero no es un sucesor**: $0 \neq S(n)$ para todo $n$
4. **El sucesor es inyectivo**: $S(n) = S(m) \implies n = m$
5. **Inducción**: Si $P(0)$ se cumple y $P(n) \implies P(S(n))$, entonces $P$ se cumple para todos los naturales

## La Implementación Type-Safe

```cpp
#include <iostream>
#include <type_traits>
#include <concepts>

// Caso base: Cero
struct Zero {
    static constexpr size_t value = 0;
    
    constexpr Zero() = default;
    
    // El cero no es el sucesor de nada
    static constexpr bool is_zero = true;
};

// Caso recursivo: Sucesor de N
template<typename N>
struct Succ {
    using predecessor = N;
    static constexpr size_t value = N::value + 1;
    
    constexpr Succ() = default;
    
    static constexpr bool is_zero = false;
};

// Concept: ¿Es este un tipo de número natural?
template<typename T>
concept NaturalNumber = requires {
    { T::value } -> std::convertible_to<size_t>;
    { T::is_zero } -> std::convertible_to<bool>;
} && (std::is_same_v<T, Zero> || requires {
    typename T::predecessor;
    requires NaturalNumber<typename T::predecessor>;
});

// Alias de tipo para legibilidad
using One   = Succ<Zero>;
using Two   = Succ<One>;
using Three = Succ<Two>;
using Four  = Succ<Three>;
using Five  = Succ<Four>;

// Muestra un número natural
template<NaturalNumber N>
void display() {
    std::cout << "Value: " << N::value << "\n";
}
```

### Probando la Construcción Básica

```cpp
int main() {
    display<Zero>();   // Value: 0
    display<One>();    // Value: 1
    display<Three>();  // Value: 3
    display<Five>();   // Value: 5
    
    return 0;
}
```

## Suma: Definición Recursiva

La suma sigue la definición recursiva de la aritmética de Peano:
- $n + 0 = n$ (caso base)
- $n + S(m) = S(n + m)$ (caso recursivo)

```cpp
// Suma: Add<N, M> computa N + M
template<NaturalNumber N, NaturalNumber M>
struct Add;

// Caso base: N + 0 = N
template<NaturalNumber N>
struct Add<N, Zero> {
    using result = N;
};

// Caso recursivo: N + Succ(M) = Succ(N + M)
template<NaturalNumber N, NaturalNumber M>
struct Add<N, Succ<M>> {
    using result = Succ<typename Add<N, M>::result>;
};

// Alias auxiliar
template<NaturalNumber N, NaturalNumber M>
using add_t = typename Add<N, M>::result;
```

### Ejemplos de Suma

```cpp
// 2 + 3 = 5
using TwoPlusThree = add_t<Two, Three>;
static_assert(TwoPlusThree::value == 5);
static_assert(std::is_same_v<TwoPlusThree, Five>);

// 0 + 4 = 4
using ZeroPlusFour = add_t<Zero, Four>;
static_assert(ZeroPlusFour::value == 4);
static_assert(std::is_same_v<ZeroPlusFour, Four>);

// La suma es conmutativa (¡a nivel de valor, no a nivel de tipo!)
using FivePlusTwo = add_t<Five, Two>;
using TwoPlusFive = add_t<Two, Five>;
static_assert(FivePlusTwo::value == TwoPlusFive::value);
```

## Multiplicación: Suma Repetida

La multiplicación se define recursivamente:
- $n \times 0 = 0$
- $n \times S(m) = n + (n \times m)$

```cpp
// Multiplicación: Mult<N, M> computa N * M
template<NaturalNumber N, NaturalNumber M>
struct Mult;

// Caso base: N * 0 = 0
template<NaturalNumber N>
struct Mult<N, Zero> {
    using result = Zero;
};

// Caso recursivo: N * Succ(M) = N + (N * M)
template<NaturalNumber N, NaturalNumber M>
struct Mult<N, Succ<M>> {
    using result = add_t<N, typename Mult<N, M>::result>;
};

// Alias auxiliar
template<NaturalNumber N, NaturalNumber M>
using mult_t = typename Mult<N, M>::result;
```

### Ejemplos de Multiplicación

```cpp
// 3 * 2 = 6
using ThreeTimesTwo = mult_t<Three, Two>;
static_assert(ThreeTimesTwo::value == 6);

// 0 * 5 = 0
using ZeroTimesFive = mult_t<Zero, Five>;
static_assert(ZeroTimesFive::value == 0);
static_assert(std::is_same_v<ZeroTimesFive, Zero>);

// Identidad: N * 1 = N
using FourTimesOne = mult_t<Four, One>;
static_assert(FourTimesOne::value == 4);
static_assert(std::is_same_v<FourTimesOne, Four>);
```

## Conversión en Runtime

Para uso práctico, necesitamos convertir entre tipos de tiempo de compilación y valores de runtime:

```cpp
// Convierte un valor de runtime a un tipo de número natural (plantilla)
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

// Ejemplo: Crea un tipo que representa el 7
using Seven = to_nat_t<7>;
static_assert(Seven::value == 7);

// Computación en runtime usando nuestros números naturales
template<NaturalNumber N, NaturalNumber M>
constexpr size_t runtime_add() {
    return add_t<N, M>::value;
}

template<NaturalNumber N, NaturalNumber M>
constexpr size_t runtime_mult() {
    return mult_t<N, M>::value;
}

int main() {
    // Computación en tiempo de compilación, despliegue en runtime
    constexpr auto result = runtime_mult<to_nat_t<6>, to_nat_t<7>>();
    std::cout << "6 * 7 = " << result << "\n";  // 6 * 7 = 42
    
    return 0;
}
```

## Operaciones de Comparación

Añadamos la comparación "menor que" usando recursión estructural:

```cpp
// LessThan<N, M>: ¿Es N < M?
template<NaturalNumber N, NaturalNumber M>
struct LessThan;

// 0 < Succ(M) es true
template<NaturalNumber M>
struct LessThan<Zero, Succ<M>> {
    static constexpr bool value = true;
};

// 0 < 0 es false
template<>
struct LessThan<Zero, Zero> {
    static constexpr bool value = false;
};

// Succ(N) < 0 es false
template<NaturalNumber N>
struct LessThan<Succ<N>, Zero> {
    static constexpr bool value = false;
};

// Succ(N) < Succ(M) sii N < M
template<NaturalNumber N, NaturalNumber M>
struct LessThan<Succ<N>, Succ<M>> {
    static constexpr bool value = LessThan<N, M>::value;
};

template<NaturalNumber N, NaturalNumber M>
constexpr bool less_than_v = LessThan<N, M>::value;

// Ejemplos
static_assert(less_than_v<Two, Five>);
static_assert(!less_than_v<Five, Two>);
static_assert(!less_than_v<Three, Three>);
```

## Ejemplo Completo Funcionando

Aquí tienes un programa completo que muestra la implementación:

```cpp
#include <iostream>

// [Incluye todo el código de arriba: Zero, Succ, Add, Mult, LessThan, etc.]

template<NaturalNumber N>
void print_nat(const char* label) {
    std::cout << label << N::value << "\n";
}

int main() {
    std::cout << "=== Peano Natural Numbers in C++ ===\n\n";
    
    // Números básicos
    print_nat<Zero>("Zero = ");
    print_nat<Five>("Five = ");
    
    // Suma
    std::cout << "\nAddition:\n";
    print_nat<add_t<Two, Three>>("2 + 3 = ");
    print_nat<add_t<Four, Five>>("4 + 5 = ");
    
    // Multiplicación
    std::cout << "\nMultiplication:\n";
    print_nat<mult_t<Three, Four>>("3 * 4 = ");
    print_nat<mult_t<Five, Five>>("5 * 5 = ");
    
    // Comparación
    std::cout << "\nComparison:\n";
    std::cout << "2 < 5? " << (less_than_v<Two, Five> ? "true" : "false") << "\n";
    std::cout << "5 < 2? " << (less_than_v<Five, Two> ? "true" : "false") << "\n";
    
    // Expresión compleja: (2 + 3) * 4 = 20
    using ComplexResult = mult_t<add_t<Two, Three>, Four>;
    print_nat<ComplexResult>("(2 + 3) * 4 = ");
    
    return 0;
}
```

**Salida:**
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

## Compilación

```bash
# Usando g++ con C++20
g++ -std=c++20 -Wall -Wextra natural_numbers.cpp -o natural_numbers

# Usando clang++ con C++20
clang++ -std=c++20 -Wall -Wextra natural_numbers.cpp -o natural_numbers

# Ejecutar
./natural_numbers
```

## Qué Hemos Aprendido

1. **Tipos como valores**: Codificamos los números en el sistema de tipos, haciendo que las computaciones ocurran en tiempo de compilación
2. **Recursión estructural**: Cada operación sigue la estructura recursiva de los números naturales
3. **Prueba por compilación**: Las restricciones de tipo fuerzan propiedades matemáticas (ej., el concept `NaturalNumber`)
4. **Abstracción de coste cero**: Toda la computación pasa en tiempo de compilación; el código en runtime es sólo los resultados

## Limitaciones y Extensiones

**Profundidad de plantilla**: La recursión profunda golpea los límites del compilador (~900 en la mayoría). Usa `-ftemplate-depth=N` para subirlo.

**Sin resta**: Necesitaríamos enteros (con negativos) o resta acotada que devuelva `std::optional<Nat>`.

**Rendimiento**: ¡Para aritmética real, usa enteros nativos! Esto es para entender, no para producción.

**Posibles extensiones**:
- Implementar exponenciación: $n^0 = 1$, $n^{S(m)} = n \times n^m$
- Añadir aritmética modular
- Definir un predicado de número primo a nivel de tipo
- Implementar división con resto

## La Imagen General

Este ejercicio muestra que:
- Los números no son primitivos — pueden construirse
- Los sistemas de tipos pueden codificar matemáticas
- La recursión es la base de la computación
- Las plantillas de C++ forman un lenguaje Turing-completo en tiempo de compilación

Para el tratamiento matemático completo con pruebas de asociatividad, conmutatividad y buen-orden, mira la sección de [Números Naturales](/math/discrete-math/natural-numbers) en nuestra referencia matemática.

---

**Temas Relacionados**: Teoría de tipos, metaprogramación con plantillas, asistentes de pruebas (Coq/Agda), tipos dependientes
