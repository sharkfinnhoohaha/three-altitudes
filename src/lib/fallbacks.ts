import type { SanityDevProject, SanityWebProject } from '@/lib/sanity/types';

export const FALLBACK_IDENTITIES = ['PILOT', 'PRODUCER', 'DEVELOPER'];

export const FALLBACK_PROJECTS: SanityDevProject[] = [
  {
    _id: 'spatial-mixer',
    num: '01',
    name: 'Spatial Mixer',
    desc: 'Browser-based spatial audio mixing environment',
    tech: ['Web Audio API', 'WASM', 'React'],
    role: 'SOLO BUILD',
    status: 'DEPLOYED',
    url: 'https://overlookstrategy.com',
  },
  {
    _id: 'stem-engine',
    num: '02',
    name: 'Stem Engine',
    desc: 'AI-powered stem separation and mastering pipeline',
    tech: ['PyTorch', 'FFmpeg', 'Next.js'],
    role: 'FULL STACK',
    status: 'DEPLOYED',
    url: 'https://overlookstrategy.com',
  },
  {
    _id: 'fleet-ops',
    num: '03',
    name: 'Fleet Ops',
    desc: 'Real-time aviation fleet operations dashboard',
    tech: ['Next.js', 'Redis', 'Mapbox'],
    role: 'LEAD DEV',
    status: 'LIVE',
    url: 'https://johnson-aviation.vercel.app',
  },
  {
    _id: 'wx-brief',
    num: '04',
    name: 'WX Brief',
    desc: 'GOES satellite weather briefing for pilots',
    tech: ['Python', 'GOES API', 'React'],
    role: 'FULL STACK',
    status: 'LIVE',
    url: 'https://johnson-aviation.vercel.app',
  },
  {
    _id: 'tidal-forecast',
    num: '05',
    name: 'Tidal Forecast',
    desc: 'ML-driven coastal tidal pattern visualization',
    tech: ['TensorFlow', 'MapboxGL', 'D3'],
    role: 'SOLO BUILD',
    status: 'BETA',
    url: 'https://overlookaudio.com',
  },
  {
    _id: 'overlook-strategy',
    num: '06',
    name: 'Overlook Strategy',
    desc: 'Brand identity and digital systems agency site',
    tech: ['Next.js', 'Three.js', 'GSAP'],
    role: 'DESIGN + DEV',
    status: 'LIVE',
    url: 'https://overlookstrategy.com',
  },
];

export const FALLBACK_WEB_PROJECTS: SanityWebProject[] = [
  {
    _id: 'johnson-aviation',
    name: 'Johnson Aviation Consulting',
    domain: 'johnson-aviation.vercel.app',
    url: 'https://johnson-aviation.vercel.app',
    desc: 'Strategic airport planning firm — land use, facilities & financial advisory',
    tech: ['Next.js', 'Three.js', 'GSAP', 'Tailwind'],
    role: 'DESIGN + DEV',
    type: 'AGENCY SITE',
  },
  {
    _id: 'overlook-audio',
    name: 'Overlook Audio',
    domain: 'overlookaudio.com',
    url: 'https://overlookaudio.com',
    desc: 'Recording studio & live sound production — Ventura, CA',
    tech: ['Next.js', 'Framer Motion', 'Tailwind'],
    role: 'DESIGN + DEV',
    type: 'STUDIO SITE',
  },
  {
    _id: 'overlook-strategy',
    name: 'Overlook Strategy',
    domain: 'overlookstrategy.com',
    url: 'https://overlookstrategy.com',
    desc: 'Brand identity & digital systems agency',
    tech: ['Next.js', 'Three.js', 'GSAP'],
    role: 'DESIGN + DEV',
    type: 'AGENCY SITE',
  },
];

export const DATA_COLUMNS = [
  '01001101\n11010010\n00110101\n10100110\n01101001',
  'const x =\n  await fetch\n  ("/api")\nreturn res\n  .json()',
  'FF A3 2D\n00 1B 4E\n7C 9A FF\nE2 00 3D\n12 BC 44',
  'init()\ncompile\nlink()\nbundle\ndeploy()',
  '0xDEAD\n0xBEEF\n0xCAFE\n0xFACE\n0x1337',
  'GET /api\n200 OK\n{"ok":1}\nContent\nLength:0',
  '▓▒░▓▒░\n░▓▒░▓▒\n▒░▓▒░▓\n▓▒░▓▒░\n░▓▒░▓▒',
  'npm run\nbuild &&\ndeploy -e\nprod --no\n-cache',
  '10110011\n01101100\n11001011\n00110110\n10011001',
  'SELECT *\nFROM sys\nWHERE id\nIN (1,2)\nLIMIT 8',
];

export const WAVEFORM_BARS = Array.from({ length: 120 }, (_, i) => {
  const t = i / 119;
  const envelope = Math.sin(t * Math.PI) * 0.85 + 0.15;
  const w1 = Math.sin(i * 0.63);
  const w2 = Math.sin(i * 1.78 + 1.2);
  const w3 = Math.sin(i * 4.1 + 0.5);
  const w4 = Math.sin(i * 9.3 + 2.1);
  const raw = Math.abs(w1 * 0.4 + w2 * 0.3 + w3 * 0.2 + w4 * 0.1);
  return Math.max(0.04, raw * envelope);
});
