# Uma Senthil — Portfolio

Portfolio of **Uma Senthil**, Senior Embedded Firmware & Systems Software Engineer (STM32 firmware · telemetry · hardware bring-up · test automation).

An immersive 3D portfolio. Scrolling flies the camera through a dark, misty world, one room per section:

| Room | What happens |
| --- | --- |
| **Smoke chamber** (hero) | Particles spell *ENGINEER*, flow into *SENTHIL*, and Uma's portrait condenses out of real-time shader smoke |
| **Portal** | About: summary, ways of working, and headline numbers |
| **Monolith gallery** | Three featured builds, each with a live animated screen: FASTER (BLE Mesh SOS), Private AI Assistant (RAG), Levven Controls (smart home) |
| **Constellation** | Skills as a 3D network; hover a category to light it up |
| **Towers of light** | Career numbers and highlights, plus education |
| **Corridor of time** | One lit doorway per role, 2011 → 2026 |
| **Product orbit** | Eight products built across the career |
| **Horizon** | Contact: email, LinkedIn, GitHub and a downloadable résumé |

## Run locally

```bash
npm install
npm run dev
```

Open the URL it prints (usually http://localhost:5173).

## Build & deploy

```bash
npm run build
```

Deploy the `dist/` folder to any static host: Vercel, Netlify, GitHub Pages or Cloudflare Pages. The build uses relative paths, so it also works from a sub-folder.

## Editing content

| What | Where |
| --- | --- |
| All text: profile, about, projects, skills, numbers, journey, products, education | `src/content.js` |
| Hero portrait (transparent background, ~880×941) | `src/assets/uma.webp` |
| Small avatar in the About panel | `src/assets/uma-avatar.webp` |
| Résumé PDF behind the Résumé button | `public/Uma_Senthil_Resume.pdf` |
| The two hero words | `WORD_A` / `WORD_B` in `src/world/Hero.jsx` |
| Accent colour | `--accent` in `src/styles.css` |

The public résumé PDF leaves out the References section on purpose.

## Tech

React 18 + Vite · Three.js via React Three Fiber and drei · custom GLSL shaders · @react-three/postprocessing (bloom, grain, vignette, SMAA) · Lenis smooth scroll · self-hosted fonts (Inter Tight, Instrument Serif, JetBrains Mono).

## Performance

This is a WebGL-heavy site. Phones get fewer particles and a simpler layout automatically. Visitors with "reduce motion" turned on get a faster intro. If a device struggles, lower `dpr` in `src/App.jsx` or the particle counts in `src/world/Hero.jsx`.
