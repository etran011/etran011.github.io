import type { Profile, Project } from "@/types/portfolio";

// Provenance and omissions are documented in docs/content-audit.md.
export const profile = {
  name: "Erik Tran",
  discipline: "Data Science",
  institution: "William & Mary",
  graduationYear: 2028,
  email: "etran01@wm.edu",
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
    screenshots: [
      { src: "/images/projects/optionlab/pricing-dashboard.png", width: 2940, height: 1670, alt: "OptionLab pricing dashboard showing call inputs, a theoretical value of $10.4506, and five risk sensitivities.", caption: "Valuation workspace · European call pricing and analytical Greeks" },
      { src: "/images/projects/optionlab/sensitivity-charts.png", width: 2248, height: 1626, alt: "OptionLab charts showing Delta and Gamma versus underlying price, and option value versus volatility and time to expiration.", caption: "Sensitivity analysis · Explore how model inputs affect value and risk" },
      { src: "/images/projects/optionlab/implied-volatility.png", width: 2508, height: 766, alt: "OptionLab implied-volatility calculator returning 19.9984 percent for a call with a $10.45 market price.", caption: "Implied volatility · Solve for volatility from an observed premium" },
    ],
  },
  {
    slug: "platepredict",
    title: "PlatePredict",
    summary: "A React app that estimates calories from nine nutrition inputs and compares them with reported values using a regression model trained in Python.",
    category: "Applied machine learning",
    period: "Original study: November 2025 – January 2026",
    featured: false,
    repositoryUrl: "https://github.com/etran011/platepredict",
    demoUrl: "https://etran011.github.io/platepredict/",
    highlights: ["Calorie estimation & comparison", "Six-model evaluation", "Interactive findings"],
    caseStudy: {
      overview: "I extended my fast-food nutrition study into a browser application. Users enter nine nutrition values to estimate missing calories or compare a reported value with the model estimate. The app preserves reported values and includes the original study, corrected model results, and interactive charts.",
      problem: "The original study asked how well nutritional measurements predict calories in fast-food menu items. The app applies that model to missing-value estimation and consistency review, although the study did not independently evaluate those uses.",
      approach: "Numeric conversion and filtering reduce 1,148 records to 964 complete records with positive calories. Two seeded random splits produce 696 training, 123 validation, and 145 test records. Inputs are total, saturated, and trans fat; cholesterol; sodium; carbohydrates; fiber; sugars; and protein. Reported calories are the target, never an input.",
      architecture: ["Python, pandas, and scikit-learn prepare data and compare linear regression, degree-two polynomial regression, KNN, SVR, decision trees, and random forests. Models and preprocessing fit only on training data; KNN and SVR use scaled features.", "Validation results select the model and tree settings. The chosen polynomial model is exported as 54 coefficients, an intercept, and feature powers; TypeScript evaluates it directly in the browser.", "React and Vite provide five static pages hosted on GitHub Pages. The current app needs no Python server; the former AWS EC2 deployment is no longer maintained."],
      challenges: [
        { title: "Model evaluation", description: "Degree-two polynomial regression had the lowest validation RMSE: 11.623 kcal, with R² 0.997470. On the separate 145-record test set, RMSE was 10.034 kcal and R² was 0.997909. Linear regression’s test RMSE was 12.082 kcal. These are repository-recorded regression scores, not percentage accuracy." },
        { title: "Correcting the original analysis", description: "The updated evaluation fixes reversed R² arguments in forest tuning, forest metrics calculated from tree predictions, and validation results labeled as test results. The original notebook is preserved alongside the corrected results." },
        { title: "Using the application", description: "Users can enter values or load historical presets, inspect reported-versus-estimated differences, and explore model comparisons and prediction plots. Inputs must be finite and nonnegative. The interface warns about values outside training ranges and clears stale results when inputs change." },
        { title: "Interpreting review flags", description: "Differences greater than 56 kcal receive a review flag. This threshold comes from the largest held-out error, rounded up; the same test set does not independently validate the rule. A flag is a prompt to check units, serving size, and source data, not proof that a calorie value is wrong." },
      ],
      outcome: "The project connects an offline regression study to a usable browser tool. Export tests compare browser predictions with Python for all 145 test records and 31 boundary cases. Results remain specific to the historical fast-food data: repeated nutritional profiles can cross the random splits, performance on unseen restaurants is unestablished, and the dataset’s upstream source and license are unverified. High R² reflects the close relationship between calories and the supplied nutrients; it is not a health score.",
    },
    technologies: ["Python", "scikit-learn", "pandas", "React", "TypeScript", "Vite"],
    screenshots: [
      { src: "/images/projects/platepredict/calorie-review-landing.webp", width: 2940, height: 1668, alt: "PlatePredict landing page introducing calorie estimation, reported-value comparison, and the evidence behind the model.", caption: "Landing page · Calorie completion and consistency review" },
      { src: "/images/projects/platepredict/nutrition-entry.webp", width: 2940, height: 1668, alt: "PlatePredict nutrition-entry form with historical menu presets, nutrient fields, and an explanation of the polynomial model and review threshold.", caption: "Nutrition entry · Input fields, historical presets, and model limitations" },
      { src: "/images/projects/platepredict/nutrition-exploration.webp", width: 2940, height: 1668, alt: "PlatePredict exploratory charts showing a calorie histogram and total fat versus recorded calories before model cleaning.", caption: "Original exploration · Calorie distribution and nutrient relationships before cleaning" },
    ],
  },
] as const satisfies readonly Project[];
