import { client, isSanityConfigured } from './client';
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
  if (!client || !isSanityConfigured) return [];
  try {
    return await client.fetch<SanityWebProject[]>(webProjectsQuery, {}, {
      next: { tags: ['webProject'] },
    });
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
  if (!client || !isSanityConfigured) return [];
  try {
    return await client.fetch<SanityDevProject[]>(devProjectsQuery, {}, {
      next: { tags: ['devProject'] },
    });
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
  if (!client || !isSanityConfigured) return null;
  try {
    return await client.fetch<SanityHero | null>(heroQuery, {}, {
      next: { tags: ['hero'] },
    });
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
  }
`;

export async function getAudioWork(): Promise<SanityAudioWork | null> {
  if (!client || !isSanityConfigured) return null;
  try {
    return await client.fetch<SanityAudioWork | null>(audioWorkQuery, {}, {
      next: { tags: ['audioWork'] },
    });
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
  if (!client || !isSanityConfigured) return null;
  try {
    return await client.fetch<SanityAviation | null>(aviationQuery, {}, {
      next: { tags: ['aviation'] },
    });
  } catch {
    return null;
  }
}
