"use client"

import React from "react"

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea(props: TextareaProps) {
  const { className = "", ...rest } = props
  return <textarea {...rest} className={`rounded-md border border-border bg-background text-foreground p-2 ${className}`} />
}

export default Textarea
