# Documentación Completa: Página Tische (/dashboard/tische)

## Resumen General

La página Tische es un módulo completo de gestión de mesas para el restaurante Badezeit Sylt, implementado con Next.js 15 usando la arquitectura Server → Client Components. Esta página permite administrar todas las mesas del restaurante, visualizar estados en tiempo real, gestionar QR codes, y analizar datos de ocupación.

## Estructura de Archivos

```
src/app/dashboard/tische/
├── page.tsx                           # Server Component principal
├── components/
│   ├── tabs-navigation.tsx            # Client Component - Navegación de tabs
│   ├── header-actions.tsx             # Client Component - Botones del header
│   ├── table-filters.tsx              # Client Component - Filtros de mesa (arreglado)
│   ├── table-stats.tsx                # Component - Estadísticas globales
│   ├── table-analytics.tsx            # Component - Dashboard analítico
│   ├── table-floor-plan.tsx           # Component - Vista del plano
│   ├── table-status-panel.tsx         # Component - Panel de estados
│   ├── table-configuration.tsx        # Component - Configuración de mesas
│   ├── enhanced-qr-manager.tsx        # Component - Gestión de QR codes
│   └── qr-code-manager.tsx            # Component - QR codes básico
```

## Arquitectura Técnica

### 1. Server Component Principal (page.tsx)

**Patrón de Implementación:**
- Server Component para optimización de rendimiento
- Manejo asíncrono de searchParams como Promise (Next.js 15)
- Consultas directas a base de datos con Prisma
- Suspense boundaries para loading states

**Funcionalidades Clave:**
```typescript
interface TablesPageProps {
  searchParams: Promise<{
    tab?: string
    location?: string
    status?: string
    capacity?: string
    shape?: string
    view?: string
  }>
}
```

**Funciones de Datos:**

1. **getTables(filters)** - Líneas 44-136
   - Consulta completa a 40 mesas reales desde Supabase
   - Incluye reservaciones activas, QR codes, y contadores
   - Calcula estados en tiempo real (AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE, OUT_OF_ORDER)
   - Filtrado dinámico por ubicación, capacidad, forma

2. **getTableStats()** - Líneas 138-193
   - Estadísticas agregadas del restaurante
   - Cálculo de tasa de ocupación
   - Estadísticas por ubicación
   - Contadores de QR codes activos

### 2. Client Components para Interactividad

#### TabsNavigation Component (tabs-navigation.tsx)
**Propósito:** Manejo de navegación entre tabs con sincronización URL

**Características:**
- 6 tabs: Overview, Analytics, Floorplan, Status, Configuration, QR-Codes
- Preserva searchParams existentes
- Iconografía Lucide React
- Grid layout responsivo

**Implementación:**
```typescript
const handleTabChange = (value: string) => {
  const params = new URLSearchParams(searchParams.toString())
  params.set('tab', value)
  router.push(`/dashboard/tische?${params.toString()}`)
}
```

#### HeaderActions Component (header-actions.tsx)
**Propósito:** Botones de acción rápida según rol del usuario

**Características:**
- Control de acceso basado en roles (ADMIN, MANAGER, STAFF, KITCHEN)
- Navegación directa a tabs específicos
- Link a nueva reservación

**Roles y Permisos:**
- ADMIN/MANAGER: Acceso completo a Analytics y QR-Codes
- STAFF/KITCHEN: Solo acceso a nueva reservación

#### TableFilters Component (table-filters.tsx) - ARREGLADO
**Problema Resuelto:** TypeError por params undefined
**Solución:** Agregado `params || {}` en línea 396

**Funcionalidades:**
- 5 tipos de filtros: Búsqueda, Ubicación, Capacidad, Forma, Estado
- Badges de filtros activos con eliminación individual
- Preservación de parámetros URL (especialmente tab)
- Transiciones con useTransition para UX fluida

**Ubicaciones Soportadas:**
```typescript
const locationOptions = [
  { value: 'TERRACE_SEA_VIEW', label: 'Terrasse Meerblick' },
  { value: 'TERRACE_STANDARD', label: 'Terrasse Standard' },
  { value: 'INDOOR_WINDOW', label: 'Innen Fenster' },
  { value: 'INDOOR_STANDARD', label: 'Innen Standard' },
  { value: 'BAR_AREA', label: 'Barbereich' }
]
```

## Integración con Base de Datos

### Modelos Prisma Utilizados

1. **Table Model** (líneas 98-119 en schema.prisma)
```prisma
model Table {
  id           String        @id @default(cuid())
  number       Int           @unique
  capacity     Int
  location     TableLocation
  isActive     Boolean       @default(true)
  description  String?
  xPosition    Float?
  yPosition    Float?
  shape        TableShape    @default(RECTANGLE)
  
  reservations Reservation[]
  qrCodes      QRCode[]
}
```

2. **Relaciones Incluidas:**
   - **reservations**: Reservas activas con detalles del cliente
   - **qrCodes**: Códigos QR asociados a cada mesa
   - **_count**: Contadores agregados

### Estados de Mesa Calculados en Tiempo Real

**Lógica de Estados (líneas 110-133):**
```typescript
let currentStatus: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE' | 'OUT_OF_ORDER' = 'AVAILABLE'

if (!table.isActive) {
  currentStatus = 'OUT_OF_ORDER'
} else if (currentReservation) {
  currentStatus = 'OCCUPIED'
} else if (table.reservations.some(r => r.status === 'CONFIRMED' && new Date(r.dateTime) > now)) {
  currentStatus = 'RESERVED'
}
```

## Funcionalidades por Tab

### 1. Overview Tab (Líneas 392-422)
- Grid responsivo de tarjetas de mesa
- Información completa de cada mesa
- Estados visuales con iconografía
- Reservaciones actuales y próximas

### 2. Analytics Tab (Línea 424-428)
- Dashboard analítico con métricas de ocupación
- Componente: `<TableAnalytics tables={tables} />`

### 3. Floorplan Tab (Líneas 430-434)
- Vista del plano del restaurante
- Componente: `<TableFloorPlan tables={tables} />`

### 4. Status Tab (Líneas 436-440)
- Panel de estados en tiempo real
- Componente: `<TableStatusPanel tables={tables} />`

### 5. Configuration Tab (Líneas 442-446)
- Configuración de mesas con control de roles
- Componente: `<TableConfiguration tables={tables} user={user} />`

### 6. QR-Codes Tab (Líneas 448-452)
- Gestión avanzada de códigos QR
- Componente: `<EnhancedQRManager tables={tables} />`

## Estadísticas y Métricas

### Componente TableStats
**Métricas Calculadas:**
- **total**: Total de mesas (40)
- **active**: Mesas activas
- **totalCapacity**: Capacidad total del restaurante
- **currentOccupied**: Mesas ocupadas actualmente
- **upcomingReservations**: Reservas pendientes
- **activeQrCodes**: QR codes activos
- **occupancyRate**: Porcentaje de ocupación
- **locationStats**: Estadísticas por ubicación

## Patrones de Implementación

### 1. Manejo de Loading States
```typescript
function TablesLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-muted rounded animate-pulse w-48" />
      {/* Skeleton components */}
    </div>
  )
}
```

### 2. Suspense Boundaries
```typescript
<Suspense fallback={<div className="h-24 bg-muted rounded animate-pulse" />}>
  <TableStats stats={stats} />
</Suspense>
```

### 3. Autorización Basada en Roles
```typescript
const user = await requireRole(['ADMIN', 'MANAGER', 'STAFF'])
```

### 4. Tipado TypeScript Completo
```typescript
interface User {
  id: string
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'KITCHEN'
  email: string
}

interface TableStats {
  total: number
  active: number
  totalCapacity: number
  occupancyRate: number
  locationStats: Record<string, any>
}
```

## Errores Resueltos

### 1. Error Parsing Línea 710
**Problema:** Código muerto o sintaxis incorrecta
**Solución:** Eliminación del código problemático

### 2. TypeError TableFilters Undefined
**Problema:** `params` undefined causando crash
**Solución:** 
```typescript
// Antes
<TableFilters currentFilters={params} />

// Después  
<TableFilters currentFilters={params || {}} />
```

### 3. Tabs No Respondían
**Problema:** Server Components no podían manejar eventos onClick
**Solución:** Separación en Client Components:
- `tabs-navigation.tsx` → Client Component con useRouter
- `header-actions.tsx` → Client Component con navegación

### 4. SearchParams Promise Error
**Problema:** Next.js 15 cambió searchParams a Promise
**Solución:**
```typescript
// Next.js 15 compatible
const params = await searchParams
```

## Rendimiento y Optimización

### 1. Consultas de Base de Datos Optimizadas
- Includes específicos para reducir queries
- Ordenamiento en DB level
- Agregaciones eficientes con Prisma

### 2. Server-Side Rendering
- Datos pre-renderizados en servidor
- Reducción de waterfalls de datos
- SEO optimizado

### 3. Client-Side Optimizations
- useTransition para transiciones fluidas
- Suspense boundaries para loading states
- Iconografía optimizada con Lucide React

## Guía de Mantenimiento

### 1. Agregar Nuevos Filtros
1. Actualizar interface `TablesPageProps`
2. Modificar función `getTables()` 
3. Agregar opciones en `TableFilters` component
4. Actualizar lógica de URL params

### 2. Nuevos Estados de Mesa
1. Actualizar enum en Prisma schema
2. Modificar función `getStatusIcon()` y `getStatusLabel()`
3. Ajustar lógica de cálculo de estados
4. Actualizar componentes visuales

### 3. Nuevas Ubicaciones
1. Actualizar enum `TableLocation` en Prisma
2. Agregar a `locationOptions` en filters
3. Actualizar función `getLocationLabel()`
4. Sincronizar con datos seed

### 4. Extensión de Roles
1. Modificar interface User
2. Actualizar lógica en `HeaderActions`
3. Ajustar permisos en componentes individuales
4. Actualizar middleware de autorización

## Testing y Validación

### 1. Funcionalidad Verificada
- ✅ Carga de 40 mesas reales desde Supabase
- ✅ Navegación de tabs completamente funcional
- ✅ Filtros operativos con persistencia URL
- ✅ Estados calculados correctamente
- ✅ Autorización por roles
- ✅ Responsive design

### 2. Puntos de Prueba Recomendados
- [ ] Performance con 100+ mesas
- [ ] Manejo de errores de conexión DB
- [ ] Estados edge cases (reservas solapadas)
- [ ] Accesibilidad (a11y)
- [ ] Mobile UX en tabs

## Arquitectura de Extensión

### Próximas Funcionalidades Sugeridas
1. **Real-time Updates**: WebSocket para estados en vivo
2. **Drag & Drop Floor Plan**: Reordenamiento visual de mesas
3. **Bulk Operations**: Acciones masivas en mesas
4. **Advanced Analytics**: Dashboard con charts y métricas detalladas
5. **Integration APIs**: Conexión con sistemas POS externos

### Patrones para Mantener
- Server → Client Component separation
- Suspense boundaries consistentes
- URL state management
- TypeScript strict typing
- Role-based access control
- Prisma optimized queries

Esta implementación establece las bases sólidas para un sistema de gestión de mesas escalable y mantenible, siguiendo las mejores prácticas de Next.js 15 y React 19.