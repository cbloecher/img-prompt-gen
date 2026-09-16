# Lexicon import pipeline

Offline pipeline for turning external tag vocabularies into reviewable, curated project lexicons.

The first target is `data/safety/nsfw.json`; the design is intentionally reusable for later trait/alias coverage imports.

## Principle

External lists are coverage sources, never the project taxonomy and never runtime dependencies.

`source -> normalize -> classify -> decisions -> review -> generated lexicon`

Classification describes vocabulary; it does not decide application policy:

- `irrelevant` — not useful for this lexicon.
- `contextual_safe` — safety-related vocabulary that is non-explicit by itself.
- `contextual_review` — ambiguous/context-dependent vocabulary requiring context or review.
- `explicit_unsafe` — vocabulary whose meaning is explicitly sexual.

There is deliberately no `allow`, `reject` or `block` classification. Runtime reactions belong to a later safety-policy layer.

## Layout

- `sources/*.json`: pinned external source definitions.
- `rules/safety.json`: categories and deterministic discovery/classification rules.
- `decisions/safety.json`: durable human-reviewed decisions.
- `build/safety/*`: generated working files; do not use as runtime data.
- `data/safety/nsfw.json`: generated/curated runtime safety lexicon.

## Provenance

Keep source repository, pinned revision, original tag, aliases and frequency when available. Frequency is a review-priority signal only; it is never evidence that a term is safer or less safe.

## Safety boundaries

Minor/age detection remains separate. Neutral adult underwear, swimwear and ordinary affection are not explicit merely because they occur in booru vocabularies. Artist, copyright, character and unrelated meta tags are outside the target lexicon.
