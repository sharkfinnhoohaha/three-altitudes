'use client';

import dynamic from 'next/dynamic';
import { HUD } from '@/components/ui/HUD';
import { ScrollSections } from '@/components/ui/ScrollSections';
import { GhostingCode } from '@/components/ui/GhostingCode';
import { MediaLayers } from '@/components/ui/MediaLayers';

// Dynamic import keeps Three.js out of the SSR bundle
const MainCanvas = dynamic(
  () => import('@/components/canvas/MainCanvas').then((mod) => mod.MainCanvas),
  { ssr: false }
);

export default function HomePage() {
  return (
    <>
      {/* Fixed 3D canvas — the cinematic background layer (z-index: 0) */}
      <MainCanvas />

      {/* Fixed photo/video atmospheric layers (z-index: 1–8) */}
      <MediaLayers />

      {/* Stage 3 ghosting code — faint TypeScript/Three.js fragments (z-index: 2) */}
      <GhostingCode />

      {/* Persistent HUD — coordinates, progress rail, stage labels (z-index: 10) */}
      <HUD />

      {/* Scrollable HTML content — 4 × 200vh sections */}
      <ScrollSections />
    </>
  );
}
