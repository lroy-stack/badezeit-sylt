# Strandrestaurant Badezeit - Website & Restaurantmanagement

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.14.0-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)

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
- **Framework**: Next.js 15 mit App Router
- **React**: Version 19.1.0
- **TypeScript**: Vollständige Typisierung
- **Styling**: Tailwind CSS 4.x mit shadcn/ui Komponenten
- **Icons**: Lucide React
- **Animationen**: tw-animate-css

### Backend & Datenbank
- **Datenbank**: PostgreSQL (Supabase)
- **ORM**: Prisma 6.14.0
- **Authentifizierung**: Clerk (Development-Modus bei fehlenden Keys)
- **Email**: React Email mit Resend Integration
- **Formulare**: Server Actions mit Zod-Validierung

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
npm run db:seed      # Datenbank mit Beispieldaten füllen
npm run db:studio    # Prisma Studio öffnen
npm run db:reset     # Datenbank zurücksetzen und neu seeden
```

## 📁 Projektstruktur

```
badezeit-sylt/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentifizierung
│   │   ├── actions/           # Server Actions
│   │   ├── api/               # API Routes
│   │   ├── globals.css        # Globale Styles
│   │   ├── layout.tsx         # Root Layout
│   │   ├── page.tsx           # Homepage
│   │   ├── kontakt/           # Kontakt-Seite
│   │   ├── ueber-uns/         # Über uns Seite
│   │   ├── speisekarte/       # Speisekarte
│   │   ├── galerie/           # Bildergalerie
│   │   └── reservierung/      # Reservierungssystem
│   ├── components/            # React Komponenten
│   │   ├── ui/                # shadcn/ui Komponenten
│   │   └── layout/            # Layout-Komponenten
│   └── lib/                   # Utilities & Konfiguration
│       ├── db.ts              # Prisma Client
│       ├── auth.ts            # Auth Utilities
│       └── email/             # Email Templates
├── prisma/
│   ├── schema.prisma          # Datenbank Schema
│   └── seed.ts                # Seed Daten
├── public/                    # Statische Assets
├── middleware.ts              # Next.js Middleware
├── tailwind.config.js         # Tailwind Konfiguration
├── tsconfig.json              # TypeScript Konfiguration
└── package.json               # Dependencies
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

## 💼 Admin-Dashboard (geplant)

Das umfassende Restaurantmanagement-System umfasst:

### Reservierungsmanagement
- Tischbelegung und Reservierungen
- Kundenverwaltung und -historie
- Automatische E-Mail-Bestätigungen
- QR-Code-System für Tische

### Menü- & Inhaltsverwaltung
- Speisekarte mit Preisen und Allergenen
- Bildergalerie-Management
- CMS für Website-Inhalte
- Newsletter-System

### Analytics & Reporting
- Besucherstatistiken
- Reservierungs-Analytics
- Umsatzberichte
- GDPR-konforme Datenanalyse

## 🔧 Technische Details

### Client Components vs Server Components
Das Projekt nutzt Next.js 13+ App Router mit einer strategischen Mischung aus:

- **Server Components**: Standard für bessere Performance
- **Client Components**: Für interaktive Features (markiert mit 'use client')

### Authentifizierung
- **Clerk Integration**: Vollständiges Auth-System
- **Development Mode**: Automatisch deaktiviert bei fehlenden Keys
- **Rollenbasiert**: ADMIN, MANAGER, STAFF, KITCHEN

### Formular-Handling
- **Server Actions**: Sichere serverseitige Verarbeitung
- **Zod Validation**: Typsichere Formularvalidierung
- **GDPR-konform**: Einverständniserklärungen für alle Formulare

### Datenbankschema
Das Prisma-Schema umfasst:
- Benutzerverwaltung mit Rollen
- Kundenverwaltung (CRM)
- Tisch- und Reservierungsmanagement
- Menü- und Inhaltsverwaltung
- QR-Code-System
- Analytics und GDPR-Compliance

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
3. **Speisekarte aktualisieren**: Admin-Dashboard oder Datenbankzugriff
4. **Bilder hinzufügen**: ImageKit CDN + Galerie-Management

### Troubleshooting
- **Build-Fehler**: Typprüfung mit `npm run type-check`
- **Datenbank-Probleme**: Prisma Studio mit `npm run db:studio`
- **Auth-Probleme**: Clerk-Konfiguration prüfen

## 📝 Lizenz

Dieses Projekt ist urheberrechtlich geschützt und ausschließlich für das Strandrestaurant Badezeit bestimmt.

---

**Strandrestaurant Badezeit** - Authentische maritime Küche am Westerland Beach, Sylt
*Wiedereröffnung 2025*
