# Issue: Profile je Kategorie + wiederverwendbare Trait-Auswahl

## Beschreibung

Implementierung von **Profilen pro Kategorie** und **wiederverwendbaren Trait-Kombinationen**:

### 1. Profile pro Kategorie
- **Person-Profil**: Speichert ausgewählte Traits aus der Person-Kategorie
- **Szene-Profil**: Speichert ausgewählte Traits aus der Szene-Kategorie
- **Bild-Profil**: Speichert ausgewählte Traits aus der Bild-Kategorie
- **Sonstige-Profil**: Speichert ausgewählte Traits aus sonstigen Kategorien
- **Gesamt-Profil**: Kombiniert alle Kategorien

### 2. Trait-Auswahl kombinierbar & wiederverwendbar
- Trait-Kombinationen als **wiederverwendbare Sets** speichbar
- Sets können **geladen, editiert und erneut gespeichert** werden
- **Keine Auswahl in der Navigation** – Integration in die Merkmalauswahl am Anfang (wie aktuell)

### 3. UI/UX
- Auswahl-Interface bleibt am Anfang des Workflows
- Profile werden **neben der Trait-Auswahl** verwaltbar (z.B. Dropdown oder Panel)
- Möglichkeit zum **schnellen Wechsel** zwischen Profilen
- Profile **persistent speichern** (localStorage, IndexedDB oder Backend)

## Technische Anforderungen

- [ ] Datenstruktur für Profile definieren
- [ ] CRUD-Operationen für Profile implementieren
- [ ] UI für Profil-Management (Erstellen, Laden, Speichern, Löschen)
- [ ] Trait-Selektion mit Profile integrieren
- [ ] Persistierung (Client-Side oder Server-Side)
- [ ] Tests für Profile + Trait-Kombinationen

## Akzeptanzkriterien

- ✅ Profile pro Kategorie (Person, Szene, Bild, Sonstige, Gesamt) erstellen und speichern
- ✅ Trait-Sets laden und in die aktuelle Auswahl übernehmen
- ✅ Profile editieren und aktualisieren
- ✅ Keine störende Änderung in der bestehenden Navigation
- ✅ Schneller Wechsel zwischen Profilen möglich
