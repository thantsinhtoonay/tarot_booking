# SPEC.md — Bhone Thaw-Tarot Web Application

## 1. Overview

**Product:** Fully responsive web application for the solo tarot astrologer brand **“Bhone Thaw-Tarot”**.
**Language:** Bilingual customer experience (English / Myanmar); admin portal remains English-only.
**Platforms:** Mobile, Tablet, Desktop (100% responsive).
**Two portals:**
1. **Customer Side** — public landing, auth, dashboard, booking flow, profile.
2. **Admin / Astrologer Side** — calendar, booking + payment management, daily message publisher.

---

## 2. Design System

### 2.1 Color Palette (from logo)

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-deep` | `#0B0D1B` | Page background (deepest) |
| `bg-cosmic` | `#12152B` | Elevated surfaces, cards |
| `accent-gold` | `#D4AF37` | Primary accent, borders, CTAs |
| `accent-gold-light` | `#E5C158` | Hover / highlight gold |
| `accent-teal` | `#0D5C75` | Mystical emerald teal (secondary) |
| `accent-peacock` | `#1B4965` | Peacock blue (tertiary) |
| Text primary | `#F5F0E6` | Body text (warm off-white) |
| Text muted | `#9BA0B5` | Secondary text |
| Danger | `#E05252` | Rejected / errors |
| Success | `#3DBE8B` | Confirmed / completed |

### 2.2 Aesthetics

- **Vibe:** Min Thein Kha mysticism × modern sleekness.
- Subtle **golden astrological ring** patterns (SVG/CSS radial rings).
- **Cosmic starfield** background (layered radial dots / subtle parallax, low opacity).
- Golden borders and filigree accents inspired by logo motifs: **Dragon, Peacock, Rabbit, Moon phases, Zodiac symbols**.
- Card-like surfaces with `1px` gold hairline borders at ~30–40% opacity; soft inner glow on hover.
- Floating glass surfaces may use translucent versions of the existing palette only; do not introduce a replacement core palette.
- Mobile navigation uses a KBZPay-inspired frosted-glass treatment: `backdrop-filter: blur(16px)` with `-webkit-backdrop-filter` support, a subtle `1px solid rgba(255, 255, 255, 0.2)` boundary, inset highlights, and soft ambient shadows.
- The mobile bottom navigation is visually lifted from the viewport edge as an inset rounded capsule, with a raised active destination, a fluid indicator, and safe-area-aware spacing.

### 2.3 Typography

| Role | Font | Notes |
|------|------|-------|
| Mystical titles / headings | **Cinzel** or **Playfair Display** (serif) | H1–H3, section titles |
| UI / body | **Inter** or system sans-serif | Forms, labels, tables, nav |

- Loaded via `next/font/google`.
- Display headings may use letter-spacing + gold gradient text for hero moments.

### 2.4 Iconography

- **Lucide-React** for all UI icons.
- Decorative zodiac/moon art as inline SVG or image assets (not icon library).

### 2.5 Motion

- **Framer Motion** for page transitions, card reveals, step wizard animation, modal entrances.
- Shared CSS micro-interactions use hardware-friendly transforms and smooth curves such as `cubic-bezier(0.22, 1, 0.36, 1)`.
- Active navigation and tab states use fluid scaling/sliding indicators.
- Loading states use a lightweight floating glass card with the brand logo, shimmer, and soft pulsing rings.
- Respect `prefers-reduced-motion` across CSS and component animations.

---

## 3. Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router, React 18+) |
| Styling | Tailwind CSS |
| Icons | lucide-react |
| Animation | framer-motion |
| Auth | Email/Password + Google OAuth (mock or NextAuth) |
| State | React state / lightweight store (Zustand optional) |
| Data | Mock database models (in-memory / JSON / SQLite — no real backend required for MVP) |
| Payments | Mock Myanmar wallet flow (UI + verification only) |

---

## 4. Layout & Navigation

### 4.1 Responsive Shell

- **Desktop / Tablet:** Adaptive **sidebar** (collapsible on tablet) + top bar with logo, user avatar, portal switch.
- **Mobile:** Hamburger **drawer** plus an inset floating glass **bottom navigation bar** (primary destinations: Home, Book, Daily Card, Profile / Admin: Calendar, Bookings, Daily Post).

### 4.2 Route Map (proposed)

```
/                          Landing (public)
/login                     Sign in (email + Google)
/register                  Sign up
/admin/login               Astrologer/admin sign in
/dashboard                 Customer dashboard (post-login)
/dashboard/book            Booking wizard (4 steps)
/dashboard/profile         Customer profile + booking history
/about                     About Bhone Thaw + About Developer
/admin                     Admin overview (protected)
/admin/calendar            Booked calendar view
/admin/bookings            Booking list + payment verification
/admin/daily               Daily Tarot Message publisher
```

---

## 5. Customer Side

### 5.1 Landing Page

- **Hero:** Bhone Thaw-Tarot logo artwork, mystical tagline, CTAs → **Sign In** / **Sign Up**.
- **Services showcase (pre-login):** brief cards of reading types (Love, Career, Overall Life, Custom Questions) + formats (Written, Voice, Video).
- **Auth:** Email/Password and **Google** sign-in options.
- Footer: About links, contact shortcuts (Telegram / Viber / Phone).

### 5.2 Customer Dashboard (post-login)

**a) Daily Tarot Message Card**
- Featured component showing today’s advice posted by the Astrologer.
- Fields: card name/image, upright/keyword, advice text, date.
- Empty state if admin hasn’t posted yet.

**b) Entry points:** Book a Reading, View My Bookings, Profile, About.

### 5.3 Tarot Booking System (4-step wizard)

| Step | Content |
|------|---------|
| **1. Reading Type** | Love, Career, Overall Life, Custom Questions (selectable cards with icons/descriptions). |
| **2. Format & Slot** | Format: Written Report / Live Voice Call / Live Video Call; pick date + time slot from available grid. |
| **3. Details** | Full Name, Date of Birth, Time of Birth, Specific Questions (textarea). |
| **4. Payment** | Myanmar mobile payment flow (below). |

- Progress indicator (steps 1–4), back/next, form validation per step.
- Sticky **order summary** (type, format, slot, price) on desktop; collapsible on mobile.

### 5.4 Payment Flow (Step 4) — inspired by zenithharraishop.com

1. **Total amount** displayed prominently.
2. **Wallet options** (selectable): **KPay (KBZPay)**, **WavePay**, **AYA Pay**, **CB Pay**.
3. **Merchant details:** Account Name + Account Number + **1-click “Copy Number”** button (toast: “Copied”).
4. **Verification section:**
   - Input: Transaction ID / last 6 digits.
   - Upload: payment receipt **screenshot** (file input, preview thumbnail).
5. Submit → booking created with status **Pending Payment** → redirect to confirmation / dashboard.

### 5.5 About Section (`/about`)

- **Major:** About the astrologer **Bhone Thaw** — profile photo, bio, background story.
- **Minor:** **About the Developer** — developer photo + link/credit.

### 5.6 Customer Profile Page

- Edit: name, phone, date/time of birth.
- **Booking history:** list with **status badges**: `Pending` → `Confirmed` → `Completed` (or Rejected).
- Status color-coded (gold/teal/green/red).

---

## 6. Admin / Astrologer Side (protected)

### 6.1 Booked Calendar View

- Monthly + weekly toggle.
- All scheduled sessions plotted; click event → booking detail drawer.
- **Color-coded by status:**
  - Pending Payment — gold/amber
  - Confirmed — teal
  - Completed — success green
  - Rejected — red (optional)

### 6.2 Customer & Booking Management

- **List view** of all bookings: customer, type, format, datetime, amount, status.
- **Search/filter:** by status, date range, reading type, name.
- **Payment verification tool:**
  - Inspect submitted **receipt image**, **transaction ID**, wallet used.
  - Actions: **Confirm Booking** (approve) / **Reject**.
- **Quick contact:** shortcut buttons → Telegram / Viber / Phone (deep links) for the customer.

### 6.3 Daily Tarot Message Publisher

- Admin widget/form: card title, image file picker (optional), advice text, effective date.
- Image picker accepts PNG, JPEG, and WebP files up to 5MB and stores the returned upload URL in `cardImage`.
- **Post / Update / Edit / Delete** daily message shown on all customer dashboards.
- Preview before publish.

---

## 7. Data Models (Mock)

```ts
User {
  id, name, email, passwordHash?, provider: "email" | "google",
  phone?, avatarUrl?, role: "customer" | "admin",
  dob?, tob?, createdAt
}

ReadingType { id, title, description, price, icon? }
SessionFormat { id, title, priceDelta, durationMin }
TimeSlot { id, date, startTime, endTime, isBooked }

Booking {
  id, userId, readingTypeId, sessionFormatId, slotId,
  fullName, dob, tob, questions?,
  amount, wallet?: "kpay" | "wavepay" | "aya" | "cbpay",
  merchantAccountSnapshot?,
  transactionId?, receiptUrl?,
  status: "pending_payment" | "confirmed" | "completed" | "rejected",
  adminNote?, createdAt, updatedAt
}

PaymentVerification {
  bookingId, transactionId, receiptUrl, verifiedBy, verifiedAt, decision
}

DailyTarotMessage {
  id, date, cardName?, cardImage?, keywords?, adviceText, publishedBy, updatedAt
}

Profile { userId, bio, photoUrl, story, developer: { name, photoUrl, link } }
```

---

## 8. Responsive Breakpoints

| Breakpoint | Layout behavior |
|------------|-----------------|
| `< 640px` (mobile) | Bottom nav or drawer; single-column; stacked wizard steps; full-width modals |
| `640–1024px` (tablet) | Collapsible sidebar or icon rail; 2-col grids |
| `> 1024px` (desktop) | Persistent sidebar; multi-column dashboard, split booking + summary |

---

## 9. UX Principles

- Gold-on-navy contrast meets WCAG AA for body text (verify muted greys).
- All interactive targets ≥ 44px on touch.
- Loading, empty, and error states for every async view.
- Loading states should feel intentional and lightweight: use the logo-based floating glass loader rather than a flat or blocking visual.
- Toasts for copy-number, payment submit, admin confirm/reject.
- Forms: inline validation + accessible labels.

---

## 10. Out of Scope (MVP)

- Real payment gateway integration (UI + mock verification only).
- Real SMS/email delivery (console/mock only).
- Additional locales beyond the customer EN/MY experience.
- Native mobile apps (web-responsive only).

---

## 11. Deliverables

1. This `SPEC.md`.
2. Next.js app with modular components (`components/`, `app/` routes per §4.2).
3. Mock data layer matching §7.
4. Both portals fully responsive per §8.
5. Clean, reusable UI primitives (Button, Card, Badge, Modal, Stepper, DataTable, Calendar).

---

## 12. API Foundation

The first API implementation uses Next.js App Router route handlers with a typed file-backed mock database for local development. All responses use the envelope `{ ok: true, data }` or `{ ok: false, error }`.

### 12.1 Public endpoints

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/health` | Service health check |
| `GET` | `/api/services` | Reading types and session formats |
| `GET` | `/api/slots?date=YYYY-MM-DD` | Available booking slots |
| `GET` | `/api/daily-message?date=YYYY-MM-DD` | Published daily message |

### 12.2 Authentication and customer endpoints

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/auth/register` | Create a customer and session |
| `POST` | `/api/auth/login` | Sign in and create a session |
| `POST` | `/api/auth/logout` | Clear the session cookie |
| `GET` | `/api/auth/me` | Return the current signed-in user, including their portal role |
| `GET/PATCH` | `/api/profile` | Read or update customer profile |
| `GET/POST` | `/api/bookings` | List or create customer bookings |
| `GET` | `/api/bookings/:id` | Read one customer booking |
| `POST` | `/api/bookings/:id/payment` | Submit wallet and payment proof |

Sessions use an HTTP-only `btt_session` cookie signed with `JWT_SECRET`. Passwords are hashed with Node's built-in `scrypt`; no password hash is returned by the API.

### 12.3 Admin endpoints

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/admin/bookings` | Filter and inspect bookings |
| `POST` | `/api/admin/bookings/:id/verify` | Approve or reject submitted payment |
| `POST` | `/api/admin/daily-message` | Publish or update a daily message |

Admin bootstrap and production database storage remain follow-up work in `TODO.md`. The implemented login flow routes customers to `/dashboard` and users with `role: "admin"` to `/admin`; the shared app shell prevents users from remaining in the wrong portal.
