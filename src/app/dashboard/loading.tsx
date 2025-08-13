import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 bg-muted rounded animate-pulse w-48" />
        <div className="h-4 bg-muted rounded animate-pulse w-96" />
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-20" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-32" />
            <div className="h-4 bg-muted rounded w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-muted rounded-full" />
                  <div className="h-4 bg-muted rounded flex-1" />
                  <div className="h-4 bg-muted rounded w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-32" />
            <div className="h-4 bg-muted rounded w-48" />
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
