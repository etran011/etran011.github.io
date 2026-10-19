// Professional background transcribed and condensed from Erik's supplied résumé.
export interface Experience {
  id: string;
  role: string;
  organization: string;
  location: string;
  period: string;
  summary: string;
  tags: readonly string[];
  highlights: readonly string[];
}

export const experience = [
  {
    id: "wm-support",
    role: "IT Support Specialist",
    organization: "William & Mary Technology Support Center",
    location: "Williamsburg, VA",
    period: "August 2026 – Present",
    summary: "Campus technology support, connecting technical troubleshooting with clear, patient communication.",
    tags: ["Microsoft Office", "Campus systems", "Technical support"],
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
    summary: "Reviewing AI-generated responses for accuracy, quality, and instruction following.",
    tags: ["AI evaluation", "Response review", "Technical feedback"],
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
    summary: "Turning construction and operational data into clear reporting and dashboards.",
    tags: ["Excel", "Tableau", "Data analysis"],
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
    summary: "Coordinating an eight-person team through timed cybersecurity challenges.",
    tags: ["OSINT", "Cryptography", "Network analysis"],
    highlights: [
      "Directed an eight-person team, coordinating efforts to solve security challenges under competition deadlines.",
      "Competed in challenges spanning OSINT, cryptography, network traffic, log analysis, and web security.",
      "Solved timed cybersecurity challenges individually and collaboratively.",
    ],
  },
] as const satisfies readonly Experience[];

export interface Education {
  institution: string;
  location: string;
  degree: string;
  graduation: string;
  gpa: string;
  coursework: readonly string[];
}

export const education = {
  institution: "College of William & Mary",
  location: "Williamsburg, Virginia",
  degree: "B.S. Data Science",
  graduation: "Expected 2028",
  gpa: "3.92 / 4.00",
  coursework: [
    "Applied Machine Learning", "Data Visualization", "Databases", "Designing AI Agents",
    "Linear Algebra", "Probability & Statistics for Scientists", "Data Structures",
    "Statistical Data Analysis", "Ethics in Data Science", "Linux for Ethical Hackers",
  ],
} as const satisfies Education;

export interface SkillCategory { id: "languages" | "libraries" | "tools"; name: string; items: readonly string[]; }

export const skillCategories = [
  { id: "languages", name: "Languages", items: ["Python", "R", "SQL", "Bash"] },
  { id: "libraries", name: "Frameworks & libraries", items: ["FastAPI", "Next.js", "pandas", "NumPy", "scikit-learn", "PyTorch", "Matplotlib", "Seaborn", "Pytest"] },
  { id: "tools", name: "Tools & environments", items: ["Git", "Linux", "AWS EC2", "Tableau", "Excel", "Stata"] },
] as const satisfies readonly SkillCategory[];

export interface About { heading: string; emphasis: string; paragraphs: readonly string[]; }

// Concise first-person introduction grounded in the supplied résumé and interests.
export const about = {
  heading: "Curiosity,",
  emphasis: "put into practice.",
  paragraphs: [
    "I’m Erik, a Data Science student at William & Mary. I enjoy programming, statistics, and the process of turning a question into working software.",
    "I’m interested in AI, machine learning, software engineering, financial technology, and consulting. I enjoy combining technical skills with analytical problem-solving to understand real-world business challenges and build useful solutions.",
  ],
} as const satisfies About;
