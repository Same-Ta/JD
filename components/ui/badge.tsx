"use client"

import React from "react"

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "outline" | "secondary"
}

export function Badge({ children, className = "", variant = "default", ...props }: BadgeProps) {
  const base = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
  const variants: Record<string, string> = {
    default: "bg-muted text-foreground",
    outline: "border border-border bg-transparent",
    secondary: "bg-secondary text-secondary-foreground",
  }

  return (
    <span {...props} className={`${base} ${variants[variant] ?? variants.default} ${className}`}>
      {children}
    </span>
  )
}

export default Badge
