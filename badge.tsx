"use client"

import type React from "react"

import { motion } from "framer-motion"

// Add the necessary imports at the top
import { useRef, useEffect, useState } from "react"
import type { Ball } from "./glass-ball"
import type { BadgeConfig } from "./types/badge-config"

interface BadgeProps {
  x: any // MotionValue<number>
  y: any // MotionValue<number>
  rotation: any // MotionValue<number>
  isMobile: boolean
  handlePointerDown: (e: React.PointerEvent) => void
  holeX: any // MotionValue<number>
  holeY: any // MotionValue<number>
  stringWidth: any // MotionValue<number>
  stringColor: any // MotionValue<number>
  anchor: { x: number; y: number }
  config: BadgeConfig
}

// Update the Badge component to include the glass ball animation
export default function Badge({
  x,
  y,
  rotation,
  isMobile,
  handlePointerDown,
  holeX,
  holeY,
  stringWidth,
  stringColor,
  anchor,
  config,
}: BadgeProps) {
  // Add refs for the container and balls
  const badgeRef = useRef<HTMLDivElement>(null)
  const ballsContainerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const ballsRef = useRef<Ball[]>([])
  const containerSizeRef = useRef({ width: 0, height: 0 })
  const velocityXRef = useRef(0)
  const velocityYRef = useRef(0)
  const lastRotation = useRef(0)

  // State to store the balls for rendering
  const [balls, setBalls] = useState<Ball[]>([])

  // Add a scroll velocity ref after the other refs
  const scrollVelocityRef = useRef(0)
  const lastScrollY = useRef(0)
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize balls and container size
  useEffect(() => {
    if (!badgeRef.current || !ballsContainerRef.current) return

    const badge = badgeRef.current
    const { width, height } = badge.getBoundingClientRect()
    containerSizeRef.current = { width, height }

    // Create balls - adjust count for badge size
    const ballCount = Math.floor((width * height) / 12000)
    const newBalls: Ball[] = []

    for (let i = 0; i < ballCount; i++) {
      newBalls.push({
        x: Math.random() * width,
        y: Math.random() * height,
        // Give balls initial velocity for more movement - more random for floaty effect
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5 - 0.5, // Slight upward bias for floaty effect
        radius: 10 + Math.random() * 10, // Smaller balls for badge
        deformation: 0,
      })
    }

    ballsRef.current = newBalls
    setBalls([...newBalls]) // Set initial state for rendering

    // Start animation
    startAnimation()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  // Add a scroll event listener effect after the initialization effect
  useEffect(() => {
    if (!isMobile) return // Only for mobile

    console.log("Setting up scroll animation for balls")

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDelta = currentScrollY - lastScrollY.current

      // Calculate scroll velocity (positive for down, negative for up)
      scrollVelocityRef.current = scrollDelta * 0.2 // Scale factor to control intensity

      // Apply velocity to balls if we have any
      if (ballsRef.current.length > 0 && Math.abs(scrollDelta) > 2) {
        console.log(
          `Scroll detected: delta=${scrollDelta.toFixed(2)}, applying velocity=${scrollVelocityRef.current.toFixed(2)}`,
        )

        // Apply velocity to balls based on scroll direction
        ballsRef.current.forEach((ball) => {
          // Add vertical velocity based on scroll direction
          ball.vy += scrollVelocityRef.current

          // Add a small random horizontal component for more interesting movement
          ball.vx += (Math.random() - 0.5) * Math.abs(scrollVelocityRef.current) * 0.5
        })
      }

      // Update last scroll position
      lastScrollY.current = currentScrollY

      // Clear any existing timer
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current)
      }

      // Reset scroll velocity after a short delay if no more scrolling
      scrollTimerRef.current = setTimeout(() => {
        scrollVelocityRef.current = 0
      }, 100)
    }

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll, { passive: true })

    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current)
      }
    }
  }, [isMobile])

  // Animation function
  const startAnimation = () => {
    if (!badgeRef.current || !ballsContainerRef.current) return

    const badge = badgeRef.current
    const { width, height } = badge.getBoundingClientRect()

    // Distribute balls across the entire badge height
    const balls = ballsRef.current
    for (let i = 0; i < balls.length; i++) {
      // Distribute balls across the full height of the badge
      balls[i].y = Math.random() * height
    }

    const animate = () => {
      // Get current rotation and calculate delta
      const currentRotation = rotation.get()
      const rotationDelta = currentRotation - lastRotation.current
      lastRotation.current = currentRotation

      // Calculate velocity from rotation and position changes
      velocityXRef.current = x.getVelocity() * 0.08 // Increased from 0.05
      velocityYRef.current = y.getVelocity() * 0.08 // Increased from 0.05

      // Update balls
      const balls = ballsRef.current
      const maxY = height - 10 // Changed from height - 10 to allow balls to reach the bottom

      for (let i = 0; i < balls.length; i++) {
        const ball = balls[i]

        // Apply gravity with tilt based on rotation - REDUCED for more floaty effect
        ball.vx += rotationDelta * 0.3 // Keep the same
        ball.vy += 0.03 // REDUCED from 0.08 to make balls more floaty

        // Apply buoyancy effect - random upward force for floaty effect
        if (Math.random() < 0.1) {
          // 10% chance per frame
          ball.vy -= 0.05 + Math.random() * 0.1 // Small random upward force
        }

        // Apply velocity from badge movement - increased for more responsiveness
        ball.vx += velocityXRef.current * 0.15 // Keep the same
        ball.vy += velocityYRef.current * 0.15 // Keep the same

        // Update position
        ball.x += ball.vx
        ball.y += ball.vy

        // Very minimal deformation based on velocity - increased for more visible effect
        ball.deformation = Math.min(Math.abs(ball.vx) + Math.abs(ball.vy), 5) * 0.002 // Reduced from 0.003 for lighter feel

        // Reduced damping for more floaty movement - INCREASED for more floaty effect
        ball.vx *= 0.995 // Increased from 0.99 for less damping
        ball.vy *= 0.995 // Increased from 0.99 for less damping

        // Boundary collision
        const margin = ball.radius * 1.05

        // Hard limit to prevent balls from going below the badge
        if (ball.y > maxY) {
          ball.y = maxY
          // Increased bounce coefficient for more bounce - INCREASED for more floaty effect
          ball.vy = -Math.abs(ball.vy) * 0.92 // Increased from 0.85 for more bounce
          // Add a bit of random horizontal velocity on bottom bounce for more interesting movement
          ball.vx += (Math.random() - 0.5) * 0.5
        }

        // Top collision - increased bounce coefficient - INCREASED for more floaty effect
        if (ball.y < margin) {
          ball.y = margin
          ball.vy *= -0.92 // Increased from -0.85 for more bounce
          // Add a bit of random horizontal velocity on top bounce
          ball.vx += (Math.random() - 0.5) * 0.5
        }

        // Left collision - increased bounce coefficient - INCREASED for more floaty effect
        if (ball.x < margin) {
          ball.x = margin
          ball.vx *= -0.92 // Increased from -0.85 for more bounce
          // Add a bit of random vertical velocity on side bounce
          ball.vy += (Math.random() - 0.5) * 0.5
        }

        // Right collision - increased bounce coefficient - INCREASED for more floaty effect
        if (ball.x > width - margin) {
          ball.x = width - margin
          ball.vx *= -0.92 // Increased from -0.85 for more bounce
          // Add a bit of random vertical velocity on side bounce
          ball.vy += (Math.random() - 0.5) * 0.5
        }

        // Ball collision (simplified) - increased bounce effect
        for (let j = i + 1; j < balls.length; j++) {
          const ball2 = balls[j]
          const dx = ball2.x - ball.x
          const dy = ball2.y - ball.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const minDist = ball.radius + ball2.radius

          if (distance < minDist) {
            // Simple collision response - increased force
            const angle = Math.atan2(dy, dx)
            const targetX = ball.x + Math.cos(angle) * minDist
            const targetY = ball.y + Math.sin(angle) * minDist
            const ax = (targetX - ball2.x) * 0.08 // Keep the same
            const ay = (targetY - ball2.y) * 0.08 // Keep the same

            // Add a bit of extra velocity for more energetic collisions - INCREASED for more floaty effect
            const energyBoost = 1.15 // Increased from 1.1 for more energy in collisions

            ball.vx -= ax * energyBoost
            ball.vy -= ay * energyBoost
            ball2.vx += ax * energyBoost
            ball2.vy += ay * energyBoost

            // Add a tiny bit of random velocity for more chaotic movement
            ball.vx += (Math.random() - 0.5) * 0.2
            ball.vy += (Math.random() - 0.5) * 0.2
            ball2.vx += (Math.random() - 0.5) * 0.2
            ball2.vy += (Math.random() - 0.5) * 0.2
          }
        }

        // Occasionally give random impulses to keep things moving - INCREASED for more floaty effect
        if (Math.random() < 0.02) {
          // Increased from 0.01 for more frequent impulses
          // 2% chance per frame per ball
          ball.vx += (Math.random() - 0.5) * 1.0
          ball.vy += (Math.random() - 0.5) * 1.0 - 0.2 // Slight upward bias
        }
      }

      // Update the state to trigger re-render with new positions
      setBalls([...balls])

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  return (
    <>
      {/* Elastic string - only for desktop */}
      {!isMobile && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
          {/* Shadow for the band to add depth */}
          <motion.line
            x1={anchor.x}
            y1={anchor.y}
            x2={holeX}
            y2={holeY}
            stroke="rgba(0,0,0,0.5)"
            strokeWidth={stringWidth}
            strokeLinecap="round"
            style={{
              filter: "blur(4px)",
              opacity: 0.5,
              transform: "translate(3px, 3px)",
            }}
          />

          {/* Main band */}
          <motion.line
            x1={anchor.x}
            y1={anchor.y}
            x2={holeX}
            y2={holeY}
            stroke={stringColor}
            strokeWidth={stringWidth}
            strokeLinecap="round"
          />
        </svg>
      )}

      {/* Badge - draggable on desktop, static on mobile */}
      <motion.div
        ref={badgeRef}
        className={`${isMobile ? "relative mx-auto" : "absolute"} flex flex-col ${isMobile ? "w-[320px] h-[440px]" : "w-[380px] h-[500px]"} rounded-2xl overflow-hidden ${!isMobile ? "cursor-grab active:cursor-grabbing" : ""}`}
        style={{
          x: isMobile ? 0 : x,
          y: isMobile ? 0 : y,
          // Center the badge horizontally, but position it so the hole is at the top
          translateX: isMobile ? undefined : "-50%",
          translateY: isMobile ? undefined : "-40px",
          // Use the dedicated rotation motion value - only for desktop
          rotate: isMobile ? 0 : rotation,
          // Enhanced realistic drop shadow
          boxShadow:
            "0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 20px 60px -10px rgba(0, 0, 0, 0.4), 0 1px 5px rgba(0, 0, 0, 0.1), 0 -1px 1px rgba(255, 255, 255, 0.08) inset",
          // Add subtle 3D effect
          transform: isMobile ? undefined : "perspective(1000px)",
          margin: isMobile ? "0 auto 24px" : undefined,
        }}
        // Custom pointer events only for desktop
        onPointerDown={!isMobile ? handlePointerDown : undefined}
        whileTap={!isMobile ? { scale: 1.02 } : undefined}
      >
        {/* Badge hole for lanyard - only for desktop */}
        {!isMobile && (
          <div
            className="absolute w-6 h-6 bg-gray-900 rounded-full border-2 border-gray-800"
            style={{
              left: "50%",
              top: "-3px",
              transform: "translateX(-50%)",
              zIndex: 20,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3) inset",
            }}
          />
        )}

        {/* Badge top section (configurable color) */}
        <div
          className="text-white p-8 flex-1 relative overflow-hidden"
          style={{
            zIndex: 1,
            backgroundColor: config.badgeColor,
          }}
        >
          {/* Event name - Vertical text */}
          <div className="absolute left-0 top-0 bottom-0 flex items-center" style={{ zIndex: 10 }}>
            <div
              className="transform -rotate-90 origin-center whitespace-nowrap"
              style={{
                position: "absolute",
                left: "-30px",
                width: "100%",
                transformOrigin: "center",
              }}
            >
              <span className="text-xl font-medium tracking-wider">{config.eventName}</span>
            </div>
          </div>

          {/* Event name - Top text */}
          <div className="mb-6 text-center" style={{ zIndex: 10 }}>
            <h3 className="text-lg font-semibold tracking-wider uppercase">{config.eventName}</h3>
            <div className="w-16 h-1 bg-white/40 mx-auto mt-2"></div>
          </div>

          {/* Name - aligned with badge details at the bottom */}
          <div className="ml-0 pl-0" style={{ zIndex: 10, position: "relative" }}>
            <h2 className={`${isMobile ? "text-4xl" : "text-5xl"} font-bold mb-2`}>{config.firstName}</h2>
            <h2 className={`${isMobile ? "text-4xl" : "text-5xl"} font-bold mb-8`}>{config.lastName}</h2>

            {/* Company */}
            <p className="text-xl tracking-widest text-gray-100">{config.company}</p>
          </div>
        </div>

        {/* Badge bottom section (configurable color) */}
        <div
          className="h-[140px] relative"
          style={{
            zIndex: 1,
            backgroundColor: config.badgeBottomColor,
          }}
        >
          {/* Wavy border between sections */}
          <div className="absolute top-0 left-0 right-0 h-6 overflow-hidden" style={{ zIndex: 2 }}>
            <div
              className="w-full h-12 rounded-[50%] translate-y-[-50%]"
              style={{ backgroundColor: config.badgeColor }}
            ></div>
          </div>

          {/* Badge details */}
          <div className="absolute bottom-8 left-8 text-white" style={{ zIndex: 10 }}>
            <p className="text-sm opacity-80 mb-1">{config.role}</p>
            <p className="text-2xl font-mono">{config.badgeId}</p>
          </div>
        </div>

        {/* Container for CSS bubble balls */}
        <div
          ref={ballsContainerRef}
          className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden"
          style={{ zIndex: 5 }}
        >
          {balls.map((ball, index) => (
            <div
              key={index}
              className="absolute stage"
              style={{
                width: `${ball.radius * 2}px`,
                height: `${ball.radius * 2}px`,
                transform: `translate(${ball.x - ball.radius}px, ${ball.y - ball.radius}px)`,
                margin: 0,
                padding: 0,
              }}
            >
              <figure
                className="ball bubble"
                style={{
                  transform: `scaleX(${1 + ball.deformation}) scaleY(${1 - ball.deformation})`,
                }}
              ></figure>
            </div>
          ))}
        </div>

        {/* Glass overlay effect for the entire badge */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-2xl"
          style={{ zIndex: 6 }}
        />
        <div
          className="absolute top-0 left-0 w-1/3 h-1/3 bg-white/10 rounded-full blur-md transform translate-x-1/4 translate-y-1/4"
          style={{ zIndex: 6 }}
        />
      </motion.div>
    </>
  )
}
