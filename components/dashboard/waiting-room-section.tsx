'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Check, X } from 'lucide-react'
import { getWaitingRoom, approveWaitingUser, denyWaitingUser } from '@/app/actions/scholium'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

interface WaitingRoomEntry {
  id: number
  user_id: string
  user_name: string
  user_email: string
  requested_at: string
}

interface WaitingRoomSectionProps {
  scholiumId: number
  isHostOrCohost: boolean
}

export function WaitingRoomSection({ scholiumId, isHostOrCohost }: WaitingRoomSectionProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, setPending] = useState<WaitingRoomEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const loadPending = useCallback(async () => {
    const result = await getWaitingRoom(scholiumId)
    if (result.success && result.data) {
      setPending(result.data.pending)
    }
    setLoading(false)
  }, [scholiumId])

  useEffect(() => {
    if (!isHostOrCohost) return

    loadPending()

    // Subscribe to realtime changes on waiting_room table
    const supabase = createClient()
    const channel = supabase
      .channel(`waiting_room_${scholiumId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'waiting_room',
          filter: `scholium_id=eq.${scholiumId}`,
        },
        () => {
          loadPending()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [scholiumId, isHostOrCohost, loadPending])

  const handleApprove = async (entry: WaitingRoomEntry) => {
    setActionLoading(entry.id)
    const result = await approveWaitingUser(entry.id, scholiumId)
    if (result.success) {
      toast({ title: `${entry.user_name} approved`, description: 'They can now access the scholium.' })
      setPending((prev) => prev.filter((p) => p.id !== entry.id))
      router.refresh()
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    }
    setActionLoading(null)
  }

  const handleDeny = async (entry: WaitingRoomEntry) => {
    setActionLoading(entry.id)
    const result = await denyWaitingUser(entry.id, scholiumId)
    if (result.success) {
      toast({ title: `${entry.user_name} denied` })
      setPending((prev) => prev.filter((p) => p.id !== entry.id))
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    }
    setActionLoading(null)
  }

  if (!isHostOrCohost || loading || pending.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Waiting Room
        </h3>
        <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 dark:text-amber-400">
          {pending.length}
        </Badge>
      </div>
      <div className="space-y-2">
        {pending.map((entry) => (
          <div
            key={entry.id}
            className="p-2 rounded border border-amber-500/20 bg-amber-500/5 flex items-center justify-between gap-2"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{entry.user_name}</p>
              <p className="text-xs text-muted-foreground truncate">{entry.user_email}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-green-600 hover:text-green-600 hover:bg-green-500/10"
                onClick={() => handleApprove(entry)}
                disabled={actionLoading === entry.id}
                title="Approve"
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleDeny(entry)}
                disabled={actionLoading === entry.id}
                title="Deny"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
