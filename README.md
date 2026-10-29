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

The hero uses a lazy-loaded React Three Fiber scene with a custom Earth shader:
sunlit day side with ocean glint, a soft terminator, city lights on the night
side, clouds and an atmosphere rim.

**Member locations.** Markers come from `GET /api/member-locations`
([route](./src/app/api/member-locations/route.ts)), fetched on load and refreshed
every 60 seconds while the tab is visible. Marker size follows member count, and
arcs run from the hub city to the largest international locations. The route
currently serves **sample data** from
[src/data/member-locations.ts](./src/data/member-locations.ts). Replace it with a
database aggregate of verified member business addresses (city, country,
latitude/longitude, member count). Keep the response shape in
[src/types/member-location.ts](./src/types/member-location.ts).

**Controls.** Click or tap a marker to fly to it and open its card (previous,
next, and back to the full globe). Click anywhere else on Earth to zoom there.
Drag to rotate; dragging clears the selection. Wheel or pinch zooms within
1.45 to 4.5 scene units. Keyboard: focus the globe, then Enter/N and P cycle
locations, arrows rotate, `+` / `-` zoom, Escape/Home resets. Auto-rotation
pauses on interaction and while a location is focused.

Reduced motion disables auto-rotation, cloud movement, travel particles, marker
pulses and parallax; manual controls still work. Rendering pauses off-screen and
in hidden tabs. Texture-loading failures and unavailable/lost WebGL show a
static Earth with an explicit status. Errors are logged to the console.

Textures are served locally from `public/images/earth`. Desktop loads a 4K day
map and night lights (~0.7 MiB). Mobile loads 2K versions (~0.1 MiB). The first
close zoom loads a sharper day map: 8K on desktop GPUs that support it
(1.4 MiB), otherwise 4K on mobile. Imagery is adapted from
[Solar System Scope](https://www.solarsystemscope.com/textures/) under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); see
[the asset attribution](./public/images/earth/ATTRIBUTION.txt).

Run `node --experimental-strip-types --test tests/globe-motion.test.mjs` for
zoom, pinch, damping, auto-rotation and focus-angle checks.

## Membership landing page

The membership page is at `/join-network`
([join-landing.tsx](./src/components/membership/join-landing.tsx)). Website
joining CTAs link there, and `/register` redirects to it. It has a hero, network
stats, benefits, a four-step overview, plans with an India / Global currency
switch and an expandable comparison table, the application form, FAQs and a
closing call to action.

- Annual India / Global prices and plan benefits are editable in
  [src/data/membership.ts](./src/data/membership.ts). They are proposals, not
  approved commercial terms.
- The application ([application-wizard.tsx](./src/components/membership/application-wizard.tsx))
  has eight steps: personal details, business profile, location, verification,
  networking interests, plan, documents, and review. On desktop each step fits in
  one view with a step rail and a Next button; on small screens it flows naturally.
  Steps already completed can be revisited from the rail or from Edit on the review.
- Fields follow the **country**: the mobile calling code, example and validation
  ([libphonenumber-js](https://www.npmjs.com/package/libphonenumber-js)); states and
  cities from `/api/locations` with manual entry when unlisted; the postal code
  label and format; the registration numbers asked for and their formats (e.g.
  GSTIN, CIN, Udyam and IEC in India, VAT in Germany); and the required documents.
  Rules are in [src/lib/business-identity.ts](./src/lib/business-identity.ts),
  [src/data/membership-verification.ts](./src/data/membership-verification.ts) and
  [application-validation.ts](./src/components/membership/application-validation.ts).
  Formats are review aids, not legal requirements; countries without a profile
  get a general one. Run `npm run test:membership` to check them.
- Submitted applications, their documents (MongoDB GridFS) and declarations are
  stored in MongoDB; see **Database & member accounts** below. Save draft keeps the
  form on this device only (`mnc-membership-draft-v1`) and leaves documents out.
- In step 7, **View** opens an attached PDF, JPG or PNG in a new tab so applicants
  can check it before submitting. Previews use local browser files and do not
  upload them. Replacing or removing a file clears its preview link.
- Live use requires approved membership terms and privacy/retention rules,
  secure backend persistence, verification, review workflows and payment
  integration.

## Database & member accounts

All forms store data in MongoDB. Configure `.env.local` (see `.env.example`):

- `MONGODB_URI`: connection string. The database user needs `readWrite` on the
  database named in `MONGODB_DB`.
- `MONGODB_DB`: database name (default `mnc_global_connect`).
- `APP_URL`: site URL used in password links printed by the admin command.

Collections (indexes are created automatically on first use):

| Collection | Contents |
|---|---|
| `applications` | Membership applications: applicant, business, address, registrations, interests, plan, declarations, document references, status (`submitted` / `approved` / `rejected`) |
| `applicationDocuments.files` / `.chunks` | Uploaded verification documents (GridFS). Type is checked from file contents; PDF, JPG or PNG up to 5 MB |
| `users` | Member accounts (created on approval). Passwords are scrypt hashes |
| `sessions` | Login sessions; only a SHA-256 hash of the cookie token is stored. Expire automatically |
| `passwordTokens` | One-time set-up / reset links (hashed, single use, auto-expiring) |
| `contactEnquiries` | Contact form messages |
| `newsletterSubscribers` | Newsletter sign-ups (one per email) |

### Admin dashboard (`/admin-dashboard`)

Only accounts with the `admin` role can open it (others get a 404; signed-out visitors go to
`/login`). Admins land there after signing in. Create the first admin from the command line:

```bash
npm run admin -- create-admin you@company.com "Your Name"   # prints a set-password link
```

| Section | What you can do |
|---|---|
| Overview | Pending applications, active members, new enquiries, subscribers; latest activity |
| Applications | Filter by status, search; open an application to see every step, view / download documents, **Approve & create account** (shows the member's one-time password link to copy) or **Reject** |
| Members | Search and filter; issue a password link; disable (signs the member out) or re-enable |
| Enquiries | Read contact messages, reply by email, mark handled / reopen |
| Subscribers | Search and **Export CSV** |

Admin APIs live under `/api/admin/*` and refuse non-admins with 403.

### Publishing events and opportunities

Open **Events** or **Opportunities** in the admin sidebar. Add a title, category,
country, date, location (events) or industry (opportunities), and a complete
HTTP(S) website / registration link. Optionally add a short description and an
image URL or local `/images/` path; a default image is used when left blank.
Remote images load directly in the visitor's browser.

Check **Publish on the website** and save to make a listing public. Leave it
unchecked for a draft. Use **Edit** to change a listing or uncheck publishing to
remove it from public view. Listings persist in the MongoDB `listings` collection.

The home page shows the four newest published opportunities and the four nearest
upcoming events. The **View all** pages show all published opportunities and all
upcoming published events. Event dates use UTC; past events stay in the admin
panel but leave upcoming listings. The previous illustrative cards are not used
as live listings. Empty lists and loading failures show explicit messages.

Card image, title and Explore links open the supplied website in a new tab with
`noopener noreferrer`, not an internal details page. Existing detail-route URLs
redirect only for published records; missing or draft records return 404.

Run `npm run test:listings` for field and URL validation. After `npm run build`,
run `npm run test:listings:integration` for admin access, persistence,
publish/edit/unpublish, public ordering and external-link checks. Integration
tests start their own temporary MongoDB and local app server, never the configured
live database, and stop both when finished.

Accounts are created only when an application is approved (in the dashboard, or from the
command line):

```bash
npm run admin -- list                      # applications awaiting review
npm run admin -- approve MNC-1A2B3C        # creates the account, prints a set-password link
npm run admin -- reject MNC-1A2B3C
npm run admin -- password-link member@company.com   # new set-up / reset link
```

No email service is connected yet: send the printed link to the member yourself.
Forgot-password requests create a link that is logged on the server in development only;
in production, issue one with `password-link`. Login locks for 15 minutes after 5 failed
attempts. Signed-in members see their membership at `/dashboard`; the session cookie is
HTTP-only, SameSite=Lax and Secure in production. All write endpoints reject cross-site requests.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
