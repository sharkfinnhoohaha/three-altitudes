'use client';

import dynamic from 'next/dynamic';

const MainCanvas = dynamic(
  () => import('@/components/canvas/MainCanvas').then((mod) => mod.MainCanvas),
  { ssr: false }
);

export function MainCanvasClient() {
  return <MainCanvas />;
}
