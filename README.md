# OnePlateAway

A React single-page website for OnePlateAway, built with Vite, React Router, React-Bootstrap, and Tailwind utility classes.

## Features

- Home, About, Campaign, Blog/Stories, Volunteer, Gift, and Monthly Giving pages.
- Shared responsive header, footer, and floating widgets.
- Stripe donation modal:
  - **Give Now** opens the modal for a one-time donation.
  - **Start Monthly Giving** and the monthly-giving buttons open it with monthly giving selected.
- Express payment API for one-time payments and monthly Stripe subscriptions.

## Requirements

- Node.js 18 or newer
- npm
- Stripe test-mode secret and publishable keys to run the donation flow

## Setup

Install dependencies:

```powershell
npm install
```

Create your local environment file:

```powershell
Copy-Item .env.example .env
```

Add your Stripe **test-mode** keys to `.env`:

```dotenv
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

Use the matching key pair from your Stripe account. Never expose or commit `STRIPE_SECRET_KEY`, and never use a `VITE_` prefix for the secret key. `.env` is ignored by Git.

## Run locally

Start both the React app and payment API:

```powershell
npm run dev:all
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api` requests to the Express payment API on port `8787`.

To run only the frontend, use `npm run dev`. Donation requests require the API server, so use `npm run dev:all` to test donations.

## Other commands

```powershell
npm run build       # Create a production frontend build in dist/
npm run preview     # Preview the production frontend build
npm run server      # Run only the payment API (requires STRIPE_SECRET_KEY)
```

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | Yes for payments | Stripe server-side secret key. Keep it private. |
| `VITE_STRIPE_PUBLIC_KEY` | Yes for payments | Matching Stripe publishable key used by the browser. |
| `VITE_API_BASE` | No | Optional base URL for the payment API. Leave blank for local development; Vite proxies `/api`. |
| `CLIENT_ORIGIN` | No | Allowed frontend origin for the API. Defaults to `http://localhost:5173`. |
| `PORT` | No | Payment API port. Defaults to `8787`. |
| `STRIPE_MONTHLY_PRODUCT_ID` | No | Existing Stripe product ID for monthly subscriptions. If omitted, the API creates a product and reuses its ID for that server process. |

## Routes

| Path | Page |
| --- | --- |
| `/` | Home |
| `/about` | About Us |
| `/campaign` | Current Campaign |
| `/blog` | Stories |
| `/volunteer` | Volunteer |
| `/gift` | Personalised Giving |
| `/monthly` | Monthly Giving |

## Project structure

```text
src/
  App.jsx                   Routes, shared layout, and donation modal state
  components/               Shared UI, including DonationModal
  pages/                    Route page components
  services/donations.js     Browser-side donation API client
  styles/                   Site, Bootstrap modal, and donation modal styles
  config.js                 Browser-safe app and Stripe configuration
server/
  index.js                  Express API for Stripe payments
```

## Payment safety

Card details are collected by Stripe Elements in the browser. The browser sends the payment method ID to the Express API; the Stripe secret key stays on the server. Use Stripe test keys and test payment methods while developing. Configure production keys and deploy the API over HTTPS before accepting live donations.
