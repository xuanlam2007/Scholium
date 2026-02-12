'use client'

import { useState } from 'react'
import { createSubject, deleteSubject } from '@/app/actions/homework'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Plus, X, Loader2 } from 'lucide-react'
import type { Subject } from '@/lib/db'

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6']

interface SubjectManagerProps {
  subjects: Subject[]
  canManageSubjects: boolean
  onSubjectsChange?: () => void
}

export function SubjectManager({ subjects, canManageSubjects, onSubjectsChange }: SubjectManagerProps) {
  const [open, setOpen] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState('')
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)

  async function handleCreateSubject() {
    if (!newSubjectName.trim()) return

    setLoading(true)
    const result = await createSubject(newSubjectName, selectedColor)
    setLoading(false)

    if (result.success) {
      setNewSubjectName('')
      setSelectedColor(COLORS[0])
      onSubjectsChange?.()
    }
  }

  async function handleDeleteSubject(subjectId: number) {
    setDeleting(subjectId)
    const result = await deleteSubject(subjectId)
    setDeleting(null)

    if (result.success) {
      onSubjectsChange?.()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 bg-transparent"
          disabled={!canManageSubjects}
        >
          <Plus className="h-4 w-4" />
          Add Subjects
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Subjects</DialogTitle>
          <DialogDescription>
            Create or remove subjects for this scholium.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Subjects */}
          <div>
            <h3 className="font-semibold mb-3">Existing Subjects</h3>
            {subjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subjects yet. Create one below.</p>
            ) : (
              <div className="space-y-2">
                {subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between p-3 rounded border border-border hover:bg-accent group"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      <span className="font-medium">{subject.name}</span>
                    </div>
                    {canManageSubjects && (
                      <button
                        onClick={() => handleDeleteSubject(subject.id)}
                        disabled={deleting === subject.id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive"
                      >
                        {deleting === subject.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create New Subject */}
          {canManageSubjects && (
            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold">Create New Subject</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="subject-name">Subject Name</Label>
                  <Input
                    id="subject-name"
                    placeholder="e.g., Mathematics"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedColor === color ? 'border-foreground' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleCreateSubject}
                  disabled={!newSubjectName.trim() || loading}
                  className="w-full"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Plus className="mr-2 h-4 w-4" />
                  Create Subject
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
