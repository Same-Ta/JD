"use client"

import React from "react"

type CardProps = React.HTMLAttributes<HTMLDivElement>

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div {...props} className={`rounded-lg bg-card border border-border ${className}`}>
      {children}
    </div>
  )
}

export default Card
