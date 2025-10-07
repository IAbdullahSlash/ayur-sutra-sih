"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

type Props = {
  className?: string
}

export default function ConnectGoogleFitButton({ className }: Props) {
  const { toast } = useToast()
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      const val = localStorage.getItem("googleFitConnected")
      setConnected(val === "true")
    } catch {
      // ignore
    }
  }, [])

  const handleConnect = async () => {
    setLoading(true)
    try {
      // Simulate OAuth connection flow
      await new Promise((r) => setTimeout(r, 600))
      localStorage.setItem("googleFitConnected", "true")
      setConnected(true)
      toast({
        title: "Connected to Google Fit",
        description: "Health Monitoring can now sync with Google Fit data.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      <Button variant={connected ? "secondary" : "default"} onClick={handleConnect} disabled={connected || loading}>
        {connected ? "Connected to Google Fit" : loading ? "Connecting..." : "Connect with Google Fit"}
      </Button>
    </div>
  )
}
