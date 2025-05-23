"use client"

import type { BadgeConfig } from "./types/badge-config"
import { Linkedin } from "lucide-react"

interface ContentProps {
  isMobile: boolean
  config: BadgeConfig
}

export default function Content({ isMobile, config }: ContentProps) {
  return (
    <>
      {isMobile ? (
        // Mobile Layout - Text at top, removed social sharing (moved to footer)
        <div className="relative px-6 text-center z-20 pt-8 pb-4">
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            {config.eventName}
            <br />
            {config.eventDates}
          </h1>
          <p className="text-lg text-gray-300 mb-6">{config.eventTagline}</p>
        </div>
      ) : (
        // Desktop Layout - Text content shifted to the left, badge on right
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-center items-center w-full max-w-6xl px-8">
          <div className="max-w-xl" style={{ transform: "translateX(-200px)" }}>
            <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
              {config.eventName}
              <br />
              {config.eventDates}
            </h1>
            <p className="text-xl text-gray-300 mb-4">{config.eventTagline}</p>

            {/* Social Sharing */}
            {config.socialLink && (
              <div className="mt-16 flex items-center gap-4">
                <span className="text-gray-400 font-medium">SHARE ON:</span>
                <a
                  href={config.socialLink}
                  className="text-gray-300 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin size={24} />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
