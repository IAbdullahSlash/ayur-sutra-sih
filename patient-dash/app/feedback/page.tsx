"use client"

import { useMemo, useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addFeedbackWithMedia, usePatientData } from "@/lib/patient-store"
import { AIVoiceAssistantButton } from "@/components/ai-voice-assistant"

const sideEffectOptions = ["Headache", "Fatigue", "Nausea", "Soreness"]

export default function FeedbackPage() {
  const data = usePatientData()
  const completedSessions = useMemo(() => data.sessions.filter((s) => s.status === "completed"), [data.sessions])
  const [selectedSessionId, setSelectedSessionId] = useState<string>(completedSessions[0]?.id || "")
  const [improved, setImproved] = useState<"yes" | "no">("yes")
  const [sideEffects, setSideEffects] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [rating, setRating] = useState(4)
  const [files, setFiles] = useState<FileList | null>(null)

  const selected = completedSessions.find((s) => s.id === selectedSessionId)

  function toggleSideEffect(s: string) {
    setSideEffects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  function submit() {
    if (!selectedSessionId) {
      alert("Feedback can only be submitted for completed sessions.")
      return
    }
    addFeedbackWithMedia({
      improved,
      sideEffects,
      notes,
      rating,
      sessionId: selectedSessionId,
      mediaFiles: files ? Array.from(files) : undefined,
    })
    setNotes("")
    setFiles(null)
    alert("Feedback submitted. Thank you!")
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-8 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Post-session Assistant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Select Completed Session</Label>
              {completedSessions.length ? (
                <select
                  className="w-full h-10 rounded-md border bg-background px-3"
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                >
                  {completedSessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.therapyType} — {s.date} {s.time}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-muted-foreground">
                  You have no completed sessions yet. The assistant will unlock after your first completed session.
                </p>
              )}
            </div>

            <AIVoiceAssistantButton
              label="Open AI Voice Assistant"
              context={
                selected
                  ? `session:${selected.id} ${selected.therapyType} on ${selected.date} ${selected.time}`
                  : "feedback:no-session"
              }
            />

            {/* retain traditional feedback form elements below the AI Voice Assistant launcher */}
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
                  <input type="radio" name="improved" checked={improved === "no"} onChange={() => setImproved("no")} />
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
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Share any observations..." />
            </div>

            <div className="space-y-1">
              <Label>Attachments (images/videos)</Label>
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

            <Button onClick={submit} disabled={!completedSessions.length}>
              Submit Feedback
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Previous Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.feedback.length === 0 && <p className="text-sm text-muted-foreground">No feedback yet.</p>}
            {data.feedback.map((f) => (
              <div key={f.id} className="border rounded-md p-3 text-sm">
                <div className="font-medium">
                  Rating: {f.rating}/5 • Improved: {f.improved}
                </div>
                <div className="text-muted-foreground">
                  Side effects: {f.sideEffects.length ? f.sideEffects.join(", ") : "None"}
                </div>
                {f.notes && <div className="mt-1">{f.notes}</div>}
                {f.media && f.media.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {f.media.map((m, idx) =>
                      m.type === "image" ? (
                        <img
                          key={idx}
                          src={m.url || "/placeholder.svg"}
                          alt={m.name || "attachment"}
                          className="rounded-md object-cover"
                        />
                      ) : m.type === "video" ? (
                        <video key={idx} src={m.url} controls className="rounded-md" />
                      ) : (
                        <a
                          key={idx}
                          href={m.url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline text-xs break-all"
                        >
                          {m.name || "file"}
                        </a>
                      ),
                    )}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1">{new Date(f.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
