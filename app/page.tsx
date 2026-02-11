import type React from "react"
import Link from "next/link"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { BookOpen, Calendar, CheckCircle, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function HomePage() {
  const user = await getSession()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Scholium</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
              Manage Your University Homework with Ease
            </h1>
            <p className="text-lg text-muted-foreground mb-8 text-pretty">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. A non perferendis soluta provident accusantium facere doloremque quae voluptatibus, aut eveniet nam suscipit praesentium dolor maiores quibusdam velit, nostrum, vel harum.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg">Create Account</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted/50">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold text-center text-foreground mb-12">
              lorem ipsum dolor sit amet consectetur
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={<Calendar className="h-8 w-8" />}
                title="Timetable View"
                description="lorem ipsum dolor sit amet consectetur adipisicing elit"
              />
              <FeatureCard
                icon={<CheckCircle className="h-8 w-8" />}
                title="Track Progress"
                description="lorem ipsum dolor sit amet consectetur adipisicing elit"
              />
              <FeatureCard
                icon={<BookOpen className="h-8 w-8" />}
                title="File Attachments"
                description="lorem ipsum dolor sit amet consectetur adipisicing elit"
              />
              <FeatureCard
                icon={<Users className="h-8 w-8" />}
                title="Role-Based Access"
                description="lorem ipsum dolor sit amet consectetur adipisicing elit"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Scholium. By students, for students.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
