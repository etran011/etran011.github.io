import type { Profile, Project } from "@/types/portfolio";

// Provenance and omissions are documented in docs/content-audit.md.
export const profile = {
  name: "Erik Tran",
  discipline: "Data Science",
  institution: "William & Mary",
  graduationYear: 2028,
  email: "etran01@wm.edu",
  resumePath: "/Erik-Tran-Resume.pdf",
  links: [
    { label: "GitHub", href: "https://github.com/etran011" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/erik-tran-tech" },
  ],
} as const satisfies Profile;

export const projects = [
  {
    slug: "optionlab",
    title: "OptionLab",
    summary: "European option pricing, analytical Greeks, implied volatility, and interactive sensitivity analysis.",
    category: "Financial software",
    period: "June 2026 – Present",
    featured: true,
    highlights: ["European calls & puts", "Analytical Greeks", "Implied volatility", "Sensitivity analysis"],
    caseStudy: {
      overview: "OptionLab brings European option valuation, risk sensitivities, and implied volatility into one focused workspace. I developed the Python pricing backend and directed AI-assisted frontend development, reviewing component behavior, API integration, and visualization design.",
      problem: "An option price is only part of the picture. Understanding how the price responds to changes in the underlying asset, volatility, and time requires a way to explore the model’s assumptions and sensitivities together.",
      approach: "A Python/FastAPI backend computes Black–Scholes prices and analytical Greeks. Brent root finding estimates implied volatility from an observed premium. A Next.js interface presents those results alongside one-variable-at-a-time sensitivity charts.",
      architecture: ["Next.js and TypeScript provide the interface and same-origin API proxy.", "FastAPI validates inputs and serves pricing, Greeks, implied-volatility, and sensitivity endpoints.", "Python owns quantitative calculations; Recharts presents sampled results without duplicating the pricing model in the browser."],
      challenges: [
        { title: "Keeping outputs consistent", description: "Pricing, Greeks, and sensitivity requests use the same input snapshot. Editing inputs clears stale curves and cancels pending analytics requests." },
        { title: "Making financial units explicit", description: "The interface distinguishes per-share values, percentage-point changes, annualized volatility, and daily Theta so the outputs can be interpreted correctly." },
        { title: "Testing model behavior", description: "Pytest checks cover put-call parity, pricing bounds, numerical Greeks, implied-volatility recovery, and API edge cases." },
      ],
      outcome: "The result is a workspace that connects a valuation to its assumptions and sensitivities. The implementation keeps numerical logic in one backend and makes loading, input validation, and partial request failures visible in the interface.",
    },
    technologies: ["Python", "FastAPI", "Next.js", "TypeScript", "Recharts", "Pytest"],
    screenshots: [],
  },
  {
    slug: "platepredict",
    title: "PlatePredict",
    summary: "Predicting menu item calories from nutritional features with six regression model families.",
    category: "Applied machine learning",
    period: "November 2025 – January 2026",
    featured: false,
    highlights: ["Six regression approaches", "Nutritional feature analysis", "Validation-based model comparison"],
    caseStudy: {
      overview: "PlatePredict explores how nutritional features can predict menu item calories. The project combines data preparation, exploratory analysis, and comparisons across six regression model families.",
      problem: "Nutritional datasets contain relationships between calories, fat, carbohydrates, protein, and other measurements. The project investigates how well regression models capture those relationships.",
      approach: "The notebook cleans numeric nutrition fields, explores distributions and correlations, and creates training, validation, and test splits. It compares linear and polynomial regression, KNN, support vector regression, decision trees, and random forests.",
      architecture: ["pandas and NumPy prepare tabular nutritional data.", "Matplotlib and Seaborn visualize distributions, relationships, and prediction behavior.", "scikit-learn provides preprocessing, regression estimators, and RMSE/R² evaluation."],
      challenges: [
        { title: "Comparing different model families", description: "The notebook uses scaled features for KNN and SVR, polynomial feature expansion for nonlinear regression, and validation-based tuning for tree models." },
        { title: "Keeping evaluation trustworthy", description: "A review of the supplied notebook identified stale prediction reuse in Random Forest evaluation and reversed R² arguments in its tuning loop. Quantitative performance claims are therefore omitted here pending a corrected evaluation." },
      ],
      outcome: "The notebook demonstrates a complete modeling workflow from exploratory analysis to prediction plots. It also highlights the need to keep each model’s predictions isolated and to separate validation results from final test evaluation. The résumé reports a FastAPI deployment on AWS EC2; no live deployment is linked here.",
    },
    technologies: ["Python", "scikit-learn", "pandas", "NumPy", "Matplotlib", "Seaborn"],
    screenshots: [],
  },
] as const satisfies readonly Project[];
