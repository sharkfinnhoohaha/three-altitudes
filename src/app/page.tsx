import { HUD } from '@/components/ui/HUD';
import { ScrollSections } from '@/components/ui/ScrollSections';
import { GhostingCode } from '@/components/ui/GhostingCode';
import { MediaLayers } from '@/components/ui/MediaLayers';
import { HeroVideo } from '@/components/ui/HeroVideo';
import { SectionFlash } from '@/components/ui/SectionFlash';
import { MainCanvasClient } from '@/components/canvas/MainCanvasClient';
import {
  getWebProjects,
  getDevProjects,
  getHero,
  getAudioWork,
  getAviation,
  getSiteSettings,
} from '@/lib/sanity/queries';

export default async function HomePage() {
  const [webProjects, devProjects, hero, audioWork, aviation, siteSettings] = await Promise.all([
    getWebProjects(),
    getDevProjects(),
    getHero(),
    getAudioWork(),
    getAviation(),
    getSiteSettings(),
  ]);

  return (
    <>
      <MainCanvasClient />
      <MediaLayers engineRoomVideoUrl={siteSettings?.engineRoomVideoUrl} />
      <HeroVideo src={siteSettings?.heroVideoUrl} />
      <GhostingCode />
      <HUD />
      <SectionFlash />
      <ScrollSections
        hero={hero}
        audioWork={audioWork}
        aviation={aviation}
        webProjects={webProjects}
        devProjects={devProjects}
      />
    </>
  );
}
