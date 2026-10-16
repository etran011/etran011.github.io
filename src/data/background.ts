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

export interface AboutChapter { id: string; word: string; label: string; title: string; body: string; }
export interface About { chapters: readonly AboutChapter[]; }

// First-person copy grounded in the supplied résumé and audited project materials.
export const about = {
  chapters: [
    {
      id: "background", word: "Learn", label: "Who I am", title: "A foundation in data.",
      body: "I’m Erik, a Data Science student at William & Mary, graduating in 2028. Coursework gives me the foundations; projects give me a way to test what I’m learning.",
    },
    {
      id: "building", word: "Build", label: "What I build", title: "From model to interface.",
      body: "I like working from the calculation to the interface. I built OptionLab’s Python pricing backend and reviewed its AI-assisted frontend. In PlatePredict, I prepared nutritional data and compared regression models.",
    },
    {
      id: "approach", word: "Explain", label: "How I approach problems", title: "Make the result understandable.",
      body: "In campus IT support, explaining a solution clearly matters as much as finding it. I bring that same care to software: check the result, make assumptions visible, and give people something they can use.",
    },
  ],
} as const satisfies About;
