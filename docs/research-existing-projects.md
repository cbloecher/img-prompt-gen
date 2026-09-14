# Recherche: bestehende Prompt-Generator-Projekte

Stand: 2026-09-14

## Ziel

Prüfung frei verfügbarer Projekte darauf, welche Konzepte für `img-prompt-gen` übernommen, adaptiert oder bewusst nicht übernommen werden sollten.

Unser Schwerpunkt bleibt ein kuratierter, zweisprachiger und semantischer Trait-Katalog für reproduzierbare Bild-Prompts. Die UI ist Mittel zum Zweck; das Datenmodell ist der wertvollere Kern.

## Kurzvergleich

| Projekt | Schwerpunkt | Relevanz | Erkenntnis für uns |
| --- | --- | --- | --- |
| [ImageLexicon](https://github.com/adenaufal/imagelexicon) | strukturierter Prompt-Editor | sehr hoch | Prompt als strukturierte Daten statt nur String |
| [Dynamic Prompts](https://github.com/adieyal/dynamicprompts) | Wildcards / Template-Engine | sehr hoch | constraint-aware Variation und Randomisierung |
| [Universal Prompt Studio](https://github.com/thinkrtank/universal-prompt-studio) | schema-/formularbasierter Browser-Generator | sehr hoch | Vanilla/client-side bestätigt; Person, Szene und Bild sauber trennen |
| [ComfyUI Easy Prompt Tools](https://github.com/hidenoji1/comfyui-easy-prompt-tools) | hierarchische Tag-Auswahl | mittel | Navigation, Kategorien und Wildcards |

## ImageLexicon

ImageLexicon läuft clientseitig und behandelt den Prompt intern als strukturierte Folge von Tags statt als bloßen String. Dadurch sind Gewichtung, Reihenfolge, Negative Prompt, LoRA-Syntax, BREAK, Import, Undo/Redo, History und Bibliotheksfunktionen sauber möglich. Das Projekt enthält außerdem eine kuratierte Keyword-Suche und modellfamilienbezogene Funktionen.

**Ableitung:** Zwischen Trait-Auswahl und finalem Prompt-String sollte bei uns langfristig eine strukturierte Prompt-Repräsentation (Prompt-IR) liegen. Unser Trait-Katalog sollte dabei die führende semantische Quelle bleiben. Eine fremde Tag-Sammlung sollte nicht ungeprüft übernommen werden.

## Dynamic Prompts

Dynamic Prompts stellt eine eigenständige Template-Sprache mit Varianten, Wildcards, Mehrfachauswahl, Verschachtelung, Variablen, parametrisierten Templates sowie zufälliger und kombinatorischer Generierung bereit. Wildcards können aus Text-, JSON- und YAML-Dateien kommen. Vorhandene Wildcard-Sammlungen eignen sich als Recherchequelle für fehlendes Vokabular.

**Ableitung:** Nicht als internes Datenmodell übernehmen. Sinnvoll sind später Variation und Zufallsauswahl auf Basis unseres Trait-Modells. Dabei müssen `selection`, `requires`, `conflicts`, `implies`, Alter und Geschlecht erhalten bleiben. Export in Wildcard-/Template-Formate ist denkbar.

## Universal Prompt Studio

Universal Prompt Studio ist eine vollständig clientseitige Browser-Anwendung ohne Build-Abhängigkeiten. Der Image Builder gliedert Prompts u. a. nach Subject, Scene, Camera, Lighting, Composition und Style. Formulare werden schemaorientiert erzeugt; Presets, localStorage, Suche und JSON-/Text-Ausgabe sind vorhanden.

**Ableitung:** Unsere Vanilla-JS-/JSON-Architektur ist für den Anwendungsfall angemessen. Auffällig ist dagegen die derzeitige Schieflage unseres Katalogs: `Person` ist bereits detailliert, `Szene` und `Bild` sind noch schwach. Die Hauptnavigation sollte deshalb diese drei Ebenen sichtbar machen:

1. **Person** – Alter/Geschlecht, Körper, Gesicht, Haut, Haare, Ausdruck, Blick, Pose usw.
2. **Szene** – Kleidung, Umgebung/Ort, Interaktion/Objekte, Situation usw.
3. **Bild** – Aufnahmeart, Kamera, Perspektive, Ausschnitt/Komposition, Licht, Stimmung, Realismus/Style usw.

## ComfyUI Easy Prompt Tools

Easy Prompt Tools erzeugt aus YAML-Dateien eine verschachtelte Accordion-/Tag-Auswahl und unterstützt Wildcards. Das Datenmodell ist bewusst einfach und kennt nicht unsere semantischen Regeln.

**Ableitung:** Hierarchische Navigation und Zufallsauswahl pro Kategorie sind nützliche UI-Ideen. Unser JSON-Modell mit Gültigkeit, Exklusivität und Beziehungen bleibt dafür geeigneter als einfache YAML-Taglisten.

## Zielarchitektur

```text
Trait Catalog (data/*.json)
          |
          v
Selection State
          |
          v
Structured Prompt Model / Prompt-IR
          |
          +--> Generic adapter
          +--> FLUX adapter
          +--> SDXL adapter
          |
          v
Final prompt string
          |
          +--> optional later: LLM enhancer
```

Die Prompt-IR sollte Kategorien und Reihenfolge erhalten, damit Modelladapter Syntax, Gewichtung und Formulierung ändern können, ohne den Trait-Katalog umzubauen.

## Bewertung

Keines der untersuchten Projekte ersetzt unseren Ansatz vollständig. Der sinnvolle Kern von `img-prompt-gen` ist nicht die Checkbox-Oberfläche, sondern ein kuratierter Trait-Katalog mit Übersetzung, Beschreibung, Alters-/Geschlechtsgültigkeit, Exklusivität, Abhängigkeiten und Konflikten. Bestehende Projekte liefern vor allem erprobte Konzepte für Prompt-IR, Navigation, Suche, Variation, Import/Export und Modelladapter.

## Quellen

- https://github.com/adenaufal/imagelexicon
- https://github.com/adieyal/dynamicprompts
- https://github.com/adieyal/dynamicprompts/blob/main/docs/SYNTAX.md
- https://github.com/thinkrtank/universal-prompt-studio
- https://github.com/hidenoji1/comfyui-easy-prompt-tools
