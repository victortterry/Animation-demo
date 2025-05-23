"use client"

import { Heart, Linkedin } from "lucide-react"
import type { BadgeConfig } from "./types/badge-config"

interface FooterProps {
  className?: string
  config: BadgeConfig
  isMobile: boolean
}

export default function Footer({ className = "", config, isMobile }: FooterProps) {
  return (
    <div
      className={`${isMobile ? "relative py-8" : "absolute bottom-6 left-0 right-0"} flex ${isMobile ? "flex-col" : ""} justify-center items-center text-gray-400 ${className}`}
    >
      {/* Social Sharing - Only for mobile */}
      {isMobile && config.socialLink && (
        <div className="flex justify-center items-center gap-4 mb-6">
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

      <p className="flex items-center gap-1 text-sm font-medium">
        {config.footerText}{" "}
        {config.footerLink && config.footerLinkText && (
          <a
            href={config.footerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-white transition-colors no-underline"
          >
            {config.footerLinkText}
          </a>
        )}{" "}
        with <Heart className="text-red-500" size={16} fill="currentColor" />
      </p>
    </div>
  )
}
