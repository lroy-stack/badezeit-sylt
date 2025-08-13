# Admin-Panel Dokumentation - Strandrestaurant Badezeit

Vollständige Dokumentation des Restaurantmanagement-Systems für das Strandrestaurant Badezeit auf Sylt.

## 🎯 Übersicht

Das Admin-Panel ist ein umfassendes Restaurantmanagement-System, das alle wichtigen Betriebsabläufe eines modernen Restaurants digitalisiert und optimiert. Es bietet eine benutzerfreundliche Oberfläche für verschiedene Mitarbeiterrollen und gewährleistet GDPR-konforme Datenverarbeitung.

### Zugriff & URL
- **URL**: `https://badezeit.de/dashboard`
- **Entwicklung**: `http://localhost:3000/dashboard`
- **Authentifizierung**: Clerk-basiert mit Development-Mode
- **Mobile-optimiert**: Vollständig responsive für Tablet und Smartphone

## 👥 Benutzerrollen & Berechtigungen

### ADMIN (Administrator)
**Vollzugriff auf alle Funktionen**
- Dashboard-Übersicht
- Reservierungsmanagement
- Kundenverwaltung (CRM)
- Tischmanagement
- Speisekartenmanagement
- Analytics & Berichte
- Systemeinstellungen
- Benutzerverwaltung

### MANAGER (Geschäftsführung)
**Operatives Management**
- Dashboard-Übersicht
- Reservierungsmanagement
- Kundenverwaltung (CRM)
- Tischmanagement
- Speisekartenmanagement
- Analytics & Berichte

### STAFF (Service-Personal)
**Tägliche Betriebsabläufe**
- Dashboard-Übersicht
- Reservierungsmanagement
- Kundenverwaltung (CRM)
- Tischmanagement

### KITCHEN (Küchen-Personal)
**Küchen-relevante Funktionen**
- Dashboard-Übersicht
- Speisekartenmanagement

## 📊 Dashboard-Übersicht

### Kernmetriken (Live-Updates)
```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Heute           │ Diese Woche     │ Diesen Monat    │ Auslastung      │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ 23 Reservierungen│ 156 Reservierungen│ 487 Reservierungen│ 78% belegt      │
│ €2,340 Umsatz   │ €15,680 Umsatz  │ €45,230 Umsatz  │ 18/23 Tische    │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

### Quick Actions
- **Neue Reservierung erstellen**
- **Kundensuche**
- **Tischübersicht anzeigen**
- **Heutige Reservierungen**
- **Walk-in Gäste erfassen**

### Echtzeit-Status
- **Tischbelegung**: Visueller Überblick aller Tische
- **Warteschlange**: Walk-in Gäste und Wartezeiten
- **Personal-Status**: Anwesenheit und Arbeitsschichten
- **Küchen-Status**: Aktuelle Bestellungen und Wartezeiten

## 📅 Reservierungsmanagement

### Reservierungskalender
**Ansichten**:
- **Tagesansicht**: Stundengenauer Überblick
- **Wochenansicht**: 7-Tage-Planung
- **Monatsansicht**: Langfristige Übersicht

**Features**:
- Drag & Drop Reservierungen verschieben
- Farb-codierte Status-Anzeige
- Konflikte automatisch erkennen
- Verfügbarkeit in Echtzeit prüfen

### Reservierungs-Status
```
PENDING     → Neue Reservierung, noch nicht bestätigt
CONFIRMED   → Bestätigt, E-Mail versendet
SEATED      → Gäste sind eingetroffen und platziert
COMPLETED   → Service abgeschlossen, Rechnung bezahlt
CANCELLED   → Reservierung storniert
NO_SHOW     → Gäste nicht erschienen
```

### Neue Reservierung erstellen
**Schritt 1: Grunddaten**
- Datum und Uhrzeit
- Personenanzahl (1-12 Personen)
- Dauer (Standard: 2 Stunden)
- Bevorzugter Tischbereich

**Schritt 2: Kundendaten**
- Neuer Kunde erstellen oder bestehenden auswählen
- Kontaktdaten (Name, E-Mail, Telefon)
- Sprache (Deutsch/Englisch)
- GDPR-Einverständnisse

**Schritt 3: Zusatzinformationen**
- Anlass (Geburtstag, Geschäftstermin, etc.)
- Diätische Anforderungen
- Allergien und Unverträglichkeiten
- Besondere Wünsche

**Schritt 4: Tischzuweisung**
- Automatische Empfehlung basierend auf Kriterien
- Manuelle Tischauswahl
- Alternative Zeiten bei Nichtverfügbarkeit

### E-Mail-Automation
**Bestätigungs-E-Mail**:
```
Betreff: Reservierung bestätigt - Strandrestaurant Badezeit
- Reservierungsdetails
- QR-Code für Check-in
- Stornierungslink
- Kontaktinformationen
- Anfahrtsbeschreibung
```

**Erinnerungs-E-Mail** (24h vorher):
```
Betreff: Erinnerung: Ihre Reservierung morgen
- Reservierungsdetails
- Wetterbericht für Terrassen-Reservierungen
- Aktualisierte Speisekarte-Highlights
- Check-in Information
```

### Reservierungs-Bearbeitung
- **Status ändern**: Workflow-gerechte Status-Übergänge
- **Zeit ändern**: Mit automatischer Verfügbarkeitsprüfung
- **Tisch ändern**: Umplatzierung mit Begründung
- **Gästeanzahl ändern**: Mit Tisch-Anpassung
- **Stornierung**: Mit Stornierungsgrund und E-Mail

## 👥 Kundenverwaltung (CRM)

### Kundendatenbank
**Kernfunktionen**:
- Vollständige Kontaktdaten-Verwaltung
- Besuchshistorie mit Details
- Ausgaben-Tracking
- Präferenzen und Notizen
- GDPR-konforme Datenverarbeitung

### Kundenprofil-Übersicht
```
┌─────────────────────────────────────────────────────────────┐
│ Max Mustermann                                    VIP-Kunde │
│ max.mustermann@email.de • +49 171 1234567                  │
├─────────────────────────────────────────────────────────────┤
│ 🏠 Hamburg • 🎂 15.06.1985 • 🗣️ Deutsch                    │
│ 📊 23 Besuche • €2,340 Gesamtausgaben • ⭐ 4.8/5         │
└─────────────────────────────────────────────────────────────┘
```

### Präferenzen & Diätanforderungen
- **Lieblingsgerichte**: Automatisch aus Bestellhistorie
- **Allergien**: EU-14-Allergene-Tracking
- **Diätanforderungen**: Vegetarisch, Vegan, Glutenfrei
- **Tischpräferenzen**: Terrasse, Fensterplatz, ruhiger Bereich
- **Zeitpräferenzen**: Bevorzugte Uhrzeiten

### GDPR-Compliance
**Einverständniserklärungen**:
- ✅ Datenverarbeitung (erforderlich)
- ⬜ E-Mail-Marketing
- ⬜ SMS-Benachrichtigungen
- ⬜ Newsletter-Abonnement

**Datenschutz-Funktionen**:
- **Datenexport**: Alle Kundendaten als JSON/CSV
- **Daten löschen**: GDPR-konformes "Recht auf Vergessenwerden"
- **Einverständnisse verwalten**: Zeitstempel und Änderungshistorie
- **Anonymisierung**: Für Analytics nach Löschung

### Notizen-System
```
┌─────────────────────────────────────────────────────────────┐
│ 📝 Kundennotizen                                            │
├─────────────────────────────────────────────────────────────┤
│ 🔴 WICHTIG: Glutenunverträglichkeit - Küche informieren    │
│    Von: Sarah M. • 15.08.2024                              │
├─────────────────────────────────────────────────────────────┤
│ ℹ️ Bevorzugt Tisch 12 (Meerblick)                          │
│    Von: Tom K. • 22.07.2024                                │
├─────────────────────────────────────────────────────────────┤
│ ℹ️ Hochzeitsantrag am 01.06.2024 - besondere Betreuung    │
│    Von: Admin • 28.05.2024                                 │
└─────────────────────────────────────────────────────────────┘
```

### Kundensegmentierung
- **VIP-Kunden**: >€1000 Jahresumsatz oder >10 Besuche
- **Stammkunden**: >5 Besuche in den letzten 12 Monaten
- **Neukunden**: Erste Reservierung in den letzten 30 Tagen
- **Inaktive Kunden**: Kein Besuch in den letzten 12 Monaten

## 🪑 Tischmanagement

### Tisch-Konfiguration
**Tischdetails**:
```
┌─────────────────────────────────────────┐
│ Tisch #12                    [AKTIV]    │
├─────────────────────────────────────────┤
│ 👥 4 Personen                           │
│ 📍 Terrasse Meerblick                   │
│ 🔲 Rechteckig                           │
│ 📱 QR-Code: TBZS-012                    │
└─────────────────────────────────────────┘
```

### Standortkategorien
1. **Terrasse Meerblick** (Premium)
   - Direkter Meerblick
   - Abends Sonnenuntergang
   - Windschutz vorhanden
   - 8 Tische (2-6 Personen)

2. **Terrasse Standard**
   - Geschützte Terrasse
   - Teilweise Meerblick
   - Überdacht bei Regen
   - 12 Tische (2-8 Personen)

3. **Innenbereich Fenster**
   - Große Panoramafenster
   - Meerblick auch bei schlechtem Wetter
   - Klimatisiert
   - 6 Tische (2-6 Personen)

4. **Innenbereich Standard**
   - Gemütliche Atmosphäre
   - Maritime Einrichtung
   - Immer verfügbar
   - 10 Tische (2-12 Personen)

5. **Bar-Bereich**
   - Stehtische und Barplätze
   - Für kleinere Gruppen
   - Spontane Besucher
   - 4 Stehtische (2-4 Personen)

### Visueller Grundriss
```
                    TERRASSE MEERBLICK
    ┌─────────────────────────────────────────────────┐
    │  [T1]    [T2]    [T3]    [T4]    🌊 MEERBLICK  │
    │    4p     2p     6p     4p                      │
    └─────────────────────────────────────────────────┘

                   TERRASSE STANDARD
    ┌─────────────────────────────────────────────────┐
    │ [T5] [T6] [T7]     🌂     [T8] [T9] [T10]      │
    │  4p   2p   6p   ÜBERDACHT   4p   2p   8p       │
    │                                                 │
    │ [T11][T12][T13]          [T14][T15][T16]       │
    │  4p   4p   2p              6p   4p   2p         │
    └─────────────────────────────────────────────────┘

          INNENBEREICH                    BAR-BEREICH
    ┌─────────────────────────┐      ┌─────────────────┐
    │ [I1] [I2] [I3] 🪟      │      │ [B1] [B2] 🍷  │
    │  4p   6p   2p  FENSTER │      │  2p   4p  BAR  │
    │                        │      │                 │
    │ [I4] [I5] [I6] 🪟      │      │ [B3] [B4] 🍺  │
    │  4p   2p   6p  FENSTER │      │  2p   4p  THEKE│
    │                        │      └─────────────────┘
    │ [I7] [I8] [I9] [I10]   │
    │  8p  12p   4p   6p     │
    └─────────────────────────┘
```

### QR-Code-System
**Funktion**:
- Jeder Tisch hat einen eindeutigen QR-Code
- QR-Code führt zur digitalen Speisekarte
- Analytics: Scan-Häufigkeit und -Zeiten
- Kontaktlose Menü-Betrachtung

**QR-Code-Format**: `https://badezeit.de/qr/TBZS-{TISCH_NUMMER}`

### Echtzeit-Status
```
🟢 VERFÜGBAR    - Tisch ist frei und bereit
🟡 RESERVIERT   - Reservierung für später heute
🔴 BESETZT      - Gäste sind aktuell am Tisch
⚫ GESCHLOSSEN  - Tisch temporär nicht verfügbar
🔧 WARTUNG      - Reinigung oder Reparatur
```

## 🍽️ Speisekartenmanagement

### Kategorien-Struktur
```
🥗 VORSPEISEN
├── Warme Vorspeisen
└── Kalte Vorspeisen

🐟 HAUPTGERICHTE
├── Fischgerichte
├── Fleischgerichte
├── Vegetarische Gerichte
└── Vegane Gerichte

🍰 DESSERTS
├── Hausgemachte Desserts
├── Eis & Sorbets
└── Käseplatte

🍺 GETRÄNKE
├── Bier & Wein
├── Alkoholfreie Getränke
├── Heißgetränke
└── Spirituosen
```

### Gericht-Management
**Gerichte-Details**:
```
┌─────────────────────────────────────────────────────────────┐
│ 🐟 Sylter Schollenfilet                         €24.50     │
├─────────────────────────────────────────────────────────────┤
│ DE: Frische Scholle aus der Nordsee, gebraten mit          │
│     Speck und Krabben, dazu Bratkartoffeln                 │
│                                                             │
│ EN: Fresh North Sea plaice, fried with bacon and           │
│     shrimps, served with roasted potatoes                  │
├─────────────────────────────────────────────────────────────┤
│ 🏷️  SIGNATURE DISH  🆕 NEU  🌱 GLUTENFREI                  │
├─────────────────────────────────────────────────────────────┤
│ ⚠️  ALLERGENE: Fisch, Krebstiere, Gluten                  │
│ 🥬 DIÄT: Glutenfrei verfügbar                              │
└─────────────────────────────────────────────────────────────┘
```

### EU-Allergenkennzeichnung (14 Hauptallergene)
- **A** - Glutenhaltiges Getreide
- **B** - Krebstiere
- **C** - Eier
- **D** - Fisch
- **E** - Erdnüsse
- **F** - Soja
- **G** - Milch/Laktose
- **H** - Schalenfrüchte
- **L** - Schwefeldioxid
- **M** - Weichtiere
- **N** - Senf
- **O** - Sesam
- **P** - Lupinen
- **R** - Sellerie

### Verfügbarkeits-Management
```
┌─────────────────────────────────────────────────────────────┐
│ ⏰ VERFÜGBARKEITSZEITRAUM                                   │
├─────────────────────────────────────────────────────────────┤
│ 🌱 Spargel-Menü                                             │
│    📅 15.04.2024 - 24.06.2024                              │
│    🕐 Nur Mittagszeit (11:30 - 14:30)                      │
├─────────────────────────────────────────────────────────────┤
│ 🦪 Austern-Festival                                         │
│    📅 01.09.2024 - 30.11.2024                              │
│    🕕 Nur Abends ab 17:00                                   │
└─────────────────────────────────────────────────────────────┘
```

### Preismanagement
- **Grundpreis**: Standardpreis für Gericht
- **Saisonpreise**: Automatische Anpassung je nach Saison
- **Portionsgrößen**: Klein/Standard/Groß mit Preisanpassung
- **Beilagen**: Zusätzliche Beilagen mit Aufpreisen
- **Menü-Pakete**: Rabatte bei Kombinationen

## 📈 Analytics & Berichte

### Dashboard-Metriken
**Reservierungs-KPIs**:
```
┌─────────────────────────────────────────────────────────────┐
│ 📊 RESERVIERUNGS-STATISTIKEN (Letzten 30 Tage)             │
├─────────────────────────────────────────────────────────────┤
│ 📈 Gesamt-Reservierungen: 487                              │
│ ✅ Erfolgsquote: 94.2% (bestätigt + abgeschlossen)         │
│ ❌ No-Show Rate: 3.1%                                       │
│ 🔄 Stornierungsrate: 2.7%                                  │
│ ⏱️  Durchschnittliche Aufenthaltsdauer: 2.3h              │
│ 👥 Durchschnittliche Gruppengröße: 3.2 Personen           │
└─────────────────────────────────────────────────────────────┘
```

**Umsatz-Tracking**:
```
┌─────────────────────────────────────────────────────────────┐
│ 💰 UMSATZ-ÜBERSICHT                                         │
├─────────────────────────────────────────────────────────────┤
│ 📅 Heute: €2,340                                            │
│ 📅 Diese Woche: €15,680                                     │
│ 📅 Diesen Monat: €45,230                                    │
│ 📅 Letztes Jahr (gleicher Monat): €38,450 (+17.6% 📈)     │
└─────────────────────────────────────────────────────────────┘
```

### Tisch-Auslastung
```
AUSLASTUNG NACH TISCHBEREICH (Durchschnitt 30 Tage)
┌─────────────────────────────────────────────────────────────┐
│ 🌊 Terrasse Meerblick:     ████████████░░░  82.3%          │
│ ☀️ Terrasse Standard:      █████████░░░░░░  61.7%          │
│ 🪟 Innenbereich Fenster:   ██████████░░░░░  68.4%          │
│ 🏠 Innenbereich Standard:  ████████░░░░░░░  55.9%          │
│ 🍺 Bar-Bereich:           ████████████████  89.1%          │
└─────────────────────────────────────────────────────────────┘
```

### Kundensegmentierung
- **VIP-Kunden**: 23 Kunden (4.2% der Gesamtkunden)
- **Stammkunden**: 156 Kunden (28.7% der Gesamtkunden)
- **Neukunden**: 89 Kunden (16.4% der Gesamtkunden)
- **Inaktive Kunden**: 275 Kunden (50.7% der Gesamtkunden)

### Beliebte Gerichte
```
🏆 TOP 10 GERICHTE (Letzten 30 Tage)
┌─────────────────────────────────────────────────────────────┐
│ 1. 🐟 Sylter Schollenfilet          127 Bestellungen        │
│ 2. 🦐 Krabbensuppe                  98 Bestellungen         │
│ 3. 🥩 Rindersteak                   87 Bestellungen         │
│ 4. 🍟 Fish & Chips                  76 Bestellungen         │
│ 5. 🌱 Veganer Buddha Bowl           65 Bestellungen         │
│ 6. 🦪 Sylter Austern               54 Bestellungen         │
│ 7. 🍰 Rote Grütze                   48 Bestellungen         │
│ 8. 🧄 Knoblauchbrot                 156 Bestellungen        │
│ 9. 🍺 Sylter Hopfen                 234 Bestellungen        │
│ 10. ☕ Pharisäer                    89 Bestellungen         │
└─────────────────────────────────────────────────────────────┘
```

## ⚙️ Systemeinstellungen

### Restaurant-Grundeinstellungen
```
🏪 RESTAURANT-INFORMATIONEN
├── Name: Strandrestaurant Badezeit
├── Adresse: Dünenstraße 3, 25980 Westerland
├── Telefon: +49 4651 834020
├── E-Mail: info@badezeit.de
├── Website: www.badezeit.de
└── Zeitzone: Europe/Berlin (CEST/CET)
```

### Öffnungszeiten-Konfiguration
```
📅 BETRIEBSZEITEN
┌─────────────────────────────────────────────────────────────┐
│ SOMMERSAISON (01.04 - 30.09)                               │
├─────────────────────────────────────────────────────────────┤
│ Montag - Sonntag: 11:00 - 22:00                            │
│ Küche: 11:30 - 21:30                                        │
│ Happy Hour: 17:00 - 19:00 (Bar)                            │
├─────────────────────────────────────────────────────────────┤
│ WINTERSAISON (01.10 - 31.03)                               │
├─────────────────────────────────────────────────────────────┤
│ Dienstag - Sonntag: 12:00 - 20:00                          │
│ Montag: GESCHLOSSEN                                         │
│ Küche: 12:30 - 19:30                                        │
└─────────────────────────────────────────────────────────────┘
```

### Reservierungsregeln
```
📋 RESERVIERUNGS-PARAMETER
├── Mindest-Vorlaufzeit: 2 Stunden
├── Maximum-Vorlaufzeit: 60 Tage
├── Standard-Dauer: 2 Stunden
├── Maximum-Gruppengröße: 12 Personen
├── Walk-in-Reservierung: Erlaubt (nach Verfügbarkeit)
├── Stornierung bis: 4 Stunden vorher kostenfrei
└── No-Show-Sperre: 30 Tage bei wiederholtem No-Show
```

### E-Mail-Template-Konfiguration
- **Reservierungsbestätigung**: Anpassbare Vorlage
- **Erinnerungs-E-Mail**: 24h vorher automatisch
- **Stornierungsbestätigung**: Sofortiger Versand
- **Newsletter**: Wöchentliche Updates
- **Personal-Einladungen**: Für neue Mitarbeiter

### GDPR-Einstellungen
```
🔒 DATENSCHUTZ-KONFIGURATION
├── Cookie-Banner: Aktiviert
├── Datenaufbewahrung: 7 Jahre (Restaurant-Standard)
├── Anonymisierung: Nach 2 Jahren Inaktivität
├── Löschfristen: Auf Anfrage binnen 30 Tagen
├── Datenexport: JSON/CSV Format verfügbar
├── Einverständnis-Tracking: Vollständig aktiviert
└── Privacy Policy: www.badezeit.de/datenschutz
```

## 🔒 Sicherheit & Compliance

### Authentifizierung & Autorisierung
```
🔐 SICHERHEITS-FRAMEWORK
├── Authentifizierung: Clerk (Production) / Dev-Mode (Development)
├── Session-Management: JWT mit automatischer Erneuerung
├── Passwort-Policy: Minimale Komplexität-Anforderungen
├── 2FA: Optional für Admin-Benutzer
├── Login-Versuche: Max 5 Versuche, dann 15min Sperre
└── Session-Timeout: 8 Stunden Inaktivität
```

### Rollenbasierte Zugriffskontrolle (RBAC)
```
BERECHTIGUNGS-MATRIX
┌─────────────────────┬───────┬─────────┬───────┬─────────┐
│ Funktion            │ ADMIN │ MANAGER │ STAFF │ KITCHEN │
├─────────────────────┼───────┼─────────┼───────┼─────────┤
│ Dashboard           │   ✅   │    ✅    │   ✅   │    ✅    │
│ Reservierungen      │   ✅   │    ✅    │   ✅   │    ⚫    │
│ Kunden (CRM)        │   ✅   │    ✅    │   ✅   │    ⚫    │
│ Tische              │   ✅   │    ✅    │   ✅   │    ⚫    │
│ Speisekarte         │   ✅   │    ✅    │   ⚫   │    ✅    │
│ Analytics           │   ✅   │    ✅    │   ⚫   │    ⚫    │
│ Einstellungen       │   ✅   │    ⚫    │   ⚫   │    ⚫    │
└─────────────────────┴───────┴─────────┴───────┴─────────┘
```

### GDPR-Compliance Framework
1. **Rechtmäßigkeit der Verarbeitung**
   - Explizite Einverständniserklärungen
   - Vertragliche Notwendigkeit (Reservierungen)
   - Berechtigte Interessen (Analytics)

2. **Datenminimierung**
   - Nur erforderliche Daten sammeln
   - Automatische Löschung inaktiver Kunden
   - Anonymisierung für Analytics

3. **Transparenz**
   - Klare Datenschutzerklärung
   - Übersicht über gespeicherte Daten
   - Verwendungszweck dokumentiert

4. **Betroffenenrechte**
   - **Auskunftsrecht**: Vollständiger Datenexport
   - **Berichtigungsrecht**: Daten-Korrektur möglich
   - **Löschungsrecht**: "Recht auf Vergessenwerden"
   - **Widerspruchsrecht**: Verarbeitung einstellen
   - **Datenübertragbarkeit**: Export in standardisierten Formaten

### Audit-Logs
```
📋 SYSTEM-AUDIT-LOG (Letzte 24h)
┌─────────────────────────────────────────────────────────────┐
│ 🕐 2024-01-15 14:23:45 │ admin@badezeit.de                  │
│    ✏️ Reservation #1234 Status: PENDING → CONFIRMED         │
├─────────────────────────────────────────────────────────────┤
│ 🕐 2024-01-15 14:15:12 │ staff@badezeit.de                  │
│    👤 Customer #567 Daten aktualisiert (Telefonnummer)      │
├─────────────────────────────────────────────────────────────┤
│ 🕐 2024-01-15 13:45:33 │ manager@badezeit.de                │
│    🍽️ Menü-Item "Schollenfilet" Preis: €23.50 → €24.50     │
└─────────────────────────────────────────────────────────────┘
```

## 📱 Mobile Optimierung

### Responsive Design
- **Desktop**: Vollständige Funktionalität
- **Tablet**: Optimierte Layouts für Servicepersonal
- **Smartphone**: Kern-Funktionen für unterwegs

### Progressive Web App (PWA)
- **Offline-Funktionalität**: Grundlegende Funktionen ohne Internet
- **App-ähnliche Erfahrung**: Installation auf Home-Screen möglich
- **Push-Benachrichtigungen**: Für wichtige Updates
- **Background-Sync**: Automatische Synchronisation bei Verbindung

### Touch-Optimierung
- **Große Buttons**: Mindestens 44px Touch-Targets
- **Swipe-Gesten**: Navigation durch Wischen
- **Haptic Feedback**: Vibration bei wichtigen Aktionen
- **Voice Input**: Sprachnotizen für Kundeninformationen

## 🚨 Notfall-Funktionen

### Development Mode
**Aktivierung**: Automatisch bei fehlenden/ungültigen Clerk-Keys
```
🔧 ENTWICKLUNGSMODUS AKTIV
├── Authentifizierung: Vereinfacht
├── Demo-Benutzer: Automatisch erstellt
├── Testdaten: Beispiel-Reservierungen verfügbar
├── E-Mail: Nur Konsolen-Ausgabe
├── Zahlungen: Deaktiviert
└── Analytics: Lokale Speicherung
```

### Backup & Recovery
- **Automatische Backups**: Täglich 03:00 Uhr
- **Punkt-in-Zeit-Wiederherstellung**: Letzte 30 Tage
- **Datenexport**: Vollständiger Export jederzeit möglich
- **Disaster Recovery**: RTO: 4h, RPO: 1h

### Support-Kontakt
```
🆘 NOTFALL-SUPPORT
├── Technischer Support: tech@badezeit.de
├── Hotline: +49 4651 834020 (24/7)
├── Status-Page: status.badezeit.de
└── Dokumentation: docs.badezeit.de
```

## 📊 Technische Spezifikationen

### Performance-Metriken
- **Ladezeit**: < 2 Sekunden (First Contentful Paint)
- **API-Response**: < 300ms (95. Perzentil)
- **Database Queries**: < 100ms (Durchschnitt)
- **Uptime**: 99.9% SLA

### Browser-Support
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile**: iOS 14+, Android 10+

### Sicherheits-Standards
- **HTTPS**: TLS 1.3 Verschlüsselung
- **CSP**: Content Security Policy aktiv
- **CSRF**: Cross-Site Request Forgery Schutz
- **XSS**: Cross-Site Scripting Prävention
- **SQL Injection**: Prisma ORM Schutz

---

**Strandrestaurant Badezeit** - Professionelles Restaurantmanagement auf Sylt  
*Admin-Panel Dokumentation - Version 1.0 - Stand: Januar 2025*