'use client'

import { useState } from 'react'
import { deleteScholium } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Trash2, Users } from 'lucide-react'

interface ScholiumsManagementProps {
  scholiums: any[]
}

export function ScholiumsManagement({ scholiums: initialScholiums }: ScholiumsManagementProps) {
  const [scholiums, setScholiums] = useState(initialScholiums)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(id: number) {
    setDeleting(true)
    const result = await deleteScholium(id)
    if (result.success) {
      setScholiums(scholiums.filter(t => t.id !== id))
    }
    setDeleting(false)
    setDeleteId(null)
  }

  return (
    <div className="space-y-4">
      {scholiums.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No scholiums yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {scholiums.map((scholium) => (
            <Card key={scholium.id} className="hover:border-primary transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{scholium.name}</CardTitle>
                    <CardDescription className="text-sm">
                      Created by {scholium.creator_name} ({scholium.creator_email})
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1 bg-secondary px-2 py-1 rounded text-sm ml-2">
                    <Users className="h-3 w-3" />
                    <span>{scholium.member_count}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  {new Date(scholium.created_at).toLocaleDateString()}
                </span>
                <AlertDialog open={deleteId === scholium.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteId(scholium.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Scholium</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{scholium.name}"? All associated data will be permanently removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-2 justify-end">
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDelete(scholium.id)}
                        disabled={deleting}
                        className="bg-destructive"
                      >
                        {deleting ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
