# Deployment Guide - Strandrestaurant Badezeit

Dieser Guide führt Sie durch den kompletten Deployment-Prozess der Badezeit-Website von der lokalen Entwicklung bis zur Produktion.

## 🎯 Deployment-Übersicht

### Ziel-Architektur
- **Frontend**: Vercel (Next.js optimiert)
- **Datenbank**: Supabase PostgreSQL
- **CDN**: ImageKit.io für Bilder
- **E-Mail**: Resend für Transaktions-E-Mails
- **Authentifizierung**: Clerk
- **Monitoring**: Vercel Analytics + Error Tracking

## 🚀 Vercel Deployment

### 1. Vercel-Projekt erstellen

```bash
# Vercel CLI installieren
npm i -g vercel

# Projekt mit Vercel verknüpfen
cd badezeit-sylt
vercel link
```

### 2. Umgebungsvariablen konfigurieren

#### Über Vercel Dashboard:
1. Gehen Sie zu [vercel.com/dashboard](https://vercel.com/dashboard)
2. Wählen Sie Ihr Projekt
3. Gehen Sie zu Settings → Environment Variables

#### Über CLI:
```bash
# Datenbank
vercel env add DATABASE_URL production
# Eingabe: postgresql://user:pass@host:5432/database

# Clerk Authentication
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL production
vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL production

# E-Mail (Resend)
vercel env add RESEND_API_KEY production
vercel env add RESEND_FROM_EMAIL production

# ImageKit CDN
vercel env add NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT production
vercel env add IMAGEKIT_PUBLIC_KEY production
vercel env add IMAGEKIT_PRIVATE_KEY production

# Analytics (optional)
vercel env add NEXT_PUBLIC_GA_ID production
```

### 3. Production Build & Deploy

```bash
# Lokaler Test des Production Builds
npm run build
npm run start

# Production Deployment
vercel --prod
```

### 4. Custom Domain konfigurieren

#### Domain hinzufügen:
1. Vercel Dashboard → Ihr Projekt → Settings → Domains
2. Domain hinzufügen: `www.badezeit.de`
3. DNS-Einstellungen beim Domain-Provider aktualisieren:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### SSL-Zertifikat:
- Automatisch via Let's Encrypt
- HTTP→HTTPS Redirect aktiviert
- HSTS-Header automatisch gesetzt

## 🗄️ Supabase Setup

### 1. Projekt erstellen

1. Gehen Sie zu [supabase.com](https://supabase.com)
2. Neues Projekt erstellen
3. Region wählen: `Central EU (Frankfurt)` für GDPR-Compliance
4. Starke Passwörter generieren lassen

### 2. Datenbank konfigurieren

```sql
-- Row Level Security aktivieren
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies erstellen
CREATE POLICY "Customers can view own data" ON customers
  FOR SELECT USING (auth.email() = email);

CREATE POLICY "Staff can view all reservations" ON reservations
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('STAFF', 'MANAGER', 'ADMIN')
  );
```

### 3. Connection String generieren

1. Supabase Dashboard → Settings → Database
2. Connection String kopieren
3. In Vercel als `DATABASE_URL` hinzufügen

```env
DATABASE_URL="postgresql://postgres.abcdefg:password@db.supabase.co:5432/postgres"
```

### 4. Schema migrieren

```bash
# Lokale Prisma-Migration auf Supabase anwenden
npx prisma db push

# Oder über Migration Files
npx prisma migrate deploy
```

## 📧 Resend Email Setup

### 1. Resend-Account erstellen

1. Gehen Sie zu [resend.com](https://resend.com)
2. Account erstellen
3. Domain verifizieren: `badezeit.de`

### 2. DNS-Records konfigurieren

```
Type: MX
Name: @
Value: feedback-smtp.eu-west-1.amazonses.com
Priority: 10

Type: TXT
Name: @
Value: "v=spf1 include:amazonses.com ~all"

Type: CNAME
Name: rs-12345._domainkey
Value: rs-12345.dkim.amazonses.com
```

### 3. API-Schlüssel generieren

```bash
# API Key in Vercel hinzufügen
vercel env add RESEND_API_KEY production
# Eingabe: re_xxxxxxxxxxxxxxxxxxxx

vercel env add RESEND_FROM_EMAIL production
# Eingabe: noreply@badezeit.de
```

## 🖼️ ImageKit CDN Setup

### 1. ImageKit-Account erstellen

1. Gehen Sie zu [imagekit.io](https://imagekit.io)
2. Account erstellen
3. URL Endpoint notieren: `https://ik.imagekit.io/your-id/`

### 2. Integration konfigurieren

```bash
# ImageKit Credentials in Vercel
vercel env add NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT production
# Eingabe: https://ik.imagekit.io/your-id/

vercel env add IMAGEKIT_PUBLIC_KEY production
vercel env add IMAGEKIT_PRIVATE_KEY production
```

### 3. Transformations konfigurieren

```typescript
// Beispiel: Responsive Bilder
const imageUrl = `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/restaurant-image.jpg?tr=w-800,h-600,c-maintain_ratio`
```

## 🔐 Clerk Authentication Setup

### 1. Clerk-Projekt erstellen

1. Gehen Sie zu [clerk.dev](https://clerk.dev)
2. Neues Projekt erstellen
3. Domain konfigurieren: `badezeit.de`

### 2. Environment Keys

```bash
# Public Key (Frontend)
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
# Eingabe: pk_live_xxxxxxxxxxxxxxxxxxxx

# Secret Key (Backend)
vercel env add CLERK_SECRET_KEY production
# Eingabe: sk_live_xxxxxxxxxxxxxxxxxxxx

# Sign-in/up URLs
vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL production
# Eingabe: /sign-in

vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL production
# Eingabe: /sign-up
```

### 3. Webhooks konfigurieren

```bash
# Webhook Endpoint: https://badezeit.de/api/webhooks/clerk
# Events: user.created, user.updated, user.deleted
```

## 📊 Monitoring & Analytics

### 1. Vercel Analytics

```bash
# Analytics aktivieren (automatisch in Vercel)
# Keine zusätzliche Konfiguration erforderlich
```

### 2. Error Tracking (Optional)

#### Sentry Integration:
```bash
npm install @sentry/nextjs

# Sentry DSN in Environment Variables
vercel env add SENTRY_DSN production
```

#### Error Boundary:
```typescript
// app/error.tsx
'use client'
import * as Sentry from '@sentry/nextjs'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  Sentry.captureException(error)
  
  return (
    <div>
      <h2>Etwas ist schief gelaufen!</h2>
      <button onClick={reset}>Erneut versuchen</button>
    </div>
  )
}
```

## 🔍 Performance-Optimierung

### 1. Next.js Build Optimierung

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  images: {
    domains: ['ik.imagekit.io'],
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
}

module.exports = nextConfig
```

### 2. Bundle-Analyse

```bash
# Bundle Analyzer installieren
npm install --save-dev @next/bundle-analyzer

# Analyse ausführen
npm run build
npm run analyze
```

### 3. Core Web Vitals

#### Lighthouse CI:
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lhci:
    name: Lighthouse
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Lighthouse CI Action
        uses: treosh/lighthouse-ci-action@v9
        with:
          configPath: '.lighthouserc.json'
```

#### Configuration:
```json
// .lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["https://badezeit.de", "https://badezeit.de/speisekarte"],
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["warn", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.95}]
      }
    }
  }
}
```

## 🚦 CI/CD Pipeline

### 1. GitHub Actions Setup

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run build

  deploy-preview:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    needs: test
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - run: npm ci
      - name: Deploy to Vercel (Preview)
        run: |
          npm i -g vercel
          vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
          vercel build --token=${{ secrets.VERCEL_TOKEN }}
          vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }}

  deploy-production:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    needs: test
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - run: npm ci
      - name: Deploy to Vercel (Production)
        run: |
          npm i -g vercel
          vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
          vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
          vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### 2. Environment Secrets

GitHub Repository → Settings → Secrets and variables → Actions:

```
VERCEL_ORG_ID=team_xxxxxxxxxxxxxxxxxxxx
VERCEL_PROJECT_ID=prj_xxxxxxxxxxxxxxxxxxxx
VERCEL_TOKEN=xxxxxxxxxxxxxxxxxxxx
```

## 🔒 Sicherheit

### 1. Headers konfigurieren

```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ]
      }
    ]
  }
}
```

### 2. GDPR-Compliance

```typescript
// lib/gdpr.ts
export const trackEvent = (eventType: string, data: any) => {
  // Nur tracken wenn Consent gegeben
  const hasConsent = localStorage.getItem('analytics-consent') === 'true'
  
  if (hasConsent) {
    // Analytics Event senden
  }
}
```

## 🧪 Testing in Production

### 1. Smoke Tests

```typescript
// scripts/smoke-test.js
const urls = [
  'https://badezeit.de',
  'https://badezeit.de/ueber-uns',
  'https://badezeit.de/kontakt',
  'https://badezeit.de/speisekarte',
  'https://badezeit.de/galerie',
  'https://badezeit.de/reservierung'
]

for (const url of urls) {
  const response = await fetch(url)
  console.log(`${url}: ${response.status}`)
  if (response.status !== 200) {
    process.exit(1)
  }
}
```

### 2. Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Database connectivity test
    await prisma.$queryRaw`SELECT 1`
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        email: 'configured'
      }
    })
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', error: error.message },
      { status: 500 }
    )
  }
}
```

## 📋 Post-Deployment Checklist

### Sofort nach Deployment:

- [ ] Website lädt korrekt: `https://badezeit.de`
- [ ] SSL-Zertifikat aktiv (grünes Schloss)
- [ ] Alle Seiten erreichbar
- [ ] Kontaktformular funktioniert
- [ ] Bilder laden korrekt
- [ ] Mobile Ansicht optimiert
- [ ] Performance-Score > 90 (Lighthouse)

### Innerhalb 24h:

- [ ] DNS-Propagation vollständig
- [ ] E-Mail-Delivery funktioniert
- [ ] Analytics Daten kommen an
- [ ] Error Tracking aktiv
- [ ] Backup-Strategie verifiziert
- [ ] Monitoring-Alerts konfiguriert

### Regelmäßige Checks:

- [ ] Wöchentlich: Lighthouse Performance
- [ ] Monatlich: Security Updates
- [ ] Quartalsweise: Dependency Updates
- [ ] Jährlich: SSL-Zertifikat Renewal

## 🆘 Troubleshooting

### Build Failures

```bash
# Lokale Build-Umgebung testen
npm run build

# Vercel Build Logs checken
vercel logs [deployment-url]

# Dependencies Cache leeren
rm -rf .next node_modules package-lock.json
npm install
```

### Database Connection Issues

```bash
# Connection testen
npx prisma db push --preview-feature

# Schema synchronisieren
npx prisma generate
npx prisma db push
```

### E-Mail Delivery Problems

```bash
# Resend Domain-Status prüfen
curl -H "Authorization: Bearer $RESEND_API_KEY" \
     https://api.resend.com/domains

# Test-E-Mail senden
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "test@badezeit.de",
    "to": "admin@badezeit.de",
    "subject": "Test",
    "text": "Test message"
  }'
```

## 📞 Support-Kontakte

### Technischer Support:
- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Supabase**: [supabase.com/support](https://supabase.com/support)
- **Clerk**: [clerk.dev/support](https://clerk.dev/support)
- **Resend**: [resend.com/support](https://resend.com/support)

### Notfall-Rollback:
```bash
# Vorherige Deployment-Version wiederherstellen
vercel rollback [deployment-url] --token=$VERCEL_TOKEN
```