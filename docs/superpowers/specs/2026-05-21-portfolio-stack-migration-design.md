# Portfolio Stack Migration Design

**Date:** 2026-05-21
**Author:** Gurinder Singh Ghuman
**Status:** Approved

---

## Overview

Migrate the existing single-file HTML portfolio (`index.html`) to **Astro + Sanity CMS**, deployed on **Cloudflare Pages**. Add a new **Books** section with an inline PDF reader powered by react-pdf. The book can be swapped at any time via Sanity Studio without touching code.

---

## Architecture

### Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend framework | Astro | Best-in-class for static portfolios; React islands for interactive components; first-class Cloudflare Pages support |
| CMS | Sanity (free tier) | Hosted Studio dashboard; GROQ API; handles PDF file assets; webhook support for deploy triggers |
| Hosting | Cloudflare Pages | Current provider; global CDN; git-triggered deploys |
| PDF Reader | react-pdf (pdfjs-dist) | Renders PDF in-browser as a React island; no server needed |
| Contact Form | Web3Forms (free tier) | Real email delivery from static sites; no backend required |

### System Diagram

```
Sanity Studio (browser)
       │
       │  author uploads new PDF
       ▼
Sanity CMS (cloud)
       │
       ├── GROQ API ──────────────► Astro build (fetch at build time)
       │                                │
       │                           Static HTML + assets
       │                                │
       └── Webhook ──────────────► Cloudflare Pages deploy hook
                                        │
                                   Rebuild & publish (~60s)
                                        │
                                   Global CDN edge
                                        │
                                   User browser
                                        │
                                   react-pdf (client-side)
                                   fetches PDF URL from Sanity CDN
```

---

## Project Structure

```
portfolio/
├─ src/
│  ├─ pages/
│  │  └─ index.astro              ← single page, all sections composed here
│  ├─ components/
│  │  ├─ Nav.astro                ← navigation with mobile hamburger
│  │  ├─ ThemeToggle.tsx          ← React island (dark/light, localStorage)
│  │  ├─ Hero.astro
│  │  ├─ About.astro
│  │  ├─ Skills.astro
│  │  ├─ Books.astro              ← fetches book data from Sanity at build time
│  │  ├─ BookReader.tsx           ← React island (react-pdf, client:load)
│  │  └─ Contact.astro
│  ├─ lib/
│  │  └─ sanity.ts                ← Sanity client config + GROQ queries
│  └─ styles/
│     └─ global.css               ← migrated CSS variables, resets, shared styles
├─ sanity/                        ← Sanity Studio workspace
│  ├─ sanity.config.ts
│  └─ schemas/
│     └─ book.ts                  ← book document schema
├─ public/
│  └─ Gemini_Generated_Image_...  ← profile photo (carried over)
├─ astro.config.mjs
├─ tsconfig.json
└─ package.json
```

---

## Components

### Nav.astro
Replicates the existing fixed navbar — logo, nav links, theme toggle pill, hamburger menu. The `ThemeToggle.tsx` React island handles `localStorage` persistence for dark/light theme. Active link highlighting uses Astro's `client:load` scroll observer.

### Hero.astro
Static section — profile photo, name, role, location, description, CTA buttons. No changes from the current design.

### About.astro
Static section — biography paragraphs and timeline. Scroll-reveal animations implemented with an Astro `<script>` tag using `IntersectionObserver` (same logic as current).

### Skills.astro
Static section — skill cards, proficiency bars, language badges. Animated progress bars via `IntersectionObserver` on scroll.

### Books.astro + BookReader.tsx
`Books.astro` fetches the book document from Sanity at build time using GROQ:

```ts
// lib/sanity.ts
export const bookQuery = `*[_type == "book"][0]{
  title,
  description,
  "pdfUrl": pdfFile.asset->url,
  "coverUrl": coverImage.asset->url,
  author,
  year
}`
```

The fetched data is passed as props to `BookReader.tsx` (a React island with `client:load`). The reader renders:
- Book card: cover image, title, description, author, "Read Online" and "Download PDF" buttons
- Inline PDF viewer: react-pdf `<Document>` + `<Page>` with prev/next page controls and zoom

If Sanity returns no book, `Books.astro` renders a "Coming soon" placeholder instead.

### Contact.astro
Replicates existing contact links (email, LinkedIn, GitHub) and the contact form. Form submission posts to Web3Forms API (free tier, no backend). Inline success/error feedback replaces the current fake button behavior.

---

## Sanity Schema

```ts
// sanity/schemas/book.ts
export default {
  name: 'book',
  title: 'Book',
  type: 'document',
  fields: [
    { name: 'title',       type: 'string',   title: 'Title' },
    { name: 'author',      type: 'string',   title: 'Author' },
    { name: 'year',        type: 'number',   title: 'Year' },
    { name: 'description', type: 'text',     title: 'Description' },
    { name: 'pdfFile',     type: 'file',     title: 'PDF File' },
    { name: 'coverImage',  type: 'image',    title: 'Cover Image' },
  ]
}
```

---

## Data Flow

1. **Build time:** Astro fetches the book document from Sanity via GROQ. The PDF URL and metadata are embedded into the static HTML as component props.
2. **Runtime (client):** `BookReader.tsx` loads in the browser. react-pdf fetches the PDF from the Sanity CDN URL and renders it page by page.
3. **Book update:** Author opens Sanity Studio → uploads new PDF → saves. Sanity fires a webhook to the Cloudflare Pages deploy hook URL → new build starts → site is live with the new book within ~60 seconds.

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| Sanity returns no book at build time | Books section renders a "Coming soon" placeholder — no build failure |
| PDF fails to load in browser (network/bad URL) | react-pdf `onLoadError` shows a fallback message with a direct download link |
| Contact form submission fails | Inline error message displayed below the form |

---

## Deployment

- **Repository:** existing GitHub repo (no change)
- **Cloudflare Pages build command:** `npm run build`
- **Output directory:** `dist/`
- **Environment variables (Cloudflare Pages dashboard):**
  - `PUBLIC_SANITY_PROJECT_ID`
  - `PUBLIC_SANITY_DATASET`
- **Sanity webhook:** configured in Sanity project settings → points to Cloudflare Pages deploy hook URL

---

## Out of Scope

- Multiple books / a full books library (can be added later by extending the schema)
- User authentication or gated access to the book
- Selling the book / payment integration
- SSR / dynamic server rendering (static export is sufficient)

---

## Manual Verification Checklist

Before each deploy:
- [ ] Book renders correctly in the inline PDF reader
- [ ] Page navigation (prev/next) and download button work
- [ ] Dark/light theme toggle persists on refresh
- [ ] Mobile hamburger menu opens and closes
- [ ] Contact form submits and shows success feedback
- [ ] All nav links scroll to the correct section
- [ ] Profile photo loads
