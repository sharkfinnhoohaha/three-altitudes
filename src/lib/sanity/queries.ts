import { isSanityConfigured } from './client';
import { sanityFetch } from './live';
import type {
  SanityWebProject,
  SanityDevProject,
  SanityHero,
  SanityAudioWork,
  SanityAviation,
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
    "url": coalesce(url, ""),
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
    "stats": coalesce(stats[] {
      value,
      label,
      "sub": coalesce(sub, ""),
    }, []),
    "touringCredits": coalesce(touringCredits[] {
      artistName,
      role,
      "context": coalesce(context, ""),
    }, []),
    "disciplines": coalesce(disciplines[] {
      code,
      "description": description,
    }, []),
    "specialties": coalesce(specialties, []),
    "photos": coalesce(photos[] {
      "_key": _key,
      "_type": _type,
      "url": asset->url,
      "mimeType": asset->mimeType,
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
