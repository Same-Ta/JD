"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../context/AuthContext"

export default function GatewayPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user === undefined) return

    if (!user) {
      router.push("/login")
    } else {
      router.push("/jobs")
    }

    setIsLoading(false)
  }, [user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F0F4F8' }}>
        <div className="text-center">
          <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-6 h-6 bg-white/30 rounded rotate-45"></div>
          </div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return null
}
