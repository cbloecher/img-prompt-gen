# Review: externe Prompt-Architektur und Generatoren

Stand: 2026-09-16

## Ziel

Vergleich unseres Generators mit Projekten, die strukturierte Prompt-Blöcke, modellabhängige Formulierungen, Reihenfolge, Constraints und Prompt-Varianten behandeln. Schwerpunkt ist nicht die Übernahme fremder Taxonomien, sondern die Validierung von Prompt-IR, Prompt-Reihenfolge und Modelladaptern.

## Geprüfte Quellen

- Cyber-Brew/ai-photo-prompt-studio (`main`), insbesondere `src/data/options.json` und `src/core/engine/PromptEngine.ts`.
- daGonen/promptforge (`main`), insbesondere `data/modes.py` und die block-/modellabhängige Assembly-Architektur.
- scoilt/prompt-palette-frontend (`main`), insbesondere die eingebettete Bibliothek mit getrennten `flux`- und `sdxl`-Formulierungen.
- Gunther-Schulz/sd-webui-prompt-enhancer (`main`), insbesondere kategorisierte Modifier sowie Prose/Hybrid/Tags und Tag-Normalisierung.

## Zentrale Erkenntnisse

### 1. Trait und Ausgabeformulierung müssen getrennt bleiben

Prompt Palette modelliert denselben auswählbaren Begriff mit einer kurzen SDXL-Tagform und einer ausführlicheren FLUX-Natursprache. Beispielhaft werden sichtbare Ausdrucksmerkmale für FLUX als konkrete Gesichtsgeometrie erläutert, während SDXL eine knappe Tagform erhält.

Das bestätigt unser Modell:

`Trait -> prompt -> prompt_terms -> Model Adapter`

`prompt_terms` sollte nicht einfach eine Verstärkungsliste sein. Sinnvoller ist langfristig eine modell- bzw. stilabhängige Formulierungsquelle, aus der Adapter eine passende Repräsentation wählen. Die kanonische Trait-ID bleibt unverändert.

### 2. Prompt-Reihenfolge gehört in den Adapter, nicht in die Taxonomie

PromptForge definiert je Modell eine eigene Blockreihenfolge und trennt diese von den Blockinhalten. SDXL, FLUX und natürliche Sprachmodelle erhalten unterschiedliche Reihenfolgen. AI Photo Prompt Studio arbeitet ebenfalls mit einer expliziten `promptOrder`-Liste.

Damit sollte Issue #10 nicht als globale fest verdrahtete Reihenfolge gelöst werden. Die Prompt-IR sollte semantische Blöcke erzeugen; der Adapter ordnet sie für das Zielmodell.

### 3. Prompt-IR sollte semantische Blöcke statt fertiger Strings transportieren

Empfohlener Kern:

```text
PromptIR
  subject/person
  action/interaction
  clothing/wearables
  scene
  lighting
  camera
  framing/perspective
  composition
  focus
  style/medium
  color
  effects
  mood
  realism
  negative
  output/options
```

Jeder Block referenziert primär Trait-IDs und optional Freitext. Erst der Adapter rendert Strings. Dadurch bleiben Reihenfolge, Separatoren, Gewichtssyntax und natürlichsprachliche Verknüpfung austauschbar.

### 4. Action/Relationship ist semantisch eigenständig

PromptForge setzt bei natürlichsprachlichen Modellen `action / relationship` früh. Das bestätigt unsere Trennung von Pose, Situation und Interaction einschließlich `person_to_person`. Für FLUX sollte Interaktion nicht am Ende als isolierter Tag angehängt werden, sondern möglichst nahe am Subject/Scene-Satz stehen.

### 5. Constraints müssen vor dem Rendering aufgelöst werden

AI Photo Prompt Studio prüft Konflikte während der Assembly und dedupliziert Promptfragmente. Für uns ist eine frühere, modellneutrale Stufe besser:

`Selection -> Constraint Resolution -> PromptIR -> Adapter -> Prompt`

`requires`, `conflicts`, `implies`, Alters-/Geschlechtsanwendbarkeit und spätere Randomisierung gehören vor die Modellformatierung. Der Adapter darf keine fachlichen Konflikte lösen müssen.

### 6. Deduplication muss semantisch erfolgen

String-Deduplizierung reicht nicht, wenn `slender`, `slim physique` und `lean build` dasselbe Konzept ausdrücken. Unsere kanonischen Trait-IDs und Aliase erlauben bessere Deduplizierung: pro Trait bzw. semantischer Gruppe wird eine Ausgabeform gewählt. `aliases` gehören nie als zusätzliche Promptverstärkung in die Ausgabe.

### 7. Modellfähigkeiten explizit beschreiben

PromptForge modelliert u. a. Reihenfolge, Tokenbudget und Gewichtssyntax je Modell. Für unsere Adapter ist ein Capability-Objekt sinnvoll, beispielsweise:

```json
{
  "id": "sdxl",
  "syntax": "tags",
  "supports_weights": true,
  "weight_syntax": "a1111",
  "supports_negative_prompt": true,
  "preferred_order": [],
  "separator": ", "
}
```

Für FLUX entsprechend `syntax: natural_language`, keine A1111-Gewichte und eine andere Renderstrategie. Token-/Längenbudgets sollten zunächst Hinweise sein, keine harten fachlichen Grenzen.

### 8. Mehrere Rendering-Modi sind sinnvoll

Der Prompt Enhancer unterscheidet Prose, Tags und Hybrid. Für unser engeres Produkt reichen zunächst zwei Adapterstrategien:

- `tags`: kompakte kommagetrennte Ausgabe, z. B. SDXL.
- `natural_language`: zusammenhängende, semantisch gruppierte Beschreibung, z. B. FLUX.

`hybrid` kann später ergänzt werden, ohne die Taxonomie zu verändern.

### 9. Behavioral Modifier nicht mit Traits vermischen

Prompt Enhancer trennt bei Modifiern zwischen Verhalten für die Generierung und Keyword-Vokabular. Begriffe wie „prioritize emotion“, „focus composition“ oder „focus texture“ beschreiben keine sichtbare Eigenschaft, sondern eine Promptstrategie. Falls wir solche Steuerung aufnehmen, gehört sie in Prompt-/Adapteroptionen und nicht als normaler Bild-Trait in die Taxonomie.

## Inhaltliche Coverage-Hinweise aus den Architekturprojekten

Trotz des Architektur-Fokus liefern die Projekte einige sinnvolle Kandidaten zur Prüfung:

- Perspective/Framing: bird's-eye, worm's-eye, Dutch angle, over-the-shoulder, through-object framing, reflection shot.
- Framing distance: extreme close-up, medium close-up, medium wide, extreme wide.
- Techniques/Effects: long exposure, double exposure, tilt-shift, macro, silhouette.
- Hair: deutlich feinere Frisurenfamilien, insbesondere Braids, Bob-Varianten und kurze Schnitte.
- Location: reale urbane, Innenraum- und Naturorte über unsere aktuelle Auswahl hinaus.
- Material: Kleidungsmaterialien und Oberflächen könnten als eigene Dimension sinnvoll werden; nicht vorschnell in Camera/Effects übernehmen.

## Entscheidungen für img-prompt-gen

1. Bestehende Taxonomie nicht nach fremden Kategorien umbauen.
2. `aliases` bleiben reine Such-/Mappingbegriffe.
3. `prompt_terms` als alternative Ausgabeformulierungen vorbereiten; später modellbezogene Auswahl durch Adapter.
4. Prompt-IR vor Modelladapter einführen.
5. Prompt-Reihenfolge je Adapter definieren.
6. Constraint Resolution vor Prompt-IR/Rendering durchführen.
7. Adapter-Capabilities für Syntax, Gewichtung, Negative Prompt, Reihenfolge und Separatoren vorsehen.
8. Zunächst `tags` und `natural_language` als Rendering-Strategien unterstützen.
9. Behavioral/priority controls getrennt von sichtbaren Traits modellieren.

## Bezug zu offenen Issues

- #9 Prompt-IR: durch diesen Review konkretisiert.
- #10 Prompt-Reihenfolge: sollte adapterabhängig statt global werden.
- #11 Randomisierung: muss nach Constraints arbeiten und vor Prompt-IR eine gültige Selection erzeugen.
- #12 Modelladapter: sollte Capabilities + Renderstrategie + Reihenfolge kapseln.

Die Review-Ergebnisse sind Anforderungen/Entscheidungsgrundlage, noch keine vollständige Implementierung dieser Issues.
