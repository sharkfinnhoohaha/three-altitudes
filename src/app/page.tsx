import { HUD } from '@/components/ui/HUD';
import { ScrollSections } from '@/components/ui/ScrollSections';
import { GhostingCode } from '@/components/ui/GhostingCode';
import { MediaLayers } from '@/components/ui/MediaLayers';
import { MainCanvasClient } from '@/components/canvas/MainCanvasClient';
import {
  getWebProjects,
  getDevProjects,
  getHero,
  getAudioWork,
  getAviation,
} from '@/lib/sanity/queries';

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
      <MainCanvasClient />
      <MediaLayers />
      <GhostingCode />
      <HUD />
      <ScrollSections />
    </>
  );
}
