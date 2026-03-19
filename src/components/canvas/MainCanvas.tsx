'use client';

import { useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { SceneManager } from './SceneManager';
import { TransitionPass } from '../transitions/TransitionPass';
import { ShorelineAtmosphere } from '../atmosphere/KineticAtmosphere';
import { PocketAtmosphere } from '../atmosphere/FluidAtmosphere';
import { EngineRoomAtmosphere, HorizonAtmosphere } from '../atmosphere/VectorAtmosphere';

export function MainCanvas() {
  const transitionRef = useRef<any>(null);

  return (
    <div className="canvas-container">
      <Canvas
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        dpr={[1, 2]}
        flat={false}
      >
        <PerspectiveCamera makeDefault fov={60} near={0.1} far={300} position={[0, 0, 10]} />

        {/* Scene orchestrator — camera rail, background color lerp, fog, shader uniforms */}
        <SceneManager transitionRef={transitionRef} />

        {/* ── Lighting ──────────────────────────────────────────────────────── */}
        {/* Neutral ambient */}
        <ambientLight intensity={0.25} />
        {/* Main fill — cool white */}
        <directionalLight position={[4, 8, 6]} intensity={0.7} color="#e8f0f0" />
        {/* Shoreline accent — Ventura teal rim light */}
        <pointLight position={[-6, 4, 2]} intensity={0.6} color="#3dd9c4" />
        {/* Pocket accent — amber vacuum-tube warmth, deeper in scene */}
        <pointLight position={[3, -2, -40]} intensity={0.55} color="#ff8c00" />
        {/* Engine room — cool blue-grey, far back */}
        <pointLight position={[0, 5, -75]} intensity={0.35} color="#8899aa" />

        {/* ── Atmosphere Layers ─────────────────────────────────────────────── */}
        <Suspense fallback={null}>
          {/* Stage 1: The Shoreline — ocean swell, Ventura teal */}
          <ShorelineAtmosphere />
          {/* Stage 2: The Pocket — amber filament, rhythmic beat */}
          <PocketAtmosphere />
          {/* Stage 3: The Engine Room — grey wireframe modules */}
          <EngineRoomAtmosphere />
          {/* Stage 4: The Horizon — single tilting horizon line */}
          <HorizonAtmosphere />
        </Suspense>

        {/* ── Post-Processing ───────────────────────────────────────────────── */}
        <EffectComposer>
          <TransitionPass ref={transitionRef} />
          <Bloom
            intensity={0.6}
            luminanceThreshold={0.55}
            luminanceSmoothing={0.85}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
