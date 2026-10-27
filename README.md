This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Interactive hero Earth

The existing hero uses a lazy-loaded React Three Fiber scene. Drag the circular
Earth area to rotate; use the wheel or two-finger pinch to zoom. Page scrolling
remains available outside that circle. Keyboard users can focus it and use
arrow keys, `+` / `-`, and `Home` to reset. Double-click toggles a closer view.
Camera distance is smoothly bounded to 2.2–4.5 scene units. Auto-rotation pauses
on interaction and ramps up after 2.5 seconds of inactivity.

Reduced motion disables automatic rotation, cloud movement, travel particles,
and parallax; manual controls still work. Rendering pauses off-screen and in
hidden tabs. Mobile uses a smaller surface map and capped pixel ratio.
Texture-loading failures and unavailable/lost WebGL show a static Earth with an
explicit status instead of an empty hero. Errors are logged to the console.

Textures are served locally from `public/images/earth`, about 412 KiB combined.
They are adapted from [Solar System Scope](https://www.solarsystemscope.com/textures/)
under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); source names and
modifications are listed in [the asset attribution](./public/images/earth/ATTRIBUTION.txt).
The static fallback is a shaded orthographic projection of the same imagery.
No external texture service is contacted by visitors.

Run `node --experimental-strip-types --test tests/globe-motion.test.mjs` for zoom
direction/limits, pinch, interpolation, and auto-rotation timing checks.
Browser validation should also cover drag, touch, page scrolling outside the
globe, reduced-motion controls, navigation, and WebGL failure.

## Membership application prototype

The membership conversion page is at `/join-network`. Website joining CTAs
link there, and `/register` redirects to it.

- Annual India / Global prices and proposed benefits are editable in
  [src/data/membership.ts](./src/data/membership.ts). Prices and benefits are
  illustrative, not approved commercial terms.
- Application models are in [src/types/membership.ts](./src/types/membership.ts).
  The eight-step form validates required fields, URLs and country-specific
  address information before creating a demo reference.
- Country / state lookups use `/api/locations`, a server-side proxy for the public
  CountriesNow service. Only the selected country and state are sent to that
  provider; no address, identifiers or documents are sent. Internet access is
  required. Responses are cached for a day; provider coverage and administrative
  names may be incomplete or outdated.
- Location fields cascade from country to state / province to city / locality.
  The provider supplies localities, not authoritative districts. Manual entry is
  explicitly available for missing locations and service failures, with retry.
  Changing country clears dependent location fields, verification identifiers
  and document metadata; changing state clears dependent locality/address fields.
- Verification fields and proposed document checklists follow the **business
  country**, independently of residence and billing region. Country profiles and
  the clearly marked general fallback are editable in
  [src/data/membership-verification.ts](./src/data/membership-verification.ts).
  These are prototype review guidelines, not approved legal requirements.
  Required / conditional guidance is displayed, but selections stay optional.
  Run `npm run test:membership` (Node 22.6+ with type stripping) to check profiles.
- Application data is not submitted to a server. Email, OTP, business review, payment, membership
  activation, referral validation and actual document uploads are not connected.
- Save Progress explicitly stores the full draft in localStorage on this device
  (`mnc-membership-draft-v1`), including any optional identifiers entered. Do not
  enter confidential data or save drafts on shared devices. Restore Saved Draft
  reloads it. Clearing site data removes saved drafts and demo references.
- Document previews accept PDF/JPG/PNG up to 5 MB per file. Only metadata is
  retained; file contents are not read, stored or uploaded.
- Submission stores only a local reference, creation date and membership
  selection (`mnc-membership-receipt-v1`). View Local Demo Status reads that
  reference. It is not a live application status or a member ID.
- Live use requires approved membership terms and privacy/retention rules,
  secure backend persistence, verification and storage APIs, final pricing,
  review workflows and payment integration.

## Google address autocomplete and maps

Join Network's Business Location step supports opt-in Google Places address
autocomplete and an on-demand map preview. Without configuration, the form
explicitly reports that Google is unavailable; existing location dropdowns and
manual address entry continue to work.

1. In a Google Cloud project with billing, enable **Maps JavaScript API**,
   **Places API (New)**, and **Maps Embed API**.
2. Create a browser API key with **Websites / HTTP referrer restrictions**.
   Allow only your development and production origins, for example
   `http://localhost:3000/*` and `https://your-domain.example/*`.
   Restrict the key to the three APIs above. Set appropriate quotas, monitoring
   and budget alerts; alerts do not enforce a spending cap.
3. Copy `.env.example` to `.env.local` and set
   `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` locally. Never put a server secret in this
   variable. The browser key is intentionally public and must be restricted.
4. Restart the development server. Production requires the variable to be set
   **before building** and a fresh deployment after changing it.
5. Open `/join-network`, go to Business Location, enable Google address search,
   select a suggestion, review the filled fields, and click **Preview map**.

The new `PlaceAutocompleteElement` widget is used, not the legacy Autocomplete
API. Google results fill country, state, district/locality, city, street address,
postal code and a Maps link. Missing details remain empty for explicit review;
do not assume an address result verifies a business. A country change also
clears verification identifiers and document metadata. State/locality names
from Google may differ from CountriesNow; returned values are retained for
review. Existing address fields remain editable. Editing address fields clears
the generated Maps link to avoid retaining a stale place pin.

Search only connects to Google after the user enables it. Map iframes only load
after **Preview map** is clicked. Search queries / selected location are then
sent to Google under Google's terms and privacy policy; the production privacy
notice must describe this processing. Google's widget branding is retained.
Browser/network errors are shown; billing, authorization, or Embed API errors
may also appear in Google's widget or map frame. No real-key integration has
been configured by this repository.

**Official India state/district data is deferred** until an approved official
LGD CSV/JSON export or dataset URL is supplied. The existing district/city/locality
dropdown still uses CountriesNow and is not an authoritative district register.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
