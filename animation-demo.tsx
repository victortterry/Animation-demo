"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function AnimationDemo() {
  const [isVisible, setIsVisible] = useState(false)
  const [animationCount, setAnimationCount] = useState(0)

  // Auto-play the animation on initial load
  useEffect(() => {
    setIsVisible(true)

    // Reset the animation after it completes
    const timer = setTimeout(() => {
      setAnimationCount((prev) => prev + 1)
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  // Replay the animation when the count changes
  useEffect(() => {
    if (animationCount > 0) {
      setIsVisible(false)

      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [animationCount])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  }

  const fadeInUp = {
    initial: { y: 60, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      y: -40,
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {isVisible && (
            <motion.div
              className="flex flex-col gap-8"
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={container}
            >
              {/* Hero section with fade in and up animation */}
              <motion.div className="text-center" variants={fadeInUp}>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Animation Demo</h1>
                <p className="text-lg text-gray-600 max-w-xl mx-auto">
                  A showcase of smooth animations and transitions using Framer Motion
                </p>
              </motion.div>

              {/* Cards with staggered animation */}
              <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4" variants={container}>
                {[1, 2, 3].map((index) => (
                  <motion.div
                    key={index}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                    variants={item}
                    whileHover={{
                      scale: 1.03,
                      transition: { duration: 0.2 },
                    }}
                  >
                    <div className="h-32 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-lg mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Feature {index}</h3>
                    <p className="text-gray-600">This card demonstrates staggered animations with hover effects.</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Animated elements with different effects */}
              <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" variants={container}>
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="aspect-square bg-gradient-to-br from-blue-400 to-cyan-300 rounded-lg flex items-center justify-center"
                    variants={{
                      hidden: { scale: 0, opacity: 0, rotate: -10 },
                      show: {
                        scale: 1,
                        opacity: 1,
                        rotate: 0,
                        transition: {
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                          delay: 0.1 * i + 0.5,
                        },
                      },
                    }}
                  >
                    <span className="text-white font-bold text-xl">{i + 1}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Button to replay animation */}
              <motion.button
                className="mx-auto mt-8 px-6 py-3 bg-indigo-600 text-white font-medium rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={() => setAnimationCount((prev) => prev + 1)}
                whileTap={{ scale: 0.95 }}
                variants={item}
              >
                Replay Animation
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
