# Technology icons

`src/data/technology-icons.json` contains twelve unmodified SVG paths from the official [Simple Icons](https://github.com/simple-icons/simple-icons) npm package, version 16.35.0, plus Tableau and Microsoft Excel from version 11.15.0. The upstream project distributes its icon collection under CC0-1.0; see the [included license](simple-icons-LICENSE.md) and individual brand guidance. The JSON records each upstream slug and its unmodified brand hex for traceability. The latest included package supplies color metadata except Tableau and Excel, which retain the included 11.15.0 values.

Python, R, NumPy, pandas, Matplotlib, and Pytest now use unmodified self-hosted original multicolor SVGs from [Devicon](https://github.com/devicons/devicon/tree/master/icons), retrieved October 16, 2026. AWS and Stata retain their existing plain-wordmark and original-wordmark files with original fills, rather than accent-colored masks. For example, the [Python original](https://github.com/devicons/devicon/blob/master/icons/python/python-original.svg) retains both blue and yellow. See the [Devicon license](devicon-LICENSE.txt). The AWS mark represents the verified EC2 environment without claiming additional AWS services.

Seaborn uses its official [dark-background logo mark](https://github.com/mwaskom/seaborn/blob/master/doc/_static/logo-mark-darkbg.svg), retrieved October 16, 2026, with its original blue tones. See the [Seaborn license](seaborn-LICENSE.md).

Paths render on the server and other assets are self-hosted. No icon CDN or icon-library JavaScript is required. Every icon sits beside a visible technology label and is hidden from assistive technology to avoid repetition. SQL uses a text mark because the language has no single canonical brand logo. No skills were added to the verified data.

Brand colors remain local to the icon and its subtle hover halo. pandas, Stata, and Excel receive a small neutral light backing to preserve dark brand details without inventing lighter logo colors. Next.js and Linux use white monochrome marks on the dark theme. SQL stays a neutral text mark. No additional technologies were inferred from the request's examples.
