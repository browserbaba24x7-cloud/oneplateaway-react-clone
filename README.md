# OnePlateAway – React + React-Bootstrap (Home, About, Campaign, Stories, Volunteer, Personalised Giving, Monthly, pixel-matched)

    npm install
    Copy-Item .env.example .env   # then set Stripe test keys
    npm run dev:all   # http://localhost:5173 plus the payment API
    npm run build

## Donations (Stripe)
"Give Now" opens the Stripe donation modal. Set `VITE_STRIPE_PUBLIC_KEY` and
`STRIPE_SECRET_KEY` in `.env` before starting the app. The secret key is used only
by the Express API; never put it in a `VITE_` variable. The Vite dev server proxies
`/api` requests to the local payment API on port 8787.

## How it matches the original
- `src/styles/site.css` is the original site's compiled stylesheet (Tailwind), untouched.
  Class names in the JSX are the original ones. Do NOT add Bootstrap's global CSS: it would
  restyle everything. react-bootstrap `Button` / `Form` are used as components only.
- Markup of every section was converted 1:1 from the exported page.
- Verified with Playwright full-page screenshots at 1440, 768 and 390 px:
  0 differing pixels for the Home page (390px footer: 68px of sub-pixel text, see below) and 0 for About, versus the exported pages (video + timed toast hidden for the comparison).

## Routes (react-router-dom)
    /        Home   (src/pages/Home.jsx)
    /about   About  (src/pages/About.jsx: breadcrumb, hadith carousel, story, gallery, FAQ accordion)
    /monthly  Monthly (src/pages/Monthly.jsx: hero, 3-photo carousel (5s), 4 tier cards, impact, CTA;
              tier cards + both CTAs call onMonthly = monthly checkout trigger)
    /personalised-giving  Personalised Giving (src/pages/PersonalisedGiving.jsx: 4-photo hero slideshow (5s),
              who-is-this-for cards, 4 packages, how-it-works, FAQ <details>); Select Package = onSelectPackage stub
    /volunteer Volunteer (src/pages/Volunteer.jsx: hero, hadith carousel, Join/Share cards; Share uses
              navigator.share -> clipboard -> WhatsApp like the original; Join button = onJoin stub)
              hero photo is public/volunteer-hero.jpeg
    /stories  Stories (src/pages/Stories.jsx: hero + story cards from a `stories` array; card click -> onOpenStory stub)
    /campaign Campaign (src/pages/Campaign.jsx: hero, progress card, project flow, Why Makkah, sidebar;
              numbers (goal / meals provided / unit cost) are constants at the top of the file)
Header / footer / floating widgets are shared; "About Us", "Stories", "Volunteer", "Personalised Giving", "Monthly giving", "Current Campaign" and "Home" links navigate.

## Structure
    src/pages/                          Home.jsx, About.jsx
    src/components/FaqList.jsx          FAQ accordion (one open at a time)
    src/App.jsx                         page composition, handlers (onGive / onMonthly / onVolunteer)
    src/components/SiteHeader.jsx       sticky header + mobile menu
    src/components/Hero.jsx
    src/components/ProblemSection.jsx   headline, audience cards, quote, "one plate" CTA
    src/components/DeliverySection.jsx  steps + video (mute toggle) + impact card
    src/components/VolunteerSection.jsx
    src/components/SiteFooter.jsx       newsletter form (onJoin TODO)
    src/components/FloatingWidgets.jsx  donate toast, chat panel, language picker
    src/components/icons.jsx            exact lucide glyphs used by the original
    src/services/chat.js                chat backend stub (set VITE_CHAT_API_URL)
    src/assets/                         images + video from your export

## Still to wire
Sponsorship checkout (details form -> Stripe) opened by "Select Package" - not in the export; see onSelectPackage.
Chat backend, newsletter submit, real translation, Facebook Pixel,
video poster image (not in the export).
