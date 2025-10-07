import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: NextRequest) {
  const { input } = await req.json()
  const hasKey = !!process.env.OPENAI_API_KEY

  if (!hasKey) {
    // Fallback: helpful template guidance when no API key is configured
    const mock =
      "I hear you. After your Panchakarma session, keep meals light and warm, hydrate, and rest. Track pain (0–10), energy (0–10), and sleep hours. If symptoms persist or worsen, contact your physician."
    return NextResponse.json({ text: mock })
  }

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    system:
      "You are Ayursutra, a compassionate Panchakarma assistant. Provide supportive, non-diagnostic guidance, summarize key points, and list 2–4 self-care actions. Encourage contacting clinicians for concerns.",
    prompt: String(input || ""),
  })
  return NextResponse.json({ text })
}
