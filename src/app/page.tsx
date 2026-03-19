'use client';

import dynamic from 'next/dynamic';
import { HUD } from '@/components/ui/HUD';
import { ScrollSections } from '@/components/ui/ScrollSections';
import { GhostingCode } from '@/components/ui/GhostingCode';
import { MediaLayers } from '@/components/ui/MediaLayers';

const MainCanvas = dynamic(
  () => import('@/components/canvas/MainCanvas').then((mod) => mod.MainCanvas),
  { ssr: false }
);

export default function HomePage() {
  return (
    <>
      <MainCanvas />
      <MediaLayers />
      <GhostingCode />
      <HUD />
      <ScrollSections />
    </>
  );
}
