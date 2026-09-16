# Review: externe Coverage- und Lexikonquellen

Stand: 2026-09-16

## Ziel

Nach dem ImageLexicon-Review werden große externe Tag-/Autocomplete-Quellen nicht als Ziel-Taxonomie importiert. Sie dienen als Coverage- und Alias-Quelle für das bestehende Modell `domain -> taxonomy[] -> trait`.

## Quellen

- BetaDoggo/danbooru-tag-list (`main`): Generator für aktuelle Danbooru-Taglisten mit Kategorie, Post Count und Danbooru-Aliasen.
- dreamscapeai/tagcomplete (`main`): A1111/Forge-Autocomplete mit Danbooru/e621-Listen, Alias-Suche, Übersetzungsdateien, fuzzy/Autocomplete-orientierter Nutzung.

## Befund zum Datenmodell

Unser neues `aliases`-Konzept passt sehr gut zu TagComplete: gesucht werden darf über Alias/Übersetzung, ausgewählt wird aber der kanonische Trait. Externe Aliasnamen dürfen daher Suchvokabular erweitern, ohne `prompt` zu verändern.

Danbooru-Häufigkeiten sind als Review-Signal nützlich, aber nicht als fachliche Priorität. Hohe Häufigkeit kann Kandidaten nach oben sortieren; sie sagt weder, dass ein Begriff in unseren naturalistisch-fotografischen Scope gehört, noch dass er eine eigene Taxonomie-Dimension verdient.

Danbooru-Kategorien sind für unsere Taxonomie ungeeignet: `general` vermischt Person, Pose, Kleidung, Interaktion, Szene, Kamera und Darstellungsmerkmale. Artist/Copyright/Character/Meta werden für die Trait-Coverage grundsätzlich nicht übernommen.

## Empfohlene Pipeline

1. Externe Tags normalisieren: `_`/`-`/Leerzeichen, Kleinschreibung, Unicode.
2. Artist/Copyright/Character/Meta sowie Minor-/Fantasy-/explizit-sexuelle Begriffe vor dem semantischen Mapping herausfiltern.
3. Exakten Treffer gegen `prompt`, `aliases`, EN/DE-Labels und vorhandene Tags suchen.
4. Synonyme auf vorhandene Traits als Alias mappen.
5. Nur echte neue Konzepte als Trait-Kandidaten markieren.
6. Kandidaten mit Quellhäufigkeit und Quelle dokumentieren; Häufigkeit ist Priorisierungsmetadatum, nicht Teil des Prompttextes.
7. Mehrdeutige Begriffe dürfen mehrere Ziel-Traits referenzieren und benötigen bei späterem Import eine bewusste Entscheidung.

## Konkrete Coverage-Kandidaten

Aus dem Vergleich der bereits sichtbaren ImageLexicon-Ergebnisse, unserer v2-Taxonomie und der Autocomplete-/Booru-Systematik ergeben sich folgende Gruppen für eine zweite, datengetriebene Detailrunde:

- Haare: feinere Frisurenvarianten wie crew cut, long bob, shag, cornrows, French/Dutch/fishtail braid, high/low ponytail; bevorzugt neue Traits nur wenn semantisch eigenständig, sonst Alias.
- Ausdruck: amused, relieved, curious, skeptical, determined, bored/sleepy und daydreaming als Prüfung gegen bestehende `emotion`, `quality`, `state` und sichtbare `facial_configuration`.
- Kamera/Framing: medium close-up, medium wide, extreme wide, bird's-eye, worm's-eye, Dutch angle, over-the-shoulder, reflection/through-object framing.
- Fototechnik: long exposure, double exposure, macro, silhouette und tilt-shift; sauber zwischen Camera/Framing/Effects/Focus verteilen statt einen Sammelast anzulegen.
- Material/Oberfläche: leather, silk, denim, lace, metal, glass sowie wet skin. Kleidungsmaterial und Hautzustand gehören in unterschiedliche bestehende Äste.
- Orte: library, botanical garden, subway station, rooftop, gallery, hotel lobby, vineyard, lighthouse und ähnliche reale Orte sind sinnvolle Coverage-Kandidaten; Fantasy-/Sci-Fi-Orte bleiben außerhalb des Kerns.

## Alias-Kandidaten

Neben bereits übernommenen Aliasen besonders prüfen:

- `headshot` -> close-up/portrait framing (nicht blind identisch setzen)
- `full-length`, `head to toe` -> full-body framing
- `birds eye`, `top down`, `overhead` -> bird's-eye/top-down perspective
- `worms eye`, `ground-up` -> worm's-eye/extreme low angle
- `OTS` -> over-the-shoulder
- `DOF`, `bokeh background` -> depth-of-field/focus-Familie
- `film grain`, `grainy` -> film grain
- Frisur-Schreibweisen mit/ohne Bindestrich sowie deutsche Suchbegriffe

## Nicht übernehmen

- Artist-Namen, Copyright-/Character-Tags und generische Meta-Tags.
- Minderjährigen-Codierung.
- explizit sexuelle Tags/Handlungen.
- Fantasy-/Non-human-Anatomie für den aktuellen naturalistischen Kern.
- reine Quality-Booster wie `masterpiece`, `best quality`, Auflösungsmarketing.
- Popularität als automatisches Kriterium für einen Trait.

## Konsequenzen

Das bestehende Schema muss für diesen Review nicht umgebaut werden. `aliases` ist die richtige Aufnahmefläche für Suchvokabular. Für eine spätere automatisierte Coverage-Prüfung ist ein separates Import-/Review-Werkzeug sinnvoll, das externe Listen gegen unsere kanonischen Traits diffen kann und nur Kandidaten ausgibt. Externe Listen sollten nicht zur Runtime-Abhängigkeit der Anwendung werden.
