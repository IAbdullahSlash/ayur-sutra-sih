"use client"

import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import {
  usePatientData,
  sessionsCompletedCount,
  bookSession,
  cancelSession,
  modifySession,
  markNotificationRead,
  addFeedbackWithMedia, // use store to save manual feedback with media
} from "@/lib/patient-store"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import ConnectGoogleFitButton from "@/components/connect-google-fit"
import { AIVoiceAssistantButton } from "@/components/ai-voice-assistant"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const therapies = ["Abhyanga", "Shirodhara", "Udwartana", "Pizhichil", "Swedana"]
const sideEffectOptions = ["Headache", "Fatigue", "Nausea", "Soreness"]

export default function DashboardPage() {
  const data = usePatientData()
  const completed = sessionsCompletedCount(data)
  const total = data.profile.goalSessions || 7

  // Scheduling form state (brought from Scheduling page into dashboard)
  const [therapyType, setTherapyType] = useState(therapies[0])
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState<string>("10:00")

  // Feedback modal state
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackSessionId, setFeedbackSessionId] = useState<string>("")
  const [improved, setImproved] = useState<"yes" | "no">("yes")
  const [sideEffects, setSideEffects] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [rating, setRating] = useState(4)
  const [files, setFiles] = useState<FileList | null>(null)
  const [feedbackMode, setFeedbackMode] = useState<"manual" | "ai">("manual") // allow choosing Manual vs AI

  function toggleSideEffect(s: string) {
    setSideEffects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  function openFeedback(sessionId: string) {
    setFeedbackSessionId(sessionId)
    setImproved("yes")
    setSideEffects([])
    setNotes("")
    setRating(4)
    setFiles(null)
    setFeedbackMode("manual") // default to Manual when opening
    setFeedbackOpen(true)
  }

  function submitFeedback() {
    if (!feedbackSessionId) return
    addFeedbackWithMedia({
      sessionId: feedbackSessionId,
      improved,
      sideEffects,
      notes,
      rating,
      mediaFiles: files ? Array.from(files) : undefined,
    })
    setFeedbackOpen(false)
  }

  function submitBooking() {
    bookSession({ therapyType, date, time })
  }

  const baseProgress = Array.isArray(data.progress) ? data.progress : []
  const defaultMock = [
    { date: "Day 1", pain: 6, energy: 4, sleep: 6 },
    { date: "Day 2", pain: 6, energy: 5, sleep: 6.5 },
    { date: "Day 3", pain: 5, energy: 5, sleep: 7 },
    { date: "Day 4", pain: 4, energy: 6, sleep: 7 },
    { date: "Day 5", pain: 4, energy: 6, sleep: 7.5 },
    { date: "Day 6", pain: 3, energy: 7, sleep: 8 },
    { date: "Day 7", pain: 3, energy: 7, sleep: 8 },
  ]
  const chartData = (baseProgress.length ? baseProgress : defaultMock).map((p, i) => ({
    date: (p as any).date || (p as any).day || (p as any).idx || `Day ${i + 1}`,
    pain: Number((p as any).pain ?? (p as any).painLevel ?? 5),
    energy: Number((p as any).energy ?? (p as any).energyLevel ?? 5),
    sleep: Number((p as any).sleep ?? (p as any).sleepHours ?? 7),
  }))

  const improvementData = chartData.map((item, index) => {
    // Calculate overall improvement based on pain reduction, energy increase, and sleep improvement
    const painImprovement = Math.max(0, ((6 - item.pain) / 6) * 100) // Pain started at 6, lower is better
    const energyImprovement = Math.max(0, ((item.energy - 4) / 6) * 100) // Energy started at 4, higher is better
    const sleepImprovement = Math.max(0, ((item.sleep - 6) / 4) * 100) // Sleep started at 6, higher is better

    const overallImprovement = Math.round((painImprovement + energyImprovement + sleepImprovement) / 3)

    return {
      date: item.date,
      improvement: Math.min(100, overallImprovement), // Cap at 100%
    }
  })

  return (
    <main className="app-surface">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-8 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 grid gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Welcome, {data.profile.name || "Guest"}</h1>
            <div className="flex gap-2">
              <AIVoiceAssistantButton label="AI Assistant" context="dashboard:assistant" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Dosha Status Tracking */}
            <Card className="frosted-card">
              <CardHeader className="section-header">
                <CardTitle className="text-base">Dosha Status Tacking</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="text-sm">
                  {completed}/{total} sessions completed
                </div>
                <div className="h-2 bg-muted rounded-full">
                  <div
                    className="h-2 bg-primary rounded-full"
                    style={{ width: `${Math.min(100, (completed / total) * 100)}%` }}
                  />
                </div>

                <div className="w-full" style={{ height: 224 }}>
                  <ChartContainer
                    className="w-full h-56 aspect-auto"
                    config={{
                      pain: { label: "Pain (↓ better)", color: "#8b5e3c" },
                      energy: { label: "Energy", color: "#2f855a" },
                      sleep: { label: "Sleep (hrs)", color: "#1e4d91" },
                    }}
                  >
                    <LineChart data={chartData} margin={{ top: 8, right: 12, left: 12, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 10]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="pain"
                        stroke="var(--color-pain)"
                        name="Pain (↓ better)"
                        dot={false}
                      />
                      <Line type="monotone" dataKey="energy" stroke="var(--color-energy)" name="Energy" dot={false} />
                      <Line
                        type="monotone"
                        dataKey="sleep"
                        stroke="var(--color-sleep)"
                        name="Sleep (hrs)"
                        dot={false}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>

                {data.milestones && data.milestones.length > 0 && (
                  <div className="grid gap-2">
                    <div className="text-sm font-medium">Milestones</div>
                    <ul className="grid gap-2">
                      {data.milestones.map((m) => (
                        <li key={m.id} className="flex items-center gap-2 text-sm">
                          <span
                            className={`inline-block h-2 w-2 rounded-full ${m.achieved ? "bg-green-600" : "bg-muted"}`}
                            aria-hidden
                          />
                          <span>
                            {m.label}
                            {m.achieved && m.date ? <span className="text-muted-foreground"> — {m.date}</span> : null}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Connect with Google Fit */}
                <ConnectGoogleFitButton className="pt-2" />
              </CardContent>
            </Card>

            <Card className="frosted-card">
              <CardHeader className="section-header">
                <CardTitle className="text-base">Overall Improvement</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="text-sm text-muted-foreground">
                  Daily progress percentage based on pain reduction, energy increase, and sleep quality
                </div>

                <div className="w-full" style={{ height: 224 }}>
                  <ChartContainer
                    className="w-full h-56 aspect-auto"
                    config={{
                      improvement: { label: "Improvement %", color: "#059669" },
                    }}
                  >
                    <LineChart data={improvementData} margin={{ top: 8, right: 12, left: 12, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="improvement"
                        stroke="var(--color-improvement)"
                        name="Improvement %"
                        strokeWidth={3}
                        dot={{ fill: "#059669", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {improvementData[improvementData.length - 1]?.improvement || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Current Overall Improvement</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Book a Session */}
          <Card className="frosted-card">
            <CardHeader className="section-header">
              <CardTitle className="text-base">Book a Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Therapy</Label>
                <select
                  className="w-full h-10 rounded-md border bg-background px-3"
                  value={therapyType}
                  onChange={(e) => setTherapyType(e.target.value)}
                >
                  {therapies.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Time</Label>
                  <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
              </div>
              <Button onClick={submitBooking}>Confirm Booking</Button>
              <p className="text-xs text-muted-foreground">A confirmation notification will be added automatically.</p>
            </CardContent>
          </Card>

          {/* Sessions list with per-completed-session feedback */}
          <Card className="frosted-card">
            <CardHeader className="section-header">
              <CardTitle className="text-base">Your Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.sessions.length === 0 && <p className="text-sm text-muted-foreground">No sessions yet.</p>}
              {data.sessions.map((s) => (
                <div key={s.id} className="border rounded-md p-3 flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-medium">
                      {s.therapyType} — {s.status}
                    </div>
                    <div className="text-muted-foreground">
                      {s.date} at {s.time} {s.therapist ? `• ${s.therapist}` : ""}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {s.status === "scheduled" && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            const nd = prompt("New date (YYYY-MM-DD)", s.date) || s.date
                            const nt = prompt("New time (HH:mm)", s.time) || s.time
                            modifySession(s.id, { date: nd, time: nt })
                          }}
                        >
                          Reschedule
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => cancelSession(s.id)}>
                          Cancel
                        </Button>
                      </>
                    )}
                    {s.status === "completed" && (
                      <Button variant="secondary" size="sm" onClick={() => openFeedback(s.id)}>
                        Feedback
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar for Notifications */}
        <aside className="md:col-span-1">
          <Card className="frosted-card">
            <CardHeader className="section-header">
              <CardTitle className="text-base">Reminders & Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.notifications.length === 0 && <p className="text-sm text-muted-foreground">No notifications.</p>}
              {data.notifications.map((n) => (
                <div key={n.id} className="border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{n.title}</div>
                    {!n.read && (
                      <Button size="sm" variant="secondary" onClick={() => markNotificationRead(n.id)}>
                        Mark read
                      </Button>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{n.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
              ))}
              <div className="pt-1">
                <Link href="/notifications">
                  <Button size="sm" variant="ghost" className="w-full justify-center">
                    Manage preferences
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>

      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Post-session Feedback</DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-2 pb-2">
            <Button
              type="button"
              variant={feedbackMode === "manual" ? "default" : "secondary"}
              size="sm"
              onClick={() => setFeedbackMode("manual")}
            >
              Manual form
            </Button>
            <Button
              type="button"
              variant={feedbackMode === "ai" ? "default" : "secondary"}
              size="sm"
              onClick={() => setFeedbackMode("ai")}
            >
              AI voice assistant
            </Button>
          </div>

          {feedbackMode === "manual" ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Symptoms improved?</Label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="improved"
                      checked={improved === "yes"}
                      onChange={() => setImproved("yes")}
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="improved"
                      checked={improved === "no"}
                      onChange={() => setImproved("no")}
                    />
                    No
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Any side effects?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {sideEffectOptions.map((se) => (
                    <label key={se} className="flex items-center gap-2 text-sm border rounded-md p-2">
                      <input type="checkbox" checked={sideEffects.includes(se)} onChange={() => toggleSideEffect(se)} />
                      {se}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Share any observations..."
                />
              </div>

              <div className="space-y-1">
                <Label>Attachments (images/videos allowed)</Label>
                <Input type="file" multiple accept="image/*,video/*" onChange={(e) => setFiles(e.target.files)} />
                {!!files?.length && (
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {Array.from(files).map((f) => (
                      <div key={f.name} className="text-xs text-muted-foreground truncate">
                        {f.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label>Satisfaction rating (1–5)</Label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={rating}
                  onChange={(e) => setRating(Number.parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          ) : (
            <div className="py-4">
              <AIVoiceAssistantButton
                label="Start AI Voice Assistant"
                context={(() => {
                  const s = data.sessions.find((x) => x.id === feedbackSessionId)
                  return s ? `session:${s.id} ${s.therapyType} on ${s.date} ${s.time}` : "feedback:unspecified-session"
                })()}
              />
              <p className="text-xs text-muted-foreground mt-3">
                Prefer talking instead of typing? Use the voice assistant to record your post-session feedback.
              </p>
            </div>
          )}

          {feedbackMode === "manual" ? (
            <DialogFooter>
              <Button variant="ghost" onClick={() => setFeedbackOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitFeedback} disabled={!feedbackSessionId}>
                Submit
              </Button>
            </DialogFooter>
          ) : (
            <DialogFooter>
              <Button variant="ghost" onClick={() => setFeedbackOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
