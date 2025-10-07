"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { updateProfile } from "@/lib/patient-store"

const symptomOptions = ["Stress", "Back pain", "Insomnia", "Digestive issues"]
const timeWindows = ["Morning", "Afternoon", "Evening"]
const therapies = ["Abhyanga", "Shirodhara", "Udwartana", "Pizhichil", "Swedana"]

export default function SurveyPage() {
  const router = useRouter()
  const [goals, setGoals] = useState("")
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [preferredTime, setPreferredTime] = useState(timeWindows[0])
  const [therapyPref, setTherapyPref] = useState(therapies[0])
  const [goalSessions, setGoalSessions] = useState(7)

  function toggleSymptom(s: string) {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  function submit() {
    updateProfile({
      therapyPreferences: therapyPref,
      goalSessions: Number.isFinite(goalSessions) ? goalSessions : 7,
      medicalHistory: `Goals: ${goals || "n/a"} | Symptoms: ${symptoms.join(", ") || "none"} | Preferred time: ${preferredTime}`,
    })
    router.push("/dashboard")
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-2xl px-4 py-8 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tell us about your goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Health goals</Label>
              <Input
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="e.g., Reduce stress and improve sleep"
              />
            </div>

            <div className="space-y-1">
              <Label>Current symptoms</Label>
              <div className="grid grid-cols-2 gap-2">
                {symptomOptions.map((s) => (
                  <label key={s} className="flex items-center gap-2 text-sm border rounded-md p-2">
                    <input type="checkbox" checked={symptoms.includes(s)} onChange={() => toggleSymptom(s)} />
                    {s}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Preferred time window</Label>
                <select
                  className="w-full h-10 rounded-md border bg-background px-3"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                >
                  {timeWindows.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Therapy preference</Label>
                <select
                  className="w-full h-10 rounded-md border bg-background px-3"
                  value={therapyPref}
                  onChange={(e) => setTherapyPref(e.target.value)}
                >
                  {therapies.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Number of sessions goal</Label>
              <Input
                type="number"
                min={1}
                max={21}
                value={goalSessions}
                onChange={(e) => setGoalSessions(Number.parseInt(e.target.value) || 7)}
              />
            </div>

            <Button onClick={submit} className="w-full">
              Save and continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
