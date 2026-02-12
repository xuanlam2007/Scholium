import type { Homework } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Calendar } from "lucide-react"

interface UpcomingRemindersProps {
  deadlines: Homework[]
}

export function UpcomingReminders({ deadlines }: UpcomingRemindersProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  function getDaysUntilDue(dateStr: string) {
    const due = new Date(dateStr)
    due.setHours(0, 0, 0, 0)
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0) return { text: "Today", urgent: true }
    if (diff === 1) return { text: "Tomorrow", urgent: true }
    return { text: `${diff} days`, urgent: false }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        {deadlines.length > 0 ? (
          <div className="space-y-3">
            {deadlines.map((hw) => {
              const dueInfo = getDaysUntilDue(hw.due_date)
              return (
                <div key={hw.id} className="p-3 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{hw.title}</p>
                      {hw.subject_name && (
                        <Badge
                          variant="outline"
                          className="mt-1 text-xs"
                          style={{
                            borderColor: hw.subject_color || undefined,
                            color: hw.subject_color || undefined,
                          }}
                        >
                          {hw.subject_name}
                        </Badge>
                      )}
                    </div>
                    <Badge variant={dueInfo.urgent ? "destructive" : "secondary"} className="shrink-0 text-xs">
                      {dueInfo.text}
                    </Badge>
                  </div>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <Calendar className="h-3 w-3" />
                    {formatDate(hw.due_date)}
                  </p>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No upcoming deadlines this week!</p>
        )}
      </CardContent>
    </Card>
  )
}
