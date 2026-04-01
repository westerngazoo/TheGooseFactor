---
sidebar_position: 3
sidebar_label: "Writing Style & Personas"
title: "How This Book Will Be Written (Style & Persona System)"
---

# How This Book Will Be Written (Style & Persona System)

To keep dense technical material engaging, multiple **goose personas** will appear as concise margin-style callouts after code blocks or concept explanations. Each persona has a distinct voice and intent:

| Persona | Image | Role / Tone |
|---------|-------|-------------|
| Angry Goose | <img src="/img/angrygoose.png" alt="Angry Goose" style={{width: '100px', height: 'auto'}} /> | Pitfalls, UB, perf traps |
| Nerdy Goose | <img src="/img/nerdygoose.png" alt="Nerdy Goose" style={{width: '100px', height: 'auto'}} /> | Complexity, memory layout, standard refs |
| Sarcastic Goose | <img src="/img/sarcasticgoose.png" alt="Sarcastic Goose" style={{width: '100px', height: 'auto'}} /> | Light snark vs anti-patterns |
| Happy Goose | <img src="/img/happygoose.png" alt="Happy Goose" style={{width: '100px', height: 'auto'}} /> | Reinforces clarity & clean patterns |
| Math Goose | <img src="/img/mathgoose.png" alt="Math Goose" style={{width: '100px', height: 'auto'}} /> | Formalism, invariants, proofs |
| Sharp Goose | <img src="/img/sharpgoose.png" alt="Sharp Goose" style={{width: '100px', height: 'auto'}} /> | API surface critique, naming |
| Surprised Goose | <img src="/img/surprisedgoose.png" alt="Surprised Goose" style={{width: '100px', height: 'auto'}} /> | Edge cases, unintuitive outcomes |
| Weightlifting Goose | <img src="/img/weightliftingoose.png" alt="Weightlifting Goose" style={{width: '100px', height: 'auto'}} /> | Training analogies ↔ optimization |

## Callout Markup Pattern
Each callout is a blockquote beginning with the tag:

```cpp
auto v = bubble_sort(vec);
```

> :angrygoose: Copy here is O(n). Consider in-place + return view if large.
>
> :nerdygoose: Stable? Current implementation preserves order; benchmark vs std::stable_sort.

## Code Snippet Conventions
- C++23 unless earlier standard comparison.
- `auto` only when it enhances, not obscures, meaning.
- `constexpr` + `[[nodiscard]]` on pure utilities.
- Complexity comments above functions: `// O(n log n) avg, O(n^2) worst (degenerate pivot)`.
- Ellipses only with explicit `// ... omitted ...` markers.

## Testing Snippets
```cpp
TEST(Sort, BasicAscending) {
	std::vector<int> v{5,4,3,2,1};
	bubble_sort(v);
	EXPECT_TRUE(std::is_sorted(v.begin(), v.end()));
}
```
> :nerdygoose: Property version randomizes size & contents; see property testing chapter.

## Benchmark Snippets (Preview)
```cpp
static void BM_Bubble_Random100(benchmark::State& st) {
	for (auto _ : st) {
		auto v = make_random(100);
		bubble_sort(v);
		benchmark::DoNotOptimize(v);
	}
}
BENCHMARK(BM_Bubble_Random100);
```

## Chapter Completion Checklist
1. Invariants stated
2. Edge cases enumerated
3. Complexity & memory behavior noted
4. ≥1 persona caution or design insight
5. Test snippet includes boundary or randomized strategy

Chapters failing the list remain `[~] drafting`.
