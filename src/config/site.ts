/**
 * Central site configuration. Everything personal lives here so the
 * components stay generic and reusable.
 */
export const siteConfig = {
  name: "Bhuwan Prasad Poudel",
  shortName: "Bhuwan",
  initials: "BP",
  title: "Bhuwan Prasad Poudel | Agricultural Engineer",
  description:
    "Agricultural engineer specialising in irrigation, renewable energy and climate-smart farming systems in Nepal.",
  role: "Agricultural Engineer",
  tagline: "Engineering resilient farms with water, energy and data.",
  location: "Chitwan, Nepal",
  email: "p.bhuwan1999@gmail.com",
  /** Optional — shown on the contact page when set. */
  phone: undefined as string | undefined,
  availability: "Open to consulting & research collaborations",
  resume: "/files/bhuwan-poudel-cv.pdf",
  locale: "en-US",
  ogImage: "/og-default.jpg",

  /**
   * Contact form endpoint. Works with any service that accepts a JSON POST
   * (Formspree, Web3Forms, Getform, your own API…). Leave empty to fall back
   * to opening the visitor's mail client.
   */
  contactFormEndpoint: import.meta.env.PUBLIC_CONTACT_ENDPOINT ?? "",

  socials: [
    { label: "Email", href: "mailto:p.bhuwan1999@gmail.com", icon: "mail" },
    { label: "LinkedIn", href: "https://www.linkedin.com/", icon: "linkedin" },
    { label: "GitHub", href: "https://github.com/", icon: "github" },
  ] satisfies Social[],

  nav: [
    { label: "Projects", href: "/projects" },
    { label: "Blog", href: "/blog" },
    { label: "Experience", href: "/experience" },
    { label: "Education", href: "/education" },
    { label: "Certifications", href: "/certifications" },
    { label: "Contact", href: "/contact" },
  ] satisfies NavItem[],

  /** Items per page on paginated listings. */
  pageSize: {
    blog: 4,
    projects: 4,
  },

  skills: [
    "AutoCAD",
    "Detailed Estimation & Costing",
    "ArcGIS",
    "SketchUp",
    "PVsyst",
    "Python",
    "Machine Learning",
    "Irrigation Design",
    "Post-harvest Engineering",
    "Hydrology",
    "Precision Agriculture",
    "Renewable Energy",
  ],
} as const;

export type NavItem = { label: string; href: string };
export type SocialIcon = "mail" | "linkedin" | "github" | "twitter" | "globe";
export type Social = { label: string; href: string; icon: SocialIcon };
export type SiteConfig = typeof siteConfig;
