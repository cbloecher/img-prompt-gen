# ImageLexicon coverage review

## Scope and source

This review compares the current `img-prompt-gen` v2 taxonomy against **ImageLexicon** as a coverage source, not as a target taxonomy.

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

Each ImageLexicon source file has a deterministic **default review rule** plus explicit **keyword overrides**. This is intentionally rule-based rather than copying a large flat source vocabulary into our repository. Every keyword in the pinned source files is covered by either the source-file default or an explicit override.

Statuses:

- `vorhanden` — semantics already exist.
- `ähnlich/alias` — same or sufficiently close semantics; prefer alias/tag rather than a new trait.
- `fehlt` — useful concept is not currently represented.
- `ungeeignet` — outside the curated natural-realistic adult core or not a useful stable semantic trait.

High-volume homogeneous sources are deliberately compressed. In particular, all entries of `artists.json` are covered by one category-wide exclusion rule rather than copied one row per artist.

## Main result

The review confirms that the new v2 structure is substantially more coherent than ImageLexicon's source categories. ImageLexicon repeatedly mixes concepts that we now keep separate:

- `expressions.json` mixes facial expression, gaze, eye state and head orientation.
- `poses.json` mixes body pose, actions, person-to-person interaction, framing and camera perspective.
- `setting-environment.json` mixes location, environment, weather/time and background.
- `image-quality.json` and `visual-effects.json` mix camera/lens, focus, composition, lighting, visual effects, render engines and generic quality-booster tokens.
- `clothing-appearance.json` mixes clothing with eyewear and jewelry.

Therefore **no structural import of ImageLexicon categories is recommended**. Our taxonomy remains authoritative.

## Confirmed taxonomy gaps

### Person

**Eye color** is the clearest missing anatomical dimension:

```text
person
  face
    eyes
      color
```

Useful candidates include natural blue, brown, green and very dark eyes plus heterochromia. Stylized red/purple/yellow/pink eyes remain outside the natural-realistic core.

**Height / stature** is missing as an explicit proportion dimension:

```text
person
  body
    proportions
      height
```

Candidates: tall, short; `petite` should be reviewed carefully because it mixes height and overall build.

**Tattoo** belongs with persistent body/skin marks rather than wearables:

```text
person
  skin
    marks
      tattoo
```

**Visible facial configuration** is underrepresented. The existing `expression` tree contains interpreted expressions and smiles, but ImageLexicon exposes useful visible configurations such as open mouth, furrowed brow, raised eyebrows, wink, frown, pout, tears/crying and yawning. A useful refinement would be:

```text
person
  expression
    facial_configuration
```

This keeps visible facial geometry separate from interpreted qualities such as confident, shy or thoughtful.

### Scene

Common domestic rooms are currently too coarse under `Home`:

```text
scene
  location
    indoor
      home
        bedroom
        kitchen
        living_room
```

A separate **scene atmosphere** branch is also justified by terms such as steam, dust, smoke, mist and wind:

```text
scene
  environment
    atmosphere
```

This should remain separate from image-level lighting and optical effects.

ImageLexicon also reveals a future multi-person gap:

```text
scene
  interaction
    person_to_person
```

Candidates include hugging, handholding and embracing. This should only be added together with an explicit decision on multi-person support.

### Image

A significant missing branch is **color rendering / grading**:

```text
image
  style_medium
    color_rendering
```

Candidates include monochrome, muted colors, warm/cool palette, vibrant colors and high/low contrast. This is conceptually different from both `mood` and `lighting`.

Another useful branch is photographic/image effects:

```text
image
  style_medium
    effects
```

Candidates include film grain, vignette, chromatic aberration and motion blur. Before implementing this, we should decide whether it deserves its own root `image -> effects` instead of living below `style_medium`.

## Good existing coverage

The review confirms strong coverage in several areas:

- Basic age/adult handling and sex/gender are already primary person attributes.
- Body build, breast morphology, hair length/texture/style and natural hair colors cover much of ImageLexicon's natural-person vocabulary.
- Skin tone, freckles, moles and scars are already better structured than the source vocabulary.
- Basic expression, gaze direction, eye state, head orientation and pose are present and correctly separated.
- Basic location, weather/time and background cover much of `setting-environment.json`.
- Basic framing, perspective, focus/depth of field, camera/lens and lighting now cover the most useful photographic terms.
- Eyewear and jewelry are correctly modeled as `person -> wearables` rather than clothing.

## Alias candidates

A large portion of ImageLexicon should enrich search vocabulary rather than add traits. Examples:

```text
slim                  -> slender
plump / curvy         -> full / voluptuous
dress shirt           -> button-up shirt
formal wear           -> formal clothing
casual wear           -> casual clothing
grin                  -> smile family
thinking              -> thoughtful / pensive
looking at viewer     -> gaze at camera
blurry background     -> shallow depth of field
city / urban          -> city street / urban environment
pale / tan / dark skin -> existing skin-tone family
```

Aliases should be added through tags/search aliases without multiplying semantic traits.

## Excluded families

The following source families should not enter the curated core:

- All artist-name tags from `artists.json`.
- All entries from `sexual-content.json`; neutral pose words duplicated there are reviewed from non-sexual source categories instead.
- `loli`, `shota`, `child`, `teen` and other minor-coded tags.
- Fantasy/non-human anatomy such as horns, wings, tail, fangs and pointed ears.
- Magic/aura-style fantasy effects.
- Generic prompt-quality boosters such as `masterpiece`, `best quality`, `8k`, `award winning photo`.
- Render-engine terms such as Unreal Engine, Octane Render, Cinema 4D and Pixar render for the current natural-photographic core.

## Deferred architecture questions

The review surfaces a few questions that should be decided deliberately rather than solved by bulk-importing traits:

1. Do we want explicit **multi-person / subject-count** modeling?
2. How broad should **clothing** become beyond everyday and work-oriented core garments?
3. Should non-photographic media and broad themes eventually live in this same generator?
4. Should photographic effects remain under `style_medium`, or should we introduce `image -> effects`?
5. Should affectionate person-to-person interactions be core features or an optional extension?

## Recommendation

Do **not** bulk-import ImageLexicon.

The next changes worth discussing are, in this order:

1. `person.face.eyes.color`
2. `person.body.proportions.height`
3. `person.expression.facial_configuration`
4. domestic room locations
5. `scene.environment.atmosphere`
6. `image.style_medium.color_rendering`
7. image effects placement
8. multi-person support and person-to-person interactions

Only after those decisions should follow-up issues be created. The review matrix deliberately separates these structural decisions from ordinary alias additions.
