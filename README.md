# img-prompt-gen

Simple, model-agnostic image prompt generator based on structured prompt traits.

## Goal

The project builds image prompts from reusable characteristics instead of maintaining large fixed prompts. The first focus is realistic adult people: skin, face, hair, body proportions, age, expression, gaze, pose and photographic realism.

The data layer is intentionally independent from SDXL, FLUX or a specific UI. Model-specific rendering rules can later live under `models/`.

## Structure

```text
img-prompt-gen/
├── README.md
├── docs/
│   └── data-model.md
└── data/
    ├── age.json
    ├── body.json
    ├── face.json
    ├── hair.json
    ├── skin.json
    ├── posture.json          # legacy/initial posture traits; migrate into pose as needed
    ├── pose.json             # whole-body, posture, hands, arms and legs
    ├── expression.json       # facial expression
    ├── gaze.json             # gaze, eye state and head pose
    ├── mood.json             # overall emotional atmosphere
    ├── shot-style.json       # photographic/staging character
    ├── realism.json
    └── negative.json
```

## Design principles

- JSON rather than YAML: directly usable from browser JavaScript without an additional parser.
- One trait = one reusable prompt fragment plus human-readable metadata.
- English prompt text; English and German labels/descriptions for the UI.
- `applies_to` filters traits without duplicating male/female data files.
- Age is independent from sex/gender applicability.
- Selection groups describe which traits may be combined.
- `requires`, `conflicts` and `implies` allow later validation and automatic suggestions.
- Model-specific syntax and weights do not belong in the trait data.
- Negative prompts are kept separately in `negative.json`.
- Anatomy, expression, pose, gaze, mood and photographic style remain separate dimensions so the generator can combine them independently.

See [docs/data-model.md](docs/data-model.md) for the JSON syntax and semantics.

## Planned generator

The first generator should remain deliberately simple: static HTML/CSS/JavaScript, load the JSON files, filter/select traits, validate obvious conflicts, and output a positive and negative prompt. No framework or backend is required for v1.
