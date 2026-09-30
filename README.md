# Unity Fund

Website for Unity Fund, a nonprofit that works like an index fund for charitable giving. Contributions are pooled and distributed every quarter across a published portfolio of vetted organizations in eight cause areas.

The site is plain HTML, CSS and JavaScript. There is no build step and nothing to install.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home: fund facts, allocation calculator, how it works, largest holdings, selection standards, distribution history, questions |
| `portfolio.html` | Every holding, with filters, search, sortable columns, CSV download and the latest rebalance changes |
| `methodology.html` | Eligibility, selection standards, weighting limits, rebalance calendar, removal rules, independence |
| `reports.html` | Distribution history, quarterly reports, annual reports, audited financials, operating costs |
| `about.html` | Mission, principles, board, staff, policies, contact |
| `contribute.html` | Contribution form with a live allocation summary, other ways to give, tax information |

## Running it locally

Open `index.html` in a browser, or serve the folder:

```sh
npx serve .
```

## Editing content

**Portfolio, weights and distributions** live in one file: `assets/js/data.js`. The allocation bar, the calculator, every holdings table, the distribution chart and the report list all read from it, so they always agree.

- Cause area weights must add up to 100.
- The holding weights inside each cause area must add up to that area's weight.
- Keep the cause areas in their current order. Each area's chart color was checked for color-blind separation in that order.

**Page text** is written directly in each HTML file. The header and footer are repeated in every page, so a change to the navigation or footer needs to be made in all six files.

**Styles** are in `assets/css/styles.css`. Colors, fonts and spacing are defined as variables at the top.

## Design notes

- Type: Source Serif 4 for headings, Libre Franklin for text, numbers and interface. Both are self-hosted in `assets/fonts` under the SIL Open Font License.
- Color: warm paper background, near-black ink for all text, one deep green for actions. No gradients.
- Chart colors: eight muted hues validated for color-blind separation and contrast against the page background.
- All text is at least 15px and set in full-strength ink, never light grey.
- Layouts adapt down to phone width. Tables simplify on small screens rather than scrolling sideways.

## Before launch

Everything below is sample content for the design and must be replaced:

- **Organizations, weights and dollar figures** in `assets/js/data.js`, plus the few figures written into the page text (for example the 2025 financial summary on `reports.html`).
- **People** on `about.html`. The board and staff names are placeholders.
- **EIN** `00-0000000` in the footer of every page and on `contribute.html`.
- **Email addresses** at `unityfund.org`. Update them if the organization uses a different domain.
- **Report PDFs.** `reports.html` links to files in a `reports/` folder (for example `reports/unity-fund-q2-2026-distribution.pdf`). Add the real files there, using the names in `assets/js/data.js` and `reports.html`.
- **Payment.** The contribution form validates the details and shows a confirmation step. The "Continue to secure payment" button (`[data-payment-link]` in `contribute.html`) should hand off to your payment processor, such as a Stripe Checkout session or a hosted donation form.
- **Email sign-up.** The footer form (`[data-signup]`) confirms on screen only. Connect it to your email provider.

## Deploying

Any static host works. For GitHub Pages, enable Pages for this repository and choose the main branch and root folder.
