'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  MessageSquare,
  Plus,
  Save,
  AlertTriangle,
  Trash2,
  Edit
} from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Note {
  id: string
  note: string
  isImportant: boolean
  createdAt: Date
  user: {
    firstName: string | null
    lastName: string | null
    role: string
  }
}

interface CustomerNotesProps {
  customerId: string
  notes: Note[]
  userRole: string
}

export function CustomerNotes({ customerId, notes, userRole }: CustomerNotesProps) {
  const router = useRouter()
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [newNote, setNewNote] = useState('')
  const [isImportant, setIsImportant] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const canEditNotes = ['ADMIN', 'MANAGER'].includes(userRole)
  const canAddNotes = ['ADMIN', 'MANAGER', 'STAFF'].includes(userRole)

  const saveNote = async (noteId?: string) => {
    if (!newNote.trim()) {
      toast.error('Bitte geben Sie eine Notiz ein')
      return
    }

    setIsLoading(true)
    try {
      const method = noteId ? 'PATCH' : 'POST'
      const url = noteId 
        ? `/api/customers/${customerId}/notes/${noteId}`
        : `/api/customers/${customerId}/notes`

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: newNote,
          isImportant
        })
      })

      if (response.ok) {
        toast.success(noteId ? 'Notiz aktualisiert' : 'Notiz hinzugefügt')
        setNewNote('')
        setIsImportant(false)
        setIsAddingNote(false)
        setEditingNote(null)
        router.refresh()
      } else {
        toast.error('Fehler beim Speichern der Notiz')
      }
    } catch (error) {
      console.error('Failed to save note:', error)
      toast.error('Fehler beim Speichern der Notiz')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!confirm('Möchten Sie diese Notiz wirklich löschen?')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/customers/${customerId}/notes/${noteId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Notiz gelöscht')
        router.refresh()
      } else {
        toast.error('Fehler beim Löschen der Notiz')
      }
    } catch (error) {
      console.error('Failed to delete note:', error)
      toast.error('Fehler beim Löschen der Notiz')
    } finally {
      setIsLoading(false)
    }
  }

  const startEditing = (note: Note) => {
    setEditingNote(note.id)
    setNewNote(note.note)
    setIsImportant(note.isImportant)
    setIsAddingNote(false)
  }

  const cancelEditing = () => {
    setEditingNote(null)
    setNewNote('')
    setIsImportant(false)
    setIsAddingNote(false)
  }

  return (
    <div className="space-y-6">
      {/* Add New Note */}
      {canAddNotes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {isAddingNote || editingNote ? 'Notiz bearbeiten' : 'Neue Notiz hinzufügen'}
              </div>
              {!isAddingNote && !editingNote && (
                <Button
                  onClick={() => setIsAddingNote(true)}
                  size="sm"
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Notiz hinzufügen
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          
          {(isAddingNote || editingNote) && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="note">Notiz</Label>
                <Textarea
                  id="note"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Geben Sie hier Ihre Notiz ein..."
                  rows={4}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="important"
                  checked={isImportant}
                  onCheckedChange={(checked) => setIsImportant(checked as boolean)}
                />
                <Label htmlFor="important" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Als wichtig markieren
                </Label>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => saveNote(editingNote || undefined)}
                  disabled={isLoading || !newNote.trim()}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Wird gespeichert...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingNote ? 'Aktualisieren' : 'Speichern'}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={cancelEditing}
                  disabled={isLoading}
                >
                  Abbrechen
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Existing Notes */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Keine Notizen vorhanden</h3>
              <p className="text-muted-foreground">
                {canAddNotes 
                  ? 'Fügen Sie die erste Notiz für diesen Kunden hinzu.'
                  : 'Für diesen Kunden sind noch keine Notizen hinterlegt.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          notes.map((note) => (
            <Card key={note.id} className={note.isImportant ? 'border-orange-200 bg-orange-50' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {note.isImportant && (
                        <Badge variant="destructive" className="bg-orange-100 text-orange-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Wichtig
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {note.user.role === 'ADMIN' ? 'Administrator' :
                         note.user.role === 'MANAGER' ? 'Manager' :
                         note.user.role === 'STAFF' ? 'Personal' :
                         note.user.role === 'KITCHEN' ? 'Küche' : note.user.role}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-900 whitespace-pre-wrap mb-3">
                      {note.note}
                    </p>
                    
                    <div className="text-xs text-muted-foreground">
                      <p>
                        {note.user.firstName} {note.user.lastName} • {' '}
                        {format(note.createdAt, 'dd.MM.yyyy HH:mm', { locale: de })} Uhr
                      </p>
                    </div>
                  </div>
                  
                  {canEditNotes && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(note)}
                        disabled={isLoading || editingNote !== null}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNote(note.id)}
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}