# Connecting this Next.js app to the Farmsapp backend

## What's set up

- **`next.config.ts`** — proxies any browser request to `/api/backend/*`
  server-side to the backend (`BACKEND_ORIGIN` + `BACKEND_CONTEXT_PATH` from
  `.env.local`). The browser never talks to the backend directly, so there's
  no CORS to configure on the Java side.
- **`.env.example`** — documents the env vars needed. Copy to `.env.local`
  and fill in real values (yours already has the first two; you need to add
  the two auth ones — see below). `.env.local` is git-ignored.
- **`lib/api.ts`** — client-side helpers (`backendGet`/`backendPost`/etc.)
  that call through the `/api/backend` proxy. Use these from `"use client"`
  components.
- **`lib/farmsapp-api.ts`** — **server-only** typed functions
  (`fetchCategories`, `fetchProducts`, `fetchCropCollections`,
  `fetchRecentlyViewed`, `fetchActiveOrders`) that call the backend
  *directly* with the app's Basic-auth credential, ported from the RN app's
  `src/webAPI/Services.js`. Call these from Server Components only (never
  from a `"use client"` file) — see "The farmerId/storeId blocker" below
  before wiring them into the UI.
- **`components/BackendStatus.tsx`** — a small widget that pings
  `/actuator/health` to prove the connection works. Safe to delete once
  real data is flowing.

## To get it running

1. In `.env.local`, add the two auth vars (already the real dev values from
   the RN app's `.env.dev`):
   ```
   BACKEND_AUTH_BASIC=Basic 
   BACKEND_AUTH_KEY=Y29tcGFuaW9uX2RldjpaRkhMX2NvbXBANDY1OA==
   ```
2. `BACKEND_ORIGIN` is already pointed at the shared dev server
   (`https://dev.kiosk.farm`), so you don't need to run the Spring Boot app
   locally just to see the site.
3. **Install deps and start the frontend**:
   ```
   npm install
   npm run dev
   ```
4. Open http://localhost:3000.

## The farmerId/storeId blocker

I read through the RN app's actual data-fetching code (`useCategories.js`,
`Crops.jsx`, `BestSellingProducts.jsx`) to find the real home-screen
endpoints. Every one of them — categories, crop collections, best selling,
recently viewed, active orders — requires **both a `storeId` and a
`farmerId`** before it'll even make the call. Those only exist once someone
has gone through the app's login/OTP flow (there's no anonymous/guest
browsing endpoint that I could find).

So `lib/farmsapp-api.ts` is ready to call real data, but nothing on the
homepage is wired to it yet — wiring it in now would just always return
empty results. Two ways forward, whenever you're ready:

1. **Build the login/OTP flow first** (`kisaan/companion/v1/login` +
   `trigger-otp`), so the website has a real farmerId/storeId to work with.
2. **Give me a known-good demo `farmerId` + `storeId`** (e.g. a test
   account on the dev server) so I can wire up real data on Home while the
   login flow gets built separately.

## Notes / things to revisit later

- **Production**: the proxy rewrite points at `BACKEND_ORIGIN` from env
  vars, so for a deployed site just set that env var in your hosting
  platform's settings — no code changes needed.
- **Auth for a logged-in user**: once login exists, the JWT should be set
  as an httpOnly cookie from a Route Handler, not stored in client JS.
