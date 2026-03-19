export type ProjectAtmosphere = 'kinetic' | 'fluid' | 'vector';

export interface ProjectData {
  slug: string;
  title: string;
  description: string;
  atmosphere: ProjectAtmosphere;
  techStack: string[];
  /** Z position along the camera rail */
  z: number;
  /** X/Y offset from center */
  x: number;
  y: number;
}

/**
 * Stub project data — 2 per atmosphere, positioned along
 * the camera rail in their respective Z ranges.
 *
 * Kinetic:  Z 5 to -25
 * Fluid:    Z -30 to -60
 * Vector:   Z -70 to -95
 */
export const projects: ProjectData[] = [
  // --- Kinetic (Overlook Audio) ---
  {
    slug: 'spatial-mixer',
    title: 'Spatial Mixer',
    description: 'Dolby Atmos spatial audio mixing suite with real-time binaural monitoring.',
    atmosphere: 'kinetic',
    techStack: ['Web Audio API', 'WASM', 'React'],
    z: 0,
    x: -3,
    y: 1.5,
  },
  {
    slug: 'stem-engine',
    title: 'Stem Engine',
    description: 'AI-powered stem separation and remix tool for live performance.',
    atmosphere: 'kinetic',
    techStack: ['PyTorch', 'FFmpeg', 'Next.js'],
    z: -15,
    x: 4,
    y: -1,
  },

  // --- Fluid (Pacific) ---
  {
    slug: 'tidal-forecast',
    title: 'Tidal Forecast',
    description: 'ML-driven swell and tide prediction platform for the Channel Islands.',
    atmosphere: 'fluid',
    techStack: ['TensorFlow', 'MapboxGL', 'D3'],
    z: -35,
    x: -4,
    y: 2,
  },
  {
    slug: 'reef-survey',
    title: 'Reef Survey',
    description: 'Underwater photogrammetry pipeline mapping kelp forest health.',
    atmosphere: 'fluid',
    techStack: ['OpenCV', 'Three.js', 'Postgres'],
    z: -52,
    x: 3,
    y: -1.5,
  },

  // --- Vector (Overlook Strategy) ---
  {
    slug: 'fleet-ops',
    title: 'Fleet Ops',
    description: 'Real-time fleet tracking and dispatch optimization for Part 135 operators.',
    atmosphere: 'vector',
    techStack: ['Next.js', 'Redis', 'Mapbox'],
    z: -75,
    x: -3.5,
    y: 1,
  },
  {
    slug: 'wx-brief',
    title: 'WX Brief',
    description: 'Automated preflight weather briefing system with SIGMET overlay.',
    atmosphere: 'vector',
    techStack: ['Python', 'GOES API', 'React'],
    z: -90,
    x: 4,
    y: -0.5,
  },
];
