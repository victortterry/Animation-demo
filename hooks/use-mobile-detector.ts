"use client"

import { useState, useEffect } from "react"

export function useMobileDetector() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Function to check if the device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1000) // Changed from 768px to 1000px
    }

    // Initial check
    checkMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile)

    // Clean up
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}
