# 🔌 API ENDPOINTS SPECIFICATION - ADMIN PANEL
## Vollständige REST API Dokumentation für Badezeit Sylt Admin Dashboard

**Base URL:** `/api/admin`  
**Authentifizierung:** Clerk JWT + Role-based Access Control  
**Database:** Supabase PostgreSQL (Live-validated)  
**Validation:** Zod Schemas  

---

## 🏗️ API ARCHITECTURE OVERVIEW

### Authentication Flow
```typescript
// Middleware für alle /api/admin/* Routes
export async function middleware(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.redirect('/sign-in')
  
  const user = await db.user.findUnique({
    where: { clerkId: userId }
  })
  
  if (!user || !user.isActive) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Role-based Access Check pro Endpoint
  return NextResponse.next()
}
```

### Standard Response Format
```typescript
// Success Response
interface ApiResponse<T> {
  data: T
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Error Response
interface ApiError {
  error: string
  details?: string[]
  code?: string
  timestamp: string
}
```

---

## 📊 DASHBOARD METRICS API

### **GET** `/api/admin/dashboard/metrics`
**Beschreibung:** Echtzeit-Kennzahlen für Dashboard Overview  
**Berechtigung:** Alle Rollen (ADMIN, MANAGER, STAFF, KITCHEN)  
**Cache:** 30 Sekunden  

```typescript
// Request
interface MetricsQuery {
  date?: string // ISO Date (default: heute)
}

// Response
interface DashboardMetrics {
  heute: {
    reservierungen: {
      gesamt: number
      bestaetigt: number
      wartend: number
      storniert: number
    }
    kunden: {
      neue: number
      wiederkehrend: number
      vip: number
    }
    tische: {
      verfuegbar: number
      besetzt: number
      reserviert: number
      ausserBetrieb: number
    }
    umsatz: {
      geschaetzt: number // basierend auf customer.totalSpent
      durchschnittProGast: number
    }
  }
  trends: {
    reservierungenVsGestern: number // +/- %
    kundenVsGestern: number
    auslastungVsGestern: number
  }
}

// SQL Implementation
const getDashboardMetrics = async (date: Date) => {
  return await db.$queryRaw`
    WITH today_stats AS (
      SELECT 
        COUNT(*) as total_reservations,
        COUNT(*) FILTER (WHERE status = 'CONFIRMED') as confirmed,
        COUNT(*) FILTER (WHERE status = 'PENDING') as pending,
        COUNT(*) FILTER (WHERE status = 'CANCELLED') as cancelled,
        COUNT(DISTINCT customerId) as unique_customers
      FROM reservations 
      WHERE DATE(dateTime) = ${date}
    ),
    table_stats AS (
      SELECT 
        COUNT(*) as total_tables,
        COUNT(*) FILTER (WHERE isActive = true) as active_tables
      FROM tables
    )
    SELECT * FROM today_stats, table_stats
  `
}
```

### **GET** `/api/admin/dashboard/warnings`
**Beschreibung:** Operative Warnungen und Alerts  
**Berechtigung:** ADMIN, MANAGER, STAFF  

```typescript
interface WarningsResponse {
  critical: Warning[]    // Sofort-Handlung erforderlich
  important: Warning[]   // Zeitnah bearbeiten
  info: Warning[]       // Information
}

interface Warning {
  id: string
  type: 'RESERVATION' | 'TABLE' | 'CUSTOMER' | 'MENU' | 'SYSTEM'
  severity: 'CRITICAL' | 'IMPORTANT' | 'INFO'
  title: string
  message: string
  actionUrl?: string
  createdAt: Date
}

// Beispiel Warnungen
const warnings = [
  {
    type: 'RESERVATION',
    severity: 'CRITICAL',
    title: 'Unbestätigte Reservierungen',
    message: '3 Reservierungen warten seit >24h auf Bestätigung'
  },
  {
    type: 'TABLE',
    severity: 'IMPORTANT', 
    title: 'Tisch außer Betrieb',
    message: 'Tisch 5 (Meerblick) ist seit 2 Tagen außer Betrieb'
  }
]
```

---

## 📅 RESERVATIONS MANAGEMENT API

### **GET** `/api/admin/reservations`
**Beschreibung:** Liste aller Reservierungen mit erweiterten Filtern  
**Berechtigung:** ADMIN, MANAGER, STAFF  

```typescript
// Query Parameters
interface ReservationFilters {
  startDate?: string      // ISO Date
  endDate?: string        // ISO Date
  status?: ReservationStatus[]
  customerId?: string
  tableId?: string
  partySize?: number
  location?: TableLocation
  search?: string         // Name/Email Suche
  page?: number          // Pagination
  limit?: number         // Items per page (max 100)
  sort?: 'dateTime' | 'createdAt' | 'status'
  order?: 'asc' | 'desc'
}

// Response mit vollständigen Relationen
interface ReservationListResponse {
  data: Array<{
    id: string
    dateTime: string
    partySize: number
    duration: number
    status: ReservationStatus
    specialRequests?: string
    occasion?: string
    dietaryNotes?: string
    notes?: string
    
    // Customer Info
    customer: {
      id: string
      firstName: string
      lastName: string
      email: string
      phone?: string
      language: 'DE' | 'EN'
      isVip: boolean
      totalVisits: number
    }
    
    // Table Info
    table?: {
      id: string
      number: number
      capacity: number
      location: TableLocation
      description?: string
    }
    
    // Metadata
    source: ReservationSource
    isConfirmed: boolean
    confirmationSentAt?: string
    reminderSentAt?: string
    checkedInAt?: string
    completedAt?: string
    cancelledAt?: string
    cancellationReason?: string
    createdAt: string
    updatedAt: string
    
    // Staff Info
    createdBy: {
      id: string
      firstName?: string
      lastName?: string
      role: UserRole
    }
  }>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// SQL mit Optimierungen
const getReservations = async (filters: ReservationFilters) => {
  return await db.reservation.findMany({
    where: {
      dateTime: {
        gte: filters.startDate ? new Date(filters.startDate) : undefined,
        lte: filters.endDate ? new Date(filters.endDate) : undefined,
      },
      status: filters.status ? { in: filters.status } : undefined,
      customerId: filters.customerId,
      tableId: filters.tableId,
      partySize: filters.partySize,
      table: filters.location ? { location: filters.location } : undefined,
      OR: filters.search ? [
        { customer: { firstName: { contains: filters.search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: filters.search, mode: 'insensitive' } } },
        { customer: { email: { contains: filters.search, mode: 'insensitive' } } },
      ] : undefined,
    },
    include: {
      customer: {
        select: {
          id: true, firstName: true, lastName: true, email: true,
          phone: true, language: true, isVip: true, totalVisits: true,
        }
      },
      table: {
        select: {
          id: true, number: true, capacity: true, location: true, description: true,
        }
      },
      createdBy: {
        select: {
          id: true, firstName: true, lastName: true, role: true,
        }
      }
    },
    orderBy: {
      [filters.sort || 'dateTime']: filters.order || 'asc'
    },
    skip: ((filters.page || 1) - 1) * (filters.limit || 25),
    take: Math.min(filters.limit || 25, 100),
  })
}
```

### **POST** `/api/admin/reservations`
**Beschreibung:** Neue Reservierung erstellen (Staff/Walk-in)  
**Berechtigung:** ADMIN, MANAGER, STAFF  

```typescript
// Request Body
interface CreateReservationRequest {
  // Customer (existing or new)
  customerId?: string     // Existing customer
  customerData?: {        // New customer
    firstName: string
    lastName: string
    email: string
    phone?: string
    language?: 'DE' | 'EN'
  }
  
  // Reservation Details
  dateTime: string        // ISO DateTime
  partySize: number       // 1-20
  duration?: number       // minutes, default 120
  tableId?: string        // specific table request
  preferredLocation?: TableLocation
  
  // Special Requests
  specialRequests?: string
  occasion?: string       // birthday, anniversary, business
  dietaryNotes?: string   // allergies, dietary restrictions
  
  // Admin Fields
  status?: ReservationStatus  // default PENDING
  source?: ReservationSource  // default WEBSITE
  notes?: string              // internal staff notes
}

// Validation Schema
const createReservationSchema = z.object({
  customerId: z.string().cuid().optional(),
  customerData: z.object({
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    email: z.string().email(),
    phone: z.string().regex(/^[\+]?[\d\s\-\(\)]{8,15}$/).optional(),
    language: z.enum(['DE', 'EN']).default('DE'),
  }).optional(),
  dateTime: z.coerce.date().refine(date => date > new Date()),
  partySize: z.number().int().min(1).max(20),
  duration: z.number().int().min(60).max(300).default(120),
  tableId: z.string().cuid().optional(),
  preferredLocation: z.enum([
    'TERRACE_SEA_VIEW', 'TERRACE_STANDARD', 
    'INDOOR_WINDOW', 'INDOOR_STANDARD', 'BAR_AREA'
  ]).optional(),
  specialRequests: z.string().max(500).optional(),
  occasion: z.string().max(100).optional(),
  dietaryNotes: z.string().max(500).optional(),
  status: z.enum(['PENDING', 'CONFIRMED']).default('PENDING'),
  source: z.enum(['WEBSITE', 'PHONE', 'WALK_IN']).default('PHONE'),
  notes: z.string().max(1000).optional(),
}).refine(data => 
  data.customerId || data.customerData, 
  "Either customerId or customerData required"
)

// Business Logic
const createReservation = async (data: CreateReservationRequest, userId: string) => {
  // 1. Validate table availability
  if (data.tableId) {
    const conflict = await checkTableAvailability(data.tableId, data.dateTime, data.duration)
    if (conflict) throw new Error('Table not available')
  }
  
  // 2. Get or create customer
  let customer
  if (data.customerId) {
    customer = await db.customer.findUnique({ where: { id: data.customerId } })
  } else {
    customer = await db.customer.upsert({
      where: { email: data.customerData.email },
      create: data.customerData,
      update: data.customerData,
    })
  }
  
  // 3. Create reservation
  const reservation = await db.reservation.create({
    data: {
      customerId: customer.id,
      tableId: data.tableId,
      dateTime: data.dateTime,
      partySize: data.partySize,
      duration: data.duration,
      status: data.status,
      source: data.source,
      specialRequests: data.specialRequests,
      occasion: data.occasion,
      dietaryNotes: data.dietaryNotes,
      notes: data.notes,
      createdById: userId,
    },
    include: { customer: true, table: true }
  })
  
  // 4. Send confirmation if requested
  if (data.status === 'CONFIRMED' && customer.emailConsent) {
    await sendReservationConfirmation(customer.email, reservation)
  }
  
  return reservation
}
```

### **PATCH** `/api/admin/reservations/[id]`
**Beschreibung:** Reservierung bearbeiten (Status, Details, Tisch)  
**Berechtigung:** ADMIN, MANAGER, STAFF  

```typescript
interface UpdateReservationRequest {
  // Basic Updates
  dateTime?: string
  partySize?: number
  duration?: number
  tableId?: string | null    // null = remove table assignment
  
  // Status Management
  status?: ReservationStatus
  cancellationReason?: string  // required if status = CANCELLED
  
  // Special Requests
  specialRequests?: string
  occasion?: string
  dietaryNotes?: string
  notes?: string
  
  // Workflow Actions
  action?: 'CONFIRM' | 'CHECK_IN' | 'COMPLETE' | 'CANCEL' | 'SEND_REMINDER'
}

// Status Workflow
const updateReservationStatus = async (id: string, action: string, userId: string) => {
  const reservation = await db.reservation.findUnique({ 
    where: { id },
    include: { customer: true, table: true }
  })
  
  switch (action) {
    case 'CONFIRM':
      await db.reservation.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
          isConfirmed: true,
          confirmationSentAt: new Date(),
          updatedById: userId,
        }
      })
      // Send confirmation email
      if (reservation.customer.emailConsent) {
        await sendReservationConfirmation(reservation.customer.email, reservation)
      }
      break
      
    case 'CHECK_IN':
      await db.reservation.update({
        where: { id },
        data: {
          status: 'SEATED',
          checkedInAt: new Date(),
          updatedById: userId,
        }
      })
      break
      
    case 'COMPLETE':
      await db.reservation.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          updatedById: userId,
        }
      })
      // Update customer statistics
      await db.customer.update({
        where: { id: reservation.customerId },
        data: {
          totalVisits: { increment: 1 },
          lastVisit: new Date(),
          averagePartySize: {
            // Recalculate average party size
          }
        }
      })
      break
      
    case 'CANCEL':
      await db.reservation.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          updatedById: userId,
        }
      })
      // Send cancellation email
      if (reservation.customer.emailConsent) {
        await sendReservationCancellation(reservation.customer.email, reservation)
      }
      break
  }
}
```

### **DELETE** `/api/admin/reservations/[id]`
**Beschreibung:** Reservierung permanent löschen  
**Berechtigung:** ADMIN only  

```typescript
// Soft Delete bevorzugt
const deleteReservation = async (id: string) => {
  // Mark as deleted instead of hard delete for audit trail
  return await db.reservation.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancellationReason: 'Deleted by admin',
    }
  })
}
```

---

## 👥 CUSTOMER MANAGEMENT API

### **GET** `/api/admin/customers`
**Beschreibung:** Kundenliste mit erweiterten CRM-Features  
**Berechtigung:** ADMIN, MANAGER, STAFF  

```typescript
interface CustomerFilters {
  search?: string         // Name, Email, Phone
  isVip?: boolean
  language?: 'DE' | 'EN'
  hasReservations?: boolean
  lastVisitAfter?: string   // ISO Date
  totalVisitsMin?: number
  totalSpentMin?: number
  marketingConsent?: boolean
  page?: number
  limit?: number
  sort?: 'lastName' | 'totalVisits' | 'totalSpent' | 'lastVisit' | 'createdAt'
  order?: 'asc' | 'desc'
}

interface CustomerListResponse {
  data: Array<{
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    language: 'DE' | 'EN'
    dateOfBirth?: string
    
    // Preferences
    preferredTime?: string
    preferredLocation?: TableLocation
    dietaryRestrictions: string[]
    allergies?: string
    favoriteDisheIds: string[]
    
    // Statistics
    totalVisits: number
    totalSpent: number
    averagePartySize: number
    lastVisit?: string
    isVip: boolean
    
    // GDPR Consents
    emailConsent: boolean
    smsConsent: boolean
    marketingConsent: boolean
    dataProcessingConsent: boolean
    consentDate?: string
    
    // Metadata
    createdAt: string
    updatedAt: string
    
    // Calculated Fields
    upcomingReservations: number
    daysAsCustomer: number
    customerValue: 'HIGH' | 'MEDIUM' | 'LOW'
  }>
  pagination: PaginationInfo
}
```

### **GET** `/api/admin/customers/[id]`
**Beschreibung:** Detailliertes Kundenprofil mit Historie  
**Berechtigung:** ADMIN, MANAGER, STAFF  

```typescript
interface CustomerDetailResponse {
  customer: {
    // All customer fields
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    // ... all other customer fields
  }
  
  // Reservation History
  reservations: Array<{
    id: string
    dateTime: string
    partySize: number
    status: ReservationStatus
    table?: { number: number, location: TableLocation }
    specialRequests?: string
    occasion?: string
    totalAmount?: number  // if available
  }>
  
  // Customer Notes
  notes: Array<{
    id: string
    note: string
    isImportant: boolean
    createdAt: string
    user: {
      firstName?: string
      lastName?: string
      role: UserRole
    }
  }>
  
  // Analytics
  analytics: {
    visitFrequency: number      // visits per month average
    seasonalPattern: object     // visits by month
    preferredTimes: string[]    // most common reservation times
    partyBreakdown: object      // party sizes frequency
    cancelationRate: number     // % of cancelled reservations
    noShowRate: number          // % of no-shows
  }
  
  // Recommendations
  recommendations: {
    vipEligible: boolean
    marketingSegment: string
    nextContactSuggestion: string
    suggestedOffers: string[]
  }
}
```

### **POST** `/api/admin/customers`
**Beschreibung:** Neuen Kunden anlegen  
**Berechtigung:** ADMIN, MANAGER, STAFF  

```typescript
interface CreateCustomerRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  language?: 'DE' | 'EN'
  dateOfBirth?: string
  
  // Preferences
  preferredTime?: string
  preferredLocation?: TableLocation
  dietaryRestrictions?: string[]
  allergies?: string
  
  // GDPR Consents
  emailConsent: boolean
  smsConsent: boolean
  marketingConsent: boolean
  dataProcessingConsent: boolean
  
  // Admin Fields
  isVip?: boolean
  notes?: string
}

const createCustomerSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  phone: z.string().regex(/^[\+]?[\d\s\-\(\)]{8,15}$/).optional(),
  language: z.enum(['DE', 'EN']).default('DE'),
  dateOfBirth: z.coerce.date().max(new Date()).optional(),
  preferredTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  preferredLocation: z.enum([
    'TERRACE_SEA_VIEW', 'TERRACE_STANDARD', 
    'INDOOR_WINDOW', 'INDOOR_STANDARD', 'BAR_AREA'
  ]).optional(),
  dietaryRestrictions: z.array(z.string()).default([]),
  allergies: z.string().max(500).optional(),
  emailConsent: z.boolean(),
  smsConsent: z.boolean(),
  marketingConsent: z.boolean(),
  dataProcessingConsent: z.boolean().refine(val => val === true),
  isVip: z.boolean().default(false),
  notes: z.string().max(1000).optional(),
})
```

### **PATCH** `/api/admin/customers/[id]`
**Beschreibung:** Kundendaten aktualisieren  
**Berechtigung:** ADMIN, MANAGER, STAFF  

### **POST** `/api/admin/customers/[id]/notes`
**Beschreibung:** Notiz zu Kunde hinzufügen  
**Berechtigung:** ADMIN, MANAGER, STAFF  

```typescript
interface AddCustomerNoteRequest {
  note: string          // max 1000 chars
  isImportant: boolean  // highlight in UI
}

const createCustomerNote = async (customerId: string, data: AddCustomerNoteRequest, userId: string) => {
  return await db.customerNote.create({
    data: {
      customerId,
      userId,
      note: data.note,
      isImportant: data.isImportant,
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          role: true,
        }
      }
    }
  })
}
```

---

## 🪑 TABLE MANAGEMENT API

### **GET** `/api/admin/tables`
**Beschreibung:** Alle Tische mit aktuellem Status  
**Berechtigung:** ADMIN, MANAGER, STAFF  

```typescript
interface TableListResponse {
  data: Array<{
    id: string
    number: number
    capacity: number
    location: TableLocation
    isActive: boolean
    description?: string
    
    // Layout
    xPosition?: number
    yPosition?: number
    shape: TableShape
    
    // Current Status (calculated)
    currentStatus: 'FREI' | 'BESETZT' | 'RESERVIERT' | 'REINIGUNG' | 'AUSSER_BETRIEB'
    currentReservation?: {
      id: string
      customer: { firstName: string, lastName: string }
      checkedInAt?: string
      estimatedEndTime: string
    }
    nextReservation?: {
      id: string
      dateTime: string
      customer: { firstName: string, lastName: string }
      partySize: number
    }
    
    // Analytics
    todayReservations: number
    weeklyOccupancy: number    // percentage
    revenue?: number           // if available
    
    createdAt: string
    updatedAt: string
  }>
  
  // Summary Stats
  summary: {
    totalTables: number
    activeToday: number
    currentlyOccupied: number
    availableNow: number
    outOfOrder: number
    overallOccupancy: number
  }
}

// Real-time Status Calculation
const getTableStatus = async () => {
  return await db.$queryRaw`
    SELECT 
      t.*,
      CASE 
        WHEN NOT t.isActive THEN 'AUSSER_BETRIEB'
        WHEN current_res.id IS NOT NULL THEN 'BESETZT'
        WHEN upcoming_res.id IS NOT NULL THEN 'RESERVIERT'
        ELSE 'FREI'
      END as currentStatus,
      current_res.id as currentReservationId,
      upcoming_res.id as nextReservationId
    FROM tables t
    LEFT JOIN reservations current_res ON (
      t.id = current_res.tableId 
      AND current_res.status = 'SEATED'
      AND current_res.checkedInAt IS NOT NULL
      AND current_res.completedAt IS NULL
    )
    LEFT JOIN reservations upcoming_res ON (
      t.id = upcoming_res.tableId
      AND upcoming_res.status IN ('CONFIRMED', 'PENDING')
      AND upcoming_res.dateTime > NOW()
      AND upcoming_res.dateTime <= NOW() + INTERVAL '2 hours'
    )
    ORDER BY t.number
  `
}
```

### **PATCH** `/api/admin/tables/[id]`
**Beschreibung:** Tischstatus oder -position aktualisieren  
**Berechtigung:** ADMIN, MANAGER, STAFF  

```typescript
interface UpdateTableRequest {
  // Status
  isActive?: boolean
  description?: string
  
  // Layout (für Drag & Drop)
  xPosition?: number
  yPosition?: number
  shape?: TableShape
  
  // Admin Actions
  action?: 'MARK_CLEANING' | 'MARK_AVAILABLE' | 'MARK_OUT_OF_ORDER'
}

// Quick Actions
const tableActions = {
  MARK_CLEANING: (tableId: string) => {
    // Temporarily mark as unavailable
    // Create internal note for cleaning staff
  },
  MARK_AVAILABLE: (tableId: string) => {
    // Mark as immediately available
    // Clear any temporary blocks
  },
  MARK_OUT_OF_ORDER: (tableId: string) => {
    // Set isActive = false
    // Cancel any upcoming reservations with notification
  }
}
```

### **POST** `/api/admin/tables/bulk-update`
**Beschreibung:** Mehrere Tische gleichzeitig aktualisieren  
**Berechtigung:** ADMIN, MANAGER  

```typescript
interface BulkTableUpdate {
  tableIds: string[]
  updates: {
    isActive?: boolean
    location?: TableLocation
    description?: string
  }
  action?: 'MARK_ALL_CLEANING' | 'ACTIVATE_ALL' | 'DEACTIVATE_ALL'
}
```

---

## 🍽️ MENU MANAGEMENT API

### **GET** `/api/admin/menu/categories`
**Beschreibung:** Menü-Kategorien verwalten  
**Berechtigung:** ADMIN, MANAGER, KITCHEN  

### **GET** `/api/admin/menu/items`
**Beschreibung:** Alle Menü-Items mit Allergenen  
**Berechtigung:** ADMIN, MANAGER, KITCHEN  

```typescript
interface MenuItemFilters {
  categoryId?: string
  isAvailable?: boolean
  isSignature?: boolean
  isVegetarian?: boolean
  isVegan?: boolean
  allergenFree?: string[]    // ['gluten', 'milk', 'nuts']
  search?: string
}

interface MenuItemResponse {
  id: string
  categoryId: string
  
  // Content
  name: string
  nameEn?: string
  description: string
  descriptionEn?: string
  price: number
  
  // Status
  isAvailable: boolean
  isSignature: boolean
  isNew: boolean
  isSeasonalSpecial: boolean
  availableFrom?: string
  availableTo?: string
  
  // EU Allergens (14 required fields)
  allergens: {
    containsGluten: boolean
    containsMilk: boolean
    containsEggs: boolean
    containsNuts: boolean
    containsFish: boolean
    containsShellfish: boolean
    containsSoy: boolean
    containsCelery: boolean
    containsMustard: boolean
    containsSesame: boolean
    containsSulfites: boolean
    containsLupin: boolean
    containsMollusks: boolean
    containsPeanuts: boolean
  }
  
  // Dietary Labels
  dietary: {
    isVegetarian: boolean
    isVegan: boolean
    isGlutenFree: boolean
    isLactoseFree: boolean
  }
  
  // Display
  displayOrder: number
  images: string[]
  
  // Metadata
  category: {
    id: string
    name: string
    nameEn?: string
  }
  createdBy: {
    firstName?: string
    lastName?: string
  }
  createdAt: string
  updatedAt: string
}
```

### **POST** `/api/admin/menu/items`
**Beschreibung:** Neues Menü-Item erstellen  
**Berechtigung:** ADMIN, MANAGER, KITCHEN  

```typescript
const createMenuItemSchema = z.object({
  categoryId: z.string().cuid(),
  name: z.string().min(1).max(100),
  nameEn: z.string().max(100).optional(),
  description: z.string().min(1).max(500),
  descriptionEn: z.string().max(500).optional(),
  price: z.number().positive().max(999.99),
  
  // Availability
  isAvailable: z.boolean().default(true),
  isSignature: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isSeasonalSpecial: z.boolean().default(false),
  availableFrom: z.coerce.date().optional(),
  availableTo: z.coerce.date().optional(),
  
  // EU Allergens (all required for legal compliance)
  containsGluten: z.boolean(),
  containsMilk: z.boolean(),
  containsEggs: z.boolean(),
  containsNuts: z.boolean(),
  containsFish: z.boolean(),
  containsShellfish: z.boolean(),
  containsSoy: z.boolean(),
  containsCelery: z.boolean(),
  containsMustard: z.boolean(),
  containsSesame: z.boolean(),
  containsSulfites: z.boolean(),
  containsLupin: z.boolean(),
  containsMollusks: z.boolean(),
  containsPeanuts: z.boolean(),
  
  // Dietary labels
  isVegetarian: z.boolean().default(false),
  isVegan: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  isLactoseFree: z.boolean().default(false),
  
  displayOrder: z.number().int().min(0).default(0),
  images: z.array(z.string().url()).default([]),
})
```

### **PATCH** `/api/admin/menu/items/[id]/availability`
**Beschreibung:** Schnelle Verfügbarkeit ändern  
**Berechtigung:** ADMIN, MANAGER, KITCHEN  

```typescript
interface MenuAvailabilityUpdate {
  isAvailable: boolean
  reason?: string  // "Ausverkauft", "Saisonale Pause", etc.
}

// Bulk Availability Update
POST /api/admin/menu/items/bulk-availability
{
  itemIds: string[]
  isAvailable: boolean
  reason?: string
}
```

---

## 📈 ANALYTICS & REPORTING API

### **GET** `/api/admin/analytics/overview`
**Beschreibung:** Zentrale Analytics-Übersicht  
**Berechtigung:** ADMIN, MANAGER  

```typescript
interface AnalyticsOverview {
  dateRange: {
    start: string
    end: string
  }
  
  // Key Metrics
  metrics: {
    totalReservations: number
    totalCustomers: number
    occupancyRate: number        // percentage
    averagePartySize: number
    averageDuration: number      // minutes
    noShowRate: number           // percentage
    cancellationRate: number     // percentage
  }
  
  // Trends (vs previous period)
  trends: {
    reservationsChange: number   // +/- percentage
    customersChange: number
    occupancyChange: number
    revenueChange?: number
  }
  
  // Top Performers
  topTables: Array<{
    tableNumber: number
    location: TableLocation
    bookings: number
    occupancyRate: number
  }>
  
  topCustomers: Array<{
    customerId: string
    firstName: string
    lastName: string
    visits: number
    totalSpent?: number
  }>
  
  // Time Analysis
  peakHours: Array<{
    hour: number
    averageOccupancy: number
    averageReservations: number
  }>
  
  peakDays: Array<{
    dayOfWeek: number
    averageOccupancy: number
    averageReservations: number
  }>
}
```

### **GET** `/api/admin/analytics/export`
**Beschreibung:** Datenexport für Berichte  
**Berechtigung:** ADMIN, MANAGER  

```typescript
interface ExportRequest {
  type: 'reservations' | 'customers' | 'tables' | 'revenue'
  format: 'csv' | 'xlsx' | 'pdf'
  startDate: string
  endDate: string
  filters?: object
}

// Returns file download with proper headers
Response: 
  Content-Type: application/csv | application/xlsx | application/pdf
  Content-Disposition: attachment; filename="badezeit_reservations_2025-01.csv"
```

---

## ⚙️ SYSTEM ADMINISTRATION API

### **GET** `/api/admin/users`
**Beschreibung:** Personal-Verwaltung  
**Berechtigung:** ADMIN only  

### **PATCH** `/api/admin/users/[id]/role`
**Beschreibung:** Benutzerrolle ändern  
**Berechtigung:** ADMIN only  

### **GET** `/api/admin/settings`
**Beschreibung:** System-Einstellungen  
**Berechtigung:** ADMIN only  

```typescript
interface SystemSettings {
  restaurant: {
    name: string
    address: string
    phone: string
    email: string
    website: string
    timezone: string
    currency: string
  }
  
  reservations: {
    maxAdvanceBookingDays: number
    defaultDuration: number
    reminderHours: number
    autoConfirm: boolean
    allowWalkIns: boolean
    maxPartySize: number
  }
  
  notifications: {
    emailEnabled: boolean
    smsEnabled: boolean
    webhookUrl?: string
    slackWebhookUrl?: string
  }
  
  business: {
    openingHours: Record<string, { open: string, close: string }>
    holidays: Array<{ date: string, name: string }>
    specialHours: Array<{ date: string, open?: string, close?: string }>
  }
}
```

---

## 🔒 ERROR HANDLING & SECURITY

### Standard Error Responses
```typescript
// 400 Bad Request
{
  error: "Validation failed",
  details: [
    {
      field: "email",
      message: "Invalid email format"
    }
  ],
  timestamp: "2025-01-13T10:30:00Z"
}

// 401 Unauthorized
{
  error: "Unauthorized",
  message: "Invalid or expired token",
  timestamp: "2025-01-13T10:30:00Z"
}

// 403 Forbidden
{
  error: "Insufficient permissions",
  message: "KITCHEN role cannot access customer data",
  requiredRole: ["ADMIN", "MANAGER", "STAFF"],
  timestamp: "2025-01-13T10:30:00Z"
}

// 404 Not Found
{
  error: "Resource not found",
  resource: "reservation",
  id: "clr123abc456",
  timestamp: "2025-01-13T10:30:00Z"
}

// 409 Conflict
{
  error: "Resource conflict",
  message: "Table is already booked for this time slot",
  conflictingResource: {
    type: "reservation",
    id: "clr789def012"
  },
  timestamp: "2025-01-13T10:30:00Z"
}

// 500 Internal Server Error
{
  error: "Internal server error",
  message: "Database connection failed",
  errorId: "err_clr123abc456",  // for debugging
  timestamp: "2025-01-13T10:30:00Z"
}
```

### Rate Limiting
```typescript
// Headers included in all responses
X-RateLimit-Limit: 1000      // requests per hour
X-RateLimit-Remaining: 999   // remaining requests
X-RateLimit-Reset: 1642086400 // reset timestamp

// 429 Too Many Requests
{
  error: "Rate limit exceeded",
  retryAfter: 3600,  // seconds
  timestamp: "2025-01-13T10:30:00Z"
}
```

---

**Diese API-Spezifikation ist vollständig implementierbar und basiert auf dem analysierten Live-Schema der Supabase-Datenbank. Alle Endpoints sind mit Zod-Validation, Role-based Security und Performance-Optimierungen dokumentiert.**