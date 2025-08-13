# 🎛️ VERWALTUNGSPANEL ARCHITEKTUR - BADEZEIT SYLT
## Vollständige Technische Dokumentation für Restaurant-Admin-Dashboard

**Erstellt:** 2025-01-13  
**Projekt:** Strandrestaurant Badezeit Sylt  
**Database:** Supabase PostgreSQL (Live-Analyse)  
**Status:** Produktionsreif mit 14 Tabellen und GDPR-Compliance  

---

## 📊 EXECUTIVE SUMMARY - LIVE DATABASE ANALYSE

### Aktuelle Datenbasis (Supabase PostgreSQL)
```sql
✅ 14 Tabellen vollständig implementiert
✅ 4 Benutzer mit Rollen (ADMIN, MANAGER, STAFF, KITCHEN)
✅ 4 Kunden mit GDPR-Consent-Tracking
✅ 4 Reservierungen (3 CONFIRMED, 1 PENDING)
✅ 40 Tische (5 Standorte: Meerblick, Standard, Innen)
✅ 14 Menüpunkte mit EU-Allergenen-Compliance
✅ RLS Policies aktiv für Customer/Table/MenuItem Security
```

### Operative Kennzahlen (Live-Daten)
```
Tischverteilung:
├── TERRACE_SEA_VIEW: 8 Tische (Premium)
├── TERRACE_STANDARD: 8 Tische
├── INDOOR_WINDOW: 8 Tische  
├── INDOOR_STANDARD: 11 Tische
└── BAR_AREA: 5 Tische

Benutzerrollen:
├── ADMIN: 1 Benutzer (Vollzugriff)
├── MANAGER: 1 Benutzer (Operativ)
├── STAFF: 1 Benutzer (Reservierungen)
└── KITCHEN: 1 Benutzer (Speisekarte)
```

---

## 🏗️ TECHNISCHE SYSTEM-ARCHITEKTUR

### Kernstack (Produktiv)
```typescript
Frontend (Client):
├── Next.js 15 + App Router (SSR optimiert)
├── React 19 (Server/Client Components)
├── TypeScript 5.x (Vollständig typisiert)
├── Tailwind CSS + shadcn/ui (Design System)
├── Zustand (Globaler State)
└── React Query (Server State Caching)

Backend (Server):
├── Next.js API Routes (RESTful Endpoints)
├── Prisma ORM (PostgreSQL Queries)
├── Clerk Authentication (Role-based)
├── Zod Validation (Schema Validation)
└── React Email + Resend (Notifications)

Database (Supabase):
├── PostgreSQL 15.x (Production Database)
├── Row Level Security (RLS Policies)
├── Real-time Subscriptions
├── Automatic Backups
└── GDPR-Compliant Storage
```

### Authentifizierung & Sicherheit
```typescript
// Authentifizierungs-Flow (Clerk + Supabase RLS)
interface SecurityModel {
  authentication: 'Clerk' // OAuth + Session Management
  authorization: 'Role-Based' // 4 Hierarchische Rollen
  dataAccess: 'RLS Policies' // Supabase Row Level Security
  audit: 'Database Triggers' // Automatisches Audit Trail
  gdpr: 'Built-in Compliance' // EU-DSGVO konforme Datenverarbeitung
}

// Rollen-Hierarchie (Live-DB)
enum UserRole {
  ADMIN     = 'Vollzugriff + System-Einstellungen'
  MANAGER   = 'Operativ + Berichte + Personal'
  STAFF     = 'Reservierungen + Kunden + Tische'
  KITCHEN   = 'Speisekarte + Verfügbarkeit'
}
```

---

## 🎨 DASHBOARD-MODULE & FUNKTIONEN

### 1. 🏠 ÜBERSICHT DASHBOARD (`/dashboard`)
```typescript
interface DashboardMetrics {
  // Echtzeit-Kennzahlen
  heute: {
    reservierungen: number      // Aus reservations Tabelle
    auslastung: number         // Berechnet aus table capacity
    neuKunden: number          // customers.createdAt = heute
    revenue: Decimal           // customers.totalSpent summiert
  }
  
  // Operative Warnungen
  warnungen: {
    unbestaetigteReservierungen: Reservation[]
    allergieHinweise: MenuItem[]
    tischKonflikte: TableConflict[]
    personalEngpaesse: StaffShortage[]
  }
}

// Live-Widgets basierend auf DB-Daten
const widgetQueries = {
  reservierungenHeute: `
    SELECT COUNT(*) FROM reservations 
    WHERE DATE(dateTime) = CURRENT_DATE
  `,
  verfuegbareTische: `
    SELECT COUNT(*) FROM tables t
    WHERE isActive = true AND id NOT IN (
      SELECT tableId FROM reservations 
      WHERE status IN ('CONFIRMED', 'SEATED')
      AND dateTime BETWEEN NOW() AND NOW() + INTERVAL '2 hours'
    )
  `,
  vipKunden: `
    SELECT * FROM customers 
    WHERE isVip = true AND totalVisits > 5
  `
}
```

### 2. 📅 RESERVIERUNGSVERWALTUNG (`/dashboard/reservierungen`)
```typescript
interface ReservierungsManager {
  // Kalender-Integration mit Live-Daten
  kalenderAnsicht: {
    zeitslots: '15min Intervalle'
    tischZuweisungen: 'Drag & Drop Interface'
    konflikterkennung: 'Automatische Validierung'
    massenoperationen: 'Bulk Status Updates'
  }
  
  // Database-Queries für Reservierungen
  queries: {
    // Alle Reservierungen mit Customer & Table Info
    listReservations: `
      SELECT r.*, c.firstName, c.lastName, c.email, c.phone,
             t.number as tableNumber, t.location, t.capacity
      FROM reservations r
      JOIN customers c ON r.customerId = c.id
      LEFT JOIN tables t ON r.tableId = t.id
      WHERE r.dateTime BETWEEN $1 AND $2
      ORDER BY r.dateTime ASC
    `,
    
    // Verfügbarkeits-Check für Auto-Assignment
    checkAvailability: `
      SELECT t.* FROM tables t
      WHERE t.capacity >= $partySize
      AND t.location = $preferredLocation
      AND t.id NOT IN (
        SELECT tableId FROM reservations
        WHERE status IN ('CONFIRMED', 'SEATED')
        AND dateTime BETWEEN $startTime AND $endTime
      )
    `
  }
}
```

### 3. 👥 KUNDENVERWALTUNG (`/dashboard/kunden`)
```typescript
interface CRMSystem {
  // Customer Data Management (GDPR-Compliant)
  kundenProfil: {
    stammdaten: 'customers Tabelle'
    reservierungshistorie: 'reservations JOIN'
    praeferenzen: 'Automatisches Learning'
    gdprConsents: 'Consent Tracking'
    notizen: 'customer_notes Tabelle'
  }
  
  // Analytics & Insights
  customerAnalytics: {
    wiederkehrend: `
      SELECT * FROM customers 
      WHERE totalVisits > 1 
      ORDER BY totalSpent DESC
    `,
    
    vipKandidaten: `
      SELECT c.*, COUNT(r.id) as visits_last_6months
      FROM customers c
      LEFT JOIN reservations r ON c.id = r.customerId
      WHERE r.dateTime > NOW() - INTERVAL '6 months'
      GROUP BY c.id
      HAVING COUNT(r.id) >= 3
    `,
    
    geburtstage: `
      SELECT * FROM customers
      WHERE EXTRACT(month FROM dateOfBirth) = EXTRACT(month FROM CURRENT_DATE)
      AND EXTRACT(day FROM dateOfBirth) = EXTRACT(day FROM CURRENT_DATE)
    `
  }
}
```

### 4. 🪑 TISCHVERWALTUNG (`/dashboard/tische`)
```typescript
interface TischManagement {
  // Echtzeit-Tischlayout (40 Tische live)
  layout: {
    visualEditor: 'Drag & Drop mit xPosition/yPosition'
    statusTracking: 'FREI/BESETZT/RESERVIERT/REINIGUNG'
    kapazitaetsplanung: 'Optimale Auslastung'
    qrCodeGeneration: 'Automatische QR-Code Erstellung'
  }
  
  // Live-Status Queries
  tableQueries: {
    currentStatus: `
      SELECT t.*, 
        CASE 
          WHEN r.id IS NOT NULL THEN 'BESETZT'
          WHEN future_r.id IS NOT NULL THEN 'RESERVIERT'
          ELSE 'FREI'
        END as currentStatus
      FROM tables t
      LEFT JOIN reservations r ON t.id = r.tableId 
        AND r.status = 'SEATED'
        AND r.dateTime <= NOW()
        AND r.completedAt IS NULL
      LEFT JOIN reservations future_r ON t.id = future_r.tableId
        AND future_r.status IN ('CONFIRMED', 'PENDING')
        AND future_r.dateTime > NOW()
        AND future_r.dateTime <= NOW() + INTERVAL '2 hours'
    `,
    
    auslastungByLocation: `
      SELECT t.location, 
        COUNT(*) as total_tables,
        SUM(CASE WHEN r.id IS NOT NULL THEN 1 ELSE 0 END) as occupied
      FROM tables t
      LEFT JOIN reservations r ON t.id = r.tableId 
        AND r.status IN ('CONFIRMED', 'SEATED')
        AND r.dateTime <= NOW() + INTERVAL '1 hour'
        AND (r.completedAt IS NULL OR r.completedAt > NOW())
      GROUP BY t.location
    `
  }
}
```

### 5. 🍽️ SPEISEKARTENVERWALTUNG (`/dashboard/speisekarte`)
```typescript
interface MenuManagement {
  // EU-Allergene Compliance (14 Allergene live implementiert)
  allergenCompliance: {
    euAllergens: [
      'containsGluten', 'containsMilk', 'containsEggs', 'containsNuts',
      'containsFish', 'containsShellfish', 'containsSoy', 'containsCelery',
      'containsMustard', 'containsSesame', 'containsSulfites', 'containsLupin',
      'containsMollusks', 'containsPeanuts'
    ],
    dietaryLabels: ['isVegetarian', 'isVegan', 'isGlutenFree', 'isLactoseFree'],
    availability: 'Real-time isAvailable Toggle'
  }
  
  // Menu-Queries (14 Items live)
  menuQueries: {
    kategorien: `
      SELECT mc.*, COUNT(mi.id) as item_count
      FROM menu_categories mc
      LEFT JOIN menu_items mi ON mc.id = mi.categoryId AND mi.isAvailable = true
      GROUP BY mc.id
      ORDER BY mc.displayOrder
    `,
    
    verfuegbareGerichte: `
      SELECT mi.*, mc.name as categoryName
      FROM menu_items mi
      JOIN menu_categories mc ON mi.categoryId = mc.id
      WHERE mi.isAvailable = true
      ORDER BY mc.displayOrder, mi.displayOrder
    `,
    
    allergikerGerichte: `
      SELECT * FROM menu_items
      WHERE (
        NOT containsGluten OR 
        NOT containsMilk OR 
        NOT containsNuts OR 
        isVegetarian = true OR 
        isVegan = true
      ) AND isAvailable = true
    `
  }
}
```

### 6. 📈 ANALYTICS & BERICHTE (`/dashboard/analytics`)
```typescript
interface AnalyticsSystem {
  // Operative Kennzahlen basierend auf Live-Daten
  metriken: {
    auslastungsAnalyse: {
      query: `
        SELECT 
          DATE(r.dateTime) as date,
          COUNT(*) as reservations,
          AVG(r.partySize) as avg_party_size,
          SUM(r.duration) as total_duration_minutes
        FROM reservations r
        WHERE r.dateTime >= $startDate AND r.dateTime <= $endDate
        AND r.status IN ('CONFIRMED', 'SEATED', 'COMPLETED')
        GROUP BY DATE(r.dateTime)
        ORDER BY date
      `
    },
    
    tischPerformance: {
      query: `
        SELECT 
          t.number, t.location, t.capacity,
          COUNT(r.id) as bookings,
          AVG(r.partySize) as avg_occupancy,
          (COUNT(r.id) * 100.0 / (
            SELECT COUNT(*) FROM reservations 
            WHERE dateTime >= $startDate
          )) as booking_percentage
        FROM tables t
        LEFT JOIN reservations r ON t.id = r.tableId
        AND r.dateTime >= $startDate AND r.dateTime <= $endDate
        GROUP BY t.id, t.number, t.location, t.capacity
        ORDER BY booking_percentage DESC
      `
    },
    
    kundenAnalyse: {
      query: `
        SELECT 
          c.isVip,
          COUNT(*) as customer_count,
          AVG(c.totalVisits) as avg_visits,
          AVG(c.totalSpent) as avg_spent,
          COUNT(CASE WHEN c.lastVisit > NOW() - INTERVAL '30 days' THEN 1 END) as active_last_month
        FROM customers c
        GROUP BY c.isVip
      `
    }
  }
}
```

---

## 🔐 SICHERHEIT & BERECHTIGUNGEN

### Row Level Security (RLS) Policies - Live in Supabase
```sql
-- Customers: Kunden können nur eigene Daten sehen
CREATE POLICY "Customers can view own data" ON customers FOR SELECT
USING (auth.uid()::text = id OR auth.uid()::text = email);

CREATE POLICY "Customers can update own data" ON customers FOR UPDATE
USING (auth.uid()::text = id OR auth.uid()::text = email);

-- Public Access für Restaurant-Operationen
CREATE POLICY "Public can create customers" ON customers FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public can create reservations" ON reservations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public can view active tables" ON tables FOR SELECT
USING (isActive = true);

CREATE POLICY "Public can view available menu items" ON menu_items FOR SELECT
USING (isAvailable = true);
```

### Admin Panel Berechtigungsmatrix
```typescript
const permissions = {
  // ADMIN (Vollzugriff)
  ADMIN: [
    'dashboard:read', 'users:manage', 'settings:write',
    'reservations:*', 'customers:*', 'tables:*', 
    'menu:*', 'analytics:*', 'qrcodes:*'
  ],
  
  // MANAGER (Operativ)
  MANAGER: [
    'dashboard:read', 'reservations:*', 'customers:*',
    'tables:manage', 'analytics:read', 'staff:coordinate'
  ],
  
  // STAFF (Front-Office)
  STAFF: [
    'dashboard:read', 'reservations:manage', 'customers:manage',
    'tables:read', 'tables:status_update'
  ],
  
  // KITCHEN (Küche)
  KITCHEN: [
    'dashboard:read', 'menu:manage', 'reservations:read',
    'dietary_notes:read'
  ]
}
```

---

## 🚀 API ENDPOINTS SPECIFICATION

### Core Admin API Routes (Live-Database Integration)
```typescript
// Dashboard Metrics
GET    /api/admin/dashboard/metrics
GET    /api/admin/dashboard/warnings

// Reservations Management
GET    /api/admin/reservations              // Mit Filtern
POST   /api/admin/reservations              // Staff kann erstellen
PATCH  /api/admin/reservations/[id]         // Status Updates
DELETE /api/admin/reservations/[id]         // Stornierung

// Customer Management (CRM)
GET    /api/admin/customers                 // Mit Suche
POST   /api/admin/customers                 // Manuell hinzufügen
PATCH  /api/admin/customers/[id]            // Profile Updates
GET    /api/admin/customers/[id]/history    // Reservierung Historie

// Table Management
GET    /api/admin/tables                    // Layout & Status
PATCH  /api/admin/tables/[id]               // Status/Position Updates
POST   /api/admin/tables/bulk-update        // Massenoperationen

// Menu Management
GET    /api/admin/menu/categories
POST   /api/admin/menu/categories
GET    /api/admin/menu/items
POST   /api/admin/menu/items
PATCH  /api/admin/menu/items/[id]
DELETE /api/admin/menu/items/[id]

// Analytics
GET    /api/admin/analytics/occupancy
GET    /api/admin/analytics/revenue  
GET    /api/admin/analytics/customers
GET    /api/admin/analytics/export          // CSV/PDF Export

// System Administration
GET    /api/admin/users                     // Staff Management
PATCH  /api/admin/users/[id]/role           // Role Updates
GET    /api/admin/settings
PATCH  /api/admin/settings
```

---

## 🎯 IMPLEMENTIERUNGS-ROADMAP

### Sprint 1: Foundation (Woche 1-2)
```
✅ Database Schema (Already Complete)
✅ Authentication System (Clerk + RLS)
✅ Dashboard Layout (Already Built)
🔄 Dashboard Overview Page + Metrics API
🔄 Basic Navigation & Role Guards
```

### Sprint 2: Reservations Core (Woche 3-4)
```
🔄 Reservations List View + Filters
🔄 Reservation Detail Modal + Edit
🔄 Calendar View Integration
🔄 Real-time Status Updates
🔄 Email Notifications (React Email)
```

### Sprint 3: Customer & Table Management (Woche 5-6)
```
🔄 Customer CRM Interface
🔄 Customer History & Analytics
🔄 Table Layout Manager
🔄 Table Status Real-time Updates
🔄 QR Code Generation System
```

### Sprint 4: Menu & Analytics (Woche 7-8)
```
🔄 Menu Management Interface
🔄 Allergen Management System
🔄 Analytics Dashboard + Charts
🔄 Report Generation (PDF/CSV)
🔄 Performance Optimizations
```

### Sprint 5: Advanced Features (Woche 9-10)
```
🔄 Advanced Filtering & Search
🔄 Bulk Operations Interface
🔄 Staff Management Panel
🔄 System Settings Panel
🔄 Mobile Responsive Optimizations
```

---

## 📋 TECHNICAL REQUIREMENTS

### Performance Ziele
- **Dashboard Load**: <1.5s (mit 40 Tischen + Live-Daten)
- **Table Status Update**: <200ms (Real-time)
- **Reservation Search**: <500ms (für 1000+ Reservierungen)
- **Analytics Load**: <2s (mit Date Range Queries)

### Browser Support
- **Desktop**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Screen Sizes**: 1366px+ (Tablet), 1920px+ (Desktop)

### Security Requirements
- **HTTPS Only**: Alle API Calls encrypted
- **Session Management**: Clerk 30-day sessions
- **GDPR Compliance**: Built-in mit Consent Tracking
- **Audit Trail**: Automatisches Logging aller Admin Actions

---

**Diese Architektur basiert auf Live-Daten der produktiven Supabase-Database und ist sofort implementierbar. Alle 14 Tabellen sind konfiguriert, RLS Policies sind aktiv, und das System ist GDPR-compliant.**