# Datenbank-Dokumentation - Strandrestaurant Badezeit

Diese Dokumentation beschreibt das umfassende Datenbankschema für das Restaurantmanagement-System.

## 🏗️ Architektur

### Technischer Stack
- **Datenbank**: PostgreSQL 14+
- **ORM**: Prisma 6.14.0
- **Hosting**: Supabase
- **Connection Pooling**: Supabase Pooler
- **Backup**: Automatische tägliche Backups via Supabase

### Schema-Übersicht

```mermaid
graph TB
    User --> Reservation
    User --> MenuItem
    User --> CustomerNote
    
    Customer --> Reservation
    Customer --> CustomerNote
    Customer --> NewsletterSubscription
    
    Table --> Reservation
    Table --> QRCode
    
    MenuCategory --> MenuItem
    
    QRCode --> QRScanEvent
```

## 📋 Datenmodelle

### User Management

#### User Model
```prisma
model User {
  id              String   @id @default(cuid())
  clerkId         String   @unique
  email           String   @unique
  firstName       String?
  lastName        String?
  role            UserRole @default(STAFF)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Beziehungen
  reservationsCreated Reservation[] @relation("CreatedBy")
  reservationsUpdated Reservation[] @relation("UpdatedBy")
  menuItemsCreated    MenuItem[]    @relation("CreatedBy")
  customerNotes       CustomerNote[]
}
```

**Benutzerrollen:**
```prisma
enum UserRole {
  ADMIN     // Vollzugriff, Systemkonfiguration
  MANAGER   // Betriebsleitung, Berichte
  STAFF     // Service, Reservierungen
  KITCHEN   // Küche, Menüverwaltung
}
```

#### Verwendungszweck:
- Mitarbeiterverwaltung mit Clerk Integration
- Rollenbasierte Zugriffskontrolle
- Audit-Trail für Änderungen

### Customer Management (CRM)

#### Customer Model
```prisma
model Customer {
  id                    String    @id @default(cuid())
  firstName             String
  lastName              String
  email                 String    @unique
  phone                 String?
  language              Language  @default(DE)
  dateOfBirth           DateTime?
  
  // Präferenzen
  preferredTime         String?
  preferredLocation     TableLocation?
  dietaryRestrictions   String[]
  allergies             String?
  favoriteDisheIds      String[]
  
  // GDPR-Compliance
  emailConsent          Boolean   @default(false)
  smsConsent            Boolean   @default(false)
  marketingConsent      Boolean   @default(false)
  dataProcessingConsent Boolean   @default(true)
  consentDate           DateTime?
  
  // Statistiken
  totalVisits           Int       @default(0)
  totalSpent            Decimal   @default(0)
  averagePartySize      Int       @default(2)
  lastVisit             DateTime?
  isVip                 Boolean   @default(false)
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

#### Verwendungszweck:
- Umfassendes Kundenprofil
- GDPR-konforme Einverständnisverwaltung
- Personalisierte Empfehlungen
- Kundenbindungsanalyse

### Tischmanagement

#### Table Model
```prisma
model Table {
  id           String        @id @default(cuid())
  number       Int           @unique
  capacity     Int
  location     TableLocation
  isActive     Boolean       @default(true)
  description  String?
  
  // Layout für visuelle Darstellung
  xPosition    Float?
  yPosition    Float?
  shape        TableShape    @default(RECTANGLE)
  
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}
```

**Tischstandorte:**
```prisma
enum TableLocation {
  TERRACE_SEA_VIEW    // Terrasse mit Meerblick (Premium)
  TERRACE_STANDARD    // Standard Terrasse
  INDOOR_WINDOW       // Innenbereich am Fenster
  INDOOR_STANDARD     // Standard Innenbereich
  BAR_AREA           // Barbereich
}
```

#### Verwendungszweck:
- Dynamische Tischbelegung
- Visuelle Restaurantlayout-Darstellung
- QR-Code-Integration pro Tisch

### Reservierungsmanagement

#### Reservation Model
```prisma
model Reservation {
  id                String            @id @default(cuid())
  customerId        String
  tableId           String?
  
  // Reservierungsdetails
  dateTime          DateTime
  partySize         Int
  duration          Int               @default(120) // Minuten
  status            ReservationStatus @default(PENDING)
  
  // Kundenwünsche
  specialRequests   String?
  occasion          String?           // Geburtstag, Geschäft, etc.
  dietaryNotes      String?
  
  // Workflow-Management
  isConfirmed       Boolean           @default(false)
  confirmationSentAt DateTime?
  reminderSentAt    DateTime?
  checkedInAt       DateTime?
  completedAt       DateTime?
  cancelledAt       DateTime?
  cancellationReason String?
  
  // Metadaten
  source            ReservationSource @default(WEBSITE)
  notes             String?
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  createdById       String
  updatedById       String?
}
```

**Reservierungsstatus:**
```prisma
enum ReservationStatus {
  PENDING     // Neue Reservierung
  CONFIRMED   // Bestätigt
  SEATED      // Gast ist da
  COMPLETED   // Abgeschlossen
  CANCELLED   // Storniert
  NO_SHOW     // Nicht erschienen
}
```

#### Verwendungszweck:
- Vollständiger Reservierungs-Lifecycle
- Automatisierte E-Mail-Workflows
- Kapazitätsplanung
- No-Show-Tracking

### Menüverwaltung

#### MenuCategory Model
```prisma
model MenuCategory {
  id                String     @id @default(cuid())
  name              String
  nameEn            String?
  description       String?
  descriptionEn     String?
  displayOrder      Int        @default(0)
  isActive          Boolean    @default(true)
  icon              String?
  
  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt
  
  menuItems         MenuItem[]
}
```

#### MenuItem Model
```prisma
model MenuItem {
  id                String       @id @default(cuid())
  categoryId        String
  
  // Grundinformationen
  name              String
  nameEn            String?
  description       String
  descriptionEn     String?
  price             Decimal      @db.Decimal(10,2)
  
  // Verfügbarkeit
  isAvailable       Boolean      @default(true)
  isSignature       Boolean      @default(false)
  isNew             Boolean      @default(false)
  isSeasonalSpecial Boolean      @default(false)
  availableFrom     DateTime?
  availableTo       DateTime?
  
  // EU-Allergenkennzeichnung (14 Hauptallergene)
  containsGluten    Boolean      @default(false)
  containsMilk      Boolean      @default(false)
  containsEggs      Boolean      @default(false)
  containsNuts      Boolean      @default(false)
  containsFish      Boolean      @default(false)
  containsShellfish Boolean      @default(false)
  containsSoy       Boolean      @default(false)
  containsCelery    Boolean      @default(false)
  containsMustard   Boolean      @default(false)
  containsSesame    Boolean      @default(false)
  containsSulfites  Boolean      @default(false)
  containsLupin     Boolean      @default(false)
  containsMollusks  Boolean      @default(false)
  containsPeanuts   Boolean      @default(false)
  
  // Ernährungsformen
  isVegetarian      Boolean      @default(false)
  isVegan           Boolean      @default(false)
  isGlutenFree      Boolean      @default(false)
  isLactoseFree     Boolean      @default(false)
  
  displayOrder      Int          @default(0)
  images            String[]     // URLs zu Bildern
  
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
  createdById       String
}
```

#### Verwendungszweck:
- Vollständige Speisekartenverwaltung
- EU-konforme Allergenkennzeichnung
- Mehrsprachige Unterstützung
- Saisonale Anpassungen

### QR-Code-System

#### QRCode Model
```prisma
model QRCode {
  id            String    @id @default(cuid())
  tableId       String
  code          String    @unique
  isActive      Boolean   @default(true)
  scansCount    Int       @default(0)
  lastScannedAt DateTime?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  table         Table     @relation(fields: [tableId], references: [id])
  scanEvents    QRScanEvent[]
}
```

#### QRScanEvent Model
```prisma
model QRScanEvent {
  id        String   @id @default(cuid())
  qrCodeId  String
  ipAddress String?
  userAgent String?
  scannedAt DateTime @default(now())
  
  qrCode    QRCode   @relation(fields: [qrCodeId], references: [id])
}
```

#### Verwendungszweck:
- Kontaktlose Speisekarten
- Tisch-spezifische QR-Codes
- Usage-Analytics
- Touch-free Ordering (geplant)

### Content Management

#### PageContent Model
```prisma
model PageContent {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  titleEn     String?
  content     String   // Rich Text Content
  contentEn   String?
  metaTitle   String?
  metaDescription String?
  isPublished Boolean  @default(false)
  publishedAt DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### GalleryImage Model
```prisma
model GalleryImage {
  id          String        @id @default(cuid())
  title       String
  titleEn     String?
  description String?
  descriptionEn String?
  imageUrl    String
  category    GalleryCategory
  isActive    Boolean       @default(true)
  displayOrder Int          @default(0)
  
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}
```

### Analytics & Compliance

#### AnalyticsEvent Model
```prisma
model AnalyticsEvent {
  id          String             @id @default(cuid())
  eventType   AnalyticsEventType
  eventData   Json               // Flexible JSON-Daten
  sessionId   String?
  ipAddress   String?
  userAgent   String?
  timestamp   DateTime           @default(now())
}
```

#### SystemSetting Model
```prisma
model SystemSetting {
  id          String   @id @default(cuid())
  key         String   @unique
  value       String
  description String?
  updatedAt   DateTime @updatedAt
}
```

## 🔧 Prisma-Befehle

### Schema-Management
```bash
# Schema-Änderungen anwenden
npx prisma db push

# Migration erstellen
npx prisma migrate dev --name migration_name

# Produktions-Migration
npx prisma migrate deploy

# Schema zurücksetzen (Development only!)
npx prisma migrate reset
```

### Client-Generation
```bash
# Prisma Client generieren
npx prisma generate

# Nach Schema-Änderungen
npm run db:generate
```

### Datenbank-Tools
```bash
# Prisma Studio öffnen
npx prisma studio

# Seed-Daten laden
npx prisma db seed

# Schema visualisieren
npx prisma-erd-generator
```

## 📊 Performance & Optimierung

### Indizierung

**Wichtige Indices:**
```sql
-- Reservierungsabfragen
CREATE INDEX idx_reservations_datetime ON reservations(dateTime);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_customer ON reservations(customerId);

-- Kundensuche
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);

-- Menüabfragen
CREATE INDEX idx_menu_items_category ON menu_items(categoryId);
CREATE INDEX idx_menu_items_available ON menu_items(isAvailable);

-- Analytics
CREATE INDEX idx_analytics_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_analytics_type ON analytics_events(eventType);
```

### Query-Optimierung

**Effiziente Reservierungsabfrage:**
```typescript
// Reservierungen für einen bestimmten Tag mit Related Data
const reservations = await prisma.reservation.findMany({
  where: {
    dateTime: {
      gte: startOfDay,
      lt: endOfDay
    },
    status: {
      in: ['CONFIRMED', 'SEATED']
    }
  },
  include: {
    customer: {
      select: {
        firstName: true,
        lastName: true,
        phone: true,
        email: true
      }
    },
    table: {
      select: {
        number: true,
        location: true
      }
    }
  },
  orderBy: {
    dateTime: 'asc'
  }
})
```

## 🔒 Sicherheit & GDPR

### Row Level Security (RLS)

**Supabase RLS Policies:**
```sql
-- Kunden können nur ihre eigenen Daten sehen
CREATE POLICY "Customers can view own data" ON customers
  FOR SELECT USING (auth.email() = email);

-- Nur authentifizierte Benutzer können Reservierungen erstellen
CREATE POLICY "Authenticated users can create reservations" ON reservations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Nur Staff kann alle Reservierungen sehen
CREATE POLICY "Staff can view all reservations" ON reservations
  FOR SELECT USING (auth.jwt() ->> 'role' IN ('STAFF', 'MANAGER', 'ADMIN'));
```

### Datenminimierung

**GDPR-konforme Datenrettention:**
```typescript
// Automatische Löschung alter Analytics-Events
const cleanupOldAnalytics = async () => {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  await prisma.analyticsEvent.deleteMany({
    where: {
      timestamp: {
        lt: thirtyDaysAgo
      },
      eventType: {
        in: ['PAGE_VIEW', 'QR_CODE_SCANNED']
      }
    }
  })
}
```

## 🧪 Testing & Seeds

### Seed-Daten

**Beispiel-Seed:**
```typescript
// prisma/seed.ts
const seedRestaurantData = async () => {
  // Tische erstellen
  const tables = await Promise.all([
    prisma.table.create({
      data: {
        number: 1,
        capacity: 4,
        location: 'TERRACE_SEA_VIEW',
        xPosition: 10,
        yPosition: 10
      }
    }),
    // ... weitere Tische
  ])
  
  // Menükategorien
  const categories = await Promise.all([
    prisma.menuCategory.create({
      data: {
        name: 'Vorspeisen',
        nameEn: 'Appetizers',
        displayOrder: 1
      }
    }),
    // ... weitere Kategorien
  ])
}
```

## 📝 Migration-Strategien

### Schema-Evolution

1. **Additive Änderungen** (sicher):
   - Neue optionale Felder
   - Neue Tabellen
   - Neue Indizes

2. **Breaking Changes** (Vorsicht):
   - Feld-Umbenennung
   - Datentyp-Änderung
   - Constraint-Änderung

### Backup-Strategien

```bash
# Manuelles Backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Automatisierte tägliche Backups via Supabase
# - Point-in-time recovery
# - Automated daily backups
# - Cross-region replication
```

## 🚀 Deployment

### Produktions-Checklist

- [ ] Alle Migrations angewandt
- [ ] Prisma Client generiert
- [ ] Umgebungsvariablen gesetzt
- [ ] Connection Pooling konfiguriert
- [ ] RLS Policies aktiviert
- [ ] Monitoring eingerichtet
- [ ] Backup-Strategie implementiert

### Environment-spezifische Konfiguration

```env
# Development
DATABASE_URL="postgresql://postgres:password@localhost:5432/badezeit_dev"

# Staging
DATABASE_URL="postgresql://user:pass@staging-db.supabase.co:5432/postgres"

# Production
DATABASE_URL="postgresql://user:pass@prod-db.supabase.co:5432/postgres"
```