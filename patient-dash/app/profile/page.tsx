"use client"

import { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePatientData, updateProfile } from "@/lib/patient-store"
import { toCSV } from "@/lib/csv"

export default function ProfilePage() {
  const data = usePatientData()
  const [name, setName] = useState(data.profile.name)
  const [age, setAge] = useState<number | undefined>(data.profile.age)
  const [email, setEmail] = useState(data.profile.email)
  const [phone, setPhone] = useState(data.profile.phone)
  const [history, setHistory] = useState(data.profile.medicalHistory)
  const [prefs, setPrefs] = useState(data.profile.therapyPreferences)
  const [goal, setGoal] = useState(data.profile.goalSessions)

  function save() {
    updateProfile({
      name,
      age,
      email,
      phone,
      medicalHistory: history,
      therapyPreferences: prefs,
      goalSessions: goal,
    })
    alert("Profile updated.")
  }

  function downloadCSV() {
    const rows = data.sessions.map((s) => ({
      id: s.id,
      therapyType: s.therapyType,
      date: s.date,
      time: s.time,
      status: s.status,
    }))
    const csv = toCSV(rows)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "therapy-history.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-8 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Age</Label>
                <Input
                  type="number"
                  value={age ?? 0}
                  onChange={(e) => setAge(Number.parseInt(e.target.value) || undefined)}
                />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Medical History</Label>
              <Input value={history} onChange={(e) => setHistory(e.target.value)} placeholder="Brief notes" />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Therapy Preferences</Label>
                <Input value={prefs} onChange={(e) => setPrefs(e.target.value)} placeholder="e.g., Abhyanga" />
              </div>
              <div className="space-y-1">
                <Label>Goal Sessions</Label>
                <Input type="number" value={goal} onChange={(e) => setGoal(Number.parseInt(e.target.value) || 7)} />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={save}>Save</Button>
              <Button variant="secondary" onClick={downloadCSV}>
                Download History (CSV)
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
