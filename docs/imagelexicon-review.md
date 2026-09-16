# ImageLexicon coverage review

## Scope and source

This review compares the `img-prompt-gen` v2 taxonomy against **ImageLexicon** as a coverage source, not as a target taxonomy.

Pinned source:

- Repository: `adenaufal/imagelexicon`
- Commit: `d2770e90ae3cdd1e395c4f7142bc9ffc11a6edfd`
- Source directory: `src/data/keywords`
- Review date: 2026-09-16

The machine-readable review is in [`imagelexicon-review.json`](imagelexicon-review.json).

## Method

The target model remains:

```text
domain -> taxonomy[] -> trait
```

Each ImageLexicon source file has a deterministic default review rule plus explicit keyword overrides. ImageLexicon categories are never imported 1:1; our taxonomy remains authoritative.

Statuses used in the review:

- `vorhanden` — semantics already exist.
- `ähnlich/alias` — same or sufficiently close semantics; prefer tags/search aliases rather than a second semantic trait.
- `fehlt` — useful concept is not represented.
- `ungeeignet` — outside the curated natural-realistic adult core or not a useful stable semantic trait.

## Main result

The review confirms that the v2 structure is more coherent than the source categories. ImageLexicon repeatedly mixes concepts that we keep separate:

- facial expression, gaze, eye state and head orientation;
- pose, action, person-to-person interaction, framing and perspective;
- location, environment, weather/time and background;
- camera/lens, focus, composition, lighting, effects and generic quality tokens;
- clothing, eyewear and jewelry.

These existing separations remain unchanged.

## Implemented recommendations

The reviewed gaps have now been imported as additive v2 taxonomy content without restructuring existing branches.

### Person

Implemented:

```text
person
  face
    eyes
      color

  body
    proportions
      height

  skin
    marks
      tattoo

  expression
    facial_configuration
```

Eye color contains natural-realistic colors and heterochromia. Stylized red, purple, pink and yellow eyes remain excluded from the curated core.

Height is modeled independently from overall build. `petite` is treated only as a search-related term around short stature rather than as a complete body definition.

Tattoo is modeled as a persistent skin mark, not as a wearable.

`facial_configuration` contains directly visible configurations such as open mouth, frown, pout, furrowed brow, raised eyebrows, wink, teary eyes, laughing and yawning. These remain separate from interpreted qualities such as confident, shy or thoughtful.

### Scene

Location coverage was expanded with common rooms and additional natural/indoor locations, including bedroom, kitchen, living room, bathroom, restaurant, bar, classroom, garden, mountains, desert, jungle and underwater scenes.

A dedicated atmosphere branch was added:

```text
scene
  environment
    atmosphere
```

It currently includes steam, smoke, airborne dust, local mist/haze and condensation. This remains distinct from global weather and from image-level optical effects.

Person-to-person interactions were added under the existing Interaction root:

```text
scene
  interaction
    person_to_person
```

Current examples include hugging/embracing, hand holding, kissing, conversation, eye contact, handshake, high five, arm around shoulders, walking together and dancing together.

No dedicated multi-person UI or subject-count model has been introduced yet. The data is available through the generic taxonomy renderer.

### Clothing

The clothing catalog was deliberately broadened while keeping jewelry, eyewear and carried accessories separate under `person -> wearables`.

Coverage now ranges from:

```text
underwear
sleepwear
casual / smart casual
business / formal
sportswear
summer / winter clothing
outerwear
swimwear
hosiery
footwear
workwear
coveralls / overalls
lab clothing
high-visibility clothing
protective suits
chemical protective suits
cleanroom suits
```

Examples include bra, briefs, boxer briefs, boxer shorts, undershirt, lingerie, pajamas, nightgown, bathrobe, tank top, polo shirt, hoodie, sweater, trousers, chinos, cargo pants, shorts, skirts, leggings, joggers, dress, jumpsuit, bib overalls, blazer, coat, raincoat, parka, business suit, uniform, work coveralls, lab coat, protective suits, swimwear and a broad footwear set.

All underwear/swimwear entries remain neutral adult garment traits and do not imply sexual framing.

### Image

Color rendering was added under Style & medium:

```text
image
  style_medium
    color_rendering
      palette
      temperature
      contrast
```

This includes muted, vibrant and pastel palettes, warm/cool rendering and high/low contrast.

The architectural question around photographic effects was resolved in favor of a dedicated root:

```text
image
  effects
```

Initial natural-photographic effects include film grain, digital noise, vignette, chromatic aberration, lens flare, bloom, halation and motion blur.

Effects remain separate from lighting, camera/lens description, focus/depth of field and style/medium.

## Good existing coverage retained

The following areas were already strong and were not restructured:

- adult age handling and sex/gender;
- body build and proportions;
- hair length, texture, style and natural color/effects;
- skin tone, freckles, moles and scars;
- expression vs. head/gaze vs. pose;
- wearables vs. clothing;
- location vs. environment vs. weather/time vs. background;
- objects vs. interaction;
- framing vs. perspective;
- camera/lens vs. focus/depth of field vs. lighting;
- shot style vs. mood vs. realism.

## Alias handling

ImageLexicon synonyms are not multiplied into separate semantic traits. Search vocabulary should continue to use `tags` where appropriate. Typical alias relationships include:

```text
slim                   -> slender
plump / curvy          -> full / voluptuous
dress shirt            -> button-up shirt
formal wear            -> formal clothing
casual wear            -> casual clothing
grin                    -> smile/laughing family
thinking                -> thoughtful / pensive
looking at viewer      -> gaze at camera
blurry background      -> shallow depth of field
city / urban           -> city street / urban environment
pale / tan / dark skin -> existing skin-tone family
```

Newly imported traits include relevant source terms in their tags where useful. Further alias enrichment can be done incrementally without changing taxonomy structure.

## Excluded families

The following source families remain excluded from the curated core:

- artist-name tags;
- explicit sexual-content vocabulary;
- minor-coded terms such as `loli`, `shota`, `child` and `teen`;
- fantasy/non-human anatomy such as horns, wings, tails, fangs and pointed ears;
- magic/aura-style effects;
- generic quality boosters such as `masterpiece`, `best quality`, `8k` and `award winning photo`;
- render-engine names such as Unreal Engine, Octane Render, Cinema 4D and Pixar render for the current natural-photographic core.

## Still deliberately deferred

Only two larger architecture questions remain intentionally open:

1. Explicit multi-person / subject-count modeling and any dedicated UI for it.
2. Whether non-photographic media and broad visual themes should eventually become part of the same generator.

These are not required for the imported person-to-person interaction data or for the current natural-photographic core.
