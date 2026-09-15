# Person taxonomy review

## Ziel

Die Person-Taxonomie wird von abstrakt nach spezifisch neu aufgebaut. Bestehende Merkmale werden semantisch übernommen, aber es gibt keine Pflicht zur Kompatibilität mit alten IDs, Kategorien, Unterkategorien oder Dateigrenzen.

Das v2-Datenmodell verwendet ausschließlich:

```text
domain -> taxonomy[] -> trait
```

`category` und `subcategory` entfallen vollständig.

## Zielhierarchie

```text
person
  identity
    sex_gender
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

## Grundregeln

### Identity

`identity` enthält globale Personenmerkmale. `ancestry_ethnicity` wird unabhängig von Hautfarbe, Haarstruktur und Gesichtsform modelliert. Es gibt keine automatische Ableitung dieser Merkmale aus Abstammung/Ethnie.

### Age

`identity -> age` enthält nur abstrakte Altersbeschreibung, z. B. adult, middle-aged, mature. Sichtbare Altersmerkmale werden an ihrer anatomischen Stelle modelliert:

- Hautalterung -> `skin -> aging`
- weicher werdende Kieferlinie -> `face -> jaw_chin`
- ergrauendes Haar -> `hair_color_effects -> aging`
- altersbezogene Körpermerkmale -> passender Pfad unter `body`

### Body

`body` beschreibt stabile körperliche Form und Proportionen. Gesamtstatur, Proportionen, Gewebeverteilung, sekundäre Geschlechtsmerkmale und weitere anatomische Details werden getrennt geführt.

Beispielhafte Pfade:

```text
person -> body -> build -> slender
person -> body -> proportions -> shoulders -> broad
person -> body -> tissue_distribution -> abdomen -> soft_lower
person -> body -> secondary_sex_characteristics -> breast -> medium
```

`broad pelvis` und `broad rounded hips` bleiben fachlich unterscheidbar: Skelett-/Beckenproportion gegenüber äußerer Silhouette/Weichteilverteilung.

### Face

`face` enthält stabile Anatomie und Geometrie. Momentane Mimik gehört nach `expression`.

Daher wird z. B. ein schiefes Lächeln künftig unter `expression -> smile` geführt, während eine schiefe Nase unter `face -> nose` bleibt.

### Skin

`skin` beschreibt Oberfläche und Gewebeerscheinung, unabhängig davon, ob das Merkmal am Gesicht oder Körper auftritt. Hautton wird explizit und unabhängig von `ancestry_ethnicity` modelliert.

### Hair

`hair` enthält Länge, Struktur, Frisur, Haaransatz/Pony und Gesichtsbehaarung. Haarfarbe und Farbeffekte liegen separat unter `hair_color_effects`.

### Expression

`expression` beschreibt momentane sichtbare Gesichtskonfiguration oder deren wahrgenommene Wirkung. Die Unterteilung bleibt bewusst zweistufig:

```text
base
smile
emotion
quality
state
```

### Head & gaze

Der bisherige Mischbereich `gaze` wird fachlich zu `head_gaze` konsolidiert:

```text
gaze_direction
gaze_quality
eye_state
head_orientation
chin_position
```

### Pose

`pose` ist der Oberbegriff für die räumliche Körperkonfiguration. `posture` ist darunter eingeordnet und keine parallele Hauptkategorie.

### Wearables

Am Körper getragene Accessoires gehören personennah zu `wearables`:

```text
eyewear
jewelry
head_accessories
carry_wearables
body_adornment
```

Beispiele: Brillen, Sonnenbrillen, Ohrringe, Ketten, Ringe, Armbänder, Uhren, Kopfbedeckungen, Taschen/Rucksäcke und sichtbarer Körperschmuck.

Handgehaltene oder genutzte Objekte gehören dagegen in `scene -> objects`; die Beziehung der Person zum Objekt gehört separat in `scene -> interaction`.

## Beispielhafte v2-IDs

```text
person.body.build.slender
person.body.proportions.shoulders.broad
person.face.nose.aquiline
person.skin.tone.medium
person.skin.pigmentation.freckles
person.hair.length.shoulder
person.hair_color_effects.base_color.dark_brown
person.expression.smile.subtle
person.head_gaze.gaze_direction.camera
person.pose.base_position.standing
person.wearables.jewelry.earrings
```

IDs dürfen beim Umbau geändert werden. Es gibt keine Legacy-Kompatibilitätsanforderung.

## Mapping der bisherigen Struktur

Die folgenden bisherigen Bereiche werden fachlich neu einsortiert:

- `age_mature_skin` -> `person -> skin -> aging`
- `age_softened_jawline` -> `person -> face -> jaw_chin`
- `age_neck_wrinkles` -> `person -> skin -> aging`
- `age_wrinkled_hands` -> `person -> skin -> aging`
- `face_smile_crooked` -> `person -> expression -> smile`
- bisherige Haarfarben in `hair` -> `person -> hair_color_effects -> base_color`
- `hair_gray_strands`, `hair_graying_temples` -> `person -> hair_color_effects -> aging`
- `gaze`-Unterbereiche -> `person -> head_gaze -> ...`
- Pose-Unterbereiche -> `person -> pose -> base_position|posture|torso|weight_balance|arms|hands|legs`
- anatomische Detail-Traits aus `realism` -> fachlich passende Person-Taxonomie

Kein Merkmal wird allein wegen der Reorganisation verworfen. Dubletten oder semantisch nahezu identische Merkmale werden erst nach expliziter Prüfung zusammengeführt.

## Offene Ergänzungen

Beim Neuaufbau sollen insbesondere folgende Lücken geschlossen werden:

- `identity -> ancestry_ethnicity`
- `skin -> tone`
- `wearables` mit den oben definierten Unterpfaden
- weitere offensichtliche Lücken erst nach konsistenter Basismigration ergänzen

## Beziehung zu Szene

Die Schnittstelle zu Szene lautet:

```text
person -> wearables        = an der Person getragen
scene -> objects           = Objekt ist vorhanden
scene -> interaction       = Person tut etwas mit dem Objekt
```

Damit bleiben Erscheinung, Gegenstand und Handlung getrennt kombinierbar.
