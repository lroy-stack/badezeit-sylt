'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MessageSquare, Save, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ReservationNotesProps {
  reservationId: string
  existingNotes: string
  userRole: string
}

export function ReservationNotes({ reservationId, existingNotes, userRole }: ReservationNotesProps) {
  const router = useRouter()
  const [notes, setNotes] = useState(existingNotes || '')
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  const canEdit = ['ADMIN', 'MANAGER', 'STAFF'].includes(userRole)
  
  const handleNotesChange = (value: string) => {
    setNotes(value)
    setHasChanges(value !== existingNotes)
  }
  
  const saveNotes = async () => {
    if (!hasChanges) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })
      
      if (response.ok) {
        toast.success('Notizen erfolgreich gespeichert')
        setHasChanges(false)
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Fehler beim Speichern')
      }
    } catch (error) {
      toast.error('Netzwerkfehler beim Speichern')
    } finally {
      setIsLoading(false)
    }
  }
  
  const resetNotes = () => {
    setNotes(existingNotes || '')
    setHasChanges(false)
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Interne Notizen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {canEdit ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notizen für das Team
              </Label>
              <Textarea
                id="notes"
                placeholder="Fügen Sie hier interne Notizen hinzu..."
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                className="min-h-24 text-sm"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Diese Notizen sind nur für das Restaurantteam sichtbar.
              </p>
            </div>
            
            {hasChanges && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-800">
                  Sie haben ungespeicherte Änderungen
                </span>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                onClick={saveNotes}
                disabled={!hasChanges || isLoading}
                size="sm"
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Speichern...' : 'Speichern'}
              </Button>
              {hasChanges && (
                <Button
                  variant="outline"
                  onClick={resetNotes}
                  disabled={isLoading}
                  size="sm"
                >
                  Zurücksetzen
                </Button>
              )}
            </div>
          </>
        ) : (
          <div>
            {existingNotes ? (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{existingNotes}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Keine internen Notizen vorhanden.
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Sie haben keine Berechtigung, Notizen zu bearbeiten.
            </p>
          </div>
        )}
        
        {/* Quick note templates */}
        {canEdit && (
          <div className="space-y-2">
            <Label className="text-xs font-medium">Schnellnotizen:</Label>
            <div className="flex flex-wrap gap-1">
              {[
                'Allergien beachten',
                'VIP-Behandlung',
                'Geburtstag feiern',
                'Geschäftsessen',
                'Fensterplatz gewünscht',
                'Ruhiger Bereich'
              ].map((template) => (
                <Button
                  key={template}
                  variant="outline"
                  size="sm"
                  className="text-xs h-6 px-2"
                  onClick={() => {
                    const newNotes = notes ? `${notes}\n${template}` : template
                    handleNotesChange(newNotes)
                  }}
                  disabled={isLoading}
                >
                  + {template}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
