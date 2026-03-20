'use client';

import { useState, useEffect, useRef } from 'react';
import { useScroll } from '@/contexts/ScrollContext';

const IDENTITIES = ['PILOT', 'PRODUCER', 'DEVELOPER'];

// Spotify playlist: https://open.spotify.com/playlist/7x8qaRT5L4UVebsbvzRtzE
// Update this list with actual tracks from the playlist
const TRACKS = [
  { artist: 'MINERAL KING', title: 'Featherweight', role: 'Live Mix' },
  { artist: 'MINERAL KING', title: 'High Country', role: 'Live Mix' },
  { artist: 'MINERAL KING', title: 'Sequoia', role: 'Front of House' },
  { artist: 'MINERAL KING', title: 'Glass Pass', role: 'Live Mix' },
  { artist: 'STRANGE CASE', title: 'Palm Reader', role: 'Engineering' },
  { artist: 'STRANGE CASE', title: 'Sunken Weight', role: 'Engineering' },
  { artist: 'STRANGE CASE', title: 'Riptide', role: 'Studio' },
  { artist: 'SUBLIME', title: 'What I Got', role: 'FOH' },
  { artist: 'SUBLIME', title: 'Santeria', role: 'FOH' },
  { artist: 'SUBLIME', title: 'Wrong Way', role: 'FOH' },
  { artist: 'SUBLIME', title: 'Date Rape', role: 'FOH' },
  { artist: 'VARIOUS', title: 'The Pocket Sessions Vol. I', role: 'Mixing' },
  { artist: 'VARIOUS', title: 'The Pocket Sessions Vol. II', role: 'Mixing' },
  { artist: 'OVERLOOK AUDIO', title: 'Signal Chain', role: 'Production' },
  { artist: 'OVERLOOK AUDIO', title: 'Headroom', role: 'Production' },
];

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

// ── Browser Mockup Card ──────────────────────────────────────────────────────
// ResizeObserver scales the iframe so it exactly fills the card width.
function BrowserMockupCard({ project }: { project: typeof WEB_PROJECTS[0] }) {
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

export function ScrollSections() {
  const { atmosphere, velocity } = useScroll();
  const [identityIndex, setIdentityIndex] = useState(0);
  const [cascadeActive, setCascadeActive] = useState(false);
  const pocketTextRef = useRef<HTMLDivElement>(null);
  const prevAtmosphere = useRef(atmosphere);

  useEffect(() => {
    const id = setInterval(() => {
      setIdentityIndex((i) => (i + 1) % IDENTITIES.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

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

  // Airplane cursor on body for horizon
  useEffect(() => {
    if (atmosphere === 'horizon') {
      document.body.classList.add('cursor-airplane');
    } else {
      document.body.classList.remove('cursor-airplane');
    }
    return () => document.body.classList.remove('cursor-airplane');
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
            FINN BENNETT
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
              {IDENTITIES[identityIndex]}
            </span>
            <span style={{ opacity: 0.3 }}>//</span>
            <span style={{ opacity: 0.3 }}>{IDENTITIES[(identityIndex + 1) % 3]}</span>
            <span style={{ opacity: 0.15 }}>//</span>
            <span style={{ opacity: 0.15 }}>{IDENTITIES[(identityIndex + 2) % 3]}</span>
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
            VENTURA, CALIFORNIA  //  34.2746° N  119.2290° W
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
            gap: '0.5rem',
          }}
        >
          <div ref={pocketTextRef} style={{ willChange: 'transform', transition: 'transform 0.05s linear', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <p
              className="hud-text"
              style={{
                fontSize: '0.5rem',
                letterSpacing: '0.4em',
                color: '#ff8c00',
                opacity: 0.5,
                marginBottom: '0.5rem',
                textAlign: 'center',
              }}
            >
              OVERLOOK AUDIO
            </p>

            <h2
              className="serif-text"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 300,
                color: '#f5e6d0',
                letterSpacing: '0.08em',
                textAlign: 'center',
                lineHeight: 1.2,
                marginBottom: '2rem',
              }}
            >
              Sonic Work
            </h2>

            {/* Tracklist */}
            <div
              style={{
                maxHeight: '38vh',
                overflowY: 'auto',
                width: 'clamp(280px, 40vw, 520px)',
                scrollbarWidth: 'none',
              }}
            >
              <style>{`.tracklist::-webkit-scrollbar { display: none; }`}</style>
              <div className="tracklist">
                {TRACKS.map((track, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '0.75rem',
                      padding: '0.35rem 0',
                      borderBottom: '1px solid rgba(255,140,0,0.06)',
                    }}
                  >
                    <span
                      className="hud-text"
                      style={{ fontSize: '0.32rem', color: '#ff8c00', opacity: 0.25, minWidth: '1.4rem' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="hud-text"
                      style={{ fontSize: '0.44rem', letterSpacing: '0.25em', color: '#ff8c00', opacity: 0.85, flex: 1 }}
                    >
                      {track.artist}
                    </span>
                    <span
                      className="hud-text"
                      style={{ fontSize: '0.38rem', letterSpacing: '0.1em', color: '#f5e6d0', opacity: 0.45 }}
                    >
                      {track.title}
                    </span>
                    <span
                      className="hud-text"
                      style={{ fontSize: '0.28rem', letterSpacing: '0.2em', color: '#ff8c00', opacity: 0.2 }}
                    >
                      {track.role}
                    </span>
                  </div>
                ))}
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
            {PROJECTS.map((p) => (
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
              // auto-fit collapses empty tracks → single card centers nicely
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
            {WEB_PROJECTS.map((project) => (
              <BrowserMockupCard key={project.id} project={project} />
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
          {/* CSS cloud layers */}
          <div
            className="cloud-layer"
            style={{
              width: '30vw', height: '12vw',
              top: '15%', opacity: 0.07,
              background: 'radial-gradient(ellipse at 50% 50%, #fff 0%, transparent 70%)',
              filter: 'blur(18px)',
              animation: 'cloud-drift-1 70s linear infinite',
              animationDelay: '-10s',
            }}
          />
          <div
            className="cloud-layer"
            style={{
              width: '22vw', height: '9vw',
              top: '28%', opacity: 0.10,
              background: 'radial-gradient(ellipse at 50% 50%, #fff 0%, transparent 70%)',
              filter: 'blur(12px)',
              animation: 'cloud-drift-2 45s linear infinite',
              animationDelay: '-20s',
            }}
          />
          <div
            className="cloud-layer"
            style={{
              width: '40vw', height: '14vw',
              top: '55%', opacity: 0.12,
              background: 'radial-gradient(ellipse at 50% 50%, #fff 0%, transparent 70%)',
              filter: 'blur(22px)',
              animation: 'cloud-drift-3 30s linear infinite',
              animationDelay: '-5s',
            }}
          />
          <div
            className="cloud-layer"
            style={{
              width: '18vw', height: '8vw',
              top: '68%', opacity: 0.08,
              background: 'radial-gradient(ellipse at 50% 50%, #fff 0%, transparent 70%)',
              filter: 'blur(8px)',
              animation: 'cloud-drift-4 20s linear infinite',
              animationDelay: '-8s',
            }}
          />

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
              N12345  //  COMMERCIAL PILOT
            </p>

            <div style={{ width: '80px', height: '1px', background: 'rgba(68,68,68,0.3)', margin: '0.5rem 0' }} />

            <p
              className="hud-text"
              style={{ fontSize: '0.35rem', letterSpacing: '0.5em', color: '#333', opacity: 0.3 }}
            >
              34°12′48″N  //  119°05′39″W
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
              From altitude, everything is pattern.
            </h2>

            {/* Flight instruments */}
            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
              {[
                { label: 'ALTITUDE', value: '+5,200 FT' },
                { label: 'HEADING', value: '270° W' },
                { label: 'ORIGIN', value: 'KCMA' },
              ].map(({ label, value }) => (
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
              {[
                { label: '@FINN.BENNETT', href: 'https://instagram.com/finn.bennett', sub: 'INSTAGRAM' },
                { label: 'OVERLOOK STRATEGY', href: 'https://overlookstrategy.com', sub: 'AGENCY' },
                { label: 'OVERLOOK AUDIO', href: 'https://overlookaudio.com', sub: 'STUDIO' },
              ].map(({ label, href, sub }) => (
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

    </div>
  );
}
