// Professional background transcribed and condensed from Erik's supplied résumé.
export interface Experience {
  id: string;
  role: string;
  organization: string;
  location: string;
  period: string;
  highlights: readonly string[];
}

export const experience = [
  {
    id: "wm-support",
    role: "IT Support Specialist",
    organization: "William & Mary Technology Support Center",
    location: "Williamsburg, VA",
    period: "August 2026 – Present",
    highlights: [
      "Troubleshoot Microsoft Office, campus systems, account access, and software issues, resolving 80% on first contact.",
      "Document support tickets and escalate unresolved issues to higher-level IT staff.",
      "Explain technical solutions clearly and patiently to users with different levels of experience.",
    ],
  },
  {
    id: "handshake-ai",
    role: "AI Training Contributor",
    organization: "Handshake AI",
    location: "Remote",
    period: "July 2026 – Present",
    highlights: [
      "Evaluate AI-generated responses weekly for inaccuracies, quality issues, and instruction failures.",
      "Write constructive feedback with specific corrections to improve responses.",
      "Compare AI outputs using logical reasoning and technical knowledge.",
    ],
  },
  {
    id: "tuan-construction",
    role: "Data Analyst Intern",
    organization: "Tuan Construction",
    location: "Washington, DC",
    period: "June 2026 – August 2026",
    highlights: [
      "Cleaned and organized construction, labor, and project data in Excel, reducing reporting preparation time by 20%.",
      "Built Tableau dashboards to track project trends, labor costs, job locations, and operational performance.",
      "Analyzed project data and presented findings to non-technical team members to inform planning and resource allocation.",
    ],
  },
  {
    id: "ncl",
    role: "Team Leader",
    organization: "Cybersecurity Competitions · National Cyber League",
    location: "Remote",
    period: "August 2024 – May 2026",
    highlights: [
      "Directed an eight-person team, coordinating efforts to solve security challenges under competition deadlines.",
      "Competed in challenges spanning OSINT, cryptography, network traffic, log analysis, and web security.",
      "Solved timed cybersecurity challenges individually and collaboratively.",
    ],
  },
] as const satisfies readonly Experience[];
