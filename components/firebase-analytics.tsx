"use client"

import { useEffect } from "react"
import { initializeAnalytics } from "@/lib/firebase"

export default function FirebaseAnalytics() {
  useEffect(() => {
    const init = async () => {
      await initializeAnalytics()
    }
    init()
  }, [])

  return null
}

