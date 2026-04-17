// These types mirror the existing hardcoded data shapes so ScrollSections
// can accept either Sanity data or the fallback arrays without changes.

export interface SanityWebProject {
  _id: string;
  name: string;
  domain: string;
  url: string;
  desc: string;
  tech: string[];
  role: string;
  type: string;
  screenshotUrl?: string | null;
}

export interface SanityDevProject {
  _id: string;
  num: string;
  name: string;
  desc: string;
  tech: string[];
  role: string;
  status: string;
  url?: string;
}

export interface SanityHero {
  name: string;
  identities: string[];
  locationLabel: string;
  coordinates: string;
}

export interface SanityAudioStat {
  value: string;
  label: string;
}

export interface SanityTouringCredit {
  artistName: string;
  role: string;
}

export interface SanityDiscipline {
  code: string;
  description: string;
}

export interface SanityTrack {
  trackName: string;
  artistName: string;
  albumName: string;
  albumArtUrl?: string;
  spotifyUrl?: string;
  role?: string;
}

export interface SanityAudioWork {
  headline: string;
  sectionTitle: string;
  spotifyPlaylistId: string;
  stats: SanityAudioStat[];
  touringCredits: SanityTouringCredit[];
  disciplines: SanityDiscipline[];
  tracks: SanityTrack[];
}

export interface SanityGauge {
  label: string;
  value: string;
}

export interface SanityBeaconLink {
  label: string;
  href: string;
  sub: string;
}

export interface SanityAviation {
  callsign: string;
  certLabel: string;
  coordinates: string;
  tagline: string;
  gauges: SanityGauge[];
  beaconLinks: SanityBeaconLink[];
}

export interface SanitySettings {
  siteName: string;
  email: string;
  heroVideoUrl?: string;
}
