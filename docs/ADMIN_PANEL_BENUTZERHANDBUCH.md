# Admin Panel Benutzerhandbuch - Strandrestaurant Badezeit

> **Vollständiges Benutzerhandbuch für das Admin-Panel des Badezeit Restaurant Management Systems**

## 🏠 Dashboard Übersicht

### Zugang zum Admin-Panel

1. **URL**: `https://badezeit.de/dashboard`
2. **Anmeldung**: Clerk-basierte Authentifizierung
3. **Berechtigungen**: ADMIN, MANAGER, STAFF, KITCHEN Rollen

### Dashboard Hauptseite

Das Dashboard bietet eine zentrale Übersicht über:
- **Heutige Kennzahlen**: Reservierungen, Umsatz, Gäste
- **Schnellaktionen**: Neue Reservierung, Kundensuche
- **Aktuelle Tischbelegung**: Live-Status aller Tische
- **Wichtige Benachrichtigungen**: Systemstatus und Alerts

## 🍽️ Speisekarten-Management

### Navigation

Das Speisekarten-Management ist unter `/dashboard/speisekarte` verfügbar und bietet 5 Hauptbereiche:

1. **Gerichte** - Menüitems verwalten
2. **Kategorien** - Kategorie-Struktur
3. **Allergene** - EU-14 Allergen-Compliance
4. **Bilder** - Foto-Management
5. **Einstellungen** - Menü-Konfiguration

### Tab 1: Gerichte verwalten

#### Neues Gericht hinzufügen

1. Klicken Sie auf **"Neues Gericht hinzufügen"**
2. Füllen Sie das Formular aus:
   - **Name**: Deutsche und englische Bezeichnung
   - **Beschreibung**: Detaillierte Beschreibung des Gerichts
   - **Preis**: Angabe in Euro (€)
   - **Kategorie**: Wählen Sie eine bestehende Kategorie
   - **Allergene**: Wählen Sie alle zutreffenden Allergene
   - **Status**: Aktiv/Inaktiv Toggle
3. Klicken Sie **"Speichern"**

#### Gericht bearbeiten

1. Finden Sie das gewünschte Gericht in der Liste
2. Klicken Sie auf das **Bearbeiten-Symbol** (Stift)
3. Ändern Sie die gewünschten Felder
4. Klicken Sie **"Änderungen speichern"**

#### Gericht deaktivieren/aktivieren

- Verwenden Sie den **Aktiv/Inaktiv Toggle** in der Gerichteliste
- Deaktivierte Gerichte werden nicht in der öffentlichen Speisekarte angezeigt

### Tab 2: Kategorien verwalten

#### Neue Kategorie erstellen

1. Klicken Sie **"Neue Kategorie"**
2. Eingabe erforderlicher Daten:
   - **Name**: Deutsche und englische Bezeichnung
   - **Beschreibung**: Optional
   - **Sortierreihenfolge**: Numerischer Wert für Anordnung
   - **Übergeordnete Kategorie**: Für hierarchische Struktur
3. **"Speichern"** klicken

#### Kategorie-Hierarchie

- **Hauptkategorien**: Vorspeisen, Hauptgerichte, Nachspeisen, Getränke
- **Unterkategorien**: Z.B. unter "Getränke" → "Alkoholische Getränke", "Alkoholfreie Getränke"
- **Drag & Drop**: Kategorien per Drag & Drop neu anordnen

### Tab 3: Allergene verwalten (EU-14 Compliance)

#### Verfügbare Allergene

Das System unterstützt alle 14 EU-Hauptallergene:

1. **Gluten** - Getreide mit Gluten
2. **Krebstiere** - Krusten- und Schalentiere
3. **Eier** - Eier und Eiererzeugnisse
4. **Fisch** - Fisch und Fischerzeugnisse
5. **Erdnüsse** - Erdnüsse und Erdnusserzeugnisse
6. **Soja** - Sojabohnen und Sojaerzeugnisse
7. **Milch** - Milch und Milcherzeugnisse
8. **Schalenfrüchte** - Verschiedene Nüsse
9. **Sellerie** - Sellerie und Sellerieerzeugnisse
10. **Senf** - Senf und Senferzeugnisse
11. **Sesamsamen** - Sesamsamen und Sesamsamenerzeugnisse
12. **Schwefeldioxid/Sulfite** - Konservierungsstoffe
13. **Lupinen** - Lupinen und Lupinenerzeugnisse
14. **Weichtiere** - Weichtiere und Weichtiererzeugnisse

#### Allergen-Management

1. **Neues Allergen**: Weitere Allergene hinzufügen (falls benötigt)
2. **Bearbeiten**: Bezeichnungen und Beschreibungen anpassen
3. **Aktivieren/Deaktivieren**: Allergene für Auswahl verfügbar machen
4. **Symbole**: Icons für bessere Darstellung zuweisen

### Tab 4: Bilder verwalten

#### Bilderverwaltung

1. **Galerie-Integration**: Direkte Verbindung zur Hauptgalerie
2. **Bildauswahl**: Mehrere Bilder pro Gericht auswählen
3. **Upload**: Neue Bilder hochladen
4. **Vorschau**: Live-Vorschau der Bildauswahl

#### Bilder zuweisen

1. Gericht auswählen
2. **"Bilder hinzufügen"** klicken
3. Aus Galerie auswählen oder neue Bilder hochladen
4. Bis zu 5 Bilder pro Gericht möglich
5. **Hauptbild** festlegen (erstes Bild in der Liste)

### Tab 5: Einstellungen

Das Einstellungs-Tab bietet 6 Unterbereiche:

#### Anzeige-Einstellungen
- **Darstellungsmodus**: Grid, Liste, Karten
- **Bildgrößen**: Klein, Mittel, Groß
- **Sortieroption**: Nach Kategorie, Preis, Beliebtheit
- **Sichtbare Elemente**: Preise, Beschreibungen, Allergene

#### Preis-Einstellungen
- **Währung**: EUR (Standard)
- **Preisformatierung**: Mit/ohne Währungssymbol
- **Steuerinformationen**: MwSt.-Anzeige
- **Rabattoptionen**: Sonderpreise und Aktionen

#### Sprach-Einstellungen
- **Hauptsprache**: Deutsch (Standard)
- **Zweitsprache**: Englisch
- **Automatische Übersetzung**: Ein/Aus
- **Sprachauswahl für Besucher**: Verfügbar/Versteckt

#### Layout-Einstellungen
- **Template**: Restaurant, Café, Modern
- **Farbschema**: Badezeit-Standard, Custom
- **Navigation**: Horizontal, Vertikal, Tabs
- **Responsive Verhalten**: Mobile-Optimierungen

#### Öffentliche Einstellungen
- **Verfügbarkeit**: Speisekarte online verfügbar
- **QR-Code Integration**: QR-Codes für Tische
- **SEO-Einstellungen**: Meta-Beschreibungen
- **Social Media**: Teilen-Buttons

#### System-Einstellungen
- **Cache-Verhalten**: Aktualisierungsintervalle
- **Backup**: Automatische Sicherungen
- **Logging**: Änderungsprotokoll
- **Performance**: Optimierungsoptionen

## 📊 Analytics & Export

### Analytics Dashboard

Zugang über `/dashboard/analytics` mit umfassenden Berichten:

#### Kernkennzahlen
- **Umsatz**: Tagesumsatz, Wochenumsatz, Monatsumsatz
- **Reservierungen**: Anzahl und Status
- **Gäste**: Gesamtzahl und Durchschnitt pro Reservierung
- **Auslastung**: Tischauslastung und RevPASH (Revenue per Available Seat Hour)

#### Trendanalysen
- **Zeitreihen**: Umsatz- und Besuchertrends
- **Vergleiche**: Vorperioden-Vergleiche
- **Saisonalität**: Saisonale Muster erkennen
- **Prognosen**: Trend-basierte Vorhersagen

### Export-Manager

#### PDF-Export

1. **Export-Optionen wählen**:
   - **Zeitraum**: Heute, Woche, Monat, Custom
   - **Inhalte**: Zusammenfassung, Details, Charts
   - **Format**: PDF (professionell formatiert)

2. **PDF generieren**:
   - Klick auf **"PDF Export"**
   - Download startet automatisch
   - Deutsche Formatierung (Datum, Währung)

3. **PDF-Inhalt**:
   - Zusammenfassung der Kennzahlen
   - Tägliche Detaildaten
   - Leistungskennzahlen
   - Automatische Seitennummerierung

#### Excel-Export

1. **Excel-Optionen**:
   - **Multi-Sheet**: Verschiedene Datenblätter
   - **Formatierung**: Automatische Spaltenbreiten
   - **Formeln**: Berechnete Felder

2. **Excel generieren**:
   - Klick auf **"Excel Export"**
   - .xlsx-Datei wird heruntergeladen
   - Kompatibel mit Microsoft Excel, LibreOffice

3. **Arbeitsblätter**:
   - **Zusammenfassung**: Überblick über alle Kennzahlen
   - **Tägliche Daten**: Detaillierte Tageswerte
   - **Kennzahlen**: Performance-Indikatoren

#### Export-Konfiguration

```
Exportoptionen:
├── Format wählen
│   ├── PDF (für Präsentationen)
│   └── Excel (für weitere Analysen)
├── Zeitraum festlegen
│   ├── Heute
│   ├── Diese Woche
│   ├── Dieser Monat
│   └── Benutzerdefiniert
├── Inhalte auswählen
│   ├── Zusammenfassung ✓
│   ├── Detaillierte Daten ✓
│   └── Diagramme (nur PDF) ✓
└── Export starten
```

## 🔧 Erweiterte Funktionen

### Formular-Validierung

Alle Formulare verwenden **Zod-Schema-Validierung**:
- **Echtzeit-Validierung**: Fehler werden sofort angezeigt
- **Deutsche Fehlermeldungen**: Benutzerfreundliche Texte
- **Pflichtfelder**: Klar markiert mit Sternchen (*)
- **Datenformat-Prüfung**: E-Mail, Telefon, Preise

### State Management

Das System verwendet **TanStack Query** für:
- **Optimistische Updates**: Sofortige UI-Updates
- **Cache-Management**: Intelligente Datenvorhaltung
- **Fehlerbehandlung**: Automatische Retry-Mechanismen
- **Background-Updates**: Automatische Datenaktualisierung

### Toast-Benachrichtigungen

Alle Aktionen erhalten sofortiges Feedback:
- **Erfolg**: Grüne Benachrichtigungen für erfolgreiche Aktionen
- **Fehler**: Rote Benachrichtigungen für Probleme
- **Information**: Blaue Benachrichtigungen für Hinweise
- **Warnung**: Gelbe Benachrichtigungen für wichtige Infos

## 🔒 Sicherheit & Berechtigungen

### Rollenbasierte Zugriffskontrolle

#### ADMIN (Vollzugriff)
- Speisekarten-Management: Vollzugriff
- Analytics: Vollzugriff auf alle Berichte
- Benutzer-Management: Rollen vergeben
- System-Einstellungen: Alle Konfigurationen

#### MANAGER (Betriebsleitung)
- Speisekarten-Management: Vollzugriff
- Analytics: Zugriff auf Berichte
- Reservierungen: Vollzugriff
- Begrenzter Systemzugriff

#### STAFF (Servicepersonal)
- Speisekarten-Management: Nur Lesen
- Reservierungen: Ansehen und Bearbeiten
- Kunden-Management: Basis-Funktionen
- Eingeschränkter Analytics-Zugriff

#### KITCHEN (Küchenpersonal)
- Speisekarten-Management: Nur Lesen
- Bestellungen: Küchen-spezifische Ansicht
- Allergene: Vollzugriff (Sicherheit)
- Keine Analytics

### Datensicherheit

- **GDPR-Compliance**: Alle Datenverarbeitungen DSGVO-konform
- **Audit-Logs**: Vollständige Protokollierung aller Änderungen
- **Backup-System**: Automatische Datensicherungen
- **Verschlüsselung**: Sichere Datenübertragung (HTTPS)

## 🐛 Fehlerbehebung

### Häufige Probleme

#### Speisekarte wird nicht aktualisiert
1. **Cache leeren**: Browser-Cache löschen
2. **Einstellungen prüfen**: Speisekarte auf "Verfügbar" gestellt?
3. **Gericht-Status**: Sind die Gerichte auf "Aktiv" gesetzt?

#### Export funktioniert nicht
1. **Browser-Kompatibilität**: Moderne Browser erforderlich
2. **Pop-up-Blocker**: Download-Blocker deaktivieren
3. **JavaScript**: Muss aktiviert sein
4. **Dateigröße**: Bei großen Exporten Geduld haben

#### Formulare speichern nicht
1. **Pflichtfelder**: Alle erforderlichen Felder ausfüllen
2. **Internetverbindung**: Stabile Verbindung erforderlich
3. **Session-Timeout**: Neu anmelden wenn Session abgelaufen
4. **Formular-Validierung**: Fehlermeldungen beachten

#### Bilder werden nicht angezeigt
1. **Upload-Format**: Nur JPG, PNG, WebP unterstützt
2. **Dateigröße**: Maximale Größe beachten
3. **Galerie-Integration**: Bilder müssen in Galerie verfügbar sein
4. **Cache**: Browser-Cache für Bilder leeren

### Kontakt für Support

Bei technischen Problemen:
1. **Browser-Konsole**: Fehlermeldungen dokumentieren
2. **Screenshots**: Problembereiche visuell festhalten
3. **Schritte zur Reproduktion**: Genaue Beschreibung
4. **System-Informationen**: Browser, Betriebssystem, Datum/Zeit

## 📚 Best Practices

### Speisekarten-Pflege

1. **Regelmäßige Updates**: Speisekarte aktuell halten
2. **Saisonale Anpassungen**: Jahreszeitliche Gerichte
3. **Preispflege**: Preise bei Änderungen sofort aktualisieren
4. **Allergen-Compliance**: Immer vollständig und aktuell
5. **Bildqualität**: Hochwertige, appetitliche Fotos verwenden

### Analytics-Nutzung

1. **Tägliche Checks**: Kernkennzahlen täglich prüfen
2. **Wöchentliche Berichte**: Trends frühzeitig erkennen
3. **Monatliche Analysen**: Strategische Entscheidungen
4. **Export-Archivierung**: Berichte für Vergleiche aufbewahren
5. **Datenbasierte Entscheidungen**: Fakten statt Gefühl

### Sicherheit

1. **Regelmäßige Passwort-Updates**: Sichere Passwörter verwenden
2. **Berechtigungen überprüfen**: Nur notwendige Zugriffe gewähren
3. **Logout**: Immer ordnungsgemäß abmelden
4. **Verdächtige Aktivitäten**: Sofort melden
5. **Backup-Kontrolle**: Regelmäßige Datensicherung prüfen

---

**Version**: 1.0 (Stand: 13.08.2025)  
**Zuletzt aktualisiert**: Nach Vollimplementierung des Admin-Panels  
**Nächste Überprüfung**: Bei nächstem Feature-Update

Dieses Benutzerhandbuch wird kontinuierlich aktualisiert, wenn neue Funktionen hinzugefügt oder bestehende geändert werden.