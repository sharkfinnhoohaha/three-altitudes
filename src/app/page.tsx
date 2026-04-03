import { HUD } from '@/components/ui/HUD';
import { ScrollSections } from '@/components/ui/ScrollSections';
import { GhostingCode } from '@/components/ui/GhostingCode';
import { MediaLayers } from '@/components/ui/MediaLayers';
import { MainCanvasClient } from '@/components/canvas/MainCanvasClient';
import type { SanityMediaItem } from '@/lib/sanity/types';
import {
  getWebProjects,
  getDevProjects,
  getHero,
  getAudioWork,
  getAviation,
  getSiteSettings,
} from '@/lib/sanity/queries';

function toPhotoArray(
  primary?: SanityMediaItem | null,
  accent?: SanityMediaItem | null,
): [SanityMediaItem | undefined, SanityMediaItem | undefined] {
  return [primary ?? undefined, accent ?? undefined];
}

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
      <MediaLayers
        photos={toPhotoArray(audioWork?.primaryPhoto, audioWork?.accentPhoto)}
        shorelinePhotos={toPhotoArray(hero?.primaryPhoto, hero?.accentPhoto)}
        aviationPhotos={toPhotoArray(aviation?.primaryPhoto, aviation?.accentPhoto)}
        engineRoomVideoUrl={siteSettings?.engineRoomVideo?.url}
      />
      <GhostingCode />
      <HUD />
      <ScrollSections
        hero={hero}
        audioWork={audioWork}
        webProjects={webProjects}
        devProjects={devProjects}
        aviation={aviation}
      />
    </>
  );
}
