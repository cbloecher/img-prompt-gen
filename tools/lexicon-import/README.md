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
- `rules/safety.json`: categories and deterministic classification principles/rules.
- `decisions/safety.json`: durable human-reviewed decisions.
- `input/`: downloaded source CSVs; ignored by Git.
- `build/safety/*`: generated working files; ignored by Git and never runtime data.
- `data/safety/nsfw.json`: curated/generated runtime safety lexicon.

## First run

Download the source files described in `sources/` into `tools/lexicon-import/input/` using their original filenames (`danbooru.csv`, `e621.csv`). Source definitions pin the upstream blob SHA; the importer also records SHA-256 of the actual local input.

Then run:

```bash
python3 tools/lexicon-import/import.py safety
python3 tools/lexicon-import/classify.py safety
```

The importer normalizes underscore spelling, merges identical canonical terms across sources, retains aliases, source category, source term and post count, and writes `build/safety/normalized.json`.

The classifier never guesses an unknown safety decision. Durable decisions become `classified.json` or `irrelevant.json`; everything else becomes `review.json`, ordered by the largest available post count. This deliberately makes missing knowledge visible rather than silently treating unknown tags as safe or unsafe.

The next stage is candidate discovery: deterministic rules will reduce the large unknown set to plausible safety candidates before human review. Only reviewed decisions may feed the runtime lexicon.

## Provenance

Keep source repository, pinned revision/blob, original tag, aliases and frequency when available. Frequency is a review-priority signal only; it is never evidence that a term is safer or less safe.

## Safety boundaries

Minor/age detection remains separate. Neutral adult underwear, swimwear and ordinary affection are not explicit merely because they occur in booru vocabularies. Artist, copyright, character and unrelated meta tags are outside the target lexicon.
