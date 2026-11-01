# TODO.md — Bhone Thaw-Tarot

Living backlog. Check off when done; move finished items under **Done**.

## In progress / next

- [ ] Add a secure admin bootstrap flow for the first admin account
- [ ] Replace file-backed mock persistence with production database storage before launch
- [ ] Confirm Burmese letter-spacing/line-height on landing + book (browser check with `lang="my"`)
- [ ] Set real Telegram / phone / wallet numbers in `.env.local` (see `.env.example`)
- [ ] Production: strong `JWT_SECRET` + change seeded admin password

## Feature / polish

- [ ] Optional: Google OAuth (env keys reserved; API rejects `provider=google` for now)
- [ ] Optional: email/SMS notifications (out of scope per SPEC)
- [ ] Optional: real payment gateway API (manual wallet verify remains)
- [ ] Accessibility pass: focus rings, aria on steppers/slot grids
- [ ] Mobile bottom-nav clearance when toasts show (verify on small screens)

## Docs

- [ ] Update `SPEC.md` language note: product is bilingual **customer-only** (EN/MY); admin remains English
- [ ] Document the shared floating glass UI system, motion curve, active indicators, and logo-based loading treatment

## Done (recent)

- [x] API foundation: typed mock database, health/services/slots endpoints, cookie sessions, profile, bookings, payment submission, daily messages, and admin verification/publishing routes
- [x] Admin portal access: role-aware login redirect to `/admin`, customer/admin portal guards, and documented local admin promotion flow
- [x] Admin portal rebuild: dedicated admin login, dashboard summary, booking search/review, calendar controls, and daily-message preview
- [x] Daily tarot image picker: admin upload, validation, preview, and customer dashboard rendering
- [x] Frontend clients and UI routes for the API endpoints
- [x] README: setup, route reference, PowerShell smoke tests, admin verification flow, and local database reset instructions
- [ ] Production hardening: middleware security headers + rate limits, auth cookie-only tokens, upload auth, receipt validation, booking idempotency chain
- [ ] SEO: metadata/OG, robots, sitemap, landing `h1`, public page titles
- [ ] Legal/utility pages: `/about`, `/privacy`, `/terms`, `/contact`, 404, error, loading
- [ ] Register terms consent; demo admin credentials removed from login UI
- [ ] Env-driven contact + payment config (`src/lib/site-config.ts`)
- [ ] UX: slot load error/retry, daily-message retry, admin overview retry, calendar → booking deep-link, fixed table scroll hint, Link>Button nesting
- [ ] ESLint config; Dockerfile (`output: standalone`); `.gitignore` fixes
- [ ] README API + deploy checklist
- [ ] Core app: auth, bookings, payment verify, daily post, calendar, tarot picker (78 cards)
- [ ] Layout alignment, About split, customer EN/MY + typography skill
- [ ] Booking submit toasts + double-submit guard
- [ ] UI visibility pass, admin calendar redesign, DatePicker/TimePicker, slot chips
- [ ] Landing hero → shared `DailyMessageCard`; mobile nav Sign In + centered daily image
- [ ] Frontend polish: floating frosted-glass mobile bottom navigation with safe-area spacing, raised active state, and ambient depth
- [ ] Frontend polish: glassmorphic logo loader with shimmer, pulse, and animated rings across async states
- [ ] Frontend polish: shared fluid motion curve, route transition lift/fade, segmented-control indicators, and tarot tab indicators

## Verification checklist (before “done”)

```bash
npx tsc --noEmit
npm run lint
# dev up, then HTTP 200 on public + portal routes (see AGENT.md)
```

- [ ] Admin portal still English-only, no language switcher
- [ ] Customer booking create → success toast; second rapid click → “please wait” info toast
