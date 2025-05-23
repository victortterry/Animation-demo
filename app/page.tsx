import ElasticBoxPhysics from "../elastic-box-physics"

export default function Page() {
  // You can customize the badge by passing configuration parameters
  const badgeConfig = {
    // Person details
    firstName: "Obi",
    lastName: "Wan Kenobi",
    company: "12b",
    role: "PROMPTEUR",
    badgeId: "#000023",

    // Event details
    eventName: "twelve-balloons",
    eventDates: "collective",
    eventTagline: "Let ideas fly.",

    // Styling
    badgeColor: "#e6c88a", // Changed from red to the beige/tan color from the image
    badgeBottomColor: "#1a1a2e",

    // Social
    socialLink: "",

    // Footer
    footerText: "Made by",
    footerLink: "https://twelve-balloons.com",
    footerLinkText: "twelve-balloons",
  }

  return <ElasticBoxPhysics config={badgeConfig} />
}
