'use client';

import { useState, useEffect, useRef } from 'react';
import { useScroll } from '@/contexts/ScrollContext';
import { AirplaneCursor } from './AirplaneCursor';
import type {
  SanityWebProject,
  SanityDevProject,
  SanityHero,
  SanityAudioWork,
  SanityAviation,
} from '@/lib/sanity/types';

// ── Hardcoded fallback data ───────────────────────────────────────────────────

const DEFAULT_IDENTITIES = ['PILOT', 'PRODUCER', 'DEVELOPER'];

const PROJECTS = [
  {
    id: 'spatial-mixer',
    num: '01',
    name: 'Spatial Mixer',
    desc: 'Browser-based spatial audio mixing environment',
    tech: ['Web Audio API', 'WASM', 'React'],
    role: 'SOLO BUILD',
    status: 'DEPLOYED',
  },
  {
    id: 'stem-engine',
    num: '02',
    name: 'Stem Engine',
    desc: 'AI-powered stem separation and mastering pipeline',
    tech: ['PyTorch', 'FFmpeg', 'Next.js'],
    role: 'FULL STACK',
    status: 'DEPLOYED',
  },
  {
    id: 'fleet-ops',
    num: '03',
    name: 'Fleet Ops',
    desc: 'Real-time aviation fleet operations dashboard',
    tech: ['Next.js', 'Redis', 'Mapbox'],
    role: 'LEAD DEV',
    status: 'LIVE',
  },
  {
    id: 'wx-brief',
    num: '04',
    name: 'WX Brief',
    desc: 'GOES satellite weather briefing for pilots',
    tech: ['Python', 'GOES API', 'React'],
    role: 'FULL STACK',
    status: 'LIVE',
  },
  {
    id: 'tidal-forecast',
    num: '05',
    name: 'Tidal Forecast',
    desc: 'ML-driven coastal tidal pattern visualization',
    tech: ['TensorFlow', 'MapboxGL', 'D3'],
    role: 'SOLO BUILD',
    status: 'BETA',
  },
  {
    id: 'overlook-strategy',
    num: '06',
    name: 'Overlook Strategy',
    desc: 'Brand identity and digital systems agency site',
    tech: ['Next.js', 'Three.js', 'GSAP'],
    role: 'DESIGN + DEV',
    status: 'LIVE',
  },
];

const WEB_PROJECTS = [
  {
    id: 'johnson-aviation',
    name: 'Johnson Aviation Consulting',
    domain: 'johnson-aviation.vercel.app',
    url: 'https://johnson-aviation.vercel.app',
    desc: 'Strategic airport planning firm — land use, facilities & financial advisory',
    tech: ['Next.js', 'Three.js', 'GSAP', 'Tailwind'],
    role: 'DESIGN + DEV',
    type: 'AGENCY SITE',
  },
  {
    id: 'overlook-audio',
    name: 'Overlook Audio',
    domain: 'overlookaudio.com',
    url: 'https://overlookaudio.com',
    desc: 'Recording studio & live sound production — Ventura, CA',
    tech: ['Next.js', 'Framer Motion', 'Tailwind'],
    role: 'DESIGN + DEV',
    type: 'STUDIO SITE',
  },
  {
    id: 'overlook-strategy',
    name: 'Overlook Strategy',
    domain: 'overlookstrategy.com',
    url: 'https://overlookstrategy.com',
    desc: 'Brand identity & digital systems agency',
    tech: ['Next.js', 'Three.js', 'GSAP'],
    role: 'DESIGN + DEV',
    type: 'AGENCY SITE',
  },
];

const DATA_COLUMNS = [
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

// ── Browser Mockup Card ───────────────────────────────────────────────────────

type WebProjectItem = {
  id?: string;
  _id?: string;
  name: string;
  domain: string;
  url: string;
  desc: string;
  tech: string[];
  role: string;
  type: string;
};

function BrowserMockupCard({ project }: { project: WebProjectItem }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [iframeScale, setIframeScale] = useState(0.34);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setIframeScale(entry.contentRect.width / 1280);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="web-project-card">
      {/* Browser chrome */}
      <div className="browser-chrome">
        <div className="browser-traffic-lights">
          <span className="traffic-light tl-close" />
          <span className="traffic-light tl-min" />
          <span className="traffic-light tl-max" />
        </div>
        <div className="browser-url-bar">
          <span className="url-protocol">https://</span>
          <span className="url-host">{project.domain}</span>
        </div>
      </div>

      {/* Scaled iframe viewport */}
      <div ref={viewportRef} className="browser-viewport">
        <div
          className="browser-scale-wrapper"
          style={{ transform: `scale(${iframeScale})` }}
        >
          <iframe
            src={project.url}
            title={project.name}
            scrolling="no"
            loading="lazy"
            style={{ border: 'none', width: '1280px', height: '860px', pointerEvents: 'none' }}
          />
        </div>
      </div>

      {/* Project metadata */}
      <div className="web-project-meta">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3
            className="serif-text"
            style={{ fontSize: '1rem', fontWeight: 400, color: '#ccc', letterSpacing: '0.05em' }}
          >
            {project.name}
          </h3>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hud-text"
            style={{
              fontSize: '0.3rem',
              letterSpacing: '0.3em',
              color: '#00ff88',
              opacity: 0.6,
              textDecoration: 'none',
              transition: 'opacity 0.2s ease',
              flexShrink: 0,
              marginLeft: '0.75rem',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
          >
            VISIT →
          </a>
        </div>

        <p
          className="hud-text"
          style={{ fontSize: '0.3rem', letterSpacing: '0.08em', color: '#555', lineHeight: 1.7, marginTop: '0.3rem' }}
        >
          {project.desc}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem' }}>
          {project.tech.map((t) => (
            <span
              key={t}
              className="hud-text tech-tag"
              style={{
                fontSize: '0.26rem',
                letterSpacing: '0.15em',
                color: '#555',
                opacity: 0.8,
                padding: '0.08rem 0.3rem',
                border: '1px solid rgba(85,85,85,0.3)',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface ScrollSectionsProps {
  sanityWebProjects?: SanityWebProject[];
  sanityDevProjects?: SanityDevProject[];
  sanityHero?: SanityHero;
  sanityAudioWork?: SanityAudioWork;
  sanityAviation?: SanityAviation;
}

// ── Main component ────────────────────────────────────────────────────────────

export function ScrollSections({
  sanityWebProjects,
  sanityDevProjects,
  sanityHero,
  sanityAudioWork,
  sanityAviation,
}: ScrollSectionsProps) {
  const { atmosphere, velocity } = useScroll();
  const [identityIndex, setIdentityIndex] = useState(0);
  const [cascadeActive, setCascadeActive] = useState(false);
  const pocketTextRef = useRef<HTMLDivElement>(null);
  const prevAtmosphere = useRef(atmosphere);

  // ── Resolve data: Sanity first, hardcoded fallback ──────────────────────────

  const identities = sanityHero?.identities?.length
    ? sanityHero.identities
    : DEFAULT_IDENTITIES;

  const heroName = sanityHero?.name ?? 'FINN BENNETT';
  const heroLocation = sanityHero?.locationLabel
    ? `${sanityHero.locationLabel}  //  ${sanityHero.coordinates}`
    : 'VENTURA, CALIFORNIA  //  34.2746° N  119.2290° W';

  const audioHeadline = sanityAudioWork?.headline ?? 'OVERLOOK AUDIO';
  const audioTitle = sanityAudioWork?.sectionTitle ?? 'The Work';
  const spotifyId = sanityAudioWork?.spotifyPlaylistId ?? '7x8qaRT5L4UVebsbvzRtzE';

  const audioStats = sanityAudioWork?.stats?.length
    ? sanityAudioWork.stats
    : [
        { value: '8M+', label: 'STREAMS' },
        { value: '12', label: 'YRS EXP' },
        { value: 'FOH', label: 'LIVE AUDIO' },
      ];

  const touringCredits = sanityAudioWork?.touringCredits?.length
    ? sanityAudioWork.touringCredits.map((c) => ({ name: c.artistName, role: c.role }))
    : [
        { name: 'MINERAL KING', role: 'FOH · Touring' },
        { name: 'SUBLIME', role: 'FOH · Touring' },
        { name: 'STRANGE CASE', role: 'Studio Engineering' },
      ];

  const disciplines = sanityAudioWork?.disciplines?.length
    ? sanityAudioWork.disciplines.map((d) => ({ code: d.code, desc: d.description }))
    : [
        { code: 'LIVE FOH', desc: 'Touring front-of-house' },
        { code: 'STUDIO', desc: 'Recording & mix engineering' },
        { code: 'PRODUCTION', desc: 'Composition & synthesis' },
      ];

  const activeProjects: typeof PROJECTS = sanityDevProjects?.length
    ? sanityDevProjects.map((p) => ({
        id: p._id,
        num: p.num,
        name: p.name,
        desc: p.desc,
        tech: p.tech,
        role: p.role,
        status: p.status,
      }))
    : PROJECTS;

  const activeWebProjects: WebProjectItem[] = sanityWebProjects?.length
    ? sanityWebProjects.map((p) => ({
        _id: p._id,
        name: p.name,
        domain: p.domain,
        url: p.url,
        desc: p.desc,
        tech: p.tech,
        role: p.role,
        type: p.type,
      }))
    : WEB_PROJECTS;

  const aviationCallsign = sanityAviation?.callsign ?? 'N12345';
  const aviationCert = sanityAviation?.certLabel ?? 'COMMERCIAL PILOT';
  const aviationCoords = sanityAviation?.coordinates ?? '34°12′48″N  //  119°05′39″W';
  const aviationTagline = sanityAviation?.tagline ?? 'From altitude, everything is pattern.';

  const gauges = sanityAviation?.gauges?.length
    ? sanityAviation.gauges
    : [
        { label: 'ALTITUDE', value: '+5,200 FT' },
        { label: 'HEADING', value: '270° W' },
        { label: 'ORIGIN', value: 'KCMA' },
      ];

  const beaconLinks = sanityAviation?.beaconLinks?.length
    ? sanityAviation.beaconLinks
    : [
        { label: '@FINN.BENNETT', href: 'https://instagram.com/finn.bennett', sub: 'INSTAGRAM' },
        { label: 'OVERLOOK STRATEGY', href: 'https://overlookstrategy.com', sub: 'AGENCY' },
        { label: 'OVERLOOK AUDIO', href: 'https://overlookaudio.com', sub: 'STUDIO' },
      ];

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const id = setInterval(() => {
      setIdentityIndex((i) => (i + 1) % identities.length);
    }, 2200);
    return () => clearInterval(id);
  }, [identities.length]);

  // Pocket text vibration — linked to scroll velocity
  useEffect(() => {
    if (atmosphere !== 'pocket' || !pocketTextRef.current) return;
    const el = pocketTextRef.current;
    const absV = Math.min(Math.abs(velocity), 30);
    const jitterX = (Math.random() - 0.5) * absV * 0.12;
    const jitterY = (Math.random() - 0.5) * absV * 0.08;
    el.style.transform = `translate(${jitterX}px, ${jitterY}px)`;
  }, [atmosphere, velocity]);

  // Data cascade trigger on engine-room entry
  useEffect(() => {
    if (atmosphere === 'engine-room' && prevAtmosphere.current !== 'engine-room') {
      setCascadeActive(true);
      const t = setTimeout(() => setCascadeActive(false), 2000);
      prevAtmosphere.current = atmosphere;
      return () => clearTimeout(t);
    }
    prevAtmosphere.current = atmosphere;
  }, [atmosphere]);

  // Hide default cursor in horizon section
  useEffect(() => {
    if (atmosphere === 'horizon') {
      document.body.classList.add('cursor-none');
    } else {
      document.body.classList.remove('cursor-none');
    }
    return () => document.body.classList.remove('cursor-none');
  }, [atmosphere]);

  const show = (zone: typeof atmosphere) => atmosphere === zone;

  return (
    <div className="scroll-content" style={{ height: '1000vh' }}>

      {/* ─── Stage 1: The Shoreline — Identity ────────────────────────── */}
      <section style={{ height: '200vh', position: 'relative' }}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: show('shoreline') ? 1 : 0,
            transition: 'opacity 0.9s ease',
            pointerEvents: show('shoreline') ? 'all' : 'none',
          }}
        >
          <h1
            className="serif-text"
            style={{
              fontSize: 'clamp(3.5rem, 9vw, 8rem)',
              fontWeight: 300,
              color: '#e8f5f5',
              letterSpacing: '0.12em',
              marginBottom: '1.5rem',
              lineHeight: 1,
              textAlign: 'center',
              zIndex: 1,
            }}
          >
            {heroName}
          </h1>

          <div
            className="hud-text"
            style={{
              fontSize: 'clamp(0.55rem, 1.2vw, 0.75rem)',
              letterSpacing: '0.4em',
              color: '#3dd9c4',
              opacity: 0.7,
              height: '1.4em',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1em',
              zIndex: 1,
            }}
          >
            <span key={identityIndex} style={{ animation: 'identity-enter 0.5s ease forwards' }}>
              {identities[identityIndex]}
            </span>
            <span style={{ opacity: 0.3 }}>//</span>
            <span style={{ opacity: 0.3 }}>{identities[(identityIndex + 1) % identities.length]}</span>
            <span style={{ opacity: 0.15 }}>//</span>
            <span style={{ opacity: 0.15 }}>{identities[(identityIndex + 2) % identities.length]}</span>
          </div>

          <p
            className="hud-text"
            style={{
              marginTop: '3rem',
              fontSize: '0.4rem',
              letterSpacing: '0.4em',
              color: '#3dd9c4',
              opacity: 0.2,
              zIndex: 1,
            }}
          >
            {heroLocation}
          </p>
        </div>
      </section>

      {/* ─── Stage 2: The Pocket — Sonic Work ─────────────────────────── */}
      <section style={{ height: '200vh', position: 'relative' }}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: show('pocket') ? 1 : 0,
            transition: 'opacity 0.9s ease',
            pointerEvents: show('pocket') ? 'all' : 'none',
            padding: '0 clamp(1.5rem, 5vw, 4rem)',
          }}
        >
          <div
            ref={pocketTextRef}
            style={{
              willChange: 'transform',
              transition: 'transform 0.05s linear',
              width: '100%',
              maxWidth: '1060px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {/* ── Section header ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <p
                className="hud-text"
                style={{ fontSize: '0.45rem', letterSpacing: '0.4em', color: '#ff8c00', opacity: 0.5, whiteSpace: 'nowrap' }}
              >
                {audioHeadline}
              </p>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(255,140,0,0.2) 0%, transparent 100%)' }} />
              <p
                className="hud-text"
                style={{ fontSize: '0.35rem', letterSpacing: '0.35em', color: '#ff8c00', opacity: 0.3, whiteSpace: 'nowrap' }}
              >
                {audioStats[0]?.value} {audioStats[0]?.label}
              </p>
            </div>

            <h2
              className="serif-text"
              style={{
                fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
                fontWeight: 300,
                color: '#f5e6d0',
                letterSpacing: '0.06em',
                lineHeight: 1,
              }}
            >
              {audioTitle}
            </h2>

            {/* ── Two-column body ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.5fr',
                gap: 'clamp(1.5rem, 4vw, 3rem)',
                alignItems: 'start',
              }}
            >
              {/* Left: Credentials panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>

                {/* Stats row */}
                <div style={{ display: 'flex' }}>
                  {audioStats.map(({ value, label }, idx) => (
                    <div
                      key={label}
                      style={{
                        flex: 1,
                        borderLeft: `1px solid rgba(255,140,0,${idx === 0 ? 0.3 : 0.12})`,
                        paddingLeft: '0.75rem',
                        paddingRight: '0.75rem',
                      }}
                    >
                      <p
                        className="serif-text"
                        style={{
                          fontSize: 'clamp(1.3rem, 2.2vw, 1.9rem)',
                          fontWeight: 300,
                          color: '#ff8c00',
                          lineHeight: 1,
                          opacity: idx === 0 ? 1 : 0.6,
                        }}
                      >
                        {value}
                      </p>
                      <p
                        className="hud-text"
                        style={{ fontSize: '0.28rem', letterSpacing: '0.3em', color: '#ff8c00', opacity: 0.35, marginTop: '0.2rem' }}
                      >
                        {label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Touring credits */}
                <div>
                  <p
                    className="hud-text"
                    style={{ fontSize: '0.3rem', letterSpacing: '0.4em', color: '#ff8c00', opacity: 0.3, marginBottom: '0.5rem' }}
                  >
                    TOURING CREDITS
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {touringCredits.map(({ name, role }) => (
                      <div
                        key={name}
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          justifyContent: 'space-between',
                          padding: '0.4rem 0',
                          borderBottom: '1px solid rgba(255,140,0,0.07)',
                        }}
                      >
                        <span
                          className="serif-text"
                          style={{
                            fontSize: 'clamp(0.75rem, 1.2vw, 1rem)',
                            fontWeight: 400,
                            color: '#f5e6d0',
                            letterSpacing: '0.04em',
                            opacity: 0.9,
                          }}
                        >
                          {name}
                        </span>
                        <span
                          className="hud-text"
                          style={{ fontSize: '0.28rem', letterSpacing: '0.2em', color: '#ff8c00', opacity: 0.3 }}
                        >
                          {role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disciplines */}
                <div>
                  <p
                    className="hud-text"
                    style={{ fontSize: '0.3rem', letterSpacing: '0.4em', color: '#ff8c00', opacity: 0.3, marginBottom: '0.4rem' }}
                  >
                    DISCIPLINES
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {disciplines.map(({ code, desc }) => (
                      <div key={code} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span
                          className="hud-text"
                          style={{
                            fontSize: '0.3rem',
                            letterSpacing: '0.25em',
                            color: '#ff8c00',
                            opacity: 0.6,
                            padding: '0.15rem 0.4rem',
                            border: '1px solid rgba(255,140,0,0.2)',
                            background: 'rgba(255,140,0,0.04)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {code}
                        </span>
                        <span
                          className="hud-text"
                          style={{ fontSize: '0.28rem', letterSpacing: '0.08em', color: '#f5e6d0', opacity: 0.25 }}
                        >
                          {desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right: Spotify embed */}
              <div style={{ position: 'relative' }}>
                {/* Ambient glow behind player */}
                <div
                  style={{
                    position: 'absolute',
                    inset: '-30px -20px',
                    background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,140,0,0.07) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    zIndex: 0,
                  }}
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <iframe
                    title="Overlook Audio — Selected Works"
                    src={`https://open.spotify.com/embed/playlist/${spotifyId}?utm_source=generator&theme=0`}
                    width="100%"
                    style={{
                      height: 'clamp(280px, 38vh, 352px)',
                      border: 'none',
                      borderRadius: '12px',
                      display: 'block',
                    }}
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                  <p
                    className="hud-text"
                    style={{
                      fontSize: '0.28rem',
                      letterSpacing: '0.3em',
                      color: '#ff8c00',
                      opacity: 0.2,
                      textAlign: 'center',
                      marginTop: '0.6rem',
                    }}
                  >
                    {audioHeadline} — SELECTED WORKS  //  SPOTIFY
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ─── Stage 3: The Engine Room — Dev Portfolio ─────────────────── */}
      <section style={{ height: '200vh', position: 'relative' }}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: show('engine-room') ? 1 : 0,
            transition: 'opacity 0.9s ease',
            pointerEvents: show('engine-room') ? 'all' : 'none',
            gap: '1.5rem',
            overflow: 'hidden',
          }}
        >
          {/* Data cascade overlay */}
          {cascadeActive && DATA_COLUMNS.map((col, i) => (
            <div
              key={i}
              className="data-cascade-column"
              style={{
                left: `${8 + i * 9}%`,
                animationDelay: `${i * 0.08}s`,
                opacity: 0,
              }}
            >
              {col}
            </div>
          ))}

          <p
            className="hud-text"
            style={{ fontSize: '0.45rem', letterSpacing: '0.4em', color: '#888', opacity: 0.4 }}
          >
            SELECTED WORK
          </p>

          {/* Portfolio grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              width: 'clamp(320px, 80vw, 920px)',
              maxHeight: '65vh',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              padding: '0.25rem',
            }}
          >
            {activeProjects.map((p) => (
              <div
                key={p.id}
                className="portfolio-card"
                style={{
                  border: '1px solid rgba(136,136,136,0.15)',
                  padding: '1.25rem 1.5rem',
                  position: 'relative',
                  backdropFilter: 'blur(8px)',
                  background: 'rgba(0,0,0,0.35)',
                  cursor: 'default',
                }}
              >
                {/* Corner brackets */}
                <div style={{ position: 'absolute', top: -1, right: -1, width: 8, height: 8, borderTop: '1px solid #888', borderRight: '1px solid #888' }} />
                <div style={{ position: 'absolute', bottom: -1, left: -1, width: 8, height: 8, borderBottom: '1px solid #888', borderLeft: '1px solid #888' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <p className="hud-text" style={{ fontSize: '0.32rem', letterSpacing: '0.3em', color: '#888', opacity: 0.35 }}>
                    {p.num}
                  </p>
                  <p className="hud-text" style={{ fontSize: '0.28rem', letterSpacing: '0.25em', color: '#00ff88', opacity: 0.5 }}>
                    {p.status}
                  </p>
                </div>

                <h3
                  className="serif-text"
                  style={{ fontSize: '1.1rem', fontWeight: 400, color: '#ccc', letterSpacing: '0.05em', marginBottom: '0.4rem' }}
                >
                  {p.name}
                </h3>

                <p className="hud-text" style={{ fontSize: '0.32rem', letterSpacing: '0.08em', color: '#666', lineHeight: 1.7, marginBottom: '0.75rem' }}>
                  {p.desc}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {p.tech.map((t) => (
                    <span
                      key={t}
                      className="hud-text tech-tag"
                      style={{ fontSize: '0.28rem', letterSpacing: '0.15em', color: '#555', opacity: 0.8, padding: '0.1rem 0.3rem', border: '1px solid rgba(85,85,85,0.3)' }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stage 4: Selected Work — Web Projects ─────────────────────── */}
      <section style={{ height: '200vh', position: 'relative' }}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: show('selected-work') ? 1 : 0,
            transition: 'opacity 0.9s ease',
            pointerEvents: show('selected-work') ? 'all' : 'none',
            gap: '1.5rem',
            overflow: 'hidden',
          }}
        >
          {/* Section header */}
          <p
            className="hud-text"
            style={{ fontSize: '0.45rem', letterSpacing: '0.4em', color: '#888', opacity: 0.4 }}
          >
            SELECTED WORK  //  WEB
          </p>

          <h2
            className="serif-text"
            style={{
              fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)',
              fontWeight: 300,
              color: '#ccc',
              letterSpacing: '0.08em',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            Sites Built
          </h2>

          {/* Browser mockup grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 520px))',
              justifyContent: 'center',
              gap: '1.5rem',
              width: 'clamp(380px, 82vw, 1100px)',
              maxHeight: '62vh',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              padding: '0.25rem',
            }}
          >
            {activeWebProjects.map((project) => (
              <BrowserMockupCard
                key={project._id ?? project.id ?? project.name}
                project={project}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stage 5: The Horizon — Aviation ──────────────────────────── */}
      <section style={{ height: '200vh', position: 'relative' }}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: show('horizon') ? 1 : 0,
            transition: 'opacity 0.9s ease',
            pointerEvents: show('horizon') ? 'all' : 'none',
            gap: '0.4rem',
            overflow: 'hidden',
          }}
        >
          {/* la-altitude.jpg as background */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
            <img
              src="/images/la-altitude.jpg"
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 40%',
                opacity: 0.12,
                mixBlendMode: 'multiply',
              }}
            />
          </div>

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>

            <p
              className="hud-text"
              style={{ fontSize: '0.35rem', letterSpacing: '0.5em', color: '#aaa', opacity: 0.4 }}
            >
              {aviationCallsign}  //  {aviationCert}
            </p>

            <div style={{ width: '80px', height: '1px', background: 'rgba(68,68,68,0.3)', margin: '0.5rem 0' }} />

            <p
              className="hud-text"
              style={{ fontSize: '0.35rem', letterSpacing: '0.5em', color: '#333', opacity: 0.3 }}
            >
              {aviationCoords}
            </p>

            <h2
              className="serif-text"
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                fontWeight: 300,
                fontStyle: 'italic',
                color: '#2a2a2a',
                letterSpacing: '0.1em',
                textAlign: 'center',
                marginTop: '0.5rem',
                marginBottom: '0.5rem',
              }}
            >
              {aviationTagline}
            </h2>

            {/* Flight instruments */}
            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
              {gauges.map(({ label, value }) => (
                <div
                  key={label}
                  className="flight-gauge"
                  style={{
                    textAlign: 'center',
                    padding: '1rem 1.25rem',
                    width: '90px',
                    height: '90px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <p className="hud-text" style={{ fontSize: '0.3rem', letterSpacing: '0.3em', color: '#aaa', marginBottom: '0.4rem' }}>
                    {label}
                  </p>
                  <p className="hud-text" style={{ fontSize: '0.55rem', letterSpacing: '0.1em', color: '#333' }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ width: '80px', height: '1px', background: 'rgba(68,68,68,0.3)', margin: '1rem 0 0.5rem' }} />

            {/* Social / company links */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
              {beaconLinks.map(({ label, href, sub }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="beacon-link"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.2rem',
                    padding: '0.6rem 1.1rem',
                    border: '1px solid rgba(42,42,42,0.35)',
                    textDecoration: 'none',
                    background: 'rgba(245,245,247,0.5)',
                    backdropFilter: 'blur(4px)',
                    transition: 'background 0.2s ease, border-color 0.2s ease',
                  }}
                >
                  <span className="hud-text" style={{ fontSize: '0.38rem', letterSpacing: '0.25em', color: '#2a2a2a' }}>
                    {label} →
                  </span>
                  <span className="hud-text" style={{ fontSize: '0.28rem', letterSpacing: '0.3em', color: '#888', opacity: 0.6 }}>
                    {sub}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SVG airplane cursor — only active in the horizon/aviation section */}
      <AirplaneCursor />

    </div>
  );
}
