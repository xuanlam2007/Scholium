import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { getHomework, getSubjects, getUpcomingDeadlines } from "@/app/actions/homework"
import { getCurrentScholiumId, getScholiumMembers } from "@/app/actions/scholium"

export default async function DashboardPage() {
  const user = await getSession()

  if (!user) {
    redirect("/login")
  }

  const scholiumId = await getCurrentScholiumId()
  if (!scholiumId) {
    redirect("/scholiums")
  }

  const [homework, subjects, upcomingDeadlines, members] = await Promise.all([
    getHomework(),
    getSubjects(),
    getUpcomingDeadlines(),
    getScholiumMembers(scholiumId),
  ])

  // Check if user is a member and if they're a host
  const userMember = members.find((m) => m.user_id === user.id)
  const canAddHomework = !!userMember && (userMember.can_add_homework ?? true)
  const isHost = !!userMember && userMember.is_host

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
          </div>
          <aside className="space-y-6">
          </aside>
        </div>
      </main>
    </div>
  )
}
