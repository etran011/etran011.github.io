# Content audit

## Sources and scope

Reviewed the supplied resume PDF, OptionLab repository README, and project_implementation.ipynb. The pasted design brief is a reference; development proceeds only through the explicitly requested phases. Phase 3 adds the project showcase and case studies; Phase 4 adds experience, education, technical skills, and About. Raw project source files and datasets are not copied into this public repository. The supplied résumé was used to verify professional content. At the user’s request in Phase 6, all résumé downloads and the public PDF were removed; phone numbers must not appear in portfolio content or public assets.

## Verified content

- Erik Tran; William & Mary; B.S. Data Science; expected graduation 2028; resume GPA 3.92/4.00.
- Public professional links: linkedin.com/in/erik-tran-tech and github.com/etran011 (authenticated GitHub account). Resume email: etran01@wm.edu.
- OptionLab: European call/put pricing with Black-Scholes, analytical Greeks, Brent implied-volatility estimation, sensitivity analysis, and Pytest validation. Python/FastAPI backend; Next.js, TypeScript, React, and Recharts frontend. Resume explicitly acknowledges AI-assisted frontend development and Erik's review role.
- PlatePredict: nutritional-feature calorie regression; Python, pandas, NumPy, scikit-learn, Matplotlib, Seaborn. Six model families are implemented in the notebook. Resume additionally reports FastAPI/AWS EC2 deployment, a load balancer, 120 users, R² .997, and RMSE 11.6; these are resume-reported, not independently reproduced here.
- Experience: IT Support Specialist, William & Mary Technology Support Center (August 2026–Present); AI Training Contributor, Handshake AI (July 2026–Present); Data Analyst Intern, Tuan Construction (June–August 2026); Team Leader, National Cyber League competitions (August 2024–May 2026).
- Resume skills: Python, SQL, R, Bash, Stata, Excel, Tableau, Git, Linux, AWS EC2; cleaning, EDA, statistics, visualization, ETL, data pipelines; preprocessing, feature engineering, regression, evaluation, tuning; pandas, NumPy, scikit-learn, PyTorch, Matplotlib, Seaborn, FastAPI, Next.js, Pytest.

## Assets and evidence gaps

Three OptionLab screenshots were subsequently supplied and inspected: pricing-dashboard.png (2940 × 1670), sensitivity-charts.png (2248 × 1626), and implied-volatility.png (2508 × 766). Original files are preserved unchanged in public/images/projects/optionlab/ and integrated into the Phase 3 showcase and OptionLab case study. The notebook also includes eight embedded chart images; these are analysis figures, not app screenshots. Preserve original aspect ratios when integrating assets.

Application Atlas, Email Scam Classifier, and Amazon Fresh appear only as suggestions in the brief, not in the supplied resume or project evidence. Omit until substantiated. No live project URLs were supplied.

The notebook's Random Forest evaluation reuses predictions from a previous model, its tuning loop reverses r2_score arguments, and its final “top 3” table uses validation values. Do not present these outputs as independently validated test metrics. Source code remains untouched.

## Content plan

Feature OptionLab and PlatePredict. Introduce Erik through his data science/software engineering interests; follow with project work, experience, skills, education, and contact. Keep facts in typed data modules separate from presentation. Phase 3 implements these two case studies; OptionLab uses the supplied screenshots, while PlatePredict uses a text-led presentation.

## Design direction

Near-black #0B0D12 background, charcoal #12151C surfaces, off-white #F5F5F7 text, muted #9298A5 secondary text, restrained electric blue accents. Use a readable sans-serif and monospace labels, generous responsive spacing, thin borders, visible focus, and reduced-motion support. Future hero and project showcase should carry most of the visual emphasis.


## Phase 4 background integration

`src/data/background.ts` holds the four résumé roles, William & Mary degree, expected 2028 graduation, overall GPA, all ten listed courses, and the résumé skill inventory grouped into six categories. Experience bullets are condensed without introducing new employers, dates, metrics, or responsibilities. The National Cyber League role remains explicitly labeled as competition experience. About copy draws on the user’s stated interests and the supplied professional/project materials; it adds no unsupported hobbies or credentials.
