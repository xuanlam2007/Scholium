'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Crown } from 'lucide-react'
import type { ScholiumMember } from '@/lib/scholium'

interface ParticipantsSectionProps {
  members: (ScholiumMember & {
    user_name: string
    user_email: string
  })[]
  isHost: boolean
}

export function ParticipantsSection({ members }: ParticipantsSectionProps) {
  const hosts = members.filter((m) => m.is_host)
  const participants = members.filter((m) => !m.is_host)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members
          </CardTitle>
          <Badge variant="secondary">{members.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Hosts */}
        {hosts.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <Crown className="h-3 w-3" />
              Hosts
            </h4>
            <div className="space-y-1">
              {hosts.map((member) => (
                <div key={member.id} className="p-2 rounded bg-muted/50">
                  <p className="text-sm font-medium truncate">{member.user_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.user_email}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Participants */}
        {participants.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">
              Participants ({participants.length})
            </h4>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {participants.map((member) => (
                <div key={member.id} className="p-2 rounded hover:bg-muted/50 transition-colors">
                  <p className="text-sm font-medium truncate">{member.user_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.user_email}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {members.length === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No members yet
          </div>
        )}
      </CardContent>
    </Card>
  )
}
