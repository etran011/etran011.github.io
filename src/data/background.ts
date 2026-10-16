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

export interface SkillCategory { name: string; items: readonly string[]; }

export const skillCategories = [
  { name: "Programming languages", items: ["Python", "SQL", "R", "Bash"] },
  { name: "Data analysis", items: ["Data cleaning", "Exploratory data analysis", "Statistical analysis", "ETL", "Data pipelines"] },
  { name: "Machine learning", items: ["Data preprocessing", "Feature engineering", "Regression", "Model evaluation", "Hyperparameter tuning", "scikit-learn", "PyTorch"] },
  { name: "Data visualization", items: ["Tableau", "Matplotlib", "Seaborn"] },
  { name: "Libraries & frameworks", items: ["pandas", "NumPy", "FastAPI", "Next.js", "Pytest"] },
  { name: "Tools & platforms", items: ["Git", "Linux", "AWS EC2", "Excel", "Stata"] },
] as const satisfies readonly SkillCategory[];

export interface About { paragraphs: readonly string[]; interests: readonly string[]; }

// First-person copy grounded in the supplied brief, résumé, and project materials.
export const about = {
  paragraphs: [
    "I’m Erik, a Data Science student at William & Mary, graduating in 2028. I’m interested in software engineering, AI, and machine learning, especially where they meet financial technology.",
    "My projects let me work from the calculation to the interface. In OptionLab, I developed the Python pricing backend and reviewed the AI-assisted frontend. PlatePredict gave me practice preparing data, comparing regression models, and checking how results are evaluated.",
    "I also work in campus IT support, where explaining a solution clearly matters as much as finding it. I’m building on that experience through coursework and projects, with the goal of making technical tools easier to understand and use.",
  ],
  interests: ["Software engineering", "Artificial intelligence", "Machine learning", "Financial technology", "Data visualization"],
} as const satisfies About;
