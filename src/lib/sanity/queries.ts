import { isSanityConfigured } from './client';
import { sanityFetch } from './live';
import type {
  SanityWebProject,
  SanityDevProject,
  SanityHero,
  SanityAudioWork,
  SanityAviation,
  SanitySettings,
} from './types';

// ─── Web Projects ────────────────────────────────────────────────────────────

const webProjectsQuery = `
  *[_type == "webProject"] | order(order asc) {
    "_id": _id,
    name,
    domain,
    url,
    "desc": coalesce(description, ""),
    "tech": coalesce(tech, []),
    "role": coalesce(role, ""),
    "type": coalesce(projectType, ""),
    "screenshotUrl": screenshot.asset->url,
  }
`;

export async function getWebProjects(): Promise<SanityWebProject[]> {
  if (!isSanityConfigured) return [];
  try {
    const { data } = await sanityFetch({ query: webProjectsQuery, tags: ['webProject'] });
    return (data as SanityWebProject[]) ?? [];
  } catch {
    return [];
  }
}

// ─── Dev Projects ─────────────────────────────────────────────────────────────

const devProjectsQuery = `
  *[_type == "devProject"] | order(order asc) {
    "_id": _id,
    "num": coalesce(num, ""),
    name,
    "desc": coalesce(description, ""),
    "tech": coalesce(tech, []),
    "role": coalesce(role, ""),
    "status": coalesce(status, ""),
  }
`;

export async function getDevProjects(): Promise<SanityDevProject[]> {
  if (!isSanityConfigured) return [];
  try {
    const { data } = await sanityFetch({ query: devProjectsQuery, tags: ['devProject'] });
    return (data as SanityDevProject[]) ?? [];
  } catch {
    return [];
  }
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

const heroQuery = `
  *[_type == "hero" && _id == "hero"][0] {
    name,
    "identities": coalesce(identities, []),
    "locationLabel": coalesce(locationLabel, ""),
    "coordinates": coalesce(coordinates, ""),
    "primaryPhotoUrl": primaryPhoto.asset->url,
    "accentPhotoUrl": accentPhoto.asset->url,
  }
`;

export async function getHero(): Promise<SanityHero | null> {
  if (!isSanityConfigured) return null;
  try {
    const { data } = await sanityFetch({ query: heroQuery, tags: ['hero'] });
    return (data as SanityHero | null) ?? null;
  } catch {
    return null;
  }
}

// ─── Audio Work ───────────────────────────────────────────────────────────────

const audioWorkQuery = `
  *[_type == "audioWork" && _id == "audioWork"][0] {
    headline,
    sectionTitle,
    spotifyPlaylistId,
    "stats": coalesce(stats, []),
    "touringCredits": coalesce(touringCredits, []),
    "disciplines": coalesce(disciplines[] {
      code,
      "description": description,
    }, []),
    "tracks": coalesce(tracks[] {
      trackName,
      artistName,
      albumName,
      "albumArtUrl": albumArt.asset->url,
      spotifyUrl,
      role,
    }, []),
  }
`;

export async function getAudioWork(): Promise<SanityAudioWork | null> {
  if (!isSanityConfigured) return null;
  try {
    const { data } = await sanityFetch({ query: audioWorkQuery, tags: ['audioWork'] });
    return (data as SanityAudioWork | null) ?? null;
  } catch {
    return null;
  }
}

// ─── Aviation ─────────────────────────────────────────────────────────────────

const aviationQuery = `
  *[_type == "aviation" && _id == "aviation"][0] {
    callsign,
    certLabel,
    coordinates,
    tagline,
    "gauges": coalesce(gauges, []),
    "beaconLinks": coalesce(beaconLinks, []),
    "primaryPhotoUrl": primaryPhoto.asset->url,
    "accentPhotoUrl": accentPhoto.asset->url,
  }
`;

export async function getAviation(): Promise<SanityAviation | null> {
  if (!isSanityConfigured) return null;
  try {
    const { data } = await sanityFetch({ query: aviationQuery, tags: ['aviation'] });
    return (data as SanityAviation | null) ?? null;
  } catch {
    return null;
  }
}

// ─── Site Settings ────────────────────────────────────────────────────────────

const siteSettingsQuery = `
  *[_type == "siteSettings"][0] {
    siteName,
    email,
    "heroVideoUrl": heroVideo.asset->url,
    "engineRoomVideoUrl": engineRoomVideo.asset->url,
  }
`;

export async function getSiteSettings(): Promise<SanitySettings | null> {
  if (!isSanityConfigured) return null;
  try {
    const { data } = await sanityFetch({ query: siteSettingsQuery, tags: ['siteSettings'] });
    return (data as SanitySettings | null) ?? null;
  } catch {
    return null;
  }
}
