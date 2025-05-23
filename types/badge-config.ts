export interface BadgeConfig {
  // Person details
  firstName: string
  lastName: string
  company: string
  role: string
  badgeId: string

  // Event details
  eventName: string
  eventDates: string
  eventTagline: string

  // Styling
  badgeColor: string
  badgeBottomColor: string

  // Social
  socialLink?: string

  // Footer
  footerText?: string
  footerLink?: string
  footerLinkText?: string
}

export const defaultBadgeConfig: BadgeConfig = {
  firstName: "Claudio",
  lastName: "Romano",
  company: "PANTER AG",
  role: "PROMPTEUR",
  badgeId: "#000023",

  eventName: "Swiss {ai} Weeks",
  eventDates: "1 Sep - 5 Oct 2025",
  eventTagline: "AI Made in Switzerland — Shaped by You",

  badgeColor: "rgb(255,0,0)",
  badgeBottomColor: "#1a1a2e",

  socialLink: "https://www.linkedin.com/company/swiss-ai-weeks/",

  footerText: "Made by",
  footerLink: "https://www.panter.ch",
  footerLinkText: "Panter",
}
