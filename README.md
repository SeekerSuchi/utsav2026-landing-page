# Utsav 2026 — Landing Page

The official landing page for **Utsav 2026**

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — fast dev server & builds
- **Tailwind CSS** — utility-first styling
- **GSAP** + ScrollTrigger — scroll-driven animations & section pinning
- **Framer Motion** — component enter/hover animations
- **OGL** — WebGL animated background (DarkVeil)

## Sections

| # | Section | Description |
|---|---------|-------------|
| 1 | **Logo** | Animated SVG logo reveal on load |
| 2 | **Hero** | Full-screen video background with scroll-to-fade |
| 3 | **Countdown** | Days-left counter with parallax wallpaper |
| 4 | **Theme & About** | Glassmorphic cards for fest theme & college info |
| 5 | **Gallery** | 3D circular image gallery |
| 6 | **Sponsors** | Infinite horizontal logo loop |
| 7 | **Patrons** | Committees & core team in glass cards |
| 8 | **Contact** | Social links & address |
| 9 | **Footer** | Copyright & branding |

A fixed **DarkVeil** WebGL backdrop sits behind all sections and stays in place as content scrolls over it.

## Getting Started

```bash
git clone https://github.com/Dhruvkoshta/utsav2026-landing-page.git
cd utsav2026-landing-page
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Building for Production

```bash
npm run build
```

Output goes to `dist/`.

