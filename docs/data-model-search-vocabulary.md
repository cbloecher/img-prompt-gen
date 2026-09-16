# v2 search vocabulary and prompt-term extension

This document is a normative extension of [`data-model.md`](data-model.md).

## Separation of concerns

A trait may carry three different kinds of vocabulary. They must not be conflated:

```text
aliases       -> find / map the semantic trait
prompt        -> canonical model-neutral prompt fragment
prompt_terms  -> optional alternative or reinforcing prompt formulations for adapters
```

## `aliases`

`aliases` is an optional array of strings on the runtime trait object.

```json
{
  "id": "person.body.build.slender",
  "prompt": "slender build",
  "aliases": ["slim", "lean build", "schlank"]
}
```

Aliases are **search-only semantic vocabulary**. Selecting a trait through an alias still selects the canonical trait and emits only its canonical `prompt`. Aliases must never be concatenated into the prompt as automatic reinforcement.

Aliases may contain English and German synonyms, common alternative spellings and established source vocabulary. They should not contain concepts that materially broaden or change the trait meaning.

The repository currently maintains the larger cross-cutting alias vocabulary in [`../data/search-aliases.json`](../data/search-aliases.json). The loader merges those entries into each canonical trait's runtime `aliases` array. This overlay avoids duplicating source-vocabulary maintenance across many taxonomy files while keeping the canonical trait ID as the target. Direct trait-local `aliases` remain valid and are merged with the overlay.

Each alias-overlay entry identifies exactly one canonical trait. The same natural-language alias may intentionally map to more than one trait when the source term is genuinely ambiguous; search should then expose all matching traits rather than silently choosing one.

## `prompt_terms`

`prompt_terms` is an optional array of model-neutral alternative or reinforcing formulations:

```json
{
  "id": "person.body.build.slender",
  "prompt": "slender build",
  "prompt_terms": ["slender physique", "slim physique"]
}
```

`prompt_terms` are **not search aliases** and the generic generator does not currently emit them. They are reserved for later model adapters such as FLUX or SDXL, which may choose a better formulation or controlled reinforcement strategy.

A model adapter must not blindly append every `prompt_term`. Repeating near-synonyms such as `slender, slim, lean, slim physique` is not considered useful reinforcement by default.

## `tags`

`tags` remain semantic classification/search metadata such as `body`, `portrait`, `realism`, `workwear` or `lighting`. They are not the preferred storage location for lexical synonyms anymore.

For compatibility with the current browser search, `js/data.js` temporarily mirrors loaded aliases into runtime `tags`. This is a runtime compatibility mechanism only; aliases should be maintained as aliases rather than manually duplicated into source `tags`.

## Alias sources

The first curated overlay contains:

- aliases explicitly identified during the pinned ImageLexicon review;
- conservative English synonyms added independently;
- useful German search terms and common wording variants.

Source provenance is recorded per overlay entry in `sources`, currently using values such as `imagelexicon` and `curated`.

Excluded ImageLexicon families remain excluded. Alias import must not bypass the adult-only, natural-realistic or safety/scope decisions made in the review.
