"use client"

import { useEffect, type MutableRefObject } from "react"
import type { MotionValue } from "framer-motion"

interface GravityEffectProps {
  isMobile: boolean
  anchor: { x: number; y: number }
  restPosition: { x: number; y: number }
  isPositioned: boolean
  x: MotionValue<number>
  y: MotionValue<number>
  rotation: MotionValue<number>
  isDraggingRef: MutableRefObject<boolean>
  velocityX: MutableRefObject<number>
  velocityY: MutableRefObject<number>
  bounceCountX: MutableRefObject<number>
  bounceCountY: MutableRefObject<number>
  lastVelocityX: MutableRefObject<number>
  lastVelocityY: MutableRefObject<number>
}

export function useGravityEffect({
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
}: GravityEffectProps) {
  // Apply gravity effect with more rigid band behavior - only for desktop
  useEffect(() => {
    if (isMobile || !anchor.x || !isPositioned) return // Skip for mobile or if not positioned

    let frameId: number
    let lastTime = performance.now()

    const applyGravity = (currentTime: number) => {
      // Calculate delta time for smoother animation
      const deltaTime = Math.min((currentTime - lastTime) / 16, 2) // Cap at 2x normal step
      lastTime = currentTime

      if (isDraggingRef.current) {
        // Reset velocities when dragging starts
        velocityX.current = 0
        velocityY.current = 0

        // Reset bounce counters when dragging starts
        bounceCountX.current = 0
        bounceCountY.current = 0

        frameId = requestAnimationFrame(applyGravity)
        return
      }

      const currentY = y.get()
      const currentX = x.get()

      // Calculate distance from rest position
      const dx = restPosition.x - currentX
      const dy = restPosition.y - currentY

      // Apply spring force toward rest position - INCREASED for more bounce
      const springForceX = dx * 0.04 * deltaTime // Increased from 0.03 to 0.04
      const springForceY = dy * 0.04 * deltaTime // Increased from 0.03 to 0.04

      // Add spring forces to velocity
      velocityX.current += springForceX
      velocityY.current += springForceY

      // Detect velocity direction changes to count bounces
      if (Math.sign(velocityX.current) !== Math.sign(lastVelocityX.current) && lastVelocityX.current !== 0) {
        bounceCountX.current += 1
      }
      if (Math.sign(velocityY.current) !== Math.sign(lastVelocityY.current) && lastVelocityY.current !== 0) {
        bounceCountY.current += 1
      }

      // Store current velocity for next frame comparison
      lastVelocityX.current = velocityX.current
      lastVelocityY.current = velocityY.current

      // Apply less damping for more bouncy behavior
      const baseDamping = 0.96 // Changed from 0.97 to 0.96 for more bounce
      const progressiveDampingX = Math.pow(baseDamping, 1 + bounceCountX.current * 0.3) // Reduced from 0.5 to 0.3
      const progressiveDampingY = Math.pow(baseDamping, 1 + bounceCountY.current * 0.3) // Reduced from 0.5 to 0.3

      // Apply the progressive damping
      velocityX.current *= progressiveDampingX
      velocityY.current *= progressiveDampingY

      // Update position
      x.set(currentX + velocityX.current)
      y.set(currentY + velocityY.current)

      // Update rotation based on position and velocity - INCREASED for more movement
      const positionOffset = (currentX - anchor.x) / 30 // Changed from 40 to 30
      const velocityOffset = velocityX.current / 8 // Changed from 10 to 8
      rotation.set(positionOffset + velocityOffset)

      frameId = requestAnimationFrame(applyGravity)
    }

    // Start the gravity simulation
    frameId = requestAnimationFrame(applyGravity)

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [
    anchor,
    restPosition,
    x,
    y,
    rotation,
    isMobile,
    isPositioned,
    isDraggingRef,
    velocityX,
    velocityY,
    bounceCountX,
    bounceCountY,
    lastVelocityX,
    lastVelocityY,
  ])
}
