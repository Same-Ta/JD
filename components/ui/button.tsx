"use client"

import React from "react"
import { Slot } from "@radix-ui/react-slot"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md" | "lg"
  asChild?: boolean
}

export const Button: React.FC<ButtonProps> = ({ size = "md", className = "", children, asChild = false, ...props }) => {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  }

  const classes =
    `inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:bg-primary/90 transition-all ${
      sizeClasses[size]
    } ` + className

  if (asChild) {
    return (
      <Slot {...(props as any)} className={classes}>
        {children}
      </Slot>
    )
  }

  return (
    <button {...props} className={classes}>
      {children}
    </button>
  )
}

export default Button
