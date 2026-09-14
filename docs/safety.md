# Free-text safety

## Goal

`img-prompt-gen` is intended to build realistic, non-explicit images of adults. The structured trait files are curated and are therefore the preferred input. Free-text additions need a separate safety layer because users can otherwise introduce explicit sexual content that is not represented by the curated traits.

The v1 implementation is deliberately local and deterministic. It does not require an LLM or moderation service.

## Scope

The policy applies to every user-controlled text field, including:

- positive prompt additions
- negative prompt additions
- future custom trait fields
- imported or pasted prompt fragments

Do not check only the positive prompt. A field that is later concatenated into a model request must be checked before prompt generation.

## Adult-only rule

The generator has a global `adult_only` policy and a minimum age of 18. A prompt that explicitly specifies a person below 18, or uses clearly youth/minor terminology, must be blocked. Body traits that can become sexualized must never be combined with a minor context.

The UI should preferably make age/adult status a structured global person setting instead of relying on free text.

## Decision model

The conceptual decisions are:

- **ALLOW** — ordinary anatomy, appearance, expression, pose, clothing and photographic description.
- **WARN/STRIP** — reserved for future low-confidence or unnecessary terms. The first implementation does not need automatic rewriting.
- **BLOCK** — explicit genital anatomy, explicit intimate exposure, sexual acts/positions, pornographic framing, sexualized expressions and minor context.

For v1, blocking the complete free-text addition is safer and easier to understand than silently deleting individual words. The UI should identify the rule category that matched, but it should not echo unnecessary explicit text back to the user.

## Why a plain blacklist is insufficient

Individual words can be ambiguous. For example, ordinary body-shape descriptions are useful for a portrait generator, while explicit anatomy or sexual context is outside the generator's purpose. Some unsafe concepts are multi-word phrases, and users may introduce punctuation, capitalization or simple obfuscation.

Therefore the filter should:

1. Unicode-normalize input (NFKC).
2. Lowercase it.
3. Normalize whitespace and common separators.
4. Check word boundaries rather than arbitrary substrings.
5. Detect common separator/character obfuscation where practical.
6. Match both single terms and phrases from `data/safety.json`.
7. Apply the same checks to all user-controlled prompt fields.

Avoid aggressive substring matching: a short blocked token must not accidentally match an unrelated longer word.

## Curated anatomy vs. free text

Normal adult body morphology remains allowed in curated data, including breast size/shape, hips, waist, thighs, body-fat distribution, body hair and age-related changes. This information is useful for generating realistic people.

Detailed genital anatomy and explicit intimate exposure are not needed for the project's stated goal and are blocked in free text. The same distinction applies to body hair: generic `natural body hair` can be useful; an explicit phrase that combines intimate anatomy and hair is blocked.

## Pose handling

`data/pose.json` contains ordinary body poses such as standing, sitting, cross-legged sitting, kneeling and leaning. These must not be blocked merely because a similar body configuration could occur in a sexual context.

`data/safety.json` separately contains terminology whose normal prompt meaning is a sexual position or explicitly describes sexual contact. Those phrases are blocked. Context-sensitive combinations can be added later if false positives/negatives appear in testing.

## Facial expressions

Ordinary expressions remain allowed: relaxed, playful, confident, tired, eyes half-closed, smiles, etc. Expressions explicitly framed around orgasm or sexual activity are blocked. This keeps `expression.json` useful without turning facial-expression filtering into a generic emotion blacklist.

## Implementation sketch

```text
raw free text
    |
    v
normalize
    |
    v
age/minor rules --------------------> BLOCK
    |
    v
explicit anatomy/exposure rules ----> BLOCK
    |
    v
sexual activity/position rules -----> BLOCK
    |
    v
pornographic/sexualized context ----> BLOCK
    |
    v
ALLOW
    |
    v
combine with curated traits
```

The generator should validate the final assembled prompt as a second pass. This catches unsafe combinations that could arise from multiple independent custom fields.

## Data format

`data/safety.json` contains:

- `meta.policy`: global behavior and minimum age
- `normalization`: preprocessing requirements
- `rules[]`: rule groups with `id`, `action`, `category`, bilingual descriptions and patterns
- `allowed_examples`: regression examples documenting terms that should remain usable

Safety patterns are application policy data, not model-specific prompt data. They should therefore remain separate from SDXL/FLUX adapters.

## Testing

Before exposing free text, add automated tests with three sets:

1. expected ALLOW examples from normal portrait prompts;
2. expected BLOCK examples for every rule group;
3. boundary cases that contain similar substrings but are harmless.

Tests should include capitalization, punctuation, extra whitespace and common separator-based obfuscation. Every bug found in filtering should become a regression test before expanding the pattern list.

## Limitations

A deterministic phrase filter is appropriate for a small local v1, but it cannot reliably understand arbitrary language or every euphemism. If the generator later becomes public-facing, multilingual, or accepts long natural-language instructions, add a proper moderation layer in addition to these deterministic rules rather than endlessly growing a blacklist.
