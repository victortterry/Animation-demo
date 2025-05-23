"use client"

export interface Ball {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  deformation: number
}

interface GlassBallProps {
  ball: Ball
  dpr: number
}

export default function GlassBall({ ball, dpr }: GlassBallProps) {
  const drawBall = (ctx: CanvasRenderingContext2D) => {
    ctx.save()
    ctx.translate(ball.x, ball.y)

    // Apply minimal deformation
    const radiusX = ball.radius * (1 + ball.deformation)
    const radiusY = ball.radius * (1 - ball.deformation)

    // Draw transparent ball with subtle gradient
    ctx.beginPath()
    ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2)

    // Create a transparent gradient
    const baseGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, ball.radius)
    baseGradient.addColorStop(0, "rgba(255, 255, 255, 0.4)") // White center with transparency
    baseGradient.addColorStop(0.7, "rgba(200, 200, 255, 0.3)") // Light blue-white edge
    baseGradient.addColorStop(1, "rgba(150, 150, 255, 0.2)") // Light blue edge with transparency

    ctx.fillStyle = baseGradient
    ctx.fill()

    // Add subtle edge highlight for definition
    ctx.beginPath()
    ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)" // Brighter edge
    ctx.lineWidth = 1
    ctx.stroke()

    // Add a very subtle inner refraction effect
    ctx.beginPath()
    ctx.ellipse(0, 0, radiusX * 0.85, radiusY * 0.85, 0, 0, Math.PI * 2)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)" // Brighter inner highlight
    ctx.lineWidth = 0.5
    ctx.stroke()

    ctx.restore()
  }

  return { drawBall }
}
