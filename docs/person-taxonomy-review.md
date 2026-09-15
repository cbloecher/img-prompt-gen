# Person taxonomy review

## Ziel

Die gewachsene Person-Taxonomie wird von **abstrakt nach spezifisch** geordnet, ohne bestehende Traits zu verwerfen. Bestehende Trait-IDs und Prompt-Texte bleiben zunächst stabil; Änderungen betreffen primär fachliche Kategorie, Unterkategorie und UI-Einordnung.

Grundregel:

```text
Person
→ globale Personenbeschreibung
→ stabile körperliche Merkmale
→ momentane sichtbare Zustände / Haltung
```

## Zielhierarchie

```text
PERSON

1. Person description
   1.1 Sex / gender
   1.2 Age
   1.3 Ancestry / ethnicity

2. Body
   2.1 Overall build
   2.2 Proportions
   2.3 Tissue distribution
   2.4 Secondary sex characteristics
   2.5 Body details

3. Face
   3.1 Shape
   3.2 Forehead
   3.3 Cheeks
   3.4 Jaw / chin
   3.5 Eyes
   3.6 Eyebrows
   3.7 Nose
   3.8 Mouth / lips
   3.9 Teeth
   3.10 Marks

4. Skin
   4.1 Tone
   4.2 Pigmentation
   4.3 Texture
   4.4 Marks
   4.5 Aging
   4.6 Facial skin
   4.7 Body skin

5. Hair
   5.1 Length
   5.2 Texture
   5.3 Style
   5.4 Hairline / bangs
   5.5 Facial hair

6. Hair color & effects
   6.1 Base color
   6.2 Color effects
   6.3 Roots / regrowth
   6.4 Dye condition
   6.5 Aging

7. Expression
   7.1 Base expression
   7.2 Smile
   7.3 Emotion
   7.4 Expression quality
   7.5 Temporary state

8. Head & gaze
   8.1 Gaze direction
   8.2 Gaze quality
   8.3 Eye state
   8.4 Head orientation
   8.5 Chin position

9. Pose
   9.1 Base position
   9.2 Posture
   9.3 Torso
   9.4 Weight / balance
   9.5 Arms
   9.6 Hands
   9.7 Legs
```

## Abgrenzungsregeln

- **Age** beschreibt das abstrakte Alter bzw. die Alterswirkung; sichtbare Alterungsmerkmale gehören an ihren anatomischen Ort.
- **Ancestry / ethnicity** ist eine globale Personenbeschreibung. Daraus werden **keine** Haut-, Haar- oder Gesichtsmerkmale automatisch abgeleitet.
- **Body** beschreibt stabile Körperform, Proportionen und Anatomie unterhalb des Kopfes.
- **Face** beschreibt stabile Gesichtsgeometrie und anatomische Merkmale.
- **Skin** beschreibt Oberfläche, Textur, Pigmentierung und Hautalterung – unabhängig davon, ob Gesicht oder Körper betroffen sind.
- **Hair** beschreibt Länge, Struktur und Frisur. Haarfarbe wird in **Hair color & effects** gebündelt.
- **Expression** beschreibt momentane Mimik bzw. deren wahrgenommene Wirkung.
- **Head & gaze** beschreibt Blick, Augenzustand und räumliche Kopforientierung.
- **Pose** ist der Oberbegriff für die räumliche Körperkonfiguration; **Posture** ist eine Unterkategorie davon.
- **Realism** bleibt querschnittlich und soll keine anatomischen Detailmerkmale sammeln.

## Mapping: heutige Struktur → Zielstruktur

Die Tabelle beschreibt die gewünschte fachliche Heimat. `beibehalten` bedeutet: Trait bleibt in seiner jetzigen Hauptkategorie; ggf. wird nur die Unterkategorie vereinheitlicht.

| Aktuell | Ziel | Aktion / Regel |
| --- | --- | --- |
| UI `sex` | Person description / Sex / gender | beibehalten; globale Persondimension |
| `age_adult`, `age_middle_aged`, `age_mature` | Age / stage | beibehalten |
| `age_mature_skin` | Skin / aging | verschieben |
| `age_softened_jawline` | Face / jaw_chin | verschieben |
| `age_neck_wrinkles` | Skin / aging | verschieben |
| `age_wrinkled_hands` | Skin / aging | verschieben |
| neue Traits | Ancestry / ethnicity | neue globale Kategorie; keine `implies` auf Haut/Haar/Gesicht |
| `body_build_*` | Body / overall_build | Unterkategorie umbenennen |
| `body_shoulders_*` | Body / proportions | fachlich unter Schulterproportion bündeln |
| `body_torso_*` | Body / proportions | beibehalten, einheitlich unter Proportionen |
| `body_hips_*` | Body / proportions | äußere Hüftsilhouette; nicht mit Beckenbreite zusammenführen |
| `body_female_pelvis_*` | Body / proportions | Becken-/Skelettproportion; getrennt von Hüftsilhouette |
| `body_legs_*` (Länge) | Body / proportions | beibehalten |
| `body_soft_lower_abdomen` | Body / tissue_distribution | verschieben/vereinheitlichen |
| `body_female_fat_distribution` | Body / tissue_distribution | beibehalten |
| `body_thighs_*` und vergleichbare Volumenmerkmale | Body / tissue_distribution oder body_details | nach Bedeutung: Volumen → tissue_distribution; Form/Anatomie → body_details |
| `body_female_breast_*` | Body / secondary_sex_characteristics | Unterkategorie vereinheitlichen; Größen-Gruppe bleibt exklusiv |
| sonstige lokale Körperdetails | Body / body_details | beibehalten bzw. bündeln |
| `face_shape_*` | Face / shape | beibehalten |
| Wangenmerkmale | Face / cheeks | beibehalten |
| Kiefer-/Kinnmerkmale | Face / jaw_chin | vereinheitlichen |
| stabile Augenform/-lage | Face / eyes | beibehalten |
| Augenbrauenform/-struktur | Face / eyebrows | beibehalten |
| Nasenform | Face / nose | beibehalten |
| stabile Lippen-/Mundform | Face / mouth_lips | beibehalten |
| Zahnform/-stellung | Face / teeth | beibehalten |
| `face_mole_cheek`, `face_scar_eyebrow` | Face / marks | beibehalten: lokalisierte, individualisierende Gesichtsmerkmale |
| `face_smile_crooked` | Expression / smile | verschieben; Mimik statt Anatomie |
| `skin_natural_realistic`, `skin_visible_texture`, `skin_visible_pores`, `skin_uneven_texture` | Skin / texture | beibehalten |
| `skin_freckles`, `skin_age_spots`, `skin_uneven_pigmentation` | Skin / pigmentation | beibehalten |
| Hautton-Merkmale (neu) | Skin / tone | ergänzen; unabhängig von Ancestry / ethnicity |
| `skin_subtle_redness` | Skin / tone oder pigmentation | bevorzugt `tone`; lokale Farbvariation |
| `skin_fine_lines`, `skin_wrinkles`, `skin_crows_feet`, `skin_nasolabial_folds`, `skin_reduced_elasticity` | Skin / aging | beibehalten/bündeln |
| `skin_under_eye_lines` | Skin / facial_skin | verschieben; lokales Gesichtshautdetail |
| `skin_peach_fuzz` | Skin / facial_skin | beibehalten als Oberflächendetail, nicht zu Hair verschieben |
| `skin_small_scars`, `skin_moles` | Skin / marks | beibehalten: nicht ortsspezifische Hautmerkmale |
| `skin_stretch_marks`, `skin_cellulite` | Skin / body_skin | beibehalten/bündeln |
| `skin_visible_hand_veins` | Skin / body_skin | verschieben; lokales Körperhautdetail |
| `hair_length_*` | Hair / length | beibehalten |
| `hair_texture_*` | Hair / texture | beibehalten |
| Scheitel, Pony, Haaransatz | Hair / hairline_bangs | aus `style` trennen, sofern zutreffend |
| Pferdeschwanz, Dutt, Zopf usw. | Hair / style | beibehalten |
| `hair_color_*` in `hair.json` | Hair color & effects / base_color | verschieben; globale `hair_color`-Selection-Gruppe bleibt bestehen |
| `hair_color_*` in `hair-color-effects.json` | Hair color & effects / base_color | beibehalten; Subkategorie `color` → `base_color` |
| `hair_effect_*highlights`, `lowlights`, `balayage`, `ombre` | Hair color & effects / color_effects | beibehalten |
| `hair_effect_dark_roots`, `hair_effect_grown_out_bleach` | Hair color & effects / roots_regrowth | beibehalten |
| `hair_effect_uneven_bleach`, `hair_effect_faded_dye` | Hair color & effects / dye_condition | beibehalten |
| `hair_gray_strands`, `hair_graying_temples` | Hair color & effects / aging | verschieben |
| natürliches Salz-und-Pfeffer/Silbergrau | Hair color & effects / base_color bzw. aging | Grundfarbe bleibt Base color; alterungsbezogene Zusatzmerkmale unter Aging |
| `expression_neutral`, `expression_serious` | Expression / base | beibehalten/bündeln |
| alle Smile-Traits inkl. künftig `face_smile_crooked` | Expression / smile | beibehalten/bündeln |
| `expression_surprised`, `expression_concerned` | Expression / emotion | beibehalten |
| `expression_calm`, `serene`, `thoughtful`, `pensive`, `confident`, `shy`, `playful`, `relaxed` | Expression / quality | heutige `mood`/`general`-Mischung vereinheitlichen |
| `expression_tired` | Expression / state | beibehalten; Unterkategorie `state` |
| `gaze_camera`, `gaze_away`, `gaze_down`, `gaze_up`, `gaze_side` | Head & gaze / gaze_direction | beibehalten |
| `gaze_soft`, `gaze_distant`, `gaze_direct` | Head & gaze / gaze_quality | beibehalten |
| `eyes_closed`, `eyes_half_closed` | Head & gaze / eye_state | beibehalten; ggf. später Default `open` nur als UI-Nullzustand |
| `head_upright`, `head_slightly_tilted`, `head_turned_away`, `head_toward_camera` | Head & gaze / head_orientation | bündeln |
| `chin_raised`, `chin_lowered` | Head & gaze / chin_position | beibehalten |
| `pose_standing`, `pose_sitting`, `pose_kneeling`, `pose_lying_*` | Pose / base_position | heutige `base`-Unterkategorie umbenennen |
| `pose_upright`, `pose_slouched`, `pose_casual`, `pose_relaxed_seated`, `pose_seated_upright` | Pose / posture | beibehalten/bündeln |
| `pose_lean_forward`, `pose_lean_back` | Pose / torso | aus `posture` herauslösen |
| `pose_weight_one_leg` | Pose / weight_balance | aus `posture` herauslösen |
| Armpositionen | Pose / arms | beibehalten |
| `hands_*`, `hand_*` | Pose / hands | beibehalten |
| `pose_cross_legged`, `pose_legs_*`, Knie-/Knöchelpositionen | Pose / legs | beibehalten |
| `realism_skin_detail` | Skin / texture | mittelfristig verschieben |
| `realism_natural_teeth` | Face / teeth | mittelfristig verschieben |
| `realism_natural_light` | Image / lighting | aus Person-Taxonomie heraus verschieben |
| `realism_natural_proportions` | Realism | beibehalten: querschnittliche Darstellungsanweisung |
| `realism_facial_asymmetry` | Realism oder Face | zunächst beibehalten; später prüfen, ob als querschnittlicher Cue oder konkretes Face-Trait sinnvoller |
| `realism_unretouched`, `realism_documentary`, `realism_candid_portrait`, `realism_color` | Realism | beibehalten; Darstellung statt Anatomie |

## Offensichtliche Lücken

### Ancestry / ethnicity

Neue Hauptkategorie direkt nach Age. Sie soll globale Herkunfts-/Abstammungsbeschreibung ermöglichen, aber keine körperlichen Detailmerkmale implizieren.

Noch zu entscheiden:
- gewünschte Granularität (breite Regionen vs. feinere Herkunftsangaben),
- Benennung im UI,
- ob `selection.mode` grundsätzlich `single` oder bewusst `multiple` für gemischte Herkunft sein soll.

Für gemischte Herkunft spricht fachlich **multiple** bzw. ein eigenes Modell, nicht eine starre exklusive Radiogruppe.

### Skin tone

Hautton fehlt als explizite Dimension. Er gehört nach **Skin / tone** und bleibt unabhängig von Ancestry / ethnicity.

### Face coverage

Die aktuelle Gesichtsgeometrie ist noch ungleichmäßig detailliert. Insbesondere Augenform, Augenabstand, Stirn, Kinn, Lippenform/-fülle und weitere Nasenformen können später systematisch ergänzt werden; das ImageLexicon-Review dient dabei als Coverage-Quelle.

### Hairline / bangs

Scheitel, Pony und Haaransatz sind semantisch nicht dasselbe wie eine Frisur und sollten als eigene Unterkategorie ausdifferenziert werden.

## Überschneidungen, die bewusst erhalten bleiben

Einige Merkmale wirken ähnlich, sind aber fachlich verschieden und sollen **nicht** zusammengelegt werden:

- `broad pelvis` vs. `broad rounded hips`: Skelett-/Beckenproportion vs. äußere Silhouette/Weichteile.
- Face marks vs. Skin marks: exakt lokalisiertes individualisierendes Gesichtsmerkmal vs. allgemeines Hautmerkmal.
- Hair base color vs. Hair aging: sichtbare Grundfarbe vs. zusätzliches Ergrauen/Alterungsmuster.
- Expression quality vs. Mood: Expression beschreibt die am Gesicht wahrnehmbare Wirkung; die globale Bildstimmung (`mood`) bleibt eine Bild-/Szenendimension.
- Face eyes vs. Head & gaze eye state: anatomische Augenform vs. momentaner Zustand/Blick.

## Migrationsprinzip

1. Keine Trait-ID löschen oder umbenennen, solange kein zwingender technischer Grund besteht.
2. Zunächst nur `category`, `subcategory`, Metadaten und Navigation konsolidieren.
3. Globale `selection.group`-Namen bleiben stabil, wenn ihre Semantik korrekt ist.
4. Profile werden anhand stabiler Trait-IDs weiter nutzbar gehalten.
5. Erst nach der strukturellen Migration werden fehlende Traits ergänzt.
6. ImageLexicon (#15) wird anschließend gegen diese Zielstruktur ausgewertet, nicht gegen die alte Taxonomie.

## Empfohlene Umsetzungsreihenfolge

1. Ziel-Unterkategorien und Benennungen festschreiben.
2. Offensichtliche Fehlplatzierungen verschieben (`age_*`, `face_smile_crooked`, Hair colors, ausgewählte Realism-Traits).
3. `gaze` fachlich zu **Head & gaze** weiterentwickeln, ohne Trait-IDs zu ändern.
4. Pose-Unterkategorien (`base_position`, `torso`, `weight_balance`) konsolidieren.
5. Neue Kategorie **Ancestry / ethnicity** ergänzen.
6. **Skin / tone** ergänzen.
7. Coverage-Lücken aus #15 systematisch nachziehen.

## Status

Dieses Dokument ist ein Migrationsplan, noch keine vollständige Datenmigration. Es gilt ausdrücklich: **kein bestehendes Merkmal wird verworfen**.
