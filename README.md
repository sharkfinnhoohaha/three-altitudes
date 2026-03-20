# The Three Altitudes — Finn Bennett Cinematic Portfolio

A scroll-driven 3D portfolio built on Next.js 16, React Three Fiber, and GSAP. The site is a single-take journey through three atmospheres:

- **Kinetic** (0%–33%) — Music / Overlook Audio. Dark, high-energy, bloom + chromatic aberration.
- **Fluid** (33%–66%) — Surfing / Pacific. Underwater displacement shader, buoyancy physics.
- **Vector** (66%–100%) — Aviation / Overlook Strategy. Wireframe HUD, horizon grid, precision white.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and scroll.

## Architecture

```
src/
├── app/
│   ├── layout.tsx          # Root layout + ScrollProvider
│   └── page.tsx            # Home — composes Canvas + HTML layers
├── components/
│   ├── atmosphere/
│   │   ├── KineticAtmosphere.tsx   # InstancedMesh sound shards, sin-wave oscillation
│   │   ├── FluidAtmosphere.tsx     # InstancedMesh organic particles, buoyancy lerp
│   │   └── VectorAtmosphere.tsx    # Wireframe grid + system module blocks
│   ├── canvas/
│   │   ├── MainCanvas.tsx          # Fixed R3F Canvas, EffectComposer, lighting
│   │   └── SceneManager.tsx        # Camera rail, background lerp, fog, uniform updates
│   ├── transitions/
│   │   └── TransitionPass.tsx      # postprocessing Effect: displacement + chromatic aberration
│   └── ui/
│       ├── HUD.tsx                 # Atmosphere label, progress bar, altitude readout
│       └── ScrollSections.tsx      # 600vh scroll spacer with section titles
├── contexts/
│   └── ScrollContext.tsx           # Lenis + GSAP ScrollTrigger wiring, global scroll state
├── hooks/
│   └── useProgress.ts             # Per-frame scroll state for R3F (no React re-renders)
├── shaders/
│   ├── TransitionShader.ts         # ShaderMaterial version (alternative to postprocessing)
│   ├── simplex3d.glsl              # Standalone simplex noise
│   └── glsl.d.ts                   # TypeScript declarations for .glsl imports
└── styles/
    └── globals.css                 # Tailwind + CSS custom properties + Lenis overrides
```

## The Scroll Engine

1. **Lenis** provides smooth, inertial scrolling.
2. Lenis fires `ScrollTrigger.update()` on every scroll tick.
3. `ScrollContext` exposes `progress` (0–1), `velocity`, and `atmosphere` to React.
4. `SceneManager` reads scroll directly in `useFrame` (no React overhead) and drives:
   - Camera Z position (10 → -100)
   - Background color lerp (black → teal → white)
   - Fog near/far
   - TransitionPass uniforms (`uProgress`, `uVelocity`)

## The Transition Shader

A single `postprocessing` Effect handles all three atmosphere visual treatments:

- **Kinetic zone**: Velocity-driven chromatic aberration (RGB channel offset)
- **Submerge (at 0.33)**: Simplex noise screen-space displacement (Gaussian bell curve envelope)
- **Vector zone**: Clean pass — all distortion lerps to zero

## TinaCMS

The schema template is at `tina/config.ts.template`. To activate:

```bash
npm install tinacms
mv tina/config.ts.template tina/config.ts
```

Then set `NEXT_PUBLIC_TINA_CLIENT_ID` and `TINA_TOKEN` in `.env.local`.

## What's Built (Phases 1–3)

- [x] Next.js 16 + App Router scaffold
- [x] Lenis smooth scroll ↔ GSAP ScrollTrigger integration
- [x] Fixed R3F Canvas with PerspectiveCamera
- [x] SceneManager: camera rail, background lerp, fog
- [x] Kinetic Atmosphere: 40 instanced sound shards, sin-wave oscillation
- [x] Fluid Atmosphere: 60 instanced organic particles, buoyancy drift
- [x] Vector Atmosphere: 20×20 wireframe horizon grid (mouse-driven tilt) + 8 system modules
- [x] TransitionPass: simplex displacement + chromatic aberration + clean pass
- [x] Bloom post-processing
- [x] HUD overlay with atmosphere label + progress indicator
- [x] TinaCMS schema template (Project collection)

## Next Steps (Phases 4–5)

- [ ] **ProjectArtifact component** — mesh morph (Jagged → Organic → Wireframe) based on `uProgress`
- [ ] **Click-to-explode** — GSAP camera zoom through artifact into case study route
- [ ] **TinaCMS integration** — wire project data into atmosphere layers
- [ ] **Performance gate** — `three-perf` + mobile fallback (reduce post-processing, lower instance counts)
- [ ] **HDR environments** — drop in textures for Kinetic (smoke/particle) and Fluid (underwater caustics)
- [ ] **Vercel deployment** — `vercel.json` with ISR for TinaCMS content

## Performance Notes

- All atmosphere objects use `InstancedMesh` (single draw call per atmosphere)
- Scroll state in R3F reads `window.scrollY` directly in `useFrame` — zero React re-renders
- Post-processing is a single `EffectComposer` pipeline (no swapping mid-scroll)
- Targets 120fps on M1 Max, 60fps fallback for lower-end devices
