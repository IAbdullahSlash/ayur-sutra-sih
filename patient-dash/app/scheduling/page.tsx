"use client"

import { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePatientData, bookSession, cancelSession, modifySession } from "@/lib/patient-store"

const therapies = ["Abhyanga", "Shirodhara", "Udwartana", "Pizhichil", "Swedana"]

export default function SchedulingPage() {
  const data = usePatientData()
  const [therapyType, setTherapyType] = useState(therapies[0])
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState<string>("10:00")

  function submit() {
    bookSession({ therapyType, date, time })
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
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
            <Button onClick={submit}>Confirm Booking</Button>
            <p className="text-xs text-muted-foreground">A confirmation notification will be added automatically.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
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
                    {s.date} at {s.time}
                  </div>
                </div>
                <div className="flex gap-2">
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
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
