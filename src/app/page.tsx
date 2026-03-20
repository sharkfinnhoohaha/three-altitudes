import dynamic from 'next/dynamic';
import { HUD } from '@/components/ui/HUD';
import { ScrollSections } from '@/components/ui/ScrollSections';
import { GhostingCode } from '@/components/ui/GhostingCode';
import { MediaLayers } from '@/components/ui/MediaLayers';
import {
  getWebProjects,
  getDevProjects,
  getHero,
  getAudioWork,
  getAviation,
} from '@/lib/sanity/queries';

const MainCanvas = dynamic(
  () => import('@/components/canvas/MainCanvas').then((mod) => mod.MainCanvas),
  { ssr: false }
);

export default async function HomePage() {
  const [webProjects, devProjects, hero, audioWork, aviation] = await Promise.all([
    getWebProjects(),
    getDevProjects(),
    getHero(),
    getAudioWork(),
    getAviation(),
  ]);

  return (
    <>
      <MainCanvas />
      <MediaLayers />
      <GhostingCode />
      <HUD />
      <ScrollSections
        sanityWebProjects={webProjects.length > 0 ? webProjects : undefined}
        sanityDevProjects={devProjects.length > 0 ? devProjects : undefined}
        sanityHero={hero ?? undefined}
        sanityAudioWork={audioWork ?? undefined}
        sanityAviation={aviation ?? undefined}
      />
    </>
  );
}
