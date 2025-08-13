# Wartungshandbuch - Strandrestaurant Badezeit

Dieses Handbuch beschreibt die regelmäßigen Wartungsaufgaben und häufige Änderungen für die Badezeit-Website.

## 🎯 Übersicht

Das Wartungshandbuch richtet sich an:
- **Restaurant-Personal**: Tägliche Inhalts-Updates
- **Entwickler**: Technische Wartung und Updates
- **Administratoren**: System-Monitoring und Backups

## 👥 Benutzerrollen & Zugriffsrechte

### Restaurant-Team (Norbert Mangelsen & Mitarbeiter)
- ✅ Kontaktformular-Nachrichten lesen
- ✅ Reservierungsanfragen bearbeiten
- ❌ Code-Änderungen
- ❌ Datenbankzugriff

### Entwickler/Administrator
- ✅ Vollzugriff auf alle Systeme
- ✅ Code-Deployment
- ✅ Datenbankmanagement
- ✅ Server-Konfiguration

## 📝 Häufige Inhalts-Updates

### 1. Restaurant-Informationen aktualisieren

#### Öffnungszeiten ändern
**Datei**: `/src/app/kontakt/page.tsx`

```typescript
// Zeilen 65-70 - Öffnungszeiten anpassen
hours: {
  regular: language === 'de' ? "Mo-So: 11:00 - 22:00 Uhr" : "Mon-Sun: 11:00 AM - 10:00 PM",
  kitchen: language === 'de' ? "Küche bis 21:30 Uhr" : "Kitchen until 9:30 PM",
  note: language === 'de' ? "Reservierung empfohlen" : "Reservation recommended"
}
```

**Nach der Änderung:**
```bash
git add src/app/kontakt/page.tsx
git commit -m "Update opening hours"
git push origin main
# Automatisches Deployment via Vercel
```

#### Kontaktdaten aktualisieren
**Datei**: `/src/app/kontakt/page.tsx`

```typescript
// Zeilen 54-64 - Kontaktinformationen
kontaktInfo = {
  address: {
    name: "Strandrestaurant Badezeit",
    street: "Dünenstraße 3",
    city: "25980 Westerland/Sylt",
    country: "Deutschland"
  },
  contact: {
    phone: "+49 (0) 4651 834020",  // Hier ändern
    email: "info@badezeit.de",     // Hier ändern
    website: "www.badezeit.de"
  }
}
```

### 2. Über uns Seite aktualisieren

#### Team-Informationen ändern
**Datei**: `/src/app/ueber-uns/page.tsx`

```typescript
// Zeilen 100-133 - Team-Mitglieder bearbeiten
const team = [
  {
    name: "Norbert Mangelsen",
    position: language === 'de' ? "Geschäftsführer & Inhaber" : "Managing Director & Owner",
    bio: language === 'de' 
      ? "Hier neuen Text über Norbert einfügen..."
      : "New English text about Norbert...",
    image: "https://images.unsplash.com/photo-559339352-11d035aa65de"
  }
  // Weitere Team-Mitglieder...
]
```

#### Restaurant-Geschichte aktualisieren
**Datei**: `/src/app/ueber-uns/page.tsx`

```typescript
// Zeilen 52-83 - Geschichte-Sektion
geschichte = {
  de: {
    title: "Ein traditionsreiches Strandrestaurant",
    text: `Hier den neuen Text über die Geschichte einfügen...
    
    Informationen über Norbert Mangelsen und das Restaurant...`,
    timeline: [
      { year: "Seit Jahren", event: "Neuer Event-Text" },
      // Weitere Timeline-Einträge...
    ]
  }
}
```

### 3. Wiedereröffnungs-Status aktualisieren

Wenn das Restaurant 2025 wiedereröffnet:

#### 1. README.md aktualisieren
```markdown
<!-- Diesen Hinweis entfernen: -->
> **WICHTIGER HINWEIS**: Das Strandrestaurant Badezeit ist aufgrund eines Brandes derzeit geschlossen. Die Wiedereröffnung ist für 2025 geplant.

<!-- Und durch diesen ersetzen: -->
> **WIEDERERÖFFNET**: Das Strandrestaurant Badezeit ist wieder geöffnet! Besuchen Sie uns für authentische maritime Küche am Westerland Beach.
```

#### 2. Status-Badges aktualisieren
**Dateien**: 
- `/src/app/ueber-uns/page.tsx` (Zeile 29, 41)
- `/src/app/kontakt/page.tsx` (Zeile 36, 45)

```typescript
// Von:
badge: "🌊 Wiedereröffnung 2025",
// Zu:
badge: "🌊 Jetzt geöffnet",
```

#### 3. Öffnungszeiten aktivieren
**Datei**: `/src/app/kontakt/page.tsx`

Neue Öffnungszeiten eintragen und Reservierungs-Button aktivieren.

## 🖼️ Bilder & Medien verwalten

### ImageKit CDN - Neue Bilder hochladen

1. **ImageKit Dashboard öffnen**: [imagekit.io](https://imagekit.io)
2. **Bilder hochladen**: Drag & Drop oder Upload-Button
3. **URL kopieren**: Für Verwendung in Code
4. **Transformationen konfigurieren**: Automatische Größenanpassung

#### Beispiel: Restaurant-Bild aktualisieren
**Datei**: `/src/app/ueber-uns/page.tsx`

```typescript
// Zeile 220-221 - Hintergrundbild ändern
style={{
  backgroundImage: 'url(https://ik.imagekit.io/insomnialz/neues-bild.webp)'
}}
```

### Galerie-Bilder verwalten (zukünftig über Admin-Panel)

**Aktuell**: Direkt in Code-Dateien
**Geplant**: Admin-Dashboard mit Upload-Funktion

## 📧 E-Mail & Kontaktformular

### Kontaktformular-Nachrichten verwalten

#### E-Mails empfangen
- **Standard-Empfänger**: info@badezeit.de
- **Backup**: Kann in Resend-Dashboard konfiguriert werden

#### E-Mail-Templates anpassen
**Verzeichnis**: `/src/lib/email/templates/`

```typescript
// reservation-confirmation.tsx - Reservierungsbestätigung
export function ReservationConfirmationEmail({ customerName, date, time }) {
  return (
    <Html>
      <Head />
      <Preview>Ihre Reservierung bei Badezeit Sylt</Preview>
      <Body>
        <Container>
          <Text>Liebe/r {customerName},</Text>
          <Text>
            Ihre Reservierung für {date} um {time} wurde bestätigt.
          </Text>
          {/* Template anpassen */}
        </Container>
      </Body>
    </Html>
  )
}
```

### Resend Dashboard

**Zugang**: [resend.com/dashboard](https://resend.com/dashboard)
- E-Mail-Statistiken einsehen
- Delivery-Status prüfen
- Bounce-Behandlung
- Domain-Verifizierung

## 🔧 Technische Wartung

### 1. Abhängigkeiten aktualisieren

#### Wöchentlich: Security Updates
```bash
# Security Updates prüfen
npm audit

# Kritische Updates installieren
npm audit fix

# Spezifische Packages aktualisieren
npm update @clerk/nextjs
npm update next
npm update prisma
```

#### Monatlich: Minor Updates
```bash
# Alle Dependencies prüfen
npm outdated

# Minor Updates installieren
npm update

# Testing nach Updates
npm run build
npm run type-check
npm run lint
```

#### Quartalsweise: Major Updates
```bash
# Major Updates manuell prüfen
npx npm-check-updates

# Selektiv updaten
npx npm-check-updates -u --target minor
npm install

# Vollständige Tests nach Major Updates
npm run build
npm run test  # Wenn Tests vorhanden
```

### 2. Datenbank-Wartung

#### Wöchentlich: Performance Check
```sql
-- Langsame Queries identifizieren
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Index-Nutzung prüfen
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

#### Monatlich: Cleanup
```typescript
// Alte Analytics-Events löschen (älter als 30 Tage)
await prisma.analyticsEvent.deleteMany({
  where: {
    timestamp: {
      lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  }
})

// Abgebrochene Reservierungen löschen (älter als 7 Tage)
await prisma.reservation.deleteMany({
  where: {
    status: 'CANCELLED',
    cancelledAt: {
      lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  }
})
```

### 3. Backup & Recovery

#### Automatische Backups (Supabase)
- **Tägliche Backups**: Automatisch via Supabase
- **Point-in-time Recovery**: 7 Tage Retention
- **Cross-Region Backup**: EU-Compliance

#### Manuelles Backup
```bash
# Datenbank-Backup erstellen
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup auf sicheren Storage hochladen
aws s3 cp backup_*.sql s3://badezeit-backups/
```

#### Recovery-Test (Quartalsweise)
```bash
# Test-Datenbank wiederherstellen
createdb badezeit_recovery_test
psql badezeit_recovery_test < backup_latest.sql

# Schema-Integrität prüfen
npx prisma db pull --schema=./test-schema.prisma
```

## 📊 Monitoring & Performance

### 1. Vercel Analytics überwachen

**Dashboard**: [vercel.com/analytics](https://vercel.com/analytics)

**Wichtige Metriken:**
- **Page Load Speed**: < 2 Sekunden
- **Core Web Vitals**: Alle grün
- **Error Rate**: < 0.1%
- **Uptime**: > 99.9%

### 2. Performance-Alerts

#### Lighthouse CI (automatisch)
```yaml
# .github/workflows/lighthouse.yml
# Läuft bei jedem Deployment
# Alerts bei Performance < 90%
```

#### Custom Monitoring
```typescript
// app/api/health/route.ts
export async function GET() {
  const healthcheck = {
    database: await checkDatabase(),
    email: await checkEmail(),
    cdn: await checkCDN(),
    timestamp: new Date().toISOString()
  }
  
  return Response.json(healthcheck)
}
```

### 3. Error Tracking

#### Vercel Error Tracking
- Automatische Error-Erfassung
- Real-time Alerts bei kritischen Fehlern
- Stack Traces für Debugging

#### Custom Error Handling
```typescript
// Wichtige Formulare mit Error Tracking
try {
  await sendContactForm(data)
} catch (error) {
  // Error loggen
  console.error('Contact form error:', error)
  
  // In Production: Error Tracking Service
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error)
  }
}
```

## 🔒 Sicherheits-Wartung

### 1. SSL-Zertifikate

- **Automatisch**: Vercel managed SSL via Let's Encrypt
- **Überwachung**: SSL Labs Monitoring
- **Alerts**: Automatische Erneuerung 30 Tage vor Ablauf

### 2. Dependency Security

```bash
# Wöchentlicher Security Scan
npm audit

# GitHub Security Alerts beachten
# Dependabot automatische Updates aktiviert
```

### 3. Access Control Review

#### Monatlich: Benutzerrechte prüfen
- Clerk Dashboard: Aktive Benutzer überprüfen
- Vercel Team: Zugriffsrechte validieren
- Supabase: Database-Access logs

#### Quartalsweise: API-Keys rotieren
```bash
# Neue API-Keys generieren
# Alte Keys deaktivieren
# Environment Variables aktualisieren
vercel env rm OLD_API_KEY production
vercel env add NEW_API_KEY production
```

## 📱 SEO & Analytics

### 1. Google Search Console

**Setup**: [search.google.com](https://search.google.com/search-console)
- Domain verifizieren: badezeit.de
- Sitemap übermitteln: badezeit.de/sitemap.xml
- Index-Status überwachen

### 2. Meta-Tags aktualisieren

Bei Inhaltsänderungen Meta-Tags anpassen:

```typescript
// Beispiel: Kontakt-Seite
<Head>
  <title>Kontakt - Badezeit Sylt | Reservierung & Anfahrt</title>
  <meta name="description" content="Aktuelle Beschreibung mit Keywords..." />
  <meta name="keywords" content="Badezeit Sylt, Restaurant Sylt, Westerland..." />
</Head>
```

### 3. Lokale SEO

#### Google My Business
- Öffnungszeiten aktuell halten
- Fotos regelmäßig updaten
- Bewertungen beantworten
- Posts für Events/Specials

#### Schema.org Markup
```typescript
// Restaurant Schema hinzufügen
const restaurantSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "Strandrestaurant Badezeit",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Dünenstraße 3",
    "addressLocality": "Westerland",
    "postalCode": "25980",
    "addressCountry": "DE"
  },
  "telephone": "+49 4651 834020",
  "url": "https://www.badezeit.de",
  "servesCuisine": "Maritime Küche",
  "priceRange": "€€"
}
```

## 📋 Wartungsplan

### Täglich (Restaurant-Team)
- [ ] Kontaktformular-Nachrichten prüfen
- [ ] Reservierungsanfragen bearbeiten
- [ ] Social Media Updates (falls vorhanden)

### Wöchentlich (Entwickler)
- [ ] Security Updates prüfen (`npm audit`)
- [ ] Performance Monitoring checken
- [ ] Backup-Status verifizieren
- [ ] Error Logs reviewen

### Monatlich (Administrator)
- [ ] Dependency Updates (`npm update`)
- [ ] Database Cleanup ausführen
- [ ] SSL-Status prüfen
- [ ] Analytics Review
- [ ] Access Control Review

### Quartalsweise (Entwickler)
- [ ] Major Dependency Updates
- [ ] Recovery-Test durchführen
- [ ] API-Keys rotieren
- [ ] Performance Audit (Lighthouse)
- [ ] Security Audit

### Jährlich (Restaurant + Entwickler)
- [ ] Vollständiger Security Review
- [ ] Hosting-Kosten evaluieren
- [ ] Domain-Renewal
- [ ] Compliance Review (GDPR)
- [ ] Disaster Recovery Test

## 🆘 Notfall-Prozeduren

### Website Down
```bash
# 1. Status prüfen
curl -I https://badezeit.de

# 2. Vercel Status checken
# https://vercel-status.com

# 3. Rollback auf vorherige Version
vercel rollback [previous-deployment-url] --token=$VERCEL_TOKEN

# 4. Health Check ausführen
curl https://badezeit.de/api/health
```

### Database Ausfall
```bash
# 1. Supabase Status prüfen
# https://status.supabase.com

# 2. Connection testen
npx prisma db push --preview-feature

# 3. Falls nötig: Backup wiederherstellen
# Kontakt: Supabase Support
```

### E-Mail Probleme
```bash
# 1. Resend Status prüfen
curl -H "Authorization: Bearer $RESEND_API_KEY" \
     https://api.resend.com/domains

# 2. DNS-Records validieren
dig TXT badezeit.de
dig MX badezeit.de

# 3. Test-E-Mail senden
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from": "test@badezeit.de", "to": "admin@badezeit.de", "subject": "Test", "text": "Test"}'
```

### Kontakt-Information

**Notfall-Kontakt für technische Probleme:**
- **E-Mail**: admin@badezeit.de
- **Telefon**: +49 4651 834020 (Restaurant)

**Service-Provider Support:**
- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Supabase**: [supabase.com/support](https://supabase.com/support)
- **Resend**: [resend.com/support](https://resend.com/support)

## 📚 Weiterführende Dokumentation

- [README.md](./README.md) - Projekt-Übersicht
- [API.md](./API.md) - API-Dokumentation
- [DATABASE.md](./DATABASE.md) - Datenbank-Schema
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment-Guide