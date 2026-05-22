# Portfolio Stack Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the single-file HTML portfolio to Astro + Sanity CMS on Cloudflare Pages, adding an inline PDF book reader managed via Sanity Studio.

**Architecture:** Astro generates a fully static site at build time, fetching book metadata from Sanity via GROQ. The PDF reader and theme toggle run as React islands (`client:load`). Cloudflare Pages hosts the static `dist/` output; a Sanity webhook triggers a redeploy whenever the book is updated in Sanity Studio.

**Tech Stack:** Astro 4, React 18, TypeScript, `@sanity/client`, `react-pdf`, Web3Forms (contact), Cloudflare Pages

**Spec:** `docs/superpowers/specs/2026-05-21-portfolio-stack-migration-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `index.html` | Rename → `index.html.bak` | Backup of original |
| `astro.config.mjs` | Create | Astro config with React integration |
| `tsconfig.json` | Create | TypeScript strict config |
| `package.json` | Create | All dependencies |
| `src/styles/global.css` | Create | CSS variables, reset, shared classes |
| `src/pages/index.astro` | Create | Root page — composes all sections |
| `src/components/Nav.astro` | Create | Fixed navbar, hamburger, mobile drawer |
| `src/components/ThemeToggle.tsx` | Create | Dark/light toggle React island |
| `src/components/Hero.astro` | Create | Hero section — name, role, CTA |
| `src/components/About.astro` | Create | About section — bio + timeline |
| `src/components/Skills.astro` | Create | Skills cards, proficiency bars, languages |
| `src/components/Books.astro` | Create | Books section — fetches from Sanity, renders BookReader |
| `src/components/BookReader.tsx` | Create | React island — react-pdf inline viewer |
| `src/components/Contact.astro` | Create | Contact section — links + Web3Forms form |
| `src/lib/sanity.ts` | Create | Sanity client + GROQ book query |
| `sanity/package.json` | Create | Sanity Studio workspace |
| `sanity/sanity.config.ts` | Create | Studio config |
| `sanity/schemas/book.ts` | Create | Book document schema |
| `public/` | Keep | Profile photo carried over |

---

## Task 1: Scaffold Astro Project

**Files:**
- Rename: `index.html` → `index.html.bak`
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`

- [ ] **Step 1: Back up the existing HTML file**

```bash
mv index.html index.html.bak
```

- [ ] **Step 2: Install Astro and all dependencies**

```bash
npm init -y
npm install astro @astrojs/react react react-dom typescript
npm install @sanity/client react-pdf
npm install --save-dev @types/react @types/react-dom
```

- [ ] **Step 3: Create `astro.config.mjs`**

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  output: 'static',
});
```

- [ ] **Step 4: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "strictNullChecks": true,
    "baseUrl": ".",
    "paths": {
      "@components/*": ["src/components/*"],
      "@lib/*": ["src/lib/*"]
    }
  }
}
```

- [ ] **Step 5: Update `package.json` scripts**

Replace the `scripts` section in `package.json` with:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  }
}
```

- [ ] **Step 6: Create required directories**

```bash
mkdir -p src/pages src/components src/lib src/styles public
```

- [ ] **Step 7: Move profile photo to public/**

```bash
mv "Gemini_Generated_Image_2ffus92ffus92ffu.png" public/
```

- [ ] **Step 8: Verify Astro runs**

```bash
npm run dev
```

Expected: Astro dev server starts at `http://localhost:4321` (may show a blank page — that's fine, pages come in later tasks).

- [ ] **Step 9: Commit**

```bash
git add astro.config.mjs tsconfig.json package.json package-lock.json src/ public/
git commit -m "chore: scaffold Astro project with React integration"
```

---

## Task 2: Global Styles

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Create `src/styles/global.css`**

```css
/* src/styles/global.css */

/* ── RESET ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── CSS VARIABLES ── */
:root {
  --blue-primary:   #2563eb;
  --blue-light:     #38bdf8;
  --blue-cyan:      #06b6d4;
  --blue-deep:      #1d4ed8;
  --blue-sky:       #0ea5e9;
  --gradient:       linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 55%, #22d3ee 100%);
  --gradient-text:  linear-gradient(90deg, #2563eb, #0ea5e9, #22d3ee);
}

/* ── DARK THEME ── */
[data-theme="dark"] {
  --bg-primary:    #020c1b;
  --bg-secondary:  #061526;
  --bg-card:       #0d2137;
  --bg-card-hover: #112b47;
  --text-primary:  #e0f2fe;
  --text-secondary:#93c5fd;
  --text-muted:    #4a7c9e;
  --border:        rgba(56, 189, 248, 0.15);
  --nav-bg:        rgba(2, 12, 27, 0.85);
  --shadow:        rgba(0, 0, 0, 0.45);
  --orb-opacity:   0.45;
}

/* ── LIGHT THEME ── */
[data-theme="light"] {
  --bg-primary:    #f0f9ff;
  --bg-secondary:  #e0f2fe;
  --bg-card:       #ffffff;
  --bg-card-hover: #dbeafe;
  --text-primary:  #0c1a2e;
  --text-secondary:#1e40af;
  --text-muted:    #64748b;
  --border:        rgba(37, 99, 235, 0.15);
  --nav-bg:        rgba(240, 249, 255, 0.85);
  --shadow:        rgba(37, 99, 235, 0.12);
  --orb-opacity:   0.18;
}

html { scroll-behavior: smooth; }

body {
  font-family: 'Inter', sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  overflow-x: hidden;
  transition: background-color 0.35s, color 0.35s;
}

/* ── CUSTOM SCROLLBAR ── */
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: var(--bg-primary); }
::-webkit-scrollbar-thumb { background: var(--blue-primary); border-radius: 3px; }

/* ── SHARED LAYOUT ── */
section { padding: 5.5rem 1.5rem; }
.container { max-width: 1100px; margin: 0 auto; }

/* ── SECTION HEADERS ── */
.section-eyebrow {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--blue-primary);
  margin-bottom: 0.6rem;
}

.section-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.9rem, 4.5vw, 2.9rem);
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.section-title em {
  font-style: normal;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

/* ── BUTTONS ── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.78rem 1.75rem;
  border-radius: 50px;
  font-size: 0.93rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s, color 0.25s;
  font-family: 'Inter', sans-serif;
}

.btn-primary {
  background: var(--gradient);
  color: #fff;
  box-shadow: 0 4px 22px rgba(37, 99, 235, 0.28);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 32px rgba(37, 99, 235, 0.42);
}

.btn-ghost {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.btn-ghost:hover {
  transform: translateY(-3px);
  border-color: var(--blue-primary);
  color: var(--blue-primary);
}

/* ── SCROLL REVEAL ── */
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.65s ease, transform 0.65s ease;
}

.reveal.visible { opacity: 1; transform: none; }
.reveal-d1 { transition-delay: 0.1s; }
.reveal-d2 { transition-delay: 0.2s; }
.reveal-d3 { transition-delay: 0.3s; }
.reveal-d4 { transition-delay: 0.4s; }

/* ── CHIP ── */
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.85rem;
  border-radius: 50px;
  font-size: 0.78rem;
  font-weight: 600;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  background: var(--bg-secondary);
}

.chip.accent {
  border-color: rgba(37, 99, 235, 0.4);
  color: var(--blue-primary);
  background: rgba(37, 99, 235, 0.08);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add global CSS variables and shared styles"
```

---

## Task 3: Root Page and Fonts

**Files:**
- Create: `src/pages/index.astro`

- [ ] **Step 1: Create `src/pages/index.astro`** (shell — sections added in later tasks)

```astro
---
// src/pages/index.astro
import '../styles/global.css';
---

<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gurinder Singh Ghuman | Portfolio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;0,800;1,700&display=swap" rel="stylesheet" />
</head>
<body>
  <p style="color:white;padding:2rem;">Astro is working ✓</p>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

```bash
npm run dev
```

Open `http://localhost:4321`. Expected: white text "Astro is working ✓" on dark background.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add root index.astro shell"
```

---

## Task 4: Nav Component + ThemeToggle Island

**Files:**
- Create: `src/components/Nav.astro`
- Create: `src/components/ThemeToggle.tsx`

- [ ] **Step 1: Create `src/components/ThemeToggle.tsx`**

```tsx
// src/components/ThemeToggle.tsx
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('portfolio-theme') as 'dark' | 'light' | null;
    const initial = saved ?? 'dark';
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
  }

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      title="Toggle dark / light mode"
      aria-label="Toggle theme"
    >
      <div className="toggle-thumb">{theme === 'dark' ? '🌙' : '☀️'}</div>
      <div className="toggle-icons">
        <span>🌙</span>
        <span>☀️</span>
      </div>
    </button>
  );
}
```

- [ ] **Step 2: Create `src/components/Nav.astro`**

```astro
---
// src/components/Nav.astro
import ThemeToggle from './ThemeToggle.tsx';
---

<nav id="nav">
  <div class="nav-inner">
    <a href="#hero" class="nav-logo">GSG.</a>

    <ul class="nav-links">
      <li><a href="#hero"    data-nav="hero">Home</a></li>
      <li><a href="#about"   data-nav="about">About</a></li>
      <li><a href="#skills"  data-nav="skills">Skills</a></li>
      <li><a href="#books"   data-nav="books">Books</a></li>
      <li><a href="#contact" data-nav="contact">Contact</a></li>
    </ul>

    <div class="nav-controls">
      <ThemeToggle client:load />
      <button class="hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</nav>

<nav class="mobile-nav" id="mobileNav" aria-hidden="true">
  <a href="#hero"    onclick="closeMenu()">Home</a>
  <a href="#about"   onclick="closeMenu()">About</a>
  <a href="#skills"  onclick="closeMenu()">Skills</a>
  <a href="#books"   onclick="closeMenu()">Books</a>
  <a href="#contact" onclick="closeMenu()">Contact</a>
</nav>

<style>
  nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 1000;
    height: 68px;
    background: var(--nav-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    transition: background 0.35s, border-color 0.35s;
  }

  .nav-inner {
    max-width: 1160px;
    margin: 0 auto;
    padding: 0 1.5rem;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav-logo {
    font-family: 'Playfair Display', serif;
    font-size: 1.45rem;
    font-weight: 800;
    background: var(--gradient-text);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-decoration: none;
    letter-spacing: -0.01em;
  }

  .nav-links {
    list-style: none;
    display: flex;
    align-items: center;
    gap: 2.2rem;
  }

  .nav-links a {
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 0.88rem;
    font-weight: 500;
    position: relative;
    transition: color 0.2s;
  }

  .nav-links a::after {
    content: '';
    position: absolute;
    bottom: -5px; left: 0;
    width: 0; height: 2px;
    background: var(--gradient);
    border-radius: 1px;
    transition: width 0.3s;
  }

  .nav-links a:hover,
  .nav-links a.active { color: var(--blue-primary); }
  .nav-links a:hover::after,
  .nav-links a.active::after { width: 100%; }

  .nav-controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  :global(.theme-toggle) {
    position: relative;
    width: 58px; height: 30px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 50px;
    cursor: pointer;
    transition: border-color 0.3s;
  }

  :global(.theme-toggle:hover) { border-color: var(--blue-primary); }

  :global(.toggle-thumb) {
    position: absolute;
    top: 3px; left: 3px;
    width: 22px; height: 22px;
    border-radius: 50%;
    background: var(--gradient);
    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    line-height: 1;
  }

  :global([data-theme="light"] .toggle-thumb) { transform: translateX(28px); }

  :global(.toggle-icons) {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 6px;
    font-size: 11px;
    pointer-events: none;
  }

  .hamburger {
    display: none;
    flex-direction: column;
    gap: 5px;
    cursor: pointer;
    padding: 6px;
    background: none;
    border: none;
  }

  .hamburger span {
    display: block;
    width: 22px; height: 2px;
    background: var(--text-primary);
    border-radius: 2px;
    transition: transform 0.3s, opacity 0.3s;
  }

  .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

  .mobile-nav {
    display: none;
    position: fixed;
    top: 68px; left: 0; right: 0;
    background: var(--nav-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    padding: 1.25rem 1.5rem 1.5rem;
    flex-direction: column;
    gap: 0;
    z-index: 999;
    transform: translateY(-10px);
    opacity: 0;
    transition: transform 0.3s, opacity 0.3s;
  }

  .mobile-nav.open {
    display: flex;
    transform: translateY(0);
    opacity: 1;
  }

  .mobile-nav a {
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 1rem;
    font-weight: 500;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--border);
    transition: color 0.2s, padding-left 0.2s;
  }

  .mobile-nav a:last-child { border-bottom: none; }
  .mobile-nav a:hover { color: var(--blue-primary); padding-left: 0.5rem; }

  @media (max-width: 768px) {
    .nav-links { display: none; }
    .hamburger { display: flex; }
  }
</style>

<script>
  const hamburger = document.getElementById('hamburger')!;
  const mobileNav = document.getElementById('mobileNav')!;

  function openMenu() {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('open');
    mobileNav.setAttribute('aria-hidden', 'false');
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
  }

  (window as any).closeMenu = closeMenu;

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    mobileNav.classList.contains('open') ? closeMenu() : openMenu();
  });

  document.addEventListener('click', (e) => {
    if (!mobileNav.contains(e.target as Node) && !hamburger.contains(e.target as Node)) closeMenu();
  });

  // Active nav link on scroll
  const navLinks = document.querySelectorAll<HTMLAnchorElement>('.nav-links a[data-nav]');
  const sectionIds = ['hero', 'about', 'skills', 'books', 'contact'];

  const navObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(a => {
          a.classList.toggle('active', a.dataset.nav === id);
        });
      }
    });
  }, { threshold: 0.4 });

  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) navObs.observe(el);
  });
</script>
```

- [ ] **Step 3: Add Nav to `src/pages/index.astro`**

Replace the entire file content with:

```astro
---
// src/pages/index.astro
import '../styles/global.css';
import Nav from '../components/Nav.astro';
---

<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gurinder Singh Ghuman | Portfolio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;0,800;1,700&display=swap" rel="stylesheet" />
</head>
<body>
  <Nav />
  <main style="padding-top:68px;color:var(--text-primary);">
    <p style="padding:4rem 2rem;">Sections coming soon…</p>
  </main>
</body>
</html>
```

- [ ] **Step 4: Verify nav in browser**

```bash
npm run dev
```

Open `http://localhost:4321`. Expected: fixed navbar with logo "GSG.", nav links, and working theme toggle. On mobile width, hamburger appears.

- [ ] **Step 5: Commit**

```bash
git add src/components/Nav.astro src/components/ThemeToggle.tsx src/pages/index.astro
git commit -m "feat: add Nav component and ThemeToggle React island"
```

---

## Task 5: Hero Section

**Files:**
- Create: `src/components/Hero.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/Hero.astro`**

```astro
---
// src/components/Hero.astro
---

<section id="hero">
  <div class="hero-orbs">
    <div class="orb orb-a"></div>
    <div class="orb orb-b"></div>
    <div class="orb orb-c"></div>
    <div class="orb orb-d"></div>
  </div>

  <div class="hero-inner">
    <div class="hero-content">
      <div class="hero-tag">
        <span class="dot"></span>
        Available for opportunities
      </div>

      <h1 class="hero-name">Gurinder Singh<br>Ghuman</h1>

      <p class="hero-role">Data &amp; Automation &nbsp;·&nbsp; Operations Analytics &nbsp;·&nbsp; Full-Stack Tooling</p>

      <div class="hero-location">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
        </svg>
        Berlin, Germany
      </div>

      <p class="hero-desc">
        Data and automation professional with an MSc in Data Analytics &amp; Marketing. Translating operational complexity into measurable KPIs, repeatable reports, and lightweight automation — with the strategic mindset of a commissioned Military Officer.
      </p>

      <div class="hero-cta">
        <a href="#contact" class="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,12 2,6"/></svg>
          Get in Touch
        </a>
        <a href="#about" class="btn btn-ghost">
          Explore My Work
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </div>
    </div>

    <div class="avatar-card">
      <div class="avatar-ring">
        <img src="/Gemini_Generated_Image_2ffus92ffus92ffu.png" alt="Gurinder Singh Ghuman" />
      </div>
      <div class="avatar-name">Gurinder Singh Ghuman</div>
      <div class="avatar-role">Data &amp; Automation Professional</div>

      <div class="avatar-chips">
        <span class="chip accent">🎖️ Army Officer</span>
        <span class="chip accent">📊 Data Analyst</span>
        <span class="chip">🇩🇪 Berlin-based</span>
        <span class="chip">🎓 MSc Data Analytics</span>
      </div>

      <div class="quick-stats">
        <div class="qs-item">
          <div class="qs-num">5+</div>
          <div class="qs-label">Years Exp.</div>
        </div>
        <div class="qs-item">
          <div class="qs-num">MSc</div>
          <div class="qs-label">Data Analytics</div>
        </div>
        <div class="qs-item">
          <div class="qs-num">3+</div>
          <div class="qs-label">Languages</div>
        </div>
      </div>
    </div>
  </div>

  <div class="scroll-cue" aria-hidden="true">
    <span>Scroll</span>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
  </div>
</section>

<style>
  #hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    padding: 7rem 1.5rem 4rem;
  }

  .hero-inner {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 4rem;
    align-items: center;
    max-width: 1100px;
    width: 100%;
    position: relative;
    z-index: 1;
  }

  .hero-orbs { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }

  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(90px);
    opacity: var(--orb-opacity);
    animation: drift 10s ease-in-out infinite;
  }

  .orb-a { width: 480px; height: 480px; background: radial-gradient(circle, #1d4ed8 0%, transparent 65%); top: -8%;  right: -6%; animation-delay: 0s; }
  .orb-b { width: 360px; height: 360px; background: radial-gradient(circle, #0ea5e9 0%, transparent 65%); bottom: 5%; left: -6%; animation-delay: -4s; }
  .orb-c { width: 280px; height: 280px; background: radial-gradient(circle, #06b6d4 0%, transparent 65%); top: 38%;  left: 28%; animation-delay: -8s; }
  .orb-d { width: 200px; height: 200px; background: radial-gradient(circle, #38bdf8 0%, transparent 65%); bottom: 20%; right: 15%; animation-delay: -2s; }

  @keyframes drift {
    0%,100% { transform: translate(0, 0) scale(1); }
    33%      { transform: translate(18px, -22px) scale(1.06); }
    66%      { transform: translate(-12px, 14px) scale(0.94); }
  }

  #hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(var(--border) 1px, transparent 1px),
      linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 60px 60px;
    opacity: 0.4;
    pointer-events: none;
  }

  .hero-content { text-align: left; }
  .hero-content .hero-cta { justify-content: flex-start; }

  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 50px;
    padding: 0.38rem 1.1rem;
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--blue-primary);
    margin-bottom: 1.75rem;
    letter-spacing: 0.02em;
  }

  .hero-tag .dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--blue-primary);
    animation: pulse-dot 2s ease-in-out infinite;
  }

  @keyframes pulse-dot {
    0%,100% { opacity: 1; transform: scale(1); }
    50%      { opacity: 0.5; transform: scale(0.7); }
  }

  .hero-name {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.6rem, 7.5vw, 5.2rem);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.02em;
    margin-bottom: 1rem;
    background: var(--gradient-text);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-role {
    font-size: clamp(1rem, 2.2vw, 1.2rem);
    color: var(--text-secondary);
    font-weight: 400;
    margin-bottom: 1rem;
    letter-spacing: 0.01em;
  }

  .hero-location {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--text-muted);
    font-size: 0.88rem;
    margin-bottom: 1.75rem;
  }

  .hero-desc {
    font-size: 1.02rem;
    color: var(--text-secondary);
    max-width: 600px;
    margin: 0 auto 2.5rem;
    line-height: 1.85;
  }

  .hero-cta {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .scroll-cue {
    position: absolute;
    bottom: 2rem; left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    color: var(--text-muted);
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    animation: bob 2.2s ease-in-out infinite;
  }

  .scroll-cue svg { width: 18px; height: 18px; }

  @keyframes bob {
    0%,100% { transform: translateX(-50%) translateY(0); }
    50%      { transform: translateX(-50%) translateY(9px); }
  }

  /* Avatar card */
  .avatar-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 28px;
    padding: 2.5rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .avatar-ring {
    width: 140px; height: 140px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(29,78,216,0.25), rgba(14,165,233,0.25));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 4rem;
    position: relative;
    overflow: hidden;
  }

  .avatar-ring img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    border-radius: 50%;
  }

  .avatar-ring::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: var(--gradient);
    z-index: -1;
  }

  .avatar-ring::after {
    content: '';
    position: absolute;
    inset: 2px;
    border-radius: 50%;
    background: var(--bg-card);
    z-index: -1;
  }

  .avatar-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.25rem;
    font-weight: 700;
    text-align: center;
    color: var(--text-primary);
  }

  .avatar-role {
    font-size: 0.82rem;
    color: var(--text-muted);
    text-align: center;
    margin-top: -1rem;
  }

  .avatar-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }

  .quick-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.6rem;
    width: 100%;
  }

  .qs-item {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 0.75rem 0.5rem;
    text-align: center;
    transition: border-color 0.25s, transform 0.25s;
  }

  .qs-item:hover { border-color: var(--blue-primary); transform: translateY(-3px); }

  .qs-num {
    font-size: 1.4rem;
    font-weight: 700;
    background: var(--gradient-text);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .qs-label {
    font-size: 0.68rem;
    color: var(--text-muted);
    margin-top: 0.15rem;
    line-height: 1.3;
  }

  @media (max-width: 900px) {
    .hero-inner { grid-template-columns: 1fr; gap: 2.5rem; }
    .hero-content { text-align: center; }
    .hero-content .hero-cta { justify-content: center; }
    .hero-location { justify-content: center; }
    .avatar-card { max-width: 340px; margin: 0 auto; }
  }

  @media (max-width: 480px) {
    .hero-cta { flex-direction: column; align-items: center; }
    .quick-stats { grid-template-columns: 1fr 1fr; }
  }
</style>
```

- [ ] **Step 2: Add Hero to `src/pages/index.astro`**

```astro
---
import '../styles/global.css';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
---

<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gurinder Singh Ghuman | Portfolio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;0,800;1,700&display=swap" rel="stylesheet" />
</head>
<body>
  <Nav />
  <Hero />
</body>
</html>
```

- [ ] **Step 3: Verify Hero in browser**

Open `http://localhost:4321`. Expected: full-viewport hero with name, gradient orbs, avatar card, and CTA buttons.

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero.astro src/pages/index.astro
git commit -m "feat: add Hero section"
```

---

## Task 6: About Section

**Files:**
- Create: `src/components/About.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/About.astro`**

```astro
---
// src/components/About.astro
---

<section id="about">
  <div class="container">
    <div class="section-header">
      <span class="section-eyebrow">Who I Am</span>
      <h2 class="section-title">About <em>Me</em></h2>
    </div>

    <div class="about-grid">
      <div class="about-right">
        <h3 class="reveal">Data Professional &amp;<br>Former Military Officer</h3>

        <p class="reveal reveal-d1">
          Data and automation professional with an MSc in Data Analytics &amp; Marketing.
          Expert in translating operational pain points into measurable KPIs, repeatable reports,
          and lightweight automation tools that stick.
        </p>

        <p class="reveal reveal-d2">
          My background as a commissioned Military Officer in the Indian Army shaped my ability to
          lead under pressure, coordinate across diverse teams, and deliver strategic outcomes —
          qualities I now bring to every data project and full-stack build.
        </p>

        <div class="timeline reveal reveal-d3">
          <p class="tl-label">Experience &amp; Education</p>

          <div class="tl-item">
            <div class="tl-left"><div class="tl-dot"></div><div class="tl-line"></div></div>
            <div class="tl-body">
              <h4>Marketing &amp; Business Intelligence Intern</h4>
              <div class="tl-meta">Optimizely · Berlin &nbsp;·&nbsp; Oct 2021 – Mar 2022</div>
              <p>Developed recurring BI reports and dashboards for stakeholder decision-making. Structured and validated complex datasets; supported campaign performance tracking for email marketing.</p>
            </div>
          </div>

          <div class="tl-item">
            <div class="tl-left"><div class="tl-dot"></div><div class="tl-line"></div></div>
            <div class="tl-body">
              <h4>Military Officer – Operations / Intelligence / GIS</h4>
              <div class="tl-meta">Indian Army &nbsp;·&nbsp; Commissioned Officer (NDA Background)</div>
              <p>Provided critical operational decision support in high-pressure environments. Designed and maintained a strategic GIS database; coordinated across diverse teams for strategic objectives.</p>
              <span class="tl-award">🏅 Army Commander's Commendation</span>
            </div>
          </div>

          <div class="tl-item">
            <div class="tl-left"><div class="tl-dot"></div><div class="tl-line"></div></div>
            <div class="tl-body">
              <h4>Neo4j Operations Dashboard</h4>
              <div class="tl-meta">Personal Project &nbsp;·&nbsp; Full-Stack Analytics</div>
              <p>Built a comprehensive internal-style dashboard using Next.js, React, TypeScript, and Neo4j. Includes supply-planning module with demand proxies and "what-if" scenario controls.</p>
            </div>
          </div>

          <div class="tl-item">
            <div class="tl-left"><div class="tl-dot"></div><div class="tl-line"></div></div>
            <div class="tl-body">
              <h4>MSc in Data Analytics &amp; Marketing</h4>
              <div class="tl-meta">Arden University (UK) · Berlin &nbsp;·&nbsp; 2020 – 2022</div>
              <p>Focus: Data handling, Python analytics, and Power BI visualization.</p>
            </div>
          </div>

          <div class="tl-item">
            <div class="tl-left"><div class="tl-dot"></div></div>
            <div class="tl-body">
              <h4>Bachelor of Arts – National Defence Academy</h4>
              <div class="tl-meta">Pune, India</div>
              <p>Majors: Economics, Geography, History, and English.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  #about { background: var(--bg-secondary); }

  .about-grid {
    display: block;
    max-width: 780px;
    margin: 0 auto;
  }

  .about-right h3 {
    font-family: 'Playfair Display', serif;
    font-size: 1.65rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 1rem;
    line-height: 1.25;
  }

  .about-right p {
    color: var(--text-secondary);
    line-height: 1.85;
    margin-bottom: 1.25rem;
    font-size: 0.97rem;
  }

  .timeline { margin-top: 2.5rem; }

  .tl-label {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--blue-primary);
    margin-bottom: 1.5rem;
  }

  .tl-item {
    display: flex;
    gap: 1.1rem;
    margin-bottom: 1.8rem;
    position: relative;
  }

  .tl-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    width: 16px;
  }

  .tl-dot {
    width: 14px; height: 14px;
    border-radius: 50%;
    background: var(--gradient);
    flex-shrink: 0;
    margin-top: 4px;
    box-shadow: 0 0 0 3px var(--bg-secondary), 0 0 0 5px rgba(37,99,235,0.2);
  }

  .tl-line {
    flex: 1;
    width: 2px;
    background: var(--border);
    margin-top: 4px;
  }

  .tl-item:last-child .tl-line { display: none; }

  .tl-body h4 {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.3;
  }

  .tl-body .tl-meta {
    font-size: 0.8rem;
    color: var(--blue-primary);
    margin: 0.2rem 0 0.4rem;
    font-weight: 500;
  }

  .tl-body p {
    font-size: 0.85rem;
    color: var(--text-muted);
    line-height: 1.65;
    margin: 0;
  }

  .tl-award {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.75rem;
    background: rgba(56,189,248,0.1);
    border: 1px solid rgba(56,189,248,0.3);
    color: var(--blue-cyan);
    border-radius: 50px;
    padding: 0.2rem 0.7rem;
    margin-top: 0.5rem;
  }
</style>

<script>
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
</script>
```

- [ ] **Step 2: Add About to `src/pages/index.astro`**

Add `import About from '../components/About.astro';` to the frontmatter and `<About />` after `<Hero />` in the body.

- [ ] **Step 3: Verify About in browser**

Scroll down from hero. Expected: About section with bio paragraphs and animated timeline.

- [ ] **Step 4: Commit**

```bash
git add src/components/About.astro src/pages/index.astro
git commit -m "feat: add About section with timeline"
```

---

## Task 7: Skills Section

**Files:**
- Create: `src/components/Skills.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/Skills.astro`**

```astro
---
// src/components/Skills.astro
---

<section id="skills">
  <div class="container">
    <div class="section-header">
      <span class="section-eyebrow">What I Do</span>
      <h2 class="section-title">Core <em>Skills</em></h2>
    </div>

    <div class="skills-layout">
      <div class="skill-card reveal">
        <div class="skill-card-head">
          <div class="skill-icon si-orange">📊</div>
          <h3>Analytics</h3>
        </div>
        <div class="skill-tags">
          <span class="stag">Operations Analytics</span>
          <span class="stag">KPI Design</span>
          <span class="stag">Reporting Automation</span>
          <span class="stag">Time-series Aggregation</span>
          <span class="stag">Data Validation</span>
          <span class="stag">Campaign Tracking</span>
        </div>
      </div>

      <div class="skill-card reveal reveal-d1">
        <div class="skill-card-head">
          <div class="skill-icon si-purple">🗄️</div>
          <h3>Data Technology</h3>
        </div>
        <div class="skill-tags">
          <span class="stag">Python</span>
          <span class="stag">SQL · SSMS</span>
          <span class="stag">GraphQL</span>
          <span class="stag">Cypher</span>
          <span class="stag">Neo4j</span>
          <span class="stag">GIS Systems</span>
        </div>
      </div>

      <div class="skill-card reveal reveal-d2">
        <div class="skill-card-head">
          <div class="skill-icon si-pink">🌐</div>
          <h3>Web &amp; Tooling</h3>
        </div>
        <div class="skill-tags">
          <span class="stag">React</span>
          <span class="stag">Next.js</span>
          <span class="stag">TypeScript</span>
          <span class="stag">Git</span>
          <span class="stag">Vercel</span>
        </div>
      </div>

      <div class="skill-card reveal reveal-d3">
        <div class="skill-card-head">
          <div class="skill-icon si-amber">📈</div>
          <h3>BI &amp; Visualization</h3>
        </div>
        <div class="skill-tags">
          <span class="stag">Power BI</span>
          <span class="stag">Tableau</span>
          <span class="stag">Advanced Excel</span>
          <span class="stag">Dashboard Design</span>
          <span class="stag">Data Storytelling</span>
        </div>
      </div>
    </div>

    <div class="proficiency reveal" id="proficiency">
      <h3>Proficiency Levels</h3>
      <div class="bar-item">
        <div class="bar-header"><span class="bar-name">SQL</span><span class="bar-pct">92%</span></div>
        <div class="bar-track"><div class="bar-fill" data-w="92"></div></div>
      </div>
      <div class="bar-item">
        <div class="bar-header"><span class="bar-name">Python</span><span class="bar-pct">85%</span></div>
        <div class="bar-track"><div class="bar-fill" data-w="85"></div></div>
      </div>
      <div class="bar-item">
        <div class="bar-header"><span class="bar-name">Power BI</span><span class="bar-pct">88%</span></div>
        <div class="bar-track"><div class="bar-fill" data-w="88"></div></div>
      </div>
      <div class="bar-item">
        <div class="bar-header"><span class="bar-name">React / Next.js</span><span class="bar-pct">80%</span></div>
        <div class="bar-track"><div class="bar-fill" data-w="80"></div></div>
      </div>
      <div class="bar-item">
        <div class="bar-header"><span class="bar-name">Neo4j / Cypher</span><span class="bar-pct">75%</span></div>
        <div class="bar-track"><div class="bar-fill" data-w="75"></div></div>
      </div>
    </div>

    <div class="lang-row reveal">
      <div class="lang-badge"><div class="lang-name">🇬🇧 English</div><div class="lang-level">Fluent / Native</div></div>
      <div class="lang-badge"><div class="lang-name">🇩🇪 German</div><div class="lang-level">B2 · Upper Intermediate</div></div>
      <div class="lang-badge"><div class="lang-name">🇮🇳 Hindi</div><div class="lang-level">Native</div></div>
      <div class="lang-badge"><div class="lang-name">🫶 Punjabi</div><div class="lang-level">Native</div></div>
    </div>
  </div>
</section>

<style>
  #skills { background: var(--bg-primary); }

  .skills-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 3.5rem;
  }

  .skill-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 22px;
    padding: 1.8rem;
    transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
  }

  .skill-card:hover {
    transform: translateY(-6px);
    border-color: var(--blue-primary);
    box-shadow: 0 20px 45px var(--shadow);
  }

  .skill-card-head {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    margin-bottom: 1.2rem;
  }

  .skill-icon {
    width: 46px; height: 46px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.35rem;
  }

  .si-orange { background: rgba(37,99,235,0.12); }
  .si-pink   { background: rgba(14,165,233,0.12); }
  .si-purple { background: rgba(6,182,212,0.12); }
  .si-amber  { background: rgba(56,189,248,0.12); }

  .skill-card-head h3 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .skill-tags { display: flex; flex-wrap: wrap; gap: 0.45rem; }

  .stag {
    display: inline-block;
    padding: 0.28rem 0.75rem;
    border-radius: 50px;
    font-size: 0.78rem;
    font-weight: 500;
    border: 1px solid var(--border);
    color: var(--text-secondary);
    background: var(--bg-secondary);
    transition: border-color 0.2s, color 0.2s, background 0.2s;
  }

  .stag:hover {
    border-color: var(--blue-primary);
    color: var(--blue-primary);
    background: rgba(37,99,235,0.08);
  }

  .proficiency {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 22px;
    padding: 2rem 2.25rem;
  }

  .proficiency h3 {
    font-family: 'Playfair Display', serif;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 1.75rem;
  }

  .bar-item { margin-bottom: 1.3rem; }

  .bar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.45rem;
  }

  .bar-name { font-size: 0.88rem; font-weight: 500; color: var(--text-primary); }
  .bar-pct  { font-size: 0.82rem; font-weight: 700; color: var(--blue-primary); }

  .bar-track {
    height: 5px;
    background: var(--bg-secondary);
    border-radius: 3px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    border-radius: 3px;
    background: var(--gradient);
    width: 0;
    transition: width 1.4s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .lang-row {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 3.5rem;
  }

  .lang-badge {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1rem 1.5rem;
    flex: 1;
    min-width: 140px;
    transition: border-color 0.25s, transform 0.25s;
  }

  .lang-badge:hover { border-color: var(--blue-light); transform: translateY(-3px); }
  .lang-name { font-weight: 600; font-size: 0.95rem; color: var(--text-primary); }
  .lang-level { font-size: 0.78rem; color: var(--blue-light); margin-top: 0.2rem; font-weight: 500; }

  @media (max-width: 900px) { .skills-layout { grid-template-columns: 1fr; } }
</style>

<script>
  const barObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll<HTMLElement>('.bar-fill').forEach(b => {
          b.style.width = b.dataset.w + '%';
        });
      }
    });
  }, { threshold: 0.3 });

  const prof = document.getElementById('proficiency');
  if (prof) barObs.observe(prof);
</script>
```

- [ ] **Step 2: Add Skills to `src/pages/index.astro`**

Add `import Skills from '../components/Skills.astro';` to frontmatter and `<Skills />` after `<About />`.

- [ ] **Step 3: Verify Skills in browser**

Scroll to Skills. Expected: two-column skill cards, animated proficiency bars on scroll, language badges.

- [ ] **Step 4: Commit**

```bash
git add src/components/Skills.astro src/pages/index.astro
git commit -m "feat: add Skills section"
```

---

## Task 8: Sanity CMS Setup

**Files:**
- Create: `sanity/package.json`
- Create: `sanity/sanity.config.ts`
- Create: `sanity/schemas/book.ts`

- [ ] **Step 1: Create the Sanity Studio workspace**

```bash
mkdir -p sanity/schemas
```

- [ ] **Step 2: Create `sanity/package.json`**

```json
{
  "name": "portfolio-sanity",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "sanity dev",
    "build": "sanity build",
    "deploy": "sanity deploy"
  },
  "dependencies": {
    "sanity": "^3.0.0",
    "@sanity/vision": "^3.0.0"
  }
}
```

- [ ] **Step 3: Install Sanity Studio dependencies**

```bash
cd sanity && npm install && cd ..
```

- [ ] **Step 4: Create Sanity project**

Go to https://www.sanity.io/manage and create a new project named `portfolio`. Note the **Project ID** — you'll need it in the next step.

- [ ] **Step 5: Create `sanity/schemas/book.ts`**

```ts
// sanity/schemas/book.ts
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'book',
  title: 'Book',
  type: 'document',
  fields: [
    defineField({ name: 'title',       type: 'string', title: 'Title',       validation: r => r.required() }),
    defineField({ name: 'author',      type: 'string', title: 'Author',      validation: r => r.required() }),
    defineField({ name: 'year',        type: 'number', title: 'Year' }),
    defineField({ name: 'description', type: 'text',   title: 'Description' }),
    defineField({ name: 'pdfFile',     type: 'file',   title: 'PDF File',    options: { accept: '.pdf' } }),
    defineField({ name: 'coverImage',  type: 'image',  title: 'Cover Image', options: { hotspot: true } }),
  ],
});
```

- [ ] **Step 6: Create `sanity/sanity.config.ts`** (replace `YOUR_PROJECT_ID` with actual ID from step 4)

```ts
// sanity/sanity.config.ts
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import book from './schemas/book';

export default defineConfig({
  name: 'portfolio',
  title: 'Portfolio CMS',
  projectId: 'YOUR_PROJECT_ID',
  dataset: 'production',
  plugins: [structureTool(), visionTool()],
  schema: { types: [book] },
});
```

- [ ] **Step 7: Start Sanity Studio and create a test book**

```bash
cd sanity && npm run dev
```

Expected: Studio opens at `http://localhost:3333`. Create one Book document: add a title, author, description, and upload a PDF. Note: you can use any small PDF for testing.

- [ ] **Step 8: Commit**

```bash
cd ..
git add sanity/
git commit -m "feat: add Sanity Studio with book schema"
```

---

## Task 9: Sanity Client in Astro

**Files:**
- Create: `src/lib/sanity.ts`

- [ ] **Step 1: Create `src/lib/sanity.ts`** (replace `YOUR_PROJECT_ID` with actual ID)

```ts
// src/lib/sanity.ts
import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET ?? 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
});

export interface Book {
  title: string;
  author: string;
  year: number;
  description: string;
  pdfUrl: string;
  coverUrl: string | null;
}

export async function getBook(): Promise<Book | null> {
  return sanityClient.fetch<Book | null>(
    `*[_type == "book"][0]{
      title,
      author,
      year,
      description,
      "pdfUrl": pdfFile.asset->url,
      "coverUrl": coverImage.asset->url
    }`
  );
}
```

- [ ] **Step 2: Create `.env` file for local development**

```bash
# .env  (never commit this file)
PUBLIC_SANITY_PROJECT_ID=your_project_id_here
PUBLIC_SANITY_DATASET=production
```

- [ ] **Step 3: Add `.env` to `.gitignore`**

```bash
echo ".env" >> .gitignore
```

- [ ] **Step 4: Verify the query returns data**

Create a temporary test script `src/lib/test-sanity.ts` (delete after verifying):

```ts
// src/lib/test-sanity.ts — DELETE AFTER VERIFYING
import { getBook } from './sanity';
getBook().then(b => console.log(JSON.stringify(b, null, 2)));
```

Run: `npx tsx src/lib/test-sanity.ts`

Expected output: JSON object with title, author, pdfUrl fields populated.

- [ ] **Step 5: Delete the test script**

```bash
rm src/lib/test-sanity.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/sanity.ts .gitignore
git commit -m "feat: add Sanity client and book GROQ query"
```

---

## Task 10: Books Section + BookReader Island

**Files:**
- Create: `src/components/Books.astro`
- Create: `src/components/BookReader.tsx`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/BookReader.tsx`**

```tsx
// src/components/BookReader.tsx
import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  pdfUrl: string;
  title: string;
}

export default function BookReader({ pdfUrl, title }: Props) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const onLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setError(null);
  }, []);

  const onLoadError = useCallback((err: Error) => {
    setError('Failed to load PDF. Try downloading it directly.');
    console.error('PDF load error:', err);
  }, []);

  if (error) {
    return (
      <div className="reader-error">
        <p>{error}</p>
        <a href={pdfUrl} download className="btn btn-ghost">⬇ Download PDF</a>
      </div>
    );
  }

  return (
    <div className="reader-wrap">
      <Document
        file={pdfUrl}
        onLoadSuccess={onLoadSuccess}
        onLoadError={onLoadError}
        loading={<div className="reader-loading">Loading PDF…</div>}
      >
        <Page pageNumber={pageNumber} width={Math.min(window.innerWidth - 64, 700)} />
      </Document>

      {numPages > 0 && (
        <div className="reader-controls">
          <button
            onClick={() => setPageNumber(p => Math.max(p - 1, 1))}
            disabled={pageNumber <= 1}
            className="btn btn-ghost"
          >
            ← Prev
          </button>
          <span className="reader-page-info">Page {pageNumber} of {numPages}</span>
          <button
            onClick={() => setPageNumber(p => Math.min(p + 1, numPages))}
            disabled={pageNumber >= numPages}
            className="btn btn-ghost"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/Books.astro`**

```astro
---
// src/components/Books.astro
import { getBook } from '../lib/sanity';
import BookReader from './BookReader.tsx';

const book = await getBook();
---

<section id="books">
  <div class="container">
    <div class="section-header">
      <span class="section-eyebrow">What I've Written</span>
      <h2 class="section-title">My <em>Book</em></h2>
    </div>

    {book ? (
      <div class="book-inner">
        <div class="book-card reveal">
          <div class="book-cover">
            {book.coverUrl
              ? <img src={book.coverUrl} alt={`${book.title} cover`} />
              : <div class="cover-placeholder">📗</div>
            }
          </div>
          <div class="book-meta">
            <h3>{book.title}</h3>
            <p class="book-byline">{book.author}{book.year ? ` · ${book.year}` : ''}</p>
            <p class="book-desc">{book.description}</p>
            <div class="book-actions">
              <a href="#book-reader" class="btn btn-primary">📖 Read Online</a>
              <a href={book.pdfUrl} download class="btn btn-ghost">⬇ Download PDF</a>
            </div>
          </div>
        </div>

        <div id="book-reader" class="reader-container reveal reveal-d1">
          <BookReader client:load pdfUrl={book.pdfUrl} title={book.title} />
        </div>
      </div>
    ) : (
      <div class="books-placeholder reveal">
        <p>📚 Book coming soon — check back later.</p>
      </div>
    )}
  </div>
</section>

<style>
  #books { background: var(--bg-secondary); }

  .book-inner {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .book-card {
    display: grid;
    grid-template-columns: 180px 1fr;
    gap: 2rem;
    align-items: start;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 22px;
    padding: 1.75rem;
  }

  .book-cover {
    aspect-ratio: 3/4;
    border-radius: 10px;
    overflow: hidden;
    background: linear-gradient(135deg, #1d4ed8, #0ea5e9);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .book-cover img { width: 100%; height: 100%; object-fit: cover; }
  .cover-placeholder { font-size: 3rem; }

  .book-meta h3 {
    font-family: 'Playfair Display', serif;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.35rem;
  }

  .book-byline {
    font-size: 0.85rem;
    color: var(--blue-primary);
    font-weight: 500;
    margin-bottom: 0.85rem;
  }

  .book-desc {
    font-size: 0.92rem;
    color: var(--text-secondary);
    line-height: 1.75;
    margin-bottom: 1.25rem;
  }

  .book-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }

  .reader-container {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 22px;
    padding: 1.5rem;
    overflow: hidden;
  }

  :global(.reader-wrap) { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
  :global(.reader-loading) { color: var(--text-muted); padding: 3rem; text-align: center; }
  :global(.reader-error) { color: var(--text-muted); padding: 2rem; text-align: center; }
  :global(.reader-controls) { display: flex; align-items: center; gap: 1rem; }
  :global(.reader-page-info) { font-size: 0.85rem; color: var(--text-muted); }

  .books-placeholder {
    text-align: center;
    padding: 4rem;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 22px;
    color: var(--text-muted);
    max-width: 500px;
    margin: 0 auto;
  }

  @media (max-width: 600px) {
    .book-card { grid-template-columns: 1fr; }
    .book-cover { max-width: 160px; }
  }
</style>
```

- [ ] **Step 3: Add Books to `src/pages/index.astro`**

Add `import Books from '../components/Books.astro';` to frontmatter and `<Books />` after `<Skills />`.

- [ ] **Step 4: Verify Books section in browser**

```bash
npm run dev
```

Scroll to Books. Expected: book card with title/description from Sanity, and inline PDF viewer below it.

- [ ] **Step 5: Commit**

```bash
git add src/components/Books.astro src/components/BookReader.tsx src/pages/index.astro
git commit -m "feat: add Books section with Sanity data and react-pdf reader"
```

---

## Task 11: Contact Section

**Files:**
- Create: `src/components/Contact.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Get a free Web3Forms access key**

Go to https://web3forms.com, enter your email, and copy the access key. You'll paste it into the form below.

- [ ] **Step 2: Create `src/components/Contact.astro`** (replace `YOUR_WEB3FORMS_KEY`)

```astro
---
// src/components/Contact.astro
---

<section id="contact">
  <div class="container">
    <div class="section-header">
      <span class="section-eyebrow">Let's Connect</span>
      <h2 class="section-title">Get In <em>Touch</em></h2>
    </div>

    <div class="contact-inner">
      <div class="contact-links">
        <a href="mailto:gurinder.singh.ghuman22@gmail.com" class="contact-link reveal">
          <div class="cl-icon">✉️</div>
          <div class="cl-label">Email</div>
          <div class="cl-value">gurinder.singh.<br>ghuman22@gmail.com</div>
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener" class="contact-link reveal reveal-d1">
          <div class="cl-icon">💼</div>
          <div class="cl-label">LinkedIn</div>
          <div class="cl-value">Connect on LinkedIn</div>
        </a>
        <a href="https://github.com/dreamscaatcher" target="_blank" rel="noopener" class="contact-link reveal reveal-d2">
          <div class="cl-icon">🐙</div>
          <div class="cl-label">GitHub</div>
          <div class="cl-value">View My Projects</div>
        </a>
      </div>

      <form
        class="contact-form reveal reveal-d3"
        action="https://api.web3forms.com/submit"
        method="POST"
        id="contactForm"
      >
        <input type="hidden" name="access_key" value="YOUR_WEB3FORMS_KEY" />
        <input type="hidden" name="subject" value="New message from portfolio" />
        <input type="checkbox" name="botcheck" style="display:none;" />

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Name</label>
            <input type="text" name="name" class="form-input" placeholder="Your full name" required />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" name="email" class="form-input" placeholder="your@email.com" required />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Subject</label>
          <input type="text" name="subject_line" class="form-input" placeholder="What's this about?" />
        </div>
        <div class="form-group">
          <label class="form-label">Message</label>
          <textarea name="message" class="form-input" placeholder="Tell me about your project or opportunity…" required></textarea>
        </div>

        <div id="formMsg" class="form-msg" aria-live="polite"></div>

        <button type="submit" class="btn btn-primary btn-block" id="submitBtn">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          Send Message
        </button>
      </form>
    </div>
  </div>
</section>

<style>
  #contact { background: var(--bg-secondary); }
  .contact-inner { max-width: 720px; margin: 0 auto; }

  .contact-links {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 2.5rem;
  }

  .contact-link {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 1.4rem 1rem;
    text-align: center;
    text-decoration: none;
    transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
  }

  .contact-link:hover {
    transform: translateY(-5px);
    border-color: var(--blue-primary);
    box-shadow: 0 14px 35px var(--shadow);
  }

  .cl-icon { font-size: 1.7rem; margin-bottom: 0.6rem; }
  .cl-label { font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.3rem; }
  .cl-value { font-size: 0.82rem; font-weight: 600; color: var(--text-primary); word-break: break-word; }

  .contact-form {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 2.25rem;
  }

  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .form-group { margin-bottom: 1.2rem; }

  .form-label {
    display: block;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 0.45rem;
    letter-spacing: 0.02em;
  }

  .form-input {
    width: 100%;
    padding: 0.72rem 1rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text-primary);
    font-size: 0.93rem;
    font-family: 'Inter', sans-serif;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .form-input::placeholder { color: var(--text-muted); }
  .form-input:focus { border-color: var(--blue-primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  textarea.form-input { resize: vertical; min-height: 120px; }

  .btn-block { width: 100%; justify-content: center; }

  .form-msg {
    margin-bottom: 0.75rem;
    font-size: 0.88rem;
    min-height: 1.2em;
  }

  .form-msg.success { color: #22c55e; }
  .form-msg.error   { color: #f87171; }

  @media (max-width: 768px) {
    .contact-links { grid-template-columns: 1fr; }
    .form-row { grid-template-columns: 1fr; }
  }
</style>

<script>
  const form = document.getElementById('contactForm') as HTMLFormElement;
  const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;
  const formMsg = document.getElementById('formMsg') as HTMLDivElement;

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    formMsg.className = 'form-msg';
    formMsg.textContent = '';

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new FormData(form),
      });
      const data = await res.json();

      if (data.success) {
        formMsg.className = 'form-msg success';
        formMsg.textContent = '✓ Message sent! I'll get back to you soon.';
        form.reset();
      } else {
        throw new Error(data.message ?? 'Unknown error');
      }
    } catch (err) {
      formMsg.className = 'form-msg error';
      formMsg.textContent = '✗ Something went wrong. Please email me directly.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Message`;
    }
  });
</script>
```

- [ ] **Step 3: Add Contact + Footer to `src/pages/index.astro`**

Final version of `src/pages/index.astro`:

```astro
---
import '../styles/global.css';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
import About from '../components/About.astro';
import Skills from '../components/Skills.astro';
import Books from '../components/Books.astro';
import Contact from '../components/Contact.astro';
---

<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gurinder Singh Ghuman | Portfolio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;0,800;1,700&display=swap" rel="stylesheet" />
</head>
<body>
  <Nav />
  <main>
    <Hero />
    <About />
    <Skills />
    <Books />
    <Contact />
  </main>
  <footer>
    <p>Designed &amp; built by <span class="footer-name">Gurinder Singh Ghuman</span> · Berlin, Germany</p>
    <p>Data &amp; Automation · Operations Analytics · Full-Stack Tooling</p>
  </footer>
</body>
</html>

<style>
  footer {
    background: var(--bg-primary);
    border-top: 1px solid var(--border);
    padding: 2rem 1.5rem;
    text-align: center;
  }

  .footer-name {
    background: var(--gradient-text);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 700;
  }

  footer p {
    font-size: 0.83rem;
    color: var(--text-muted);
    line-height: 1.8;
  }
</style>
```

- [ ] **Step 4: Verify full page in browser**

Open `http://localhost:4321`. Walk through every section: Hero → About → Skills → Books → Contact. Check:
- Theme toggle persists on refresh
- Mobile hamburger opens/closes
- Proficiency bars animate on scroll
- PDF reader loads the book
- Contact form shows success message on submit

- [ ] **Step 5: Commit**

```bash
git add src/components/Contact.astro src/pages/index.astro
git commit -m "feat: add Contact section with Web3Forms and complete page layout"
```

---

## Task 12: Production Build + Cloudflare Pages

**Files:**
- Modify: none (configuration via Cloudflare dashboard)

- [ ] **Step 1: Run a production build locally**

```bash
npm run build
```

Expected: `dist/` directory created with no errors.

- [ ] **Step 2: Preview the production build**

```bash
npm run preview
```

Open `http://localhost:4321`. Verify the production build looks identical to dev.

- [ ] **Step 3: Set environment variables in Cloudflare Pages dashboard**

Go to your Cloudflare Pages project → Settings → Environment variables → Add:

| Variable name | Value |
|---|---|
| `PUBLIC_SANITY_PROJECT_ID` | your Sanity project ID |
| `PUBLIC_SANITY_DATASET` | `production` |

- [ ] **Step 4: Update Cloudflare Pages build settings**

In the Cloudflare Pages dashboard → Settings → Builds & deployments:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js version | `20` |

- [ ] **Step 5: Push to GitHub to trigger deploy**

```bash
git push origin main
```

Expected: Cloudflare Pages picks up the push, runs `npm run build`, and deploys the site.

- [ ] **Step 6: Verify the live site**

Open your Cloudflare Pages URL. Check all sections including the PDF reader.

- [ ] **Step 7: Commit .env.example for future reference**

```bash
cat > .env.example << 'EOF'
PUBLIC_SANITY_PROJECT_ID=your_project_id_here
PUBLIC_SANITY_DATASET=production
EOF
git add .env.example
git commit -m "chore: add .env.example for environment variable reference"
```

---

## Task 13: Sanity Webhook for Auto-Redeploy

- [ ] **Step 1: Get the Cloudflare Pages deploy hook URL**

In Cloudflare Pages → Settings → Builds & deployments → Deploy hooks → Create a new hook named "Sanity book update". Copy the URL.

- [ ] **Step 2: Add the webhook in Sanity**

Go to https://www.sanity.io/manage → your project → API → Webhooks → Create webhook:

| Field | Value |
|---|---|
| Name | Cloudflare Pages redeploy |
| URL | (the Cloudflare deploy hook URL from step 1) |
| Dataset | production |
| Trigger on | Create, Update, Delete |
| Filter | `_type == "book"` |
| HTTP method | POST |

- [ ] **Step 3: Test the webhook**

In Sanity Studio, update the book description and save. Go to Cloudflare Pages → Deployments. Expected: a new deployment starts within a few seconds.

- [ ] **Step 4: Verify the live site updated**

After the deploy finishes (~60s), open the live site and confirm the updated book description appears.

- [ ] **Step 5: Commit final notes**

```bash
git commit --allow-empty -m "chore: Sanity webhook configured for auto-redeploy on book update"
```

---

## Manual Verification Checklist

Run this before considering the migration complete:

- [ ] Book renders correctly in the inline PDF reader
- [ ] PDF page navigation (prev/next) works
- [ ] Download PDF button downloads the file
- [ ] Dark/light theme toggle works and persists on page refresh
- [ ] Mobile hamburger menu opens and closes (test at < 768px width)
- [ ] Proficiency bars animate when scrolled into view
- [ ] All nav links scroll to the correct section
- [ ] Contact form submits and shows "✓ Message sent!" feedback
- [ ] Profile photo loads correctly
- [ ] Updating book in Sanity Studio triggers a Cloudflare Pages redeploy
- [ ] New book content is live after redeploy
