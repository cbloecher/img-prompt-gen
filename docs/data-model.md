# JSON data model

## Version 2 decision

The canonical trait data model is based on exactly three structural concepts:

```text
domain -> taxonomy[] -> trait
```

`category` and `subcategory` are removed from v2. The taxonomy is the single source of truth for hierarchical placement. Files are only storage/maintenance units and are not a semantic level of the taxonomy.

The migration to v2 does **not** preserve legacy trait IDs or legacy file boundaries. Existing traits should be retained semantically, but their IDs, taxonomy paths, selection groups and file placement may be rebuilt consistently.

Primary person attributes such as exact age and sex/gender remain direct UI/state attributes because they also control trait applicability. Semantically they belong under `person -> identity`, but they do not need duplicate selectable traits. Descriptive age-stage traits can still exist under `person -> identity -> age`.

## Domains

The current top-level domains are:

- `person`
- `scene`
- `image`

Examples:

```text
person -> body -> proportions -> shoulders -> broad
person -> expression -> smile -> subtle
scene -> objects -> tools -> hammer
scene -> interaction -> holding
image -> lighting -> natural -> window
```

## File format

A data file has a metadata header and a `traits` array. The metadata describes the common taxonomy root represented by that file.

```json
{
  "schema_version": 2,
  "meta": {
    "domain": "person",
    "taxonomy": ["skin"],
    "title_en": "Skin",
    "title_de": "Haut",
    "description_en": "Skin tone, pigmentation, texture, marks and aging.",
    "description_de": "Hautton, Pigmentierung, Struktur, Male und Hautalterung.",
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

### Required file metadata

Every trait data file must define:

- `meta.domain` — one of the supported top-level domains.
- `meta.taxonomy` — taxonomy path shared by the file, as an array of stable machine-readable path segments.
- `meta.title_en` — English UI title.
- `meta.title_de` — German UI title.

`meta.description_*` and `meta.guidance` are recommended explanatory metadata and are not part of the generated prompt.

A file such as `data/person/body.json` may represent the taxonomy root `person -> body`, but the path in the JSON is authoritative. Moving or renaming a file must not change semantic placement by itself.

## Trait syntax

```json
{
  "id": "person.skin.pigmentation.freckles",
  "prompt": "freckles",
  "label_en": "Freckles",
  "label_de": "Sommersprossen",
  "description_en": "Adds naturally distributed freckles to the skin.",
  "description_de": "Fügt der Haut natürlich verteilte Sommersprossen hinzu.",
  "domain": "person",
  "taxonomy": ["skin", "pigmentation"],
  "applies_to": ["all"],
  "age_range": { "min": null, "max": null },
  "selection": {
    "mode": "multiple",
    "group": null
  },
  "tags": ["skin", "pigmentation", "realism"],
  "requires": [],
  "conflicts": [],
  "implies": [],
  "notes": ""
}
```

## Structural semantics

### `domain`

`domain` defines the broadest semantic area. It is intentionally shallow and stable. Detailed hierarchy belongs in `taxonomy`.

### `taxonomy`

`taxonomy` is an ordered path from abstract to specific. It may have any useful depth.

Examples:

```json
"taxonomy": ["body", "proportions", "shoulders"]
```

```json
"taxonomy": ["wearables", "jewelry", "rings"]
```

```json
"taxonomy": ["objects", "food_drink", "drink"]
```

Do not add fields such as `category`, `subcategory` or `subsubcategory`. If another level is needed, extend the taxonomy array.

### `id`

IDs are globally unique, readable machine identifiers and should normally mirror semantic placement:

```text
person.body.proportions.shoulders.broad
person.face.nose.aquiline
person.expression.smile.subtle
person.wearables.jewelry.earrings
scene.objects.tools.hammer
scene.interaction.holding
```

IDs use lowercase dot-separated segments. Taxonomy migrations may change IDs in v2; no legacy-ID compatibility is required during the current rebuild.

The last ID segment should identify the concrete trait rather than duplicate the entire prompt wording.

## Fields

| Field | Meaning |
|---|---|
| `id` | Globally unique dot-separated machine identifier. |
| `prompt` | Canonical English fragment inserted into the generated prompt. |
| `label_en`, `label_de` | Short bilingual UI labels. |
| `description_en`, `description_de` | Explanation of visual meaning/effect, not prompt text. |
| `domain` | Top-level semantic domain: `person`, `scene`, or `image`. |
| `taxonomy` | Ordered hierarchy below the domain, from abstract to specific. |
| `applies_to` | Applicability filter. Current values: `all`, `female`, `male`. |
| `age_range.min/max` | Recommended age range in years. `null` means no bound. |
| `selection.mode` | `single` for mutually exclusive choices; `multiple` for freely combinable traits. |
| `selection.group` | Optional global selection-group identifier. |
| `tags` | Search/filter aliases and cross-taxonomy semantics. |
| `requires` | Trait IDs that must also be selected for this trait to make sense. |
| `conflicts` | Trait IDs that should not be selected together. |
| `implies` | Related trait IDs the generator may suggest or automatically add later. |
| `notes` | Maintainer notes; not prompt text. |

## Selection groups

Selection groups are global and should use the same hierarchical naming style as trait IDs.

Examples:

```text
person.body.build
person.body.proportions.shoulders.width
person.face.shape
person.face.nose.shape
person.skin.tone
person.hair.length
person.hair_color_effects.base_color
person.expression.base
person.head_gaze.gaze_direction
person.pose.base_position
```

A `single` group behaves like a radio-button group: selecting one trait replaces another trait from the same group.

`multiple` traits can normally coexist. Explicit exceptions belong in `conflicts`.

A selection group does not have to equal a taxonomy path exactly. It describes mutual exclusivity, while taxonomy describes semantic placement.

## Person taxonomy principles

The person domain is structured from abstract to specific:

```text
person
  identity
    sex_gender          # primary UI/state attribute
    age                 # exact age is UI/state; age-stage descriptors may be traits
    ancestry_ethnicity
  body
  face
  skin
  hair
  hair_color_effects
  expression
  head_gaze
  pose
  wearables
```

Key boundaries:

- `identity/ancestry_ethnicity` is independent of skin tone, facial anatomy and hair texture; there must be no automatic coupling between them.
- `face` contains stable anatomy; `expression` contains temporary facial configuration/appearance.
- `skin` describes surface appearance; `face` describes geometry/anatomy.
- `pose` is the parent concept for body posture, torso orientation, weight/balance, arms, hands and legs.
- `wearables` contains items worn on the person such as eyewear, jewelry, watches, head accessories, carried wearables and body jewelry.
- Handheld or used objects belong in `scene/objects`; the relation to the person belongs in `scene/interaction`.

See `docs/person-taxonomy-review.md` and issue #17 for the migration record.

## Scene object / interaction boundary

Objects and their use are modeled separately:

```text
scene
  objects
    handheld
    tools
    food_drink
    activity_objects
    weapons
  interaction
    holding
    carrying
    using
    eating
    drinking_from
    pointing_with
```

Selecting an object does not automatically define what the person does with it.

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

The range is UI guidance/filtering, not a biological rule.

The exact age is a primary person attribute. Descriptive age stages belong under `person -> identity -> age`. Concrete visible aging traits belong at their anatomical location, for example skin aging under `person -> skin -> aging`.

## Model independence

Do not put SDXL/FLUX weights such as `(visible pores:1.2)` into `prompt`. Keep canonical traits readable and model-independent. Model adapters may transform the structured selection later:

```text
models/
├── sdxl.json
└── flux.json
```

## Negative prompts and safety

Negative concepts remain in `data/negative.json`; safety configuration remains in `data/safety.json` unless they are later migrated to a dedicated non-taxonomy configuration directory. They are not ordinary positive taxonomy trait files.

## Suggested storage layout

The storage layout should mirror the domains for maintainability, while remaining secondary to the JSON taxonomy. Multiple files may intentionally represent the same taxonomy root, for example `pose.json` and `pose-naturalism.json` both represent `person -> pose`.

```text
data/
  person/
    identity.json
    body.json
    face.json
    skin.json
    hair.json
    hair-color-effects.json
    expression.json
    head-gaze.json
    pose.json
    pose-naturalism.json
    wearables.json
  scene/
    clothing.json
    location.json
    environment.json
    weather-time.json
    background.json
    objects.json
    interaction.json
    situation.json
  image/
    camera.json
    perspective.json
    framing.json
    composition.json
    lighting.json
    focus-depth-of-field.json
    shot-style.json
    mood.json
    style-medium.json
    realism.json
  negative.json
  safety.json
```

## JSON conventions

- UTF-8.
- Two-space indentation.
- Double quotes only; JSON does not support single-quoted strings.
- No trailing commas.
- Trait IDs and selection groups use lowercase dot-separated segments.
- Taxonomy segments use lowercase `snake_case` strings.
- Arrays are used even when currently containing only one value (`taxonomy`, `applies_to`, `tags`, etc.).
- Empty relationships are `[]`, not `null`.
- Unknown age bounds are `null`.
- `prompt` remains English; translations belong in labels/descriptions.
