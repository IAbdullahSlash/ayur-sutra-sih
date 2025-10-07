"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

type Message = { role: "user" | "assistant"; content: string }

interface AIVoiceAssistantProps {
  label?: string
  context?: string // e.g., "session:123 - Abhyanga on 2025-09-01"
}

export function AIVoiceAssistantButton({ label = "AI Voice Assistant", context }: AIVoiceAssistantProps) {
  const [open, setOpen] = React.useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">{label}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 bg-transparent border-none shadow-none">
        <AIVoiceAssistantBody context={context} />
      </DialogContent>
    </Dialog>
  )
}

// Minimal inline types so TS doesn't need external packages
type WebSpeechRecognition = {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  onresult?: (e: any) => void
  onend?: () => void
}

type WebSpeechRecognitionEvent = {
  resultIndex: number
  results: ArrayLike<{ 0: { transcript: string } }>
}

function AIVoiceAssistantBody({ context }: { context?: string }) {
  const { toast } = useToast()
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: "assistant",
      content:
        "Namaste. I am your Panchakarma companion. Please describe how you felt after the session. I can record your voice and summarize it into structured notes.",
    },
  ])
  const [input, setInput] = React.useState("")
  const [recording, setRecording] = React.useState(false)
  const [recognitionAvailable, setRecognitionAvailable] = React.useState(false)
  const recognitionRef = React.useRef<WebSpeechRecognition | null>(null)
  const [showTranscript, setShowTranscript] = React.useState(false)

  React.useEffect(() => {
    const AnyRec =
      (typeof window !== "undefined" &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) ||
      null
    if (AnyRec) {
      setRecognitionAvailable(true)
      const rec: WebSpeechRecognition = new AnyRec()
      rec.continuous = false
      rec.interimResults = true
      rec.lang = "en-US"
      rec.onresult = (e: WebSpeechRecognitionEvent) => {
        let finalTranscript = ""
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          finalTranscript += e.results[i][0].transcript
        }
        setInput(finalTranscript)
      }
      rec.onend = () => {
        setRecording(false)
      }
      recognitionRef.current = rec
    }
  }, [])

  function speak(text: string) {
    try {
      const utter = new SpeechSynthesisUtterance(text)
      utter.rate = 1
      utter.pitch = 1
      utter.lang = "en-US"
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utter)
    } catch {}
  }

  const toggleRecord = () => {
    if (!recognitionRef.current) return
    if (recording) {
      recognitionRef.current.stop()
      setRecording(false)
    } else {
      try {
        setRecording(true)
        recognitionRef.current.start()
      } catch {
        setRecording(false)
      }
    }
  }

  const stopAndSend = () => {
    if (recognitionRef.current && recording) {
      recognitionRef.current.stop()
    }
    setRecording(false)
    const text = input.trim()
    if (text) {
      setInput("")
      askAssistant(text)
    }
  }

  async function askAssistant(text: string) {
    const userText =
      (context ? `[Context: ${context}] ` : "") +
      text +
      "\nPlease respond in a supportive, non-diagnostic way and summarize actionable self-care steps."

    setMessages((prev) => [...prev, { role: "user", content: text }])

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: userText }),
      })
      const data = await res.json()
      const reply = (data?.text as string) || "I could not generate a reply. Please try again later."
      setMessages((prev) => [...prev, { role: "assistant", content: reply }])
      speak(reply)
    } catch (err: any) {
      const fallback =
        "Thanks for sharing. Note your energy, sleep, appetite, and any discomfort. Hydrate, rest, and follow your prescribed post-therapy guidelines."
      setMessages((prev) => [...prev, { role: "assistant", content: fallback }])
      toast({ title: "Assistant offline", description: "Using a local helpful template response." })
      speak(fallback)
    }
  }

  return (
    <div className="mx-auto w-[320px] sm:w-[360px] h-[560px] rounded-3xl bg-black text-white relative overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="text-sm font-medium">Ayursutra Assistant</div>
        <button
          type="button"
          onClick={() => setShowTranscript((s) => !s)}
          className="text-xs text-white/70 hover:text-white underline underline-offset-2"
          aria-expanded={showTranscript}
        >
          {showTranscript ? "Hide transcript" : "Show transcript"}
        </button>
      </div>

      <div className="flex flex-col items-center justify-center px-5" style={{ height: 400 }}>
        <button
          type="button"
          onClick={toggleRecord}
          aria-pressed={recording}
          className={`relative h-48 w-48 rounded-full bg-white transition-shadow ${
            recording
              ? "ring-4 ring-emerald-400/60 shadow-[0_0_40px_rgba(16,185,129,0.55)] animate-pulse"
              : "ring-1 ring-white/10"
          }`}
          aria-label={recording ? "Stop listening" : "Start listening"}
        />
        <div className="mt-5 text-xs text-white/80">{recording ? "Listening" : "Tap to speak"}</div>
        <div
          className={`absolute blur-2xl rounded-full left-1/2 -translate-x-1/2 ${
            recording ? "bg-emerald-500/15" : "bg-emerald-500/5"
          }`}
          style={{ top: 140, width: 260, height: 260 }}
          aria-hidden
        />
      </div>

      <div className="absolute bottom-4 inset-x-0 px-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={toggleRecord}
            disabled={!recognitionAvailable}
            className="h-12 w-12 rounded-full bg-white/10 text-white flex items-center justify-center border border-white/10 hover:bg-white/15 disabled:opacity-40"
            title={recording ? "Pause" : "Record"}
          >
            <span className="sr-only">{recording ? "Pause" : "Record"}</span>
            {recording ? (
              <span className="inline-block h-4 w-4">
                <span className="inline-block h-4 w-1 bg-white mr-1 align-middle" />
                <span className="inline-block h-4 w-1 bg-white align-middle" />
              </span>
            ) : (
              <span
                className="inline-block h-4 w-4 rounded-full bg-emerald-400"
                aria-hidden
                style={{ boxShadow: "0 0 12px rgba(16,185,129,.6)" }}
              />
            )}
          </button>

          <div className="flex items-center gap-1" aria-label="activity">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full ${recording ? "bg-emerald-400" : "bg-white/30"}`}
                style={recording ? { opacity: (i % 3) / 3 + 0.4 } : {}}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={stopAndSend}
            className="h-12 w-12 rounded-full bg-red-500 text-white flex items-center justify-center shadow hover:bg-red-600"
            title="Stop and send"
          >
            <span className="sr-only">Stop and send</span>✕
          </button>
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Or type your update…"
              aria-label="Your message"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
            />
            <Button
              onClick={() => {
                if (!input.trim()) return
                const text = input.trim()
                setInput("")
                askAssistant(text)
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Send
            </Button>
          </div>
          <p className="text-[10px] text-white/60 mt-2">Supportive guidance only; not a medical diagnosis.</p>
        </div>
      </div>

      {showTranscript && (
        <div className="absolute inset-x-3 top-14 bottom-28 rounded-xl bg-white/5 border border-white/10 p-3 overflow-y-auto">
          <ul className="space-y-3">
            {messages.map((m, idx) => (
              <li key={idx} className={m.role === "user" ? "text-white" : "text-white/80"}>
                <span className="block text-[10px] uppercase tracking-wide opacity-70">
                  {m.role === "user" ? "You" : "Assistant"}
                </span>
                <span className="text-sm">{m.content}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
