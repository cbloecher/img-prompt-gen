# JSON data model

## File format

Every category file has a metadata header and a `traits` array.

```json
{
  "schema_version": 1,
  "meta": {
    "category": "skin",
    "title_en": "Skin",
    "title_de": "Haut",
    "description_en": "Skin texture, pigmentation, aging and natural imperfections.",
    "description_de": "Hautstruktur, Pigmentierung, Alterung und natürliche Unregelmäßigkeiten.",
    "guidance": {
      "effect_en": "Adds natural variation and reduces overly smooth synthetic-looking skin.",
      "effect_de": "Erhöht die natürliche Variation und reduziert zu glatt wirkende synthetische Haut.",
      "combination_en": "Combine several subtle traits rather than many strong traits.",
      "combination_de": "Mehrere dezente Merkmale sind meist sinnvoller als viele stark ausgeprägte Merkmale."
    }
  },
  "traits": []
}
```

`meta.guidance` describes the general effect of a category and gives advice about useful combinations. It is explanatory UI content, not part of the generated prompt.

## Trait syntax

```json
{
  "id": "skin_freckles",
  "prompt": "freckles",
  "label_en": "Freckles",
  "label_de": "Sommersprossen",
  "description_en": "Adds naturally distributed freckles to the skin.",
  "description_de": "Fügt der Haut natürlich verteilte Sommersprossen hinzu.",
  "category": "skin",
  "subcategory": "pigmentation",
  "applies_to": ["all"],
  "age_range": { "min": null, "max": null },
  "selection": { "mode": "multiple", "group": null },
  "tags": ["skin", "pigmentation", "realism"],
  "requires": [],
  "conflicts": [],
  "implies": [],
  "notes": ""
}
```

## Fields

| Field | Meaning |
|---|---|
| `id` | Stable, globally unique machine identifier. Do not use translated text as an ID. |
| `prompt` | English fragment inserted into the generated prompt. |
| `label_en`, `label_de` | Short UI labels. |
| `description_en`, `description_de` | Explanation of the visual effect, not prompt text. |
| `category` | Top-level category and normally the corresponding file name. |
| `subcategory` | More precise grouping, e.g. `texture`, `color`, `eyes`, `proportions`. |
| `applies_to` | Applicability filter. v1 values: `all`, `female`, `male`. |
| `age_range.min/max` | Recommended age range in years. `null` means no bound. This is guidance/filtering, not a biological rule. |
| `selection.mode` | `single` for mutually exclusive choices in one group; `multiple` for freely combinable traits. |
| `selection.group` | Name of a selection group such as `hair_color` or `shoulder_width`; otherwise `null`. |
| `tags` | Search/filter terms and cross-category semantics. |
| `requires` | IDs that must also be selected for this trait to make sense. |
| `conflicts` | IDs that should not be selected together. |
| `implies` | Related IDs the generator may suggest or automatically add later. |
| `notes` | Maintainer notes; not shown as prompt text by default. |

## Selection semantics

A `single` group acts like a radio-button group. For example, `narrow shoulders` and `broad shoulders` both belong to `shoulder_width`; selecting one replaces the other.

`multiple` traits can normally coexist, e.g. visible pores + freckles + subtle redness. Explicit exceptions can be listed in `conflicts`.

## `applies_to`

Sex/gender-specific files are deliberately avoided. A general trait uses:

```json
"applies_to": ["all"]
```

A specifically female trait can use:

```json
"applies_to": ["female"]
```

This avoids duplicating universal traits such as hair color, shoulder width or skin texture.

## Age

Age is kept separate from `applies_to`. Example:

```json
"age_range": { "min": 40, "max": null }
```

The range should be interpreted as a recommendation for the generator UI, not as a hard statement that the feature cannot occur outside that range.

## Model independence

Do not put SDXL/FLUX weights such as `(visible pores:1.2)` into `prompt`. Keep canonical traits readable and model-independent. If needed later, model adapters can transform them:

```text
models/
├── sdxl.json
└── flux.json
```

For example, an SDXL adapter could add weighting while a FLUX adapter could turn selected fragments into natural-language sentences.

## Negative prompts

Negative concepts use the same general metadata approach but live in `data/negative.json`. This lets the UI produce separate positive and negative outputs without mixing their semantics.

## JSON conventions

- UTF-8.
- Two-space indentation.
- Double quotes only; JSON does not support single-quoted strings.
- No trailing commas.
- IDs use lowercase `snake_case`.
- Arrays are used even when currently containing only one value (`applies_to`, `tags`, etc.).
- Empty relationships are `[]`, not `null`.
- Unknown age bounds are `null`.
- `prompt` remains English; translations belong in labels/descriptions.
