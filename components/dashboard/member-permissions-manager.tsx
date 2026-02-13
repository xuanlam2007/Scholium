'use client'

import { useState } from 'react'
import { updateMemberPermissions, removeScholiumMemberAsHost } from '@/app/actions/scholium'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Users, Loader2, X } from 'lucide-react'
import type { ScholiumMember } from '@/lib/scholium'
import { useRouter } from 'next/navigation'

interface MemberPermissionsManagerProps {
  scholiumId: number
  members: (ScholiumMember & { user_name: string; user_email: string })[]
  isHost: boolean
  onPermissionsChange?: () => void
}

export function MemberPermissionsManager({
  scholiumId,
  members,
  isHost,
  onPermissionsChange,
}: MemberPermissionsManagerProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [permissionsState, setPermissionsState] = useState<Record<number, { canAddHomework: boolean; canCreateSubject: boolean }>>({})
  const [saving, setSaving] = useState<number | null>(null)
  const [removingId, setRemovingId] = useState<number | null>(null)

  function initializePermissions() {
    const state: Record<number, { canAddHomework: boolean; canCreateSubject: boolean }> = {}
    members.forEach((member) => {
      state[member.user_id] = {
        canAddHomework: (member as any).can_add_homework ?? true,
        canCreateSubject: (member as any).can_create_subject ?? false,
      }
    })
    setPermissionsState(state)
  }

  async function handlePermissionChange(userId: number, field: 'canAddHomework' | 'canCreateSubject') {
    setSaving(userId)
    const current = permissionsState[userId] || { canAddHomework: true, canCreateSubject: false }
    const updated = { ...current, [field]: !current[field] }

    const result = await updateMemberPermissions(
      scholiumId,
      userId,
      updated.canAddHomework,
      updated.canCreateSubject
    )

    setSaving(null)

    if (result.success) {
      setPermissionsState((prev) => ({
        ...prev,
        [userId]: updated,
      }))
      onPermissionsChange?.()
    }
  }

  async function handleRemoveMember(memberId: number) {
    setRemovingId(memberId)
    const result = await removeScholiumMemberAsHost(memberId)
    if (result.success) {
      router.refresh()
      setOpen(false)
    }
    setRemovingId(null)
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => { setOpen(newOpen); if (newOpen) initializePermissions() }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-transparent"
          disabled={!isHost}
        >
          <Users className="h-4 w-4" />
          Manage Members
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Member Permissions</DialogTitle>
          <DialogDescription>
            Manage what permissions each member has in this scholium.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {members.map((member) => {
            const perms = permissionsState[member.user_id] || { canAddHomework: true, canCreateSubject: false }
            return (
              <Card key={member.id}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{member.user_name}</p>
                        <p className="text-sm text-muted-foreground">{member.user_email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary">
                          {member.is_host ? 'Host' : 'Member'}
                        </div>
                        {!member.is_host && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={removingId === member.id}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {!member.is_host && (
                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`homework-${member.user_id}`}
                            checked={perms.canAddHomework}
                            onCheckedChange={() => handlePermissionChange(member.user_id, 'canAddHomework')}
                            disabled={saving === member.user_id}
                          />
                          <Label htmlFor={`homework-${member.user_id}`} className="cursor-pointer">
                            Can Add Homework
                          </Label>
                          {saving === member.user_id && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`subject-${member.user_id}`}
                            checked={perms.canCreateSubject}
                            onCheckedChange={() => handlePermissionChange(member.user_id, 'canCreateSubject')}
                            disabled={saving === member.user_id}
                          />
                          <Label htmlFor={`subject-${member.user_id}`} className="cursor-pointer">
                            Can Create Subject
                          </Label>
                          {saving === member.user_id && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
