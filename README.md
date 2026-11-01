# Bhone Thaw-Tarot API

API foundation for the Bhone Thaw-Tarot booking application.

This project contains the Next.js App Router API layer, a responsive application UI, typed domain models, cookie-based authentication, and a file-backed mock database for local development.

The first application UI is now implemented as well: a responsive public landing page, authentication screens, customer dashboard, four-step booking flow, profile/history, public information pages, and admin overview, bookings, calendar, and daily-message screens.

## Current implementation

- Next.js App Router route handlers
- TypeScript domain models from `SPEC.md`
- File-backed local database at `.data/db.json`
- HTTP-only JWT session cookie named `btt_session`
- Password hashing with Node.js `scrypt`
- Customer registration, login, logout, session lookup, and profile updates
- Reading-service catalog and generated booking slots
- Customer booking creation and lookup
- Wallet payment-proof submission
- Daily tarot message lookup
- Admin booking filtering and payment verification
- Admin daily-message publishing/updating
- Responsive glassmorphic public and authenticated UI
- Customer dashboard with daily message and booking history
- Four-step booking flow: focus, format/time, details, payment proof
- Admin overview, booking review, monthly calendar, and daily-message publisher
- Admin daily-message image picker with authenticated PNG/JPEG/WebP upload, thumbnail preview, and customer-card rendering
- Landing-page visual pass: header-safe spacing, readable hero hierarchy, intentional CTA/proof row, and responsive navigation
- About-page visual hierarchy: astrologer-first bio card with circular photo frame; developer story remains secondary below
- Consistent JSON response envelope:

```json
{ "ok": true, "data": {} }
```

or:

```json
{ "ok": false, "error": "message" }
```

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- PowerShell on Windows, or an equivalent shell

## Setup

Install dependencies:

```powershell
npm install
```

Create the local environment file:

```powershell
Copy-Item .env.example .env.local
```

Set a real local secret in `.env.local`:

```env
JWT_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Do not commit `.env.local` or `.data/`.

## Run the API

Start the development server:

```powershell
npm run dev
```

The API is available at `http://localhost:3000`.

The same development server renders the application UI routes listed below.

The local database is created automatically on the first request at:

```text
.data/db.json
```

The database is intentionally mock/file-backed for development. It is not suitable for production or concurrent multi-instance deployment.

## Validation commands

Run TypeScript validation:

```powershell
npm run typecheck
```

Run lint:

```powershell
npm run lint
```

Build the application:

```powershell
npm run build
```

The build script uses webpack and a single build worker to mitigate a Windows-only `.next` segment-directory `EPERM` race during parallel static generation.

Start the production build:

```powershell
npm run start
```

There are not yet automated unit or integration test files. Until those are added, use the smoke-test flow below for API verification.

## Application routes

| Route | Purpose |
|-------|---------|
| `/` | Public landing page |
| `/about` | Public about page |
| `/contact` | Contact information placeholder |
| `/privacy` | Privacy information |
| `/terms` | Terms information |
| `/login` | Customer sign in |
| `/register` | Customer registration |
| `/admin/login` | Astrologer/admin sign in |
| `/dashboard` | Customer dashboard and daily message |
| `/dashboard/book` | Four-step booking flow |
| `/dashboard/profile` | Customer profile and booking history |
| `/dashboard/about` | Authenticated about page |
| `/admin` | Admin overview |
| `/admin/bookings` | Booking list and payment decisions |
| `/admin/calendar` | Monthly booking calendar |
| `/admin/daily` | Daily message publisher |

### UI smoke test

1. Open `/` and confirm the public hero, service cards, navigation links, and logo render.
2. Open `/register`, create a customer, and confirm redirection to `/dashboard`.
3. Confirm the dashboard loads the daily-message placeholder and an empty booking state.
4. Open `/dashboard/book` and move through all four steps.
5. Select a focus, format, generated slot, customer details, wallet, and transaction ID.
6. Submit the booking and confirm the success state.
7. Open `/dashboard/profile` and confirm the booking appears with `pending payment` status.
8. Sign out and sign back in through `/login`.
9. For admin testing, promote a local test user to `admin` in `.data/db.json`, sign out, and sign in through `/admin/login`. Admin users are also redirected automatically to `/admin` when they use `/login`; verify `/admin` and `/admin/bookings`.
10. Open `/admin/daily`, choose a tarot image with the file picker (PNG/JPG/WebP, maximum 5MB), confirm the thumbnail preview, publish the daily message, then refresh `/dashboard` as the customer and confirm both text and image appear.
11. Check the public landing page at desktop width and confirm the fixed header never overlaps the hero eyebrow or heading.
12. Check the landing and About pages below 580px wide: navigation remains usable, hero text stays within the viewport, and astrologer/developer cards stack without horizontal overflow.

## API smoke test

Run these commands while `npm run dev` is active.

### 1. Health check

```powershell
Invoke-RestMethod http://localhost:3000/api/health
```

Expected result:

```json
{
  "ok": true,
  "data": {
    "service": "bhone-thaw-tarot-api",
    "status": "ok"
  }
}
```

### 2. Read services

```powershell
Invoke-RestMethod http://localhost:3000/api/services
```

The response contains `readingTypes` and `sessionFormats`.

### 3. Read available slots

All available slots:

```powershell
Invoke-RestMethod http://localhost:3000/api/slots
```

Slots for one date:

```powershell
Invoke-RestMethod "http://localhost:3000/api/slots?date=2026-10-30"
```

Use a date in the generated 21-day window when testing.

### 4. Register a customer

```powershell
$registerBody = @{
  name = "Test Customer"
  email = "customer@example.com"
  password = "password123"
  phone = "09123456789"
} | ConvertTo-Json

$register = Invoke-WebRequest `
  -Uri http://localhost:3000/api/auth/register `
  -Method Post `
  -ContentType "application/json" `
  -Body $registerBody `
  -SessionVariable tarotSession

$register.Content
```

The `-SessionVariable tarotSession` option stores the HTTP-only session cookie for later requests.

If the email already exists, use a different email or reset the local database as described below.

### 5. Confirm the current session

```powershell
Invoke-RestMethod `
  -Uri http://localhost:3000/api/auth/me `
  -WebSession $tarotSession
```

### 6. Read and update the profile

Read:

```powershell
Invoke-RestMethod `
  -Uri http://localhost:3000/api/profile `
  -WebSession $tarotSession
```

Update:

```powershell
$profileBody = @{
  name = "Updated Customer"
  phone = "09987654321"
  dob = "1995-05-12"
  tob = "14:30"
  bio = "A customer profile used for local API testing."
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri http://localhost:3000/api/profile `
  -Method Patch `
  -ContentType "application/json" `
  -Body $profileBody `
  -WebSession $tarotSession
```

### 7. Create a booking

First capture an available slot:

```powershell
$slots = Invoke-RestMethod `
  -Uri http://localhost:3000/api/slots `
  -WebSession $tarotSession

$slotId = $slots.data[0].id
$slotId
```

Create the booking:

```powershell
$bookingBody = @{
  readingTypeId = "love"
  sessionFormatId = "written"
  slotId = $slotId
  fullName = "Test Customer"
  dob = "1995-05-12"
  tob = "14:30"
  questions = "What should I focus on in my relationship?"
  wallet = "kpay"
} | ConvertTo-Json

$booking = Invoke-RestMethod `
  -Uri http://localhost:3000/api/bookings `
  -Method Post `
  -ContentType "application/json" `
  -Body $bookingBody `
  -WebSession $tarotSession

$booking
$bookingId = $booking.data.id
```

The new booking starts with status `pending_payment`.

### 8. Submit payment proof

```powershell
$paymentBody = @{
  wallet = "kpay"
  transactionId = "TEST-TXN-000001"
  receiptUrl = "/uploads/test-receipt.png"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost:3000/api/bookings/$bookingId/payment" `
  -Method Post `
  -ContentType "application/json" `
  -Body $paymentBody `
  -WebSession $tarotSession
```

The booking remains `pending_payment` until an admin approves or rejects it.

### 9. Read customer bookings

```powershell
Invoke-RestMethod `
  -Uri http://localhost:3000/api/bookings `
  -WebSession $tarotSession
```

Read one booking:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:3000/api/bookings/$bookingId" `
  -WebSession $tarotSession
```

### 10. Read the daily message

```powershell
Invoke-RestMethod http://localhost:3000/api/daily-message
```

For a specific date:

```powershell
Invoke-RestMethod "http://localhost:3000/api/daily-message?date=2026-10-30"
```

## Admin API testing

Admin endpoints and the admin portal require a user whose stored `role` is `admin`. There is no public admin bootstrap endpoint; local development uses the role-promotion step below. After promotion, sign in through `/login`; the login screen reads the returned user role and sends admins to `/admin` automatically.

For local-only testing, stop the dev server, open `.data/db.json`, and change one user record:

```json
{
  "role": "admin"
}
```

PowerShell shortcut for a user created as `admin-test@example.com`:

```powershell
$db = Get-Content .data\db.json -Raw | ConvertFrom-Json
$user = $db.users | Where-Object { $_.email -eq "admin-test@example.com" }
if (-not $user) { throw "User not found" }
$user.role = "admin"
$db | ConvertTo-Json -Depth 20 | Set-Content .data\db.json
```

Restart the dev server, sign out of the browser, and sign in at `/admin/login`. The login response includes the user's role, so an admin is sent to `/admin` automatically. Opening `/dashboard` as an admin also redirects to `/admin`; a customer opening `/admin` is sent back to `/dashboard`.

### Clear login instructions

Customer login:

1. Open `/register` and create a customer account.
2. After registration, use `/login` for future sign-ins.
3. Customer accounts open `/dashboard` automatically.

Local admin login:

1. Create a normal account at `/register` using a dedicated email such as `admin-test@example.com`.
2. Stop the dev server and change that user's `role` to `admin` using the PowerShell command above.
3. Restart the dev server.
4. Open `/admin/login` and sign in with the same email and password.
5. The admin portal opens at `/admin`.

Admin access is not created by public registration. If `/admin/login` says the account does not have astrologer portal access, the user's stored role is still `customer`, or the local database was reset and the user has not been promoted again.

The admin daily-message image picker uploads through `/api/upload` and stores the returned URL in the existing `cardImage` field. No filesystem path is typed into the daily-message form.

For a repeatable local setup, you can create or update an admin account without editing JSON manually:

```powershell
npm run admin:set -- admin@example.com "replace-with-a-password"
```

The command stores only a scrypt password hash in `.data/db.json`. It creates the local database if it does not exist, or updates the matching email to `role: "admin"` if it already exists.

If a signed-out visitor opens `/admin` directly, the protected shell sends them to `/admin/login` automatically.

`/admin/login` is intentionally outside the protected admin shell so the login form can render for signed-out visitors.

Then sign in as that user and preserve the returned session in a separate PowerShell web session.

### List bookings

```powershell
Invoke-RestMethod `
  -Uri http://localhost:3000/api/admin/bookings `
  -WebSession $adminSession
```

Filter by status or date:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:3000/api/admin/bookings?status=pending_payment&date=2026-10-30" `
  -WebSession $adminSession
```

### Verify payment

Approve:

```powershell
$verifyBody = @{ decision = "approved"; adminNote = "Payment checked locally." } | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost:3000/api/admin/bookings/$bookingId/verify" `
  -Method Post `
  -ContentType "application/json" `
  -Body $verifyBody `
  -WebSession $adminSession
```

Reject by changing `decision` to `rejected`.

### Publish a daily message

```powershell
$messageBody = @{
  date = "2026-10-30"
  cardName = "The Star"
  cardImage = "/images/tarot/17-star.jpg"
  keywords = @("hope", "healing", "renewal")
  adviceText = "Make room for a small, hopeful step today."
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri http://localhost:3000/api/admin/daily-message `
  -Method Post `
  -ContentType "application/json" `
  -Body $messageBody `
  -WebSession $adminSession
```

## Reset local test data

The mock database is created automatically. To reset all local users, bookings, payment records, and generated slots:

```powershell
if (Test-Path .data\db.json) {
  Remove-Item .data\db.json
}
```

This clears all local customer/admin accounts, profiles, bookings, payment verifications, daily messages, and generated slots. Make the next API request to regenerate a clean database. Uploaded receipt files under `.data/uploads` are not removed by this command.

## Route summary

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| `GET` | `/api/health` | Public | Health check |
| `GET` | `/api/services` | Public | Reading types and formats |
| `GET` | `/api/slots` | Public | Available slots |
| `POST` | `/api/auth/register` | Public | Register customer |
| `POST` | `/api/auth/login` | Public | Login |
| `POST` | `/api/auth/logout` | Session | Logout |
| `GET` | `/api/auth/me` | Session | Current user |
| `GET/PATCH` | `/api/profile` | Customer | Profile |
| `GET/POST` | `/api/bookings` | Customer | List/create bookings |
| `GET` | `/api/bookings/:id` | Customer | Booking detail |
| `POST` | `/api/bookings/:id/payment` | Customer | Payment proof |
| `POST` | `/api/upload` | Customer | Upload receipt image |
| `GET` | `/api/upload/:filename` | Customer | Read own uploaded image |
| `GET` | `/api/daily-message` | Public | Daily message |
| `GET` | `/api/admin/bookings` | Admin | Booking management |
| `POST` | `/api/admin/bookings/:id/verify` | Admin | Payment decision |
| `POST` | `/api/admin/daily-message` | Admin | Publish daily message |

## Known limitations and next tests

- File-backed persistence is for local development only.
- There is no admin bootstrap endpoint yet.
- Receipt upload accepts authenticated PNG, JPEG, and WebP files up to 5MB and stores them under `.data/uploads` for local development.
- No automated unit or integration test suite exists yet.
- Add tests for duplicate bookings, invalid dates, expired sessions, rejected payments, and concurrent slot claims.

The frontend API clients and UI routes are now implemented, but automated frontend tests are still pending. If a generated-output `EPERM` occurs on Windows, stop any dev server, remove `.next`, and rerun `npm run build`; the issue is isolated to Next's generated build directories on this workspace. `npm run typecheck` and `npm run lint` remain the first validation commands and currently pass.

Keep this README updated whenever a route, request body, response shape, setup step, or test flow changes.
