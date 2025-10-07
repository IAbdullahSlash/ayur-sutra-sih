import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const faqs = [
  {
    q: "What is Panchakarma?",
    a: "A holistic Ayurvedic cleansing and rejuvenation therapy tailored to individual needs.",
  },
  {
    q: "How do reminders work?",
    a: "Pre/post reminders appear in Notifications. Email/SMS toggles are available for later integration.",
  },
  { q: "Can I reschedule?", a: "Yes. Visit Scheduling to modify or cancel sessions." },
]

export default function SupportPage() {
  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-8 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Help Center</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i}>
                <div className="font-medium">{f.q}</div>
                <div className="text-sm text-muted-foreground">{f.a}</div>
              </div>
            ))}
            <div>
              <div className="font-medium">Contact</div>
              <div className="text-sm text-muted-foreground">Use the feedback page or email support@example.com</div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
