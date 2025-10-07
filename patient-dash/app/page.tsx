import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-2 items-center">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-semibold text-balance">Panchakarma Care, Simplified</h1>
          <p className="text-foreground/80">
            Schedule therapies, receive gentle reminders, track your recovery, and share feedback—all in one calm,
            Ayurveda-inspired space.
          </p>
          <div className="flex gap-3">
            <Link href="/auth">
              <Button>Get Started</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary">View Dashboard</Button>
            </Link>
          </div>
        </div>
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Benefits for Patients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Easy therapy scheduling with confirmations</p>
            <p>• Pre and post-procedure reminders (in-app, email/SMS toggles)</p>
            <p>• Progress visualization with milestones</p>
            <p>• Integrated feedback after each session</p>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
