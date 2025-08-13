import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { requireRole } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Star,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Shield,
  UserCheck,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { CustomerTable } from './components/customer-table'
import { CustomerFilters } from './components/customer-filters'
import { CustomerStats } from './components/customer-stats'
import { GDPRControls } from './components/gdpr-controls'

interface CustomersPageProps {
  searchParams: Promise<{
    search?: string
    isVip?: string
    language?: string
    consent?: string
    sortBy?: string
    sortOrder?: string
    page?: string
  }>
}

async function getCustomers(filters: any) {
  const whereClause: any = {}
  
  if (filters.search) {
    whereClause.OR = [
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { phone: { contains: filters.search, mode: 'insensitive' } }
    ]
  }
  
  if (filters.isVip === 'true') {
    whereClause.isVip = true
  } else if (filters.isVip === 'false') {
    whereClause.isVip = false
  }
  
  if (filters.language && filters.language !== 'all') {
    whereClause.language = filters.language
  }
  
  if (filters.consent) {
    switch (filters.consent) {
      case 'email':
        whereClause.emailConsent = true
        break
      case 'marketing':
        whereClause.marketingConsent = true
        break
      case 'no-consent':
        whereClause.OR = [
          { emailConsent: false },
          { marketingConsent: false }
        ]
        break
    }
  }
  
  const orderBy: any = {}
  if (filters.sortBy) {
    orderBy[filters.sortBy] = filters.sortOrder || 'desc'
  } else {
    orderBy.createdAt = 'desc'
  }

  const page = parseInt(filters.page) || 1
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const [customers, totalCount] = await Promise.all([
    db.customer.findMany({
      where: whereClause,
      include: {
        reservations: {
          select: {
            id: true,
            dateTime: true,
            status: true,
            partySize: true
          },
          orderBy: {
            dateTime: 'desc'
          },
          take: 1 // Only get the most recent
        },
        notes: {
          where: { isImportant: true },
          select: {
            id: true,
            note: true,
            createdAt: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 3
        },
        _count: {
          select: {
            reservations: true
          }
        }
      },
      orderBy,
      skip,
      take: pageSize
    }),
    db.customer.count({ where: whereClause })
  ])

  return {
    customers,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: page
  }
}

async function getCustomerStats() {
  const [totalCustomers, vipCustomers, newThisMonth, emailConsentCount, marketingConsentCount] = await Promise.all([
    db.customer.count(),
    db.customer.count({ where: { isVip: true } }),
    db.customer.count({ 
      where: { 
        createdAt: { 
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    }),
    db.customer.count({ where: { emailConsent: true } }),
    db.customer.count({ where: { marketingConsent: true } })
  ])

  return {
    total: totalCustomers,
    vip: vipCustomers,
    newThisMonth,
    emailConsent: emailConsentCount,
    marketingConsent: marketingConsentCount,
    emailConsentRate: totalCustomers > 0 ? Math.round((emailConsentCount / totalCustomers) * 100) : 0,
    marketingConsentRate: totalCustomers > 0 ? Math.round((marketingConsentCount / totalCustomers) * 100) : 0
  }
}

function CustomerCard({ customer }: { customer: any }) {
  const lastReservation = customer.reservations[0]
  const totalReservations = customer._count.reservations
  const importantNotes = customer.notes
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">
                {customer.firstName} {customer.lastName}
              </h3>
              {customer.isVip && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Star className="h-3 w-3 mr-1" />
                  VIP
                </Badge>
              )}
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                <span>{customer.email}</span>
                {customer.emailConsent && (
                  <UserCheck className="h-3 w-3 text-green-600" />
                )}
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  <span>{customer.phone}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right space-y-1">
            <div className="flex items-center gap-1 text-sm">
              <Calendar className="h-3 w-3" />
              <span>{totalReservations} Reservierungen</span>
            </div>
            {customer.totalSpent > 0 && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>€{customer.totalSpent.toFixed(0)}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Last Reservation */}
        {lastReservation && (
          <div className="mb-3 p-2 bg-muted rounded text-xs">
            <p className="font-medium">Letzte Reservierung:</p>
            <p className="text-muted-foreground">
              {format(new Date(lastReservation.dateTime), 'dd.MM.yyyy HH:mm', { locale: de })} • {' '}
              {lastReservation.partySize} Personen • {lastReservation.status}
            </p>
          </div>
        )}
        
        {/* Important Notes */}
        {importantNotes.length > 0 && (
          <div className="mb-3">
            <div className="bg-orange-50 border-l-4 border-orange-200 p-2 rounded">
              <p className="text-xs font-medium text-orange-800 mb-1">
                Wichtige Notizen ({importantNotes.length}):
              </p>
              <p className="text-xs text-orange-700">
                {importantNotes[0].note.substring(0, 80)}{importantNotes[0].note.length > 80 ? '...' : ''}
              </p>
            </div>
          </div>
        )}
        
        {/* GDPR Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs">
            <Shield className="h-3 w-3" />
            <span>GDPR:</span>
            {customer.dataProcessingConsent ? (
              <Badge variant="default" className="text-xs px-1 py-0">OK</Badge>
            ) : (
              <Badge variant="destructive" className="text-xs px-1 py-0">⚠</Badge>
            )}
          </div>
          <div className="flex gap-1">
            {customer.emailConsent && (
              <Badge variant="outline" className="text-xs px-1 py-0">E-Mail</Badge>
            )}
            {customer.marketingConsent && (
              <Badge variant="outline" className="text-xs px-1 py-0">Marketing</Badge>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" asChild>
            <Link href={`/dashboard/kunden/${customer.id}`}>
              Profil anzeigen
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/dashboard/reservierungen/neu?customerId=${customer.id}`}>
              Reservieren
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function CustomersLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-muted rounded animate-pulse w-48" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded animate-pulse" />
        ))}
      </div>
    </div>
  )
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const user = await requireRole(['ADMIN', 'MANAGER', 'STAFF'])
  const params = await searchParams
  
  const [{ customers, totalCount, totalPages, currentPage }, stats] = await Promise.all([
    getCustomers({
      search: params.search,
      isVip: params.isVip,
      language: params.language,
      consent: params.consent,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      page: params.page
    }),
    getCustomerStats()
  ])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kundenverwaltung</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Kundenprofile, VIP-Status und GDPR-Compliance
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
            <>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/kunden/gdpr">
                  <Shield className="h-4 w-4 mr-2" />
                  GDPR
                </Link>
              </Button>
            </>
          )}
          <Button asChild>
            <Link href="/dashboard/reservierungen/neu">
              <Plus className="h-4 w-4 mr-2" />
              Neue Reservierung
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <Suspense fallback={<div className="h-24 bg-muted rounded animate-pulse" />}>
        <CustomerStats stats={stats} />
      </Suspense>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <Suspense fallback={<div className="h-16 bg-muted rounded animate-pulse" />}>
            <CustomerFilters currentFilters={params} />
          </Suspense>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {totalCount} Kunde{totalCount !== 1 ? 'n' : ''} gefunden
          {params.search && ` für "${params.search}"`}
        </p>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Seite {currentPage} von {totalPages}
        </div>
      </div>

      {/* Customers Grid */}
      <Suspense fallback={<CustomersLoading />}>
        {customers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Keine Kunden gefunden</h3>
              <p className="text-muted-foreground">
                {params.search
                  ? 'Keine Kunden entsprechen den Suchkriterien.'
                  : 'Noch keine Kunden in der Datenbank.'}
              </p>
              <Button className="mt-4" asChild>
                <Link href="/dashboard/reservierungen/neu">
                  Erste Reservierung erstellen
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </Suspense>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {currentPage > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link href={{ pathname: '/dashboard/kunden', query: { ...params, page: currentPage - 1 } }}>
                Vorherige
              </Link>
            </Button>
          )}
          
          <span className="text-sm text-muted-foreground px-4">
            Seite {currentPage} von {totalPages}
          </span>
          
          {currentPage < totalPages && (
            <Button variant="outline" size="sm" asChild>
              <Link href={{ pathname: '/dashboard/kunden', query: { ...params, page: currentPage + 1 } }}>
                Nächste
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
