# Person taxonomy review

## Status

Issue #17 ist umgesetzt. Die Person-Taxonomie verwendet jetzt Schema v2:

```text
domain -> taxonomy[] -> trait
```

`category` und `subcategory` sind aus den v2-Personendaten entfernt. Dateien sind ausschließlich Speicher-/Pflegeeinheiten; die fachliche Einordnung ergibt sich aus `domain` und `taxonomy[]`.

Die frühere v1-Struktur wurde als fachliche Quelle verwendet, nicht als Kompatibilitätsvertrag. Trait-IDs und Selection-Gruppen wurden daher konsistent neu aufgebaut. Sinnvolle vorhandene Merkmale wurden semantisch erhalten; die zusätzliche alte `posture.json` wurde in `pose` bzw. `pose-naturalism.json` überführt.

## Ziel- und Isthierarchie

```text
person
  identity
    sex_gender          # primäres UI-Personenattribut, kein zusätzlicher Trait
    age
    ancestry_ethnicity
  body
    build
    proportions
    tissue_distribution
    secondary_sex_characteristics
    details
  face
    shape
    forehead
    cheeks
    jaw_chin
    eyes
    eyebrows
    nose
    mouth_lips
    teeth
    marks
  skin
    tone
    pigmentation
    texture
    marks
    aging
    facial
    body
  hair
    length
    texture
    style
    hairline_bangs
    facial_hair
  hair_color_effects
    base_color
    effects
    roots_regrowth
    dye_condition
    aging
  expression
    base
    smile
    emotion
    quality
    state
  head_gaze
    gaze_direction
    gaze_quality
    eye_state
    head_orientation
    chin_position
  pose
    base_position
    posture
    torso
    weight_balance
    arms
    hands
    legs
  wearables
    eyewear
    jewelry
    head_accessories
    carry_wearables
    body_adornment
```

`sex_gender` und das exakte Alter bleiben bewusste primäre Personenattribute der UI, weil sie gleichzeitig die Anwendbarkeit anderer Traits steuern. Altersstufen wie `middle-aged` und `mature` können zusätzlich als Traits gesetzt werden. Die strukturelle Einordnung dieser Attribute bleibt `person -> identity`.

## Zentrale Abgrenzungsregeln

- **Identity / ancestry_ethnicity** beschreibt globale Abstammung/Ethnie. Daraus werden keine Haut-, Haar- oder Gesichtsmerkmale automatisch abgeleitet.
- **Skin / tone** ist eine unabhängige Dimension mit eigener exklusiver Selection-Gruppe.
- **Body** beschreibt stabile Körperform, Proportionen, Gewebeverteilung und nicht-explizite sekundäre Geschlechtsmerkmale.
- **Face** beschreibt stabile Gesichtsgeometrie und Anatomie; Mimik liegt unter **Expression**.
- **Skin** beschreibt Oberfläche, Textur, Pigmentierung, Hautalterung und lokale Hautdetails.
- **Hair** enthält Länge, Struktur, Frisur und Haaransatz; Grundfarbe und Farbeffekte liegen unter **Hair color & effects**.
- **Expression** beschreibt momentane Mimik und deren sichtbare Wirkung.
- **Head & gaze** enthält Blick, Augenzustand, Kopforientierung und Kinnposition.
- **Pose** ist Oberbegriff für Grundposition, Körperhaltung, Oberkörper, Balance sowie Arm-, Hand- und Beinpositionen.
- **Wearables** enthält am Körper getragene Accessoires. Handgehaltene/genutzte Objekte gehören in `scene -> objects`, die Beziehung dazu in `scene -> interaction`.
- **Realism** bleibt Bild-/Darstellungsdimension. Anatomische Detail-Traits wurden in die Person-Taxonomie verschoben.

## Wichtige Migrationen

| v1-Bedeutung | v2-Heimat |
| --- | --- |
| abstrakte Altersstufen | `person -> identity -> age` |
| mature skin, neck wrinkles, aged hands | `person -> skin -> aging` |
| softened jawline | `person -> face -> jaw_chin` |
| broad pelvis | `person -> body -> proportions -> pelvis` |
| broad rounded hips | `person -> body -> proportions -> hips` |
| breast size/asymmetry/aging | `person -> body -> secondary_sex_characteristics -> breast` |
| crooked smile | `person -> expression -> smile` |
| facial asymmetry | `person -> face -> shape` |
| detailed skin texture | `person -> skin -> texture` |
| natural teeth | `person -> face -> teeth` |
| natural hair colors | `person -> hair_color_effects -> base_color` |
| gray strands / graying temples | `person -> hair_color_effects -> aging` |
| gaze + head pose | `person -> head_gaze` |
| old posture traits | `person -> pose`; supplementary naturalism traits in `pose-naturalism.json` |

## Neue Lücken, die im v2-Aufbau geschlossen wurden

### Ancestry / ethnicity

`identity.json` enthält eine erste breite, bewusst nicht deterministische Herkunfts-/Abstammungsstruktur. Die Traits sind mehrfach kombinierbar, damit gemischte Herkunft beschrieben werden kann. Alle `implies` bleiben leer; es gibt insbesondere keine automatische Kopplung an Hautton, Haarstruktur oder Gesichtsanatomie.

### Skin tone

`skin.json` enthält eine eigenständige Auswahl von Hauttonstufen unter `person -> skin -> tone`. Diese Selection-Gruppe ist unabhängig von Abstammung/Ethnie.

### Wearables

`wearables.json` enthält eine erste Struktur für Brillen, Schmuck, Kopf-Accessoires, getragene Taschen und sichtbaren Körperschmuck. Damit ist die Grenze klar:

```text
am Körper getragen -> person / wearables
Objekt vorhanden   -> scene / objects
Person nutzt Objekt -> scene / interaction
```

## Bewusst erhaltene semantische Unterschiede

- `broad pelvis` vs. `broad rounded hips`: Skelett-/Beckenproportion vs. äußere Silhouette/Weichteile.
- Face marks vs. Skin marks: exakt lokalisiertes Gesichtsmerkmal vs. allgemeines Hautmerkmal.
- Hair base color vs. Hair aging: Grundfarbe vs. zusätzliches Ergrauen/Alterungsmuster.
- Expression quality vs. Image mood: sichtbarer Gesichtsausdruck vs. globale Bildstimmung.
- Face eyes vs. Head & gaze eye state: anatomische Augenform vs. momentaner Zustand/Blick.
- Anatomische Schulterbreite vs. haltungsbedingte ungleiche Schulterhöhe.

## Technische Umsetzung

Die Anwendung arbeitet intern bereits auf `domain + taxonomy[]`. Noch nicht migrierte Szene-/Bild-Dateien werden beim Laden vorübergehend auf diese Struktur normalisiert; die Person-Daten liegen nativ in Schema v2 vor.

Navigation, Suche und Prompt-Reihenfolge verwenden Taxonomiepfade statt `category`/`subcategory`. Profile verwenden die Domain direkt für ihre Bereiche. Der alte lokale State und alte Profile werden bewusst nicht migriert.

Die Tests prüfen unter anderem:

- Schema v2 für alle Person-Dateien,
- Fehlen von `category`/`subcategory`,
- Eindeutigkeit der neuen IDs,
- Domain-basierte Profilbereiche,
- hierarchische exklusive Selection-Gruppen,
- Unabhängigkeit von Ancestry/Ethnicity und körperlichen Merkmalen,
- eigenständige Skin-Tone-Gruppe.

## Nächste Taxonomie-Arbeit

Die gleiche v2-Systematik soll für **Scene** (#6) und **Image** (#7) verwendet werden. Das systematische ImageLexicon-Review (#15) wird gegen diese neue Struktur gespiegelt, nicht gegen die frühere v1-Taxonomie.
