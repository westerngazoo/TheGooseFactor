---
title: 在 C++ 中从零构建自然数
description: Peano 算术的类型安全实现,展示如何使用现代 C++ 构造自然数
---

# 在 C++ 中从零构建自然数

你有没有想过自然数*真正*是什么?不仅仅是"1、2、3..."而是它们的根本构造?让我们使用 C++ 和 Peano 公理,从第一性原理构建它们。

> 对于数学基础,参见我们数学参考的[自然数小节](/math/discrete-math/natural-numbers)。

## 为什么要这么做?

理解如何构造自然数教会我们:
- **类型级编程**:用类型系统编码数学性质
- **递归思维**:一切都从一条简单规则构建
- **构造性证明**:如果它能编译,它就是对的(某种程度上)

## C++ 中的 Peano 公理

自然数由以下定义:
1. **零存在**:有一个起点
2. **后继函数**:给定任何自然数 $n$,我们可以构造 $S(n)$(它的后继)
3. **零不是后继**:对于任何 $n$,$0 \neq S(n)$
4. **后继是单射**:$S(n) = S(m) \implies n = m$
5. **归纳法**:如果 $P(0)$ 成立,且 $P(n) \implies P(S(n))$,那么 $P$ 对所有自然数成立

## 类型安全的实现

```cpp
#include <iostream>
#include <type_traits>
#include <concepts>

// 基本情况:零
struct Zero {
    static constexpr size_t value = 0;
    
    constexpr Zero() = default;
    
    // 零不是任何东西的后继
    static constexpr bool is_zero = true;
};

// 递归情况:N 的后继
template<typename N>
struct Succ {
    using predecessor = N;
    static constexpr size_t value = N::value + 1;
    
    constexpr Succ() = default;
    
    static constexpr bool is_zero = false;
};

// 概念:这是自然数类型吗?
template<typename T>
concept NaturalNumber = requires {
    { T::value } -> std::convertible_to<size_t>;
    { T::is_zero } -> std::convertible_to<bool>;
} && (std::is_same_v<T, Zero> || requires {
    typename T::predecessor;
    requires NaturalNumber<typename T::predecessor>;
});

// 为可读性的类型别名
using One   = Succ<Zero>;
using Two   = Succ<One>;
using Three = Succ<Two>;
using Four  = Succ<Three>;
using Five  = Succ<Four>;

// 显示一个自然数
template<NaturalNumber N>
void display() {
    std::cout << "Value: " << N::value << "\n";
}
```

### 测试基本构造

```cpp
int main() {
    display<Zero>();   // Value: 0
    display<One>();    // Value: 1
    display<Three>();  // Value: 3
    display<Five>();   // Value: 5
    
    return 0;
}
```

## 加法:递归定义

加法遵循 Peano 算术的递归定义:
- $n + 0 = n$(基本情况)
- $n + S(m) = S(n + m)$(递归情况)

```cpp
// 加法:Add<N, M> 计算 N + M
template<NaturalNumber N, NaturalNumber M>
struct Add;

// 基本情况:N + 0 = N
template<NaturalNumber N>
struct Add<N, Zero> {
    using result = N;
};

// 递归情况:N + Succ(M) = Succ(N + M)
template<NaturalNumber N, NaturalNumber M>
struct Add<N, Succ<M>> {
    using result = Succ<typename Add<N, M>::result>;
};

// 辅助别名
template<NaturalNumber N, NaturalNumber M>
using add_t = typename Add<N, M>::result;
```

### 加法示例

```cpp
// 2 + 3 = 5
using TwoPlusThree = add_t<Two, Three>;
static_assert(TwoPlusThree::value == 5);
static_assert(std::is_same_v<TwoPlusThree, Five>);

// 0 + 4 = 4
using ZeroPlusFour = add_t<Zero, Four>;
static_assert(ZeroPlusFour::value == 4);
static_assert(std::is_same_v<ZeroPlusFour, Four>);

// 加法满足交换律(在值层面,不是类型层面!)
using FivePlusTwo = add_t<Five, Two>;
using TwoPlusFive = add_t<Two, Five>;
static_assert(FivePlusTwo::value == TwoPlusFive::value);
```

## 乘法:重复加法

乘法递归地定义为:
- $n \times 0 = 0$
- $n \times S(m) = n + (n \times m)$

```cpp
// 乘法:Mult<N, M> 计算 N * M
template<NaturalNumber N, NaturalNumber M>
struct Mult;

// 基本情况:N * 0 = 0
template<NaturalNumber N>
struct Mult<N, Zero> {
    using result = Zero;
};

// 递归情况:N * Succ(M) = N + (N * M)
template<NaturalNumber N, NaturalNumber M>
struct Mult<N, Succ<M>> {
    using result = add_t<N, typename Mult<N, M>::result>;
};

// 辅助别名
template<NaturalNumber N, NaturalNumber M>
using mult_t = typename Mult<N, M>::result;
```

### 乘法示例

```cpp
// 3 * 2 = 6
using ThreeTimesTwo = mult_t<Three, Two>;
static_assert(ThreeTimesTwo::value == 6);

// 0 * 5 = 0
using ZeroTimesFive = mult_t<Zero, Five>;
static_assert(ZeroTimesFive::value == 0);
static_assert(std::is_same_v<ZeroTimesFive, Zero>);

// 单位:N * 1 = N
using FourTimesOne = mult_t<Four, One>;
static_assert(FourTimesOne::value == 4);
static_assert(std::is_same_v<FourTimesOne, Four>);
```

## 运行时转换

为了实际使用,我们需要在编译期类型和运行时值之间转换:

```cpp
// 把运行时值转换为自然数类型(模板)
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

// 例:创建表示 7 的类型
using Seven = to_nat_t<7>;
static_assert(Seven::value == 7);

// 使用我们的自然数做运行时计算
template<NaturalNumber N, NaturalNumber M>
constexpr size_t runtime_add() {
    return add_t<N, M>::value;
}

template<NaturalNumber N, NaturalNumber M>
constexpr size_t runtime_mult() {
    return mult_t<N, M>::value;
}

int main() {
    // 编译期计算,运行时显示
    constexpr auto result = runtime_mult<to_nat_t<6>, to_nat_t<7>>();
    std::cout << "6 * 7 = " << result << "\n";  // 6 * 7 = 42
    
    return 0;
}
```

## 比较操作

让我们用结构递归添加小于比较:

```cpp
// LessThan<N, M>:N < M 吗?
template<NaturalNumber N, NaturalNumber M>
struct LessThan;

// 0 < Succ(M) 为 true
template<NaturalNumber M>
struct LessThan<Zero, Succ<M>> {
    static constexpr bool value = true;
};

// 0 < 0 为 false
template<>
struct LessThan<Zero, Zero> {
    static constexpr bool value = false;
};

// Succ(N) < 0 为 false
template<NaturalNumber N>
struct LessThan<Succ<N>, Zero> {
    static constexpr bool value = false;
};

// Succ(N) < Succ(M) 当且仅当 N < M
template<NaturalNumber N, NaturalNumber M>
struct LessThan<Succ<N>, Succ<M>> {
    static constexpr bool value = LessThan<N, M>::value;
};

template<NaturalNumber N, NaturalNumber M>
constexpr bool less_than_v = LessThan<N, M>::value;

// 例
static_assert(less_than_v<Two, Five>);
static_assert(!less_than_v<Five, Two>);
static_assert(!less_than_v<Three, Three>);
```

## 完整可运行示例

这是一个展示完整实现的程序:

```cpp
#include <iostream>

// [包含上面所有代码:Zero、Succ、Add、Mult、LessThan 等]

template<NaturalNumber N>
void print_nat(const char* label) {
    std::cout << label << N::value << "\n";
}

int main() {
    std::cout << "=== Peano Natural Numbers in C++ ===\n\n";
    
    // 基本数字
    print_nat<Zero>("Zero = ");
    print_nat<Five>("Five = ");
    
    // 加法
    std::cout << "\nAddition:\n";
    print_nat<add_t<Two, Three>>("2 + 3 = ");
    print_nat<add_t<Four, Five>>("4 + 5 = ");
    
    // 乘法
    std::cout << "\nMultiplication:\n";
    print_nat<mult_t<Three, Four>>("3 * 4 = ");
    print_nat<mult_t<Five, Five>>("5 * 5 = ");
    
    // 比较
    std::cout << "\nComparison:\n";
    std::cout << "2 < 5? " << (less_than_v<Two, Five> ? "true" : "false") << "\n";
    std::cout << "5 < 2? " << (less_than_v<Five, Two> ? "true" : "false") << "\n";
    
    // 复杂表达式:(2 + 3) * 4 = 20
    using ComplexResult = mult_t<add_t<Two, Three>, Four>;
    print_nat<ComplexResult>("(2 + 3) * 4 = ");
    
    return 0;
}
```

**输出:**
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

## 编译

```bash
# 使用 g++ 配合 C++20
g++ -std=c++20 -Wall -Wextra natural_numbers.cpp -o natural_numbers

# 使用 clang++ 配合 C++20
clang++ -std=c++20 -Wall -Wextra natural_numbers.cpp -o natural_numbers

# 运行
./natural_numbers
```

## 我们学到了什么

1. **类型即值**:我们在类型系统里编码数字,让计算在编译期发生
2. **结构递归**:每个操作都跟随自然数的递归结构
3. **靠编译来证明**:类型约束强制数学性质(例如 `NaturalNumber` 概念)
4. **零成本抽象**:所有计算都在编译期发生;运行时代码只是结果

## 限制与扩展

**模板深度**:深度递归会撞到编译器限制(大多数 ~900)。用 `-ftemplate-depth=N` 提高。

**没有减法**:我们需要整数(包含负数)或返回 `std::optional<Nat>` 的有界减法。

**性能**:实际算术请用内置整数!这是为了理解,不是生产。

**可能的扩展**:
- 实现指数:$n^0 = 1$,$n^{S(m)} = n \times n^m$
- 添加模运算
- 在类型层面定义素数谓词
- 实现带余除法

## 大局观

这个练习展示了:
- 数字不是原始的——它们可以被构造
- 类型系统可以编码数学
- 递归是计算的基础
- C++ 模板形成图灵完备的编译期语言

要看包含结合律、交换律和良序证明的完整数学处理,请看我们数学参考中的[自然数小节](/math/discrete-math/natural-numbers)。

---

**相关主题**:类型论、模板元编程、证明助手(Coq/Agda)、依赖类型
