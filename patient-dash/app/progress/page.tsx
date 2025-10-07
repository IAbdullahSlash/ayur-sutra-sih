"use client"

import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePatientData, sessionsCompletedCount } from "@/lib/patient-store"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function ProgressPage() {
  const data = usePatientData()
  const completed = sessionsCompletedCount(data)
  const total = data.profile.goalSessions || 7

  // Build a simple timeseries from feedback ratings
  const points = data.feedback
    .slice()
    .reverse()
    .map((f, idx) => ({
      idx: idx + 1,
      rating: f.rating,
    }))

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Therapy Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm mb-2">
              {completed}/{total} sessions completed
            </div>
            <div className="h-2 bg-muted rounded-full">
              <div
                className="h-2 bg-primary rounded-full"
                style={{ width: `${Math.min(100, (completed / total) * 100)}%` }}
              />
            </div>
            <ul className="mt-3 text-sm list-disc pl-5 space-y-1">
              <li>
                Milestone: Completed {Math.min(completed, total)} of {total} sessions
              </li>
              <li>Next: Keep consistent schedule and hydration</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Well-being Trend (Rating)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="idx" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="rating" stroke="var(--color-chart-1)" dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Ratings come from your feedback after each session.</p>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
