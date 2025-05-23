"use client"

import { useRef } from "react"
import { useMotionValue, useTransform } from "framer-motion"
import { useMobileDetector } from "./hooks/use-mobile-detector"
import { useInitElasticBoxPositions } from "./hooks/use-init-elastic-box-positions"
import { useGravityEffect } from "./hooks/use-gravity-effect"
import Badge from "./badge"
import Content from "./content"
import Footer from "./footer"
import { type BadgeConfig, defaultBadgeConfig } from "./types/badge-config"

interface ElasticBoxPhysicsProps {
  config?: Partial<BadgeConfig>
}

export default function ElasticBoxPhysics({ config = {} }: ElasticBoxPhysicsProps) {
  // Merge default config with provided config
  const mergedConfig: BadgeConfig = { ...defaultBadgeConfig, ...config }

  // Detect if on mobile device
  const isMobile = useMobileDetector()

  // Reference to the container to get its dimensions
  const containerRef = useRef<HTMLDivElement>(null)

  // Motion values for the box position
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Motion value for rotation
  const rotation = useMotionValue(0)

  // Add these after the rotation motion value
  const holeX = useTransform(x, (latest) => latest) // Same X as badge
  const holeY = useTransform(y, (latest) => latest - 40) // Offset Y to match hole position

  // Initialize positions with our custom hook
  const [{ isPositioned, anchor, restPosition }, { velocityX, velocityY }] = useInitElasticBoxPositions(
    containerRef,
    isMobile,
    x,
    y,
    rotation,
  )

  // Spring physics configuration - MORE bounce
  const springConfig = { damping: 8, stiffness: 120, mass: 3 }

  // Gravity strength - REDUCED to ensure badge stays centered
  const gravityStrength = 0 // No gravity to ensure badge stays at exact position

  // Track if currently dragging - using ref to avoid re-renders
  const isDraggingRef = useRef(false)

  // Track bounce count to apply progressive damping
  const bounceCountX = useRef(0)
  const bounceCountY = useRef(0)
  const lastVelocityX = useRef(0)
  const lastVelocityY = useRef(0)

  // Store the initial pointer position and badge position for custom dragging
  const initialPointerX = useRef(0)
  const initialPointerY = useRef(0)
  const initialBadgeX = useRef(0)
  const initialBadgeY = useRef(0)

  // Flag to track if initial animation has played
  const hasAnimatedRef = useRef(false)

  // Calculate the distance from anchor to determine string tension
  const distance = useTransform([x, y], ([latestX, latestY]) => {
    const dx = latestX - anchor.x
    const dy = latestY - anchor.y
    return Math.sqrt(dx * dx) + Math.sqrt(dy * dy)
  })

  // String tension affects the color (red-themed gradient)
  const stringColor = useTransform(distance, [0, 300, 600], ["#ff6b6b", "#ff0000", "#990000"])

  // String width changes based on tension - MUCH WIDER
  const stringWidth = useTransform(distance, [0, 600], [9, 8])

  // Apply gravity effect with our custom hook
  useGravityEffect({
    isMobile,
    anchor,
    restPosition,
    isPositioned,
    x,
    y,
    rotation,
    isDraggingRef,
    velocityX,
    velocityY,
    bounceCountX,
    bounceCountY,
    lastVelocityX,
    lastVelocityY,
  })

  // Handle releasing drag when mouse leaves the window
  const handlePointerUp = () => {
    if (isMobile) return // Skip for mobile

    // Clean up event listeners
    window.removeEventListener("pointermove", handlePointerMove)
    window.removeEventListener("pointerup", handlePointerUp)
    window.removeEventListener("pointerleave", handlePointerUp)

    // End dragging state
    isDraggingRef.current = false

    // Add release velocity for natural movement - INCREASED for more bounce
    velocityX.current = velocityX.current * 1.0 // Changed from 0.8 to 1.0
    velocityY.current = velocityY.current * 1.0 // Changed from 0.8 to 1.0

    // Reset bounce counters on release
    bounceCountX.current = 0
    bounceCountY.current = 0
  }

  // Custom pointer event handlers for dragging without jumps - only for desktop
  const handlePointerDown = (e) => {
    if (isMobile) return // Skip for mobile

    // Prevent default behavior
    e.preventDefault()

    // Store the initial pointer position
    initialPointerX.current = e.clientX
    initialPointerY.current = e.clientY

    // Store the initial badge position
    initialBadgeX.current = x.get()
    initialBadgeY.current = y.get()

    // Set dragging state
    isDraggingRef.current = true

    // Set up pointer move and up listeners
    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)

    // Add event listener for when pointer leaves the window
    window.addEventListener("pointerleave", handlePointerUp)

    // Track for velocity calculation
    prevX.current = x.get()
    prevY.current = y.get()
    lastUpdateTime.current = performance.now()
  }

  const handlePointerMove = (e) => {
    if (isMobile || !isDraggingRef.current) return // Skip for mobile

    // Calculate how far the pointer has moved from the initial position
    const deltaX = e.clientX - initialPointerX.current
    const deltaY = e.clientY - initialPointerY.current

    // Apply that delta to the initial badge position
    const newX = initialBadgeX.current + deltaX
    const newY = initialBadgeY.current + deltaY

    // Calculate velocity for physics
    const now = performance.now()
    const dt = now - lastUpdateTime.current

    if (dt > 0) {
      velocityX.current = ((newX - prevX.current) / dt) * 16
      velocityY.current = ((newY - prevY.current) / dt) * 16

      prevX.current = newX
      prevY.current = newY
      lastUpdateTime.current = now
    }

    // Update badge position
    x.set(newX)
    y.set(newY)
  }

  // Track previous positions to calculate velocity on drag
  const prevX = useRef(0)
  const prevY = useRef(0)
  const lastUpdateTime = useRef(0)

  // Render different layouts for mobile and desktop
  return (
    <div
      ref={containerRef}
      className={`${isMobile ? "relative min-h-screen" : "fixed inset-0 w-full h-full"} bg-gradient-to-b from-gray-700 to-gray-800 ${isMobile ? "overflow-auto" : "touch-none overflow-hidden"}`}
    >
      {/* Content component for text and social sharing */}
      <Content isMobile={isMobile} config={mergedConfig} />

      {/* Only render the badge and band when positioned correctly */}
      {isPositioned && (
        <Badge
          x={x}
          y={y}
          rotation={rotation}
          isMobile={isMobile}
          handlePointerDown={handlePointerDown}
          holeX={holeX}
          holeY={holeY}
          stringWidth={stringWidth}
          stringColor={stringColor}
          anchor={anchor}
          config={mergedConfig}
        />
      )}

      {/* Footer component */}
      <Footer config={mergedConfig} isMobile={isMobile} />
    </div>
  )
}
