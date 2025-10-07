"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfile, usePatientData } from "@/lib/patient-store"

export default function AuthPage() {
  const data = usePatientData()
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "signup">("signup")
  const [name, setName] = useState(data.profile.name || "")
  const [email, setEmail] = useState(data.profile.email || "")
  const [phone, setPhone] = useState(data.profile.phone || "")
  const [password, setPassword] = useState("")

  function submit() {
    // Demo: persist name/email/phone; password unused.
    updateProfile({ name, email, phone })
    router.push("/survey")
  }

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-md px-4 py-10">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{mode === "signup" ? "Create account" : "Login"}</CardTitle>
            <Button variant="secondary" size="sm" onClick={() => setMode(mode === "signup" ? "login" : "signup")}>
              {mode === "signup" ? "Have an account? Login" : "New here? Sign up"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 000 0000"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button className="w-full" onClick={submit}>
              {mode === "signup" ? "Sign up" : "Login"}
            </Button>
            <p className="text-xs text-muted-foreground">
              OTP login can be added later; for this prototype we persist basic profile details.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
