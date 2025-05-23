"use client"

import type React from "react"

import { useState, useEffect, useRef, type RefObject } from "react"
import type { MotionValue } from "framer-motion"

interface PositionState {
  isPositioned: boolean
  anchor: { x: number; y: number }
  restPosition: { x: number; y: number }
}

export function useInitElasticBoxPositions(
  containerRef: RefObject<HTMLDivElement>,
  isMobile: boolean,
  x: MotionValue<number>,
  y: MotionValue<number>,
  rotation: MotionValue<number>,
): [PositionState, { velocityX: React.MutableRefObject<number>; velocityY: React.MutableRefObject<number> }] {
  // State to track if positions have been initialized
  const [isPositioned, setIsPositioned] = useState(false)

  // Anchor point (center of the screen, outside the window)
  const [anchor, setAnchor] = useState({ x: 0, y: -150 }) // Start with negative y to be off-screen

  // Natural resting position (where the badge settles due to gravity)
  const [restPosition, setRestPosition] = useState({ x: 0, y: 0 })

  // Track velocity for more dynamic movement
  const velocityX = useRef(0)
  const velocityY = useRef(0)

  // Initialize positions immediately on mount, before first render
  useEffect(() => {
    // Function to calculate and set initial positions
    const initializePositions = () => {
      if (!containerRef.current) return false

      const rect = containerRef.current.getBoundingClientRect()

      if (isMobile) {
        // Mobile layout: static badge closer to the text
        const centerX = rect.width * 0.5 // Center horizontally
        const topY = rect.height * 0.35 // Position for mobile

        // Set initial position for mobile
        x.set(centerX)
        y.set(topY)
      } else {
        // Desktop layout: badge on right side
        const centerX = rect.width * 0.5 // Center of the screen
        const badgeX = centerX + 300 // Badge positioned to the right
        const higherY = rect.height * 0.25 // Higher position

        // Set anchor point
        setAnchor({
          x: badgeX,
          y: -100,
        })

        // Set rest position (where the badge will eventually settle)
        setRestPosition({
          x: badgeX,
          y: higherY,
        })

        // Set initial position OFF-SCREEN to the RIGHT
        const startX = window.innerWidth + 200 // Start position off-screen to the right
        x.set(startX)
        y.set(higherY)

        // Set initial rotation for a more dramatic entrance
        rotation.set(15) // Positive rotation for right-to-left swing

        // Set initial velocity as if it was released from outside the window
        velocityX.current = -15 // Strong initial velocity to the left
      }

      return true
    }

    // Try to initialize positions
    const success = initializePositions()

    // Mark as positioned if successful
    if (success) {
      setIsPositioned(true)
    } else {
      // If not successful (container not ready), try again after a short delay
      const timer = setTimeout(() => {
        if (initializePositions()) {
          setIsPositioned(true)
        }
      }, 10)

      return () => clearTimeout(timer)
    }
  }, [isMobile, x, y, rotation, containerRef])

  // Update anchor point and rest position when container size changes
  useEffect(() => {
    if (!containerRef.current || !isPositioned) return

    const updatePositions = () => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        if (isMobile) {
          // Mobile layout: static badge closer to the text
          const centerX = rect.width * 0.5 // Center horizontally

          // Position badge on mobile, with adjusted position
          const topY = rect.height * 0.35 // Keep mobile position the same

          // For mobile, we don't need to set anchor since there's no band
          // But we still set the badge position
          x.set(centerX)
          y.set(topY)
        } else {
          // Desktop layout: centered content with badge on right side
          const centerX = rect.width * 0.5 // Center of the screen
          const badgeX = centerX + 300 // Badge positioned 300px to the right of center (increased from 200px)
          const higherY = rect.height * 0.25 // Changed from 0.35 to 0.25 to move badge ~50px higher

          // Position anchor above the badge's position - ADJUSTED to be more directly above
          setAnchor({
            x: badgeX, // Align anchor X with badge X for more natural hanging
            y: -100, // Closer to the top of the screen for shorter band
          })

          // Set natural resting position for desktop
          setRestPosition({
            x: badgeX,
            y: higherY,
          })

          // Don't reset position on resize to avoid interrupting animations
          // Only set if we're not already positioned
          if (!isPositioned) {
            // Set initial position OFF-SCREEN to the RIGHT
            const startX = window.innerWidth + 200 // Start position off-screen to the right
            x.set(startX)
            y.set(higherY)

            // Set initial rotation for a more dramatic entrance
            rotation.set(15) // Positive rotation for right-to-left swing

            // Set initial velocity as if it was released from outside the window
            velocityX.current = -15 // Strong initial velocity to the left
          }
        }
      }
    }

    // Run immediately on mount
    updatePositions()

    // Handle window resize
    window.addEventListener("resize", updatePositions)
    return () => window.removeEventListener("resize", updatePositions)
  }, [x, y, rotation, isMobile, isPositioned, containerRef])

  return [
    { isPositioned, anchor, restPosition },
    { velocityX, velocityY },
  ]
}
