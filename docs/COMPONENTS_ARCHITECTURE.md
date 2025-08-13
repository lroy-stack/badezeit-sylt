# 🧩 COMPONENTS ARCHITECTURE - ADMIN DASHBOARD
## Vollständige Component-Spezifikation für Badezeit Sylt Admin Panel

**Erstellt:** 2025-01-13  
**Basis:** Live Supabase Database mit 14 Tabellen  
**Framework:** Next.js 15 + React 19 + TypeScript  
**UI Library:** shadcn/ui + Tailwind CSS  

---

## 🏗️ COMPONENT HIERARCHY OVERVIEW

### Admin Dashboard Structure
```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN LAYOUT                             │
│  ┌─────────────┐  ┌───────────────────────────────────────┐ │
│  │   SIDEBAR   │  │           MAIN CONTENT               │ │
│  │             │  │  ┌─────────────────────────────────┐  │ │
│  │ - Dashboard │  │  │        PAGE HEADER              │  │ │
│  │ - Reserv.   │  │  │ Title + Actions + Breadcrumbs   │  │ │
│  │ - Kunden    │  │  └─────────────────────────────────┘  │ │
│  │ - Tische    │  │  ┌─────────────────────────────────┐  │ │
│  │ - Speise    │  │  │                                 │  │ │
│  │ - Analytics │  │  │         DYNAMIC CONTENT         │  │ │
│  │ - Settings  │  │  │     (Page-specific modules)     │  │ │
│  │             │  │  │                                 │  │ │
│  └─────────────┘  │  └─────────────────────────────────┘  │ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 LAYOUT COMPONENTS

### 1. **AdminLayout** - Root Layout Container
```typescript
// src/components/admin/layout/AdminLayout.tsx
interface AdminLayoutProps {
  children: React.ReactNode
  user: User
  currentPath: string
}

export function AdminLayout({ children, user, currentPath }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <AdminSidebar user={user} currentPath={currentPath} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader user={user} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

// Features:
// ✅ Responsive breakpoints (lg:hidden für mobile sidebar)
// ✅ Role-based navigation items visibility
// ✅ Persistent sidebar state (localStorage)
// ✅ Real-time user status indicator
```

### 2. **AdminSidebar** - Navigation Menu
```typescript
// src/components/admin/layout/AdminSidebar.tsx
interface AdminSidebarProps {
  user: User
  currentPath: string
}

interface NavigationItem {
  name: string
  href: string
  icon: IconType
  badge?: number | string
  requiredRoles: UserRole[]
  subItems?: NavigationItem[]
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Übersicht',
    href: '/dashboard',
    icon: HomeIcon,
    requiredRoles: ['ADMIN', 'MANAGER', 'STAFF', 'KITCHEN']
  },
  {
    name: 'Reservierungen',
    href: '/dashboard/reservierungen',
    icon: CalendarIcon,
    badge: 'pendingReservations', // Real-time count
    requiredRoles: ['ADMIN', 'MANAGER', 'STAFF'],
    subItems: [
      { name: 'Heute', href: '/dashboard/reservierungen/heute' },
      { name: 'Kalender', href: '/dashboard/reservierungen/kalender' },
      { name: 'Warteschlange', href: '/dashboard/reservierungen/pending' }
    ]
  },
  {
    name: 'Kunden',
    href: '/dashboard/kunden',
    icon: UsersIcon,
    requiredRoles: ['ADMIN', 'MANAGER', 'STAFF']
  },
  {
    name: 'Tische',
    href: '/dashboard/tische',
    icon: TableIcon,
    badge: 'occupiedTables', // Real-time status
    requiredRoles: ['ADMIN', 'MANAGER', 'STAFF']
  },
  {
    name: 'Speisekarte',
    href: '/dashboard/speisekarte',
    icon: MenuIcon,
    requiredRoles: ['ADMIN', 'MANAGER', 'KITCHEN']
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: ChartBarIcon,
    requiredRoles: ['ADMIN', 'MANAGER']
  },
  {
    name: 'Einstellungen',
    href: '/dashboard/einstellungen',
    icon: CogIcon,
    requiredRoles: ['ADMIN']
  }
]

// Live Badge Updates mit TanStack Query
const useLiveBadges = () => {
  const { data: pendingReservations } = useQuery({
    queryKey: ['pending-reservations-count'],
    queryFn: () => api.reservations.getPendingCount(),
    refetchInterval: 30000 // 30 Sekunden
  })
  
  const { data: occupiedTables } = useQuery({
    queryKey: ['occupied-tables-count'],
    queryFn: () => api.tables.getOccupiedCount(),
    refetchInterval: 15000 // 15 Sekunden
  })
  
  return { pendingReservations, occupiedTables }
}
```

### 3. **AdminHeader** - Top Navigation Bar
```typescript
// src/components/admin/layout/AdminHeader.tsx
interface AdminHeaderProps {
  user: User
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const { data: notifications } = useNotifications()
  
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Breadcrumbs */}
        <AdminBreadcrumbs />
        
        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Live Notifications */}
          <NotificationDropdown notifications={notifications} />
          
          {/* Quick Actions */}
          <QuickActionMenu />
          
          {/* User Menu */}
          <UserDropdown user={user} />
        </div>
      </div>
    </header>
  )
}

// Real-time Notifications mit Server-Sent Events
const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.notifications.getRecent(),
    refetchInterval: 10000 // 10 Sekunden
  })
}
```

---

## 📊 DASHBOARD PAGE COMPONENTS

### 1. **DashboardOverview** - Main Dashboard Page
```typescript
// src/components/admin/dashboard/DashboardOverview.tsx
export function DashboardOverview() {
  const { data: metrics, isLoading } = useDashboardMetrics()
  const { data: warnings } = useDashboardWarnings()
  
  if (isLoading) return <DashboardSkeleton />
  
  return (
    <div className="space-y-6">
      {/* Critical Warnings Banner */}
      {warnings?.critical && (
        <CriticalWarningsBanner warnings={warnings.critical} />
      )}
      
      {/* Metrics Cards Grid */}
      <MetricsGrid metrics={metrics} />
      
      {/* Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentReservations />
        <TableStatusOverview />
      </div>
      
      {/* Analytics Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <OccupancyChart />
        <CustomerInsights />
        <RevenuePreview />
      </div>
    </div>
  )
}

// Live Dashboard Metrics von API
const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => api.dashboard.getMetrics(),
    refetchInterval: 30000, // 30 Sekunden
    staleTime: 15000 // 15 Sekunden fresh
  })
}
```

### 2. **MetricsGrid** - KPI Cards Component
```typescript
// src/components/admin/dashboard/MetricsGrid.tsx
interface MetricCardProps {
  title: string
  value: number | string
  change?: number // Percentage change
  icon: IconType
  color: 'blue' | 'green' | 'yellow' | 'red'
  format?: 'number' | 'currency' | 'percentage'
}

export function MetricsGrid({ metrics }: { metrics: DashboardMetrics }) {
  const cards: MetricCardProps[] = [
    {
      title: 'Reservierungen Heute',
      value: metrics.heute.reservierungen.gesamt,
      change: metrics.trends.reservierungenVsGestern,
      icon: CalendarIcon,
      color: 'blue'
    },
    {
      title: 'Aktuelle Auslastung',
      value: metrics.heute.tische.auslastungProzent,
      icon: ChartBarIcon,
      color: 'green',
      format: 'percentage'
    },
    {
      title: 'Neue Kunden',
      value: metrics.heute.kunden.neue,
      change: metrics.trends.kundenVsGestern,
      icon: UserPlusIcon,
      color: 'blue'
    },
    {
      title: 'Geschätzter Umsatz',
      value: metrics.heute.umsatz.geschaetzt,
      icon: CurrencyEuroIcon,
      color: 'green',
      format: 'currency'
    }
  ]
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <MetricCard key={index} {...card} />
      ))}
    </div>
  )
}

// Animierte Metric Card mit Trend-Indicators
function MetricCard({ title, value, change, icon: Icon, color, format }: MetricCardProps) {
  const formattedValue = formatMetricValue(value, format)
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {formattedValue}
          </p>
          {change !== undefined && (
            <TrendIndicator change={change} />
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  )
}
```

---

## 📅 RESERVATIONS COMPONENTS

### 1. **ReservationsManager** - Main Reservations Page
```typescript
// src/components/admin/reservations/ReservationsManager.tsx
export function ReservationsManager() {
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [filters, setFilters] = useState<ReservationFilters>({})
  
  return (
    <div className="space-y-6">
      {/* Page Header mit Actions */}
      <ReservationsHeader 
        view={view} 
        onViewChange={setView}
        filters={filters}
        onFiltersChange={setFilters}
      />
      
      {/* Conditional View Rendering */}
      {view === 'list' ? (
        <ReservationsList filters={filters} />
      ) : (
        <ReservationsCalendar filters={filters} />
      )}
      
      {/* Action Modals */}
      <CreateReservationModal />
      <EditReservationModal />
      <BulkActionModal />
    </div>
  )
}
```

### 2. **ReservationsList** - Table View Component
```typescript
// src/components/admin/reservations/ReservationsList.tsx
interface ReservationsListProps {
  filters: ReservationFilters
}

export function ReservationsList({ filters }: ReservationsListProps) {
  const [pagination, setPagination] = useState({ page: 1, limit: 25 })
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  const { data, isLoading, error } = useReservations({
    ...filters,
    ...pagination
  })
  
  if (isLoading) return <ReservationsTableSkeleton />
  if (error) return <ErrorMessage error={error} />
  
  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <BulkActionsToolbar 
          selectedCount={selectedIds.length}
          onConfirmAll={() => bulkUpdateStatus(selectedIds, 'CONFIRMED')}
          onCancelAll={() => bulkUpdateStatus(selectedIds, 'CANCELLED')}
        />
      )}
      
      {/* Data Table */}
      <DataTable
        columns={reservationColumns}
        data={data?.reservations || []}
        pagination={pagination}
        onPaginationChange={setPagination}
        selection={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={(reservation) => openEditModal(reservation)}
      />
    </div>
  )
}

// Table Columns Definition
const reservationColumns: ColumnDef<ReservationWithIncludes>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'dateTime',
    header: 'Datum & Zeit',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">
          {format(row.original.dateTime, 'dd.MM.yyyy')}
        </div>
        <div className="text-sm text-gray-500">
          {format(row.original.dateTime, 'HH:mm')} Uhr
        </div>
      </div>
    )
  },
  {
    accessorKey: 'customer',
    header: 'Kunde',
    cell: ({ row }) => (
      <div className="flex items-center space-x-3">
        <CustomerAvatar customer={row.original.customer} />
        <div>
          <div className="font-medium">
            {row.original.customer.firstName} {row.original.customer.lastName}
          </div>
          <div className="text-sm text-gray-500">
            {row.original.customer.email}
          </div>
        </div>
      </div>
    )
  },
  {
    accessorKey: 'partySize',
    header: 'Personen',
    cell: ({ row }) => (
      <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
        {row.original.partySize}
      </span>
    )
  },
  {
    accessorKey: 'table',
    header: 'Tisch',
    cell: ({ row }) => {
      const table = row.original.table
      return table ? (
        <div>
          <div className="font-medium">Tisch {table.number}</div>
          <div className="text-sm text-gray-500">
            {getLocationDisplayName(table.location)}
          </div>
        </div>
      ) : (
        <span className="text-gray-400">Offen</span>
      )
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <ReservationStatusBadge status={row.original.status} />
    )
  },
  {
    id: 'actions',
    header: 'Aktionen',
    cell: ({ row }) => (
      <ReservationActions reservation={row.original} />
    ),
    enableSorting: false,
  }
]
```

### 3. **ReservationsCalendar** - Calendar View Component
```typescript
// src/components/admin/reservations/ReservationsCalendar.tsx
export function ReservationsCalendar({ filters }: { filters: ReservationFilters }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'day' | 'week' | 'month'>('day')
  
  const { data: reservations } = useReservations({
    startDate: startOfWeek(currentDate),
    endDate: endOfWeek(currentDate),
    ...filters
  })
  
  const { data: tables } = useTables()
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Calendar Header */}
      <CalendarHeader 
        currentDate={currentDate}
        view={view}
        onDateChange={setCurrentDate}
        onViewChange={setView}
      />
      
      {/* Calendar Grid */}
      <div className="p-6">
        {view === 'day' && (
          <DayViewCalendar 
            date={currentDate}
            reservations={reservations}
            tables={tables}
            onReservationClick={openEditModal}
            onTimeSlotClick={openCreateModal}
          />
        )}
        
        {view === 'week' && (
          <WeekViewCalendar 
            date={currentDate}
            reservations={reservations}
            onReservationClick={openEditModal}
          />
        )}
        
        {view === 'month' && (
          <MonthViewCalendar 
            date={currentDate}
            reservations={reservations}
            onDateClick={setCurrentDate}
          />
        )}
      </div>
    </div>
  )
}

// Day View mit Zeit-Slots (Restaurant-optimiert)
function DayViewCalendar({ date, reservations, tables, onReservationClick, onTimeSlotClick }) {
  const timeSlots = generateTimeSlots(11, 23, 15) // 11:00-23:00 in 15min intervals
  
  return (
    <div className="grid grid-cols-[100px_1fr] gap-4">
      {/* Time Column */}
      <div className="space-y-2">
        {timeSlots.map(time => (
          <div key={time} className="h-12 flex items-center text-sm text-gray-500">
            {time}
          </div>
        ))}
      </div>
      
      {/* Tables Grid */}
      <div className="grid grid-cols-8 gap-2"> {/* 8 columns für 40 Tische */}
        {tables?.map(table => (
          <TableColumn 
            key={table.id}
            table={table}
            date={date}
            reservations={reservations?.filter(r => r.tableId === table.id)}
            timeSlots={timeSlots}
            onReservationClick={onReservationClick}
            onTimeSlotClick={(time) => onTimeSlotClick(table.id, time)}
          />
        ))}
      </div>
    </div>
  )
}
```

---

## 👥 CUSTOMER MANAGEMENT COMPONENTS

### 1. **CustomersManager** - CRM Main Component
```typescript
// src/components/admin/customers/CustomersManager.tsx
export function CustomersManager() {
  const [filters, setFilters] = useState<CustomerFilters>({})
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Customers List */}
      <div className="lg:col-span-2">
        <CustomersList 
          filters={filters}
          onFiltersChange={setFilters}
          onCustomerSelect={setSelectedCustomer}
        />
      </div>
      
      {/* Customer Detail Panel */}
      <div className="lg:col-span-1">
        {selectedCustomer ? (
          <CustomerDetailPanel customer={selectedCustomer} />
        ) : (
          <CustomerDetailPlaceholder />
        )}
      </div>
    </div>
  )
}
```

### 2. **CustomerDetailPanel** - Customer Profile Component
```typescript
// src/components/admin/customers/CustomerDetailPanel.tsx
export function CustomerDetailPanel({ customer }: { customer: Customer }) {
  const { data: reservations } = useCustomerReservations(customer.id)
  const { data: notes } = useCustomerNotes(customer.id)
  const { data: analytics } = useCustomerAnalytics(customer.id)
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      {/* Customer Header */}
      <CustomerHeader customer={customer} />
      
      {/* Quick Stats */}
      <CustomerQuickStats analytics={analytics} />
      
      {/* Tabs Navigation */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="history">Historie</TabsTrigger>
          <TabsTrigger value="notes">Notizen</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4">
          <CustomerProfileForm customer={customer} />
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <CustomerReservationHistory reservations={reservations} />
        </TabsContent>
        
        <TabsContent value="notes" className="space-y-4">
          <CustomerNotes 
            notes={notes} 
            customerId={customer.id}
            onAddNote={addCustomerNote}
          />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <CustomerAnalytics analytics={analytics} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

---

## 🪑 TABLE MANAGEMENT COMPONENTS

### 1. **TableLayoutManager** - Visual Table Editor
```typescript
// src/components/admin/tables/TableLayoutManager.tsx
export function TableLayoutManager() {
  const { data: tables } = useTables()
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Visual Layout Editor */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <TableLayoutCanvas 
            tables={tables}
            selectedTable={selectedTable}
            onTableSelect={setSelectedTable}
            isEditMode={isEditMode}
            onTableMove={updateTablePosition}
          />
        </div>
      </div>
      
      {/* Table Control Panel */}
      <div className="lg:col-span-1">
        <TableControlPanel 
          selectedTable={selectedTable}
          isEditMode={isEditMode}
          onEditModeChange={setIsEditMode}
        />
      </div>
    </div>
  )
}
```

### 2. **TableLayoutCanvas** - Drag & Drop Interface
```typescript
// src/components/admin/tables/TableLayoutCanvas.tsx
interface TableLayoutCanvasProps {
  tables: Table[]
  selectedTable: Table | null
  onTableSelect: (table: Table) => void
  isEditMode: boolean
  onTableMove: (tableId: string, x: number, y: number) => void
}

export function TableLayoutCanvas({ 
  tables, 
  selectedTable, 
  onTableSelect, 
  isEditMode, 
  onTableMove 
}: TableLayoutCanvasProps) {
  
  return (
    <div className="relative w-full h-96 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
      {/* Restaurant Layout Background */}
      <RestaurantLayoutBackground />
      
      {/* Draggable Tables */}
      {tables?.map(table => (
        <DraggableTable
          key={table.id}
          table={table}
          isSelected={selectedTable?.id === table.id}
          isEditMode={isEditMode}
          onClick={() => onTableSelect(table)}
          onDragEnd={(x, y) => onTableMove(table.id, x, y)}
        />
      ))}
      
      {/* Location Labels */}
      <LocationLabels />
    </div>
  )
}

// Draggable Table Component
function DraggableTable({ table, isSelected, isEditMode, onClick, onDragEnd }) {
  const { data: currentStatus } = useTableStatus(table.id)
  
  return (
    <Draggable
      disabled={!isEditMode}
      defaultPosition={{ x: table.xPosition || 0, y: table.yPosition || 0 }}
      onStop={(e, data) => onDragEnd(data.x, data.y)}
    >
      <div
        className={cn(
          "absolute w-12 h-12 rounded-lg border-2 flex items-center justify-center text-sm font-medium cursor-pointer transition-all",
          getTableStatusColor(currentStatus),
          isSelected && "ring-2 ring-blue-500",
          isEditMode && "hover:scale-110"
        )}
        onClick={onClick}
      >
        {table.number}
      </div>
    </Draggable>
  )
}
```

---

## 🍽️ MENU MANAGEMENT COMPONENTS

### 1. **MenuManager** - Menu Administration
```typescript
// src/components/admin/menu/MenuManager.tsx
export function MenuManager() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { data: categories } = useMenuCategories()
  const { data: items } = useMenuItems({ categoryId: selectedCategory })
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Categories Sidebar */}
      <div className="lg:col-span-1">
        <MenuCategoriesPanel 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
      </div>
      
      {/* Menu Items Grid */}
      <div className="lg:col-span-3">
        <MenuItemsGrid 
          items={items}
          categoryId={selectedCategory}
        />
      </div>
    </div>
  )
}
```

### 2. **MenuItemCard** - Individual Menu Item Component
```typescript
// src/components/admin/menu/MenuItemCard.tsx
interface MenuItemCardProps {
  item: MenuItemWithCategory
  onEdit: (item: MenuItem) => void
  onToggleAvailability: (itemId: string, isAvailable: boolean) => void
}

export function MenuItemCard({ item, onEdit, onToggleAvailability }: MenuItemCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Item Image */}
      {item.images?.[0] && (
        <div className="h-48 bg-gray-200">
          <img 
            src={item.images[0]} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      {/* Item Details */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-gray-900">{item.name}</h3>
            {item.nameEn && (
              <p className="text-sm text-gray-500">{item.nameEn}</p>
            )}
          </div>
          <span className="text-lg font-semibold text-gray-900">
            €{item.price.toFixed(2)}
          </span>
        </div>
        
        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {item.description}
        </p>
        
        {/* Dietary & Allergen Labels */}
        <div className="flex flex-wrap gap-1">
          {item.isVegetarian && <DietaryBadge type="vegetarian" />}
          {item.isVegan && <DietaryBadge type="vegan" />}
          {item.isGlutenFree && <DietaryBadge type="glutenFree" />}
          {/* Allergen Icons */}
          <AllergenIcons allergens={getItemAllergens(item)} />
        </div>
        
        {/* Status & Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <AvailabilityToggle 
            isAvailable={item.isAvailable}
            onChange={(isAvailable) => onToggleAvailability(item.id, isAvailable)}
          />
          
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
              Bearbeiten
            </Button>
            <MenuItemActionMenu item={item} />
          </div>
        </div>
      </div>
    </div>
  )
}

// EU Allergen Icons Component
function AllergenIcons({ allergens }: { allergens: string[] }) {
  const iconMap = {
    gluten: '🌾',
    milk: '🥛',
    eggs: '🥚',
    nuts: '🥜',
    fish: '🐟',
    shellfish: '🦐',
    soy: '🫘',
    // ... weitere Allergene
  }
  
  return (
    <div className="flex space-x-1">
      {allergens.map(allergen => (
        <Tooltip key={allergen} content={getAllergenName(allergen)}>
          <span className="text-sm">{iconMap[allergen]}</span>
        </Tooltip>
      ))}
    </div>
  )
}
```

---

## 📊 ANALYTICS COMPONENTS

### 1. **AnalyticsDashboard** - Analytics Main Page
```typescript
// src/components/admin/analytics/AnalyticsDashboard.tsx
export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  })
  
  const { data: analytics } = useAnalytics(dateRange)
  
  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <AnalyticsHeader 
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
      
      {/* Key Metrics Overview */}
      <AnalyticsMetricsGrid analytics={analytics} />
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OccupancyChart data={analytics?.occupancy} />
        <RevenueChart data={analytics?.revenue} />
        <CustomerSegmentChart data={analytics?.customers} />
        <TablePerformanceChart data={analytics?.tables} />
      </div>
      
      {/* Detailed Reports */}
      <AnalyticsDetailedReports analytics={analytics} />
    </div>
  )
}
```

### 2. **OccupancyChart** - Table Occupancy Visualization
```typescript
// src/components/admin/analytics/OccupancyChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function OccupancyChart({ data }: { data: OccupancyData[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Auslastung der letzten 30 Tage
      </h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => format(new Date(date), 'dd.MM')}
          />
          <YAxis 
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            labelFormatter={(date) => format(new Date(date), 'dd.MM.yyyy')}
            formatter={(value: number) => [`${value}%`, 'Auslastung']}
          />
          <Line 
            type="monotone" 
            dataKey="occupancyRate" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

---

## 🔧 SHARED UTILITY COMPONENTS

### 1. **DataTable** - Reusable Table Component
```typescript
// src/components/admin/shared/DataTable.tsx
interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  pagination?: PaginationState
  onPaginationChange?: (pagination: PaginationState) => void
  selection?: string[]
  onSelectionChange?: (selection: string[]) => void
  onRowClick?: (row: T) => void
  loading?: boolean
}

export function DataTable<T>({ 
  columns, 
  data, 
  pagination, 
  onPaginationChange,
  selection,
  onSelectionChange,
  onRowClick,
  loading 
}: DataTableProps<T>) {
  
  const table = useReactTable({
    data,
    columns,
    state: { pagination, rowSelection: selection },
    onPaginationChange,
    onRowSelectionChange: onSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })
  
  return (
    <div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          {/* Table Header */}
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          
          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <TableSkeleton columnCount={columns.length} />
            ) : (
              table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination && (
        <TablePagination 
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          totalRows={data.length}
        />
      )}
    </div>
  )
}
```

### 2. **FormModal** - Reusable Modal Component
```typescript
// src/components/admin/shared/FormModal.tsx
interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function FormModal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  children, 
  footer,
  size = 'md' 
}: FormModalProps) {
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-md": size === 'sm',
        "max-w-lg": size === 'md',
        "max-w-2xl": size === 'lg',
        "max-w-4xl": size === 'xl'
      )}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {subtitle && (
            <DialogDescription>{subtitle}</DialogDescription>
          )}
        </DialogHeader>
        
        <div className="py-4">
          {children}
        </div>
        
        {footer && (
          <DialogFooter>
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

---

**Diese Component-Architektur basiert auf der analysierten Live-Database und ist vollständig implementierbar mit shadcn/ui + TanStack Query + Prisma. Alle Components sind typisiert und folgen modernen React Patterns.**