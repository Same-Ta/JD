"use client"

import React from "react"

type Props = {
  title?: string
  subtitle?: string
  children?: React.ReactNode
}

export default function PageShell({ title, subtitle, children }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {title && <h1 className="text-[var(--heading-1)] font-bold leading-tight">{title}</h1>}
          {subtitle && <p className="text-[var(--font-size-sm)] text-muted mt-1">{subtitle}</p>}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
