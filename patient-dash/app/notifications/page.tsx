"use client"

import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { usePatientData, setNotificationPrefs, markNotificationRead } from "@/lib/patient-store"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function NotificationsPage() {
  const data = usePatientData()
  const prefs = data.profile.notificationPref

  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="inapp">In-app</Label>
              <Switch
                id="inapp"
                checked={prefs.inApp}
                onCheckedChange={(v) => setNotificationPrefs({ ...prefs, inApp: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email">Email</Label>
              <Switch
                id="email"
                checked={prefs.email}
                onCheckedChange={(v) => setNotificationPrefs({ ...prefs, email: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms">SMS</Label>
              <Switch
                id="sms"
                checked={prefs.sms}
                onCheckedChange={(v) => setNotificationPrefs({ ...prefs, sms: v })}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Email/SMS are simulated in this prototype; in-app reminders are functional.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reminders & Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.notifications.length === 0 && <p className="text-sm text-muted-foreground">No notifications yet.</p>}
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
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
