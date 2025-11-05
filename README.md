# Strandrestaurant Badezeit - Website & Restaurantmanagement

[![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.18.0-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)

> **WICHTIGER HINWEIS**: Das Strandrestaurant Badezeit ist aufgrund eines Brandes derzeit geschlossen. Die Wiedereröffnung ist für 2025 geplant.

## 📍 Über das Projekt

Dies ist die **offizielle Website** des **Strandrestaurant Badezeit** - einem authentischen deutschen Strandrestaurant am Westerland Beach auf Sylt. Das Projekt umfasst sowohl eine öffentliche Website als auch ein umfassendes Restaurantmanagement-System.

### Restaurant-Informationen
- **Name**: Strandrestaurant Badezeit
- **Adresse**: Dünenstraße 3, 25980 Westerland, Sylt, Deutschland
- **Inhaber**: Norbert Mangelsen
- **Telefon**: +49 4651 834020
- **E-Mail**: info@badezeit.de
- **Website**: www.badezeit.de
- **Status**: Geschlossen aufgrund Brand, Wiedereröffnung 2025

## 🏗️ Technische Architektur

### Frontend-Stack
- **Framework**: Next.js 16.0.1 mit App Router + Turbopack
- **React**: Version 19.1.0 (stable)
- **TypeScript**: Vollständige strict mode Typisierung
- **Styling**: Tailwind CSS 4.x mit shadcn/ui Komponenten
- **Icons**: Lucide React
- **Animationen**: Framer Motion + tw-animate-css
- **UI-Komponenten**: shadcn/ui (Radix UI primitives)
- **Theming**: 5 OKLCH-Farbschemata (Coral, Ocean, Forest, Sunset, Midnight)

### Backend & Datenbank
- **Datenbank**: PostgreSQL (Supabase)
- **ORM**: Prisma 6.18.0 (mit prisma.config.ts)
- **Authentifizierung**: Supabase Auth (migrated from Clerk)
- **Email**: React Email mit Resend Integration
- **Formulare**: React Hook Form mit Server Actions und Zod-Validierung
- **Export**: jsPDF (PDF-Generation) + XLSX (Excel-Export)
- **State Management**: TanStack Query v5 für Server-State

### Deployment & Hosting
- **Plattform**: Vercel (Next.js optimiert)
- **CDN**: Vercel Edge Network
- **Bilder**: ImageKit.io CDN
- **Domain**: badezeit.de

## 🚀 Installation & Setup

### Voraussetzungen
- Node.js 18.x oder höher
- npm oder yarn
- PostgreSQL Datenbank (empfohlen: Supabase)
- Git

### 1. Repository klonen
```bash
git clone https://github.com/[username]/badezeit-sylt.git
cd badezeit-sylt
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Umgebungsvariablen konfigurieren
Erstellen Sie eine `.env.local` Datei im Hauptverzeichnis:

```env
# Database
DATABASE_URL="postgresql://postgres:password@host:5432/database"

# Clerk Authentication (optional - Development Mode wenn leer)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Email (Resend)
RESEND_API_KEY=""
RESEND_FROM_EMAIL="noreply@badezeit.de"

# ImageKit CDN
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=""
IMAGEKIT_PUBLIC_KEY=""
IMAGEKIT_PRIVATE_KEY=""

# Analytics (optional)
NEXT_PUBLIC_GA_ID=""
```

### 4. Datenbank einrichten
```bash
# Prisma Client generieren
npm run db:generate

# Schema in Datenbank übertragen
npm run db:push

# Beispieldaten hinzufügen (optional)
npm run db:seed
```

### 5. Entwicklungsserver starten
```bash
npm run dev
```

Die Anwendung ist nun unter `http://localhost:3000` erreichbar.

## 🛠️ Entwicklungsbefehle

### Core Commands
```bash
npm run dev          # Entwicklungsserver mit Turbopack (Port 3000)
npm run build        # Produktions-Build erstellen
npm run start        # Produktionsserver starten
npm run lint         # ESLint ausführen
npm run type-check   # TypeScript Typprüfung
```

### Datenbank Commands
```bash
npm run db:generate  # Prisma Client generieren
npm run db:push      # Schema-Änderungen in DB übertragen
npm run db:seed      # Datenbank mit Beispieldaten füllen (inkl. 5 Kategorien, 10 Menüitems)
npm run db:studio    # Prisma Studio öffnen
npm run db:reset     # Datenbank zurücksetzen und neu seeden
```

### Neue Features Testen
```bash
# Admin Panel Funktionen
# 1. Starte Entwicklungsserver
npm run dev

# 2. Navigiere zu /dashboard/speisekarte für Menümanagement
# 3. Navigiere zu /dashboard/analytics für Export-Funktionen
# 4. Teste alle Tab-Navigationen im Speisekarte-Bereich
```

## 🎨 Admin Panel (Neu Gestaltet für Next.js 16)

Das Admin-Panel wurde vollständig neu gestaltet mit modernem, flüssigem und responsive Design.

### Hauptmerkmale

#### 1. Responsive Layout
- **Kollapierbarer Sidebar**: 80px ↔ 280px (Desktop)
- **Mobile Hamburger-Menü**: Touch-optimiert für Smartphones
- **Smooth Animations**: Framer Motion für flüssige Übergänge
- **Dark Mode Support**: Vollständige Unterstützung aller 5 Themes

#### 2. Navigation System
- **Breadcrumbs**: Dynamische Navigation mit aktuellem Pfad
- **Command Menu**: Globale Suche (Cmd+K / Ctrl+K)
- **Role-based Access**: Automatische Filterung nach Benutzerrolle
- **Collapsible Sub-items**: Einstellungen mit Untermenü

#### 3. Einstellungen-Seite (4 Hauptabschnitte)

**📍 Allgemein**
- Restaurant-Informationen (Name, Beschreibung, Website)
- Regional-Einstellungen (Sprache, Zeitzone, Währung)
- Datums- und Zeitformate
- Kontaktinformationen (Telefon, E-Mail, Adresse)

**🎨 Branding**
- Logo- und Favicon-Upload
- Farbschema (Primär-, Sekundär-, Akzentfarbe)
- Visuelle Identität
- Color Picker Integration

**🔔 Benachrichtigungen**
- E-Mail-Benachrichtigungen (An/Aus)
- SMS-Benachrichtigungen (An/Aus)
- Absender-E-Mail konfigurieren
- Template-Verwaltung (geplant)

**🛡️ System**
- Benutzerstatistiken (Total, Admins, Manager, Staff)
- Wartungsmodus-Schalter
- Automatische Backups (Häufigkeit konfigurierbar)
- Backup herunterladen/hochladen
- Datenaufbewahrung

#### 4. Design-Prinzipien
- **Mobile-First**: Optimiert für Touch-Geräte
- **WCAG-konform**: Barrierefreie Bedienelemente
- **Konsistente Typografie**: Inter Font-Family
- **Spacing System**: Konsistente Abstände (4px Basis)
- **Card-based Layout**: Übersichtliche Gruppierung

### Technische Verbesserungen

#### Prisma Configuration
```typescript
// Migriert von package.json zu prisma.config.ts
export default defineConfig({
  seed: {
    command: 'tsx prisma/seed.ts',
  },
  generator: {
    provider: 'prisma-client-js',
    output: '../node_modules/@prisma/client',
  },
})
```

#### Server/Client Components
- Klare Trennung zwischen Server und Client Components
- Optimale Performance durch selective hydration
- Suspense boundaries für besseres Loading UX

#### Lazy Loading
- Dynamische Imports für große Komponenten
- Code-Splitting nach Routen
- Optimierte Bundle-Größe

## 📁 Projektstruktur

```
badezeit-sylt/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentifizierung (Clerk)
│   │   │   ├── sign-in/       # Anmelde-Seite
│   │   │   └── sign-up/       # Registrierungs-Seite
│   │   ├── actions/           # Server Actions
│   │   │   └── contact.ts     # Kontaktformular-Action
│   │   ├── api/               # API Routes
│   │   │   ├── webhooks/      # Clerk Webhooks
│   │   │   ├── availability/  # Verfügbarkeitsprüfung
│   │   │   ├── reservations/  # Reservierungen API
│   │   │   ├── customers/     # Kunden API (GDPR-konform)
│   │   │   ├── menu/          # Speisekarten API
│   │   │   ├── gallery/       # Galerie API
│   │   │   ├── settings/      # System-Einstellungen
│   │   │   └── dashboard/     # Dashboard-Metriken
│   │   ├── dashboard/         # Admin-Panel (Vollständig implementiert)
│   │   │   ├── layout.tsx     # Dashboard Layout mit Navigation
│   │   │   ├── page.tsx       # Dashboard-Übersicht
│   │   │   ├── reservierungen/ # Reservierungsmanagement
│   │   │   │   ├── page.tsx   # Reservierungsliste
│   │   │   │   ├── neu/       # Neue Reservierung
│   │   │   │   ├── [id]/      # Reservierungsdetails
│   │   │   │   └── components/ # Reservierungs-Komponenten
│   │   │   ├── kunden/        # Kundenverwaltung (CRM)
│   │   │   │   ├── page.tsx   # Kundenliste
│   │   │   │   ├── [id]/      # Kundendetails
│   │   │   │   └── components/ # Kunden-Komponenten
│   │   │   ├── speisekarte/   # **NEU: Vollständiges Menümanagement**
│   │   │   │   ├── page.tsx   # Haupt-Menüseite mit Tab-Navigation
│   │   │   │   └── components/
│   │   │   │       ├── tabs-navigation.tsx    # Tab-Navigation
│   │   │   │       ├── category-manager.tsx   # Kategorienverwaltung
│   │   │   │       ├── item-manager.tsx       # Gerichteverwaltung
│   │   │   │       ├── allergen-manager.tsx   # **NEU: EU-14 Allergenmanagement**
│   │   │   │       ├── photo-manager.tsx      # **NEU: Bilderverwaltung**
│   │   │   │       └── menu-settings-manager.tsx # **NEU: 6-Tab Einstellungen**
│   │   │   └── analytics/     # **NEU: Analytics mit Export**
│   │   │       ├── page.tsx   # Analytics Dashboard
│   │   │       └── components/
│   │   │           └── export-manager.tsx     # **NEU: PDF/Excel Export**
│   │   ├── globals.css        # Globale Styles & Design System
│   │   ├── layout.tsx         # Root Layout
│   │   ├── page.tsx           # Homepage
│   │   ├── kontakt/           # Kontakt-Seite
│   │   ├── ueber-uns/         # Über uns Seite
│   │   ├── speisekarte/       # Öffentliche Speisekarte
│   │   ├── galerie/           # Bildergalerie
│   │   └── reservierung/      # Online-Reservierungssystem
│   ├── components/            # React Komponenten
│   │   ├── ui/                # shadcn/ui Base Components
│   │   │   ├── button.tsx     # Button-Komponente
│   │   │   ├── form.tsx       # Formular-Komponenten
│   │   │   ├── dialog.tsx     # Modal-Dialoge
│   │   │   ├── table.tsx      # Tabellen-Komponente
│   │   │   ├── lightbox.tsx   # Bildergalerie Lightbox
│   │   │   └── switch.tsx     # **NEU: Radix UI Switch-Komponente**
│   │   ├── layout/            # Layout-Komponenten
│   │   │   ├── header.tsx     # Website-Header
│   │   │   ├── footer.tsx     # Website-Footer
│   │   │   ├── public-layout.tsx   # Öffentliches Layout
│   │   │   ├── dashboard-layout.tsx # Admin-Layout
│   │   │   └── breadcrumbs.tsx     # Navigation
│   │   └── providers/         # React Context Provider
│   │       └── query-provider.tsx  # TanStack Query
│   ├── hooks/                 # Custom React Hooks
│   │   ├── use-reservations.ts # Reservierungs-Hook
│   │   ├── use-customers.ts    # Kunden-Hook
│   │   ├── use-availability.ts # Verfügbarkeits-Hook
│   │   ├── use-menu.ts        # Speisekarten-Hook
│   │   ├── use-gallery.ts     # Galerie-Hook
│   │   ├── use-settings.ts    # System-Settings Hook
│   │   └── use-dashboard-metrics.ts # Dashboard-Daten
│   ├── middleware/            # Middleware-Logik
│   │   ├── types.ts           # Middleware-Typen
│   │   ├── prod.ts            # Produktions-Middleware
│   │   └── dev.ts             # Entwicklungs-Middleware
│   └── lib/                   # Utilities & Konfiguration
│       ├── db.ts              # Prisma Client Setup
│       ├── auth.ts            # Auth Utilities & Rollen
│       ├── utils.ts           # Utility-Funktionen
│       ├── restaurant-utils.ts # Restaurant-spezifische Utils
│       ├── email/             # E-Mail System
│       │   ├── send-email.ts  # Resend Integration
│       │   └── templates/     # React Email Templates
│       │       ├── reservation-confirmation.tsx
│       │       ├── reservation-reminder.tsx
│       │       ├── reservation-cancellation.tsx
│       │       ├── newsletter-welcome.tsx
│       │       └── staff-invitation.tsx
│       └── validations/       # Zod Schema-Validierung
│           ├── customer.ts    # Kunden-Validierung
│           ├── reservation.ts # Reservierungs-Validierung
│           ├── menu.ts        # Speisekarten-Validierung
│           ├── table.ts       # Tisch-Validierung
│           ├── user.ts        # Benutzer-Validierung
│           ├── gallery.ts     # Galerie-Validierung
│           └── dashboard.ts   # Dashboard-Validierung
├── prisma/
│   ├── schema.prisma          # Vollständiges DB-Schema
│   ├── seed.ts                # Beispieldaten
│   └── migrations/            # Datenbank-Migrationen
├── docs/                      # Technische Dokumentation
│   ├── README.md              # Dokumentations-Übersicht
│   ├── ARCHITECTURE.md        # System-Architektur
│   ├── DATABASE.md            # Datenbank-Schema
│   ├── API.md                 # API-Dokumentation
│   ├── COMPONENTS.md          # Komponenten-Guide
│   ├── DEPLOYMENT.md          # Deployment-Guide
│   └── MAINTENANCE.md         # Wartungshandbuch
├── middleware.ts              # Next.js Middleware (Auth/Routing)
├── tailwind.config.js         # Tailwind CSS Konfiguration
├── components.json            # shadcn/ui Konfiguration
├── tsconfig.json              # TypeScript Konfiguration
├── eslint.config.mjs          # ESLint Konfiguration
├── next.config.ts             # Next.js Konfiguration
└── package.json               # Dependencies & Scripts
```

## 🌐 Website-Features

### Öffentliche Seiten
- **Homepage**: Restaurant-Präsentation mit Bildern und Informationen
- **Über uns**: Authentische Informationen über Norbert Mangelsen und das Team
- **Speisekarte**: Maritime Küche und Strandrestaurant-Klassiker
- **Galerie**: Bilder vom Restaurant, Essen und Ambiente
- **Kontakt**: Standort, Öffnungszeiten und Kontaktformular
- **Reservierung**: Online-Tischreservierungssystem

### Besondere Features
- **Zweisprachig**: Deutsch (primär) und Englisch
- **Mobile-First**: Responsive Design für alle Geräte
- **GDPR-konform**: Datenschutz und Einverständniserklärungen
- **SEO-optimiert**: Meta-Tags und strukturierte Daten
- **Performance**: Optimierte Bilder und Lazy Loading

## 💼 Admin-Dashboard

Das umfassende Restaurantmanagement-System bietet folgende Module:

### 📊 Dashboard-Übersicht
- **Kernmetriken**: Heutige Reservierungen, Umsätze, Auslastung
- **Schnellaktionen**: Neue Reservierung, Kundensuche, Tischübersicht
- **Echtzeit-Updates**: Live-Status aller Tische und Reservierungen
- **Rollenbasierte Ansichten**: Angepasste Inhalte je nach Benutzerrolle

### 📅 Reservierungsmanagement
- **Reservierungskalender**: Tages-, Wochen- und Monatsansicht
- **Tischbelegung**: Visueller Grundriss mit Echtzeit-Status
- **Kundeninformationen**: Vollständige CRM-Integration
- **Status-Management**: PENDING, CONFIRMED, SEATED, COMPLETED, CANCELLED
- **E-Mail-Automation**: Bestätigungen, Erinnerungen, Stornierungen
- **Sonderanfragen**: Anlässe, Diätvorschriften, besondere Wünsche

### 👥 Kundenverwaltung (CRM)
- **Kundenprofile**: Vollständige Kontaktdaten und Präferenzen
- **Besuchshistorie**: Detaillierte Reservierungs- und Ausgabenhistorie
- **Notizen-System**: Wichtige Informationen und Präferenzen
- **GDPR-Compliance**: Einverständniserklärungen und Datenschutz
- **VIP-Status**: Besondere Kennzeichnung für Stammkunden
- **Statistiken**: Gesamtbesuche, durchschnittliche Gruppengröße, Gesamtausgaben

### 🪑 Tischmanagement
- **Tischkonfiguration**: Kapazität, Standort, Eigenschaften
- **Grundriss-Editor**: Visuelle Anordnung mit X/Y-Koordinaten
- **Standortkategorien**: Terrasse Meerblick, Terrasse Standard, Innenbereich
- **QR-Code-System**: Automatische QR-Codes für kontaktlose Speisekarten
- **Verfügbarkeitsstatus**: Aktiv/Inaktiv, Wartungsmodus

### 🍽️ Speisekartenmanagement
**Vollständig implementiertes Admin-System mit:**
- **Tab-basierte Navigation**: 5 Hauptbereiche (Gerichte, Kategorien, Allergene, Bilder, Einstellungen)
- **Kategoriemanagement**: CRUD-Operationen mit hierarchischer Struktur
- **Gerichteverwaltung**: Vollständige Menüitemverwaltung mit Preisen und Beschreibungen
- **EU-14 Allergen-Compliance**: Vollständige Allergenkennzeichnung (Gluten, Milch, Eier, Nüsse, Fisch, Schalentiere, Soja, Sellerie, Senf, Sesam, Sulfite, Lupinen, Weichtiere, Erdnüsse)
- **Fotomanagement**: Direkte Integration mit gallery_images Tabelle
- **Menü-Einstellungen**: 6 Konfigurationsbereiche (Anzeige, Preise, Sprache, Layout, Öffentlich, System)
- **Echtzeit-Datenbankintegration**: Live-Verbindung zu Supabase PostgreSQL
- **Formular-Validierung**: React Hook Form mit Zod-Schemas
- **Mehrsprachigkeit**: Deutsch (primär) und Englisch
- **Beispieldaten**: 5 Kategorien und 10 Menüitems bereits eingepflegt

### 📈 Analytics & Berichte
**Vollständig implementiertes Analytics-System:**
- **Dashboard-Metriken**: Live-Reservierungsstatistiken, Umsätze, Trends
- **Export-Manager**: PDF- und Excel-Export mit professioneller Formatierung
- **PDF-Generation**: jsPDF mit AutoTable für strukturierte Reports
- **Excel-Export**: XLSX (SheetJS) mit mehreren Arbeitsblättern
- **Umfassende Berichte**: Zusammenfassung, Tageswerte, Leistungskennzahlen
- **Konfigurierbare Exports**: Anpassbare Inhalte und Zeiträume
- **Performance-Analyse**: RevPASH, Auslastung, Durchschnittswerte
- **Deutsche Formatierung**: Korrekte Datums- und Währungsformate
- **Kundensegmentierung**: VIP-Kunden, Stammkunden, Neukunden
- **GDPR-konforme Auswertungen**: Anonymisierte Datenanalyse

### ⚙️ Systemeinstellungen
**Vollständig funktionale Einstellungsverwaltung:**
- **Betriebszeiten**: Flexible Öffnungszeiten-Konfiguration mit Formularvalidierung
- **Reservierungsregeln**: Vorlaufzeiten, maximale Gruppengröße mit React Hook Form
- **E-Mail-Templates**: Anpassbare Kommunikationsvorlagen
- **Systemparameter**: Zeitzone, Sprache, Währung mit Echtzeit-Updates
- **Benutzerrollen**: ADMIN, MANAGER, STAFF, KITCHEN mit granularen Berechtigungen
- **TanStack Query Integration**: Optimierte Datenabfragen und Cache-Management
- **Validierung**: Zod-Schemas für alle Einstellungsformulare
- **Sofortiges Feedback**: Toast-Benachrichtigungen für Aktionen

### 🔒 Sicherheit & Compliance
- **Rollenbasierte Zugriffskontrolle**: Granulare Berechtigungen
- **GDPR-Compliance**: Vollständige Datenschutz-Integration
- **Audit-Logs**: Nachverfolgung aller Systemaktivitäten
- **Datensicherung**: Automatische Backups und Recovery
- **Entwicklungsmodus**: Automatische Deaktivierung ohne Auth-Keys

## 🔧 Technische Details

### Neue Admin Panel Architektur
**Vollständig implementierte Features:**
- **Tab-basierte Navigation**: Moderne UX mit 5 Hauptbereichen
- **Form Management**: React Hook Form mit Zod-Validierung für alle Formulare
- **State Management**: TanStack Query für optimierte Server-State-Verwaltung
- **Export-System**: jsPDF + XLSX für professionelle Berichte
- **Real-time Updates**: Live-Datenbankverbindung zu Supabase
- **Component Library**: Radix UI Primitives mit custom Styling

### Client Components vs Server Components
Das Projekt nutzt Next.js 15 App Router mit strategischer Komponentenverteilung:

- **Server Components**: Standard für Performance (Dashboard-Seiten, APIs)
- **Client Components**: Interaktive Features (alle Admin-Formulare, Export-Manager)
- **Neue Client Components**: Switch, TabsNavigation, AllergenManager, PhotoManager, MenuSettingsManager, ExportManager

### Authentifizierung
- **Clerk Integration**: Vollständiges Auth-System
- **Development Mode**: Automatisch deaktiviert bei fehlenden Keys
- **Rollenbasiert**: ADMIN, MANAGER, STAFF, KITCHEN
- **Route Protection**: Middleware für Admin-Panel-Zugang

### Formular-Handling
- **React Hook Form**: Performante Formularverarbeitung mit Validierung
- **Zod Schemas**: Typsichere Laufzeit-Validierung für alle Formulare
- **Server Actions**: Sichere serverseitige Verarbeitung
- **Toast Feedback**: Sofortiges Benutzer-Feedback mit Sonner
- **GDPR-konform**: Einverständniserklärungen für alle Formulare

### Export-System
**PDF-Generation (jsPDF):**
- Professionelle Dokumentenerstellung mit AutoTable
- Deutsche Formatierung für Datum und Währung
- Multi-Page-Support mit automatischem Umbruch
- Tabellen mit Styling und korrekter Ausrichtung

**Excel-Export (XLSX):**
- Multi-Sheet-Arbeitsmappen
- Automatische Spaltenbreitenoptimierung
- Formatierte Zahlen und Datumswerte
- Strukturierte Datenorganisation

### Datenbankintegration
Das vollständig integrierte Prisma-Schema umfasst:
- **Menüdaten**: 5 Beispielkategorien, 10 Menüitems mit Allergenen
- **Gallery-Integration**: Direkte Verbindung zu gallery_images
- **Allergen-Compliance**: EU-14 Allergenstandard vollständig implementiert
- **Settings-Management**: Persistente Konfigurationen
- **GDPR-Compliance**: Einverständniserklärungen und Audit-Logs

## 🔒 Sicherheit & Datenschutz

### GDPR-Compliance
- Explizite Einverständniserklärungen
- Datenminimierung
- Recht auf Vergessenwerden
- Transparente Datenverarbeitung

### Sicherheitsmaßnahmen
- TypeScript für Typsicherheit
- Zod für Laufzeit-Validierung
- Server Actions für sichere Formulare
- Umgebungsvariablen für sensible Daten

## 🚀 Deployment

### Vercel Deployment
```bash
# 1. Vercel CLI installieren
npm i -g vercel

# 2. Projekt verknüpfen
vercel link

# 3. Umgebungsvariablen setzen
vercel env add DATABASE_URL
vercel env add CLERK_SECRET_KEY
# ... weitere Variablen

# 4. Deployment
vercel --prod
```

### Umgebungsvariablen für Produktion
Stellen Sie sicher, dass alle erforderlichen Umgebungsvariablen in Vercel gesetzt sind:
- Database URL (Supabase)
- Clerk Authentication Keys
- Resend API Key
- ImageKit Credentials

## 📞 Support & Wartung

### Kontakt für Entwicklung
- **Projekt**: Strandrestaurant Badezeit Website
- **Restaurant**: Norbert Mangelsen, info@badezeit.de
- **Status**: Wiedereröffnung 2025

### Häufige Aufgaben
1. **Restaurant-Informationen aktualisieren**: `/src/app/ueber-uns/page.tsx`
2. **Kontaktdaten ändern**: `/src/app/kontakt/page.tsx`
3. **Speisekarte aktualisieren**: `/dashboard/speisekarte` - Vollständiges Admin-Interface
4. **Allergene verwalten**: `/dashboard/speisekarte` (Allergene-Tab)
5. **Menübilder verwalten**: `/dashboard/speisekarte` (Bilder-Tab)
6. **Analytics exportieren**: `/dashboard/analytics` (Export-Manager)
7. **Menüeinstellungen ändern**: `/dashboard/speisekarte` (Einstellungen-Tab)
8. **Bilder hinzufügen**: ImageKit CDN + Galerie-Management

### Troubleshooting
- **Build-Fehler**: Typprüfung mit `npm run type-check`
- **Datenbank-Probleme**: Prisma Studio mit `npm run db:studio`
- **Auth-Probleme**: Clerk-Konfiguration prüfen
- **Export-Probleme**: Browser-Konsole prüfen, jsPDF/XLSX Kompatibilität
- **Formular-Validierung**: Zod-Schema-Fehler in Browser-Konsole
- **Switch-Komponente fehlt**: `npm install @radix-ui/react-switch`
- **Seeding-Fehler**: `npm run db:reset` für kompletten Neustart

## 📝 Lizenz

Dieses Projekt ist urheberrechtlich geschützt und ausschließlich für das Strandrestaurant Badezeit bestimmt.

---

**Strandrestaurant Badezeit** - Authentische maritime Küche am Westerland Beach, Sylt
*Wiedereröffnung 2025*
