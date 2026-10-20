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

## PlatePredict repository review — October 20, 2026

Source: https://github.com/etran011/platepredict at `5f1f23760264d3f8eeacd8e0a2303aba7c533606`. This supersedes the notebook-only PlatePredict notes above. Reviewed README, package manifests, `src/platepredict/{data,regression,export}.py`, browser inference/comparison code, Estimator UI, and saved result artifacts.

- Current app: React/TypeScript/Vite, static GitHub Pages; Python/pandas/scikit-learn run offline. The original EC2 deployment is retired. Source and demo links are now included.
- Cleaning and seed-42 splits: 1,148 raw, 964 clean, 696 train, 123 validation, 145 test. Nine nutrition inputs exclude the calorie target. Six model families; training-only fits and validation-based selection.
- `results/model-comparison.json`: selected degree-two polynomial validation RMSE 11.622651358267351 / R² 0.9974701649837109; test RMSE 10.033693711855085 / R² 0.9979089151412642. Portfolio values are rounded. Scores were checked against artifacts and evaluation code, not a new training run. Test scores were also recalculated from the saved 145 observation/prediction pairs.
- Current code corrects the historical forest and split-labeling mistakes; the portfolio no longer describes them as unresolved.
- Model export contains 54 terms plus intercept. The browser parity fixture covers 145 test records and 31 boundary cases. Review threshold is 56 kcal, an empirical heuristic, not independently validated detection.
- Limitations retained: repeated profiles across random splits, unknown unseen-restaurant performance, unverified upstream dataset provenance/license, and no health-score or percentage-accuracy claim.
- Three supplied screenshots (2940 × 1668 each) show the updated landing page, the blank nutrition-entry form and model explanation, and pre-cleaning exploratory charts. Original PNGs are preserved; lossless WebP copies are used in the existing card/detail gallery. The form image does not show a completed estimate; the charts are not model evaluation results. The previous landing asset is retained but no longer displayed.

## Portfolio copy review — October 20, 2026

Reviewed hero, About, project cards/case studies, experience, education, tools, contact, footer, and social metadata. Replaced vague slogans with direct labels or concrete descriptions; retained résumé-backed achievements and the consulting interest. The first terminal phrase now reads “Studying data science. Writing Python.”; the AI/ML phrase and playback logic are unchanged. Removed decorative periods after Erik’s name in hero/footer and their unused color rules. Social-card source, raster output, and alt text now agree. No new professional claims or tools were added.
