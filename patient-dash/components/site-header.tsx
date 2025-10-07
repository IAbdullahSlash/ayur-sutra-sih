"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/support", label: "Support" },
]

export function SiteHeader() {
  const pathname = usePathname()
  return (
    <header className="topbar-gradient">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg text-pretty text-white">
          Ayursutra
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm text-white/90 hover:text-white",
                pathname === l.href ? "font-medium underline decoration-white/60 underline-offset-4" : "",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/auth">
            <Button size="sm" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
              Login / Signup
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
