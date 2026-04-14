'use client';

import { useState, useEffect, useRef } from 'react';
import { useScroll } from '@/contexts/ScrollContext';
import { AirplaneCursor } from './AirplaneCursor';
import type {
  SanityHero,
  SanityAudioWork,
  SanityWebProject,
  SanityDevProject,
  SanityAviation,
} from '@/lib/sanity/types';

import { SelectedWorkBrowser } from './SelectedWorkBrowser';
import {
  FALLBACK_IDENTITIES,
  FALLBACK_PROJECTS,
  FALLBACK_WEB_PROJECTS,
  DATA_COLUMNS,
  WAVEFORM_BARS,
} from '@/lib/fallbacks';

interface ScrollSectionsProps {
  hero?: SanityHero | null;
  audioWork?: SanityAudioWork | null;
  webProjects?: SanityWebProject[];
  devProjects?: SanityDevProject[];
  aviation?: SanityAviation | null;
}

export function ScrollSections({
  hero,
  audioWork,
  webProjects = [],
  devProjects = [],
  aviation,
}: ScrollSectionsProps = {}) {
  const { atmosphere, velocity } = useScroll();
  const [identityIndex, setIdentityIndex] = useState(0);
  const [cascadeActive, setCascadeActive] = useState(false);
  const [pocketEntered, setPocketEntered] = useState(false);
  const pocketTextRef = useRef<HTMLDivElement>(null);
  const prevAtmosphere = useRef(atmosphere);

  // Resolved data — Sanity values with hardcoded fallbacks
  const identities = hero?.identities?.length ? hero.identities : FALLBACK_IDENTITIES;
  const heroName = hero?.name ?? 'FINN BENNETT';
  const heroLocation = hero?.locationLabel ?? 'VENTURA, CALIFORNIA';
  const heroCoordinates = hero?.coordinates ?? '34.2746° N  119.2290° W';

  const audioHeadline = audioWork?.headline ?? 'OVERLOOK AUDIO';
  const audioSectionTitle = audioWork?.sectionTitle ?? 'Sonic Work';
  const spotifyPlaylistId = audioWork?.spotifyPlaylistId ?? '7x8qaRT5L4UVebsbvzRtzE';
  const audioStats = audioWork?.stats?.length
    ? audioWork.stats
    : [
        { value: '8M+', label: 'STREAMS', sub: 'catalog total' },
        { value: '12+', label: 'YEARS', sub: 'in the field' },
        { value: '50+', label: 'PROJECTS', sub: 'delivered' },
      ];
  const touringCredits = audioWork?.touringCredits?.length
    ? audioWork.touringCredits
    : [
        { artistName: 'Mineral King', role: 'Live Production', context: 'Touring' },
        { artistName: 'Sublime Strange Case', role: 'Front of House', context: 'Engineering' },
      ];
  const disciplines = audioWork?.disciplines?.length
    ? audioWork.disciplines
    : [
        { code: 'LIVE FOH', description: 'Touring front-of-house' },
        { code: 'STUDIO', description: 'Recording & mixing' },
        { code: 'PRODUCTION', description: 'Music production' },
      ];
  const specialties = audioWork?.specialties?.length
    ? audioWork.specialties
    : ['FRONT OF HOUSE', 'MIX ENGINEERING', 'LIVE PRODUCTION'];

  const activeWebProjects = webProjects.length ? webProjects : FALLBACK_WEB_PROJECTS;
  const activeDevProjects = devProjects.length ? devProjects : FALLBACK_PROJECTS;

  const aviationCallsign = aviation?.callsign ?? 'N12345';
  const aviationCertLabel = aviation?.certLabel ?? 'COMMERCIAL PILOT';
  const aviationCoordinates = aviation?.coordinates ?? '34°12′48″N  //  119°05′39″W';
  const aviationTagline = aviation?.tagline ?? 'From altitude, everything is pattern.';
  const aviationGauges = aviation?.gauges?.length
    ? aviation.gauges
    : [
        { label: 'ALTITUDE', value: '+5,200 FT' },
        { label: 'HEADING', value: '270° W' },
        { label: 'ORIGIN', value: 'KCMA' },
      ];
  const beaconLinks = aviation?.beaconLinks?.length
    ? aviation.beaconLinks
    : [
        { label: '@FINN.BENNETT', href: 'https://instagram.com/finn.bennett', sub: 'INSTAGRAM' },
        { label: 'OVERLOOK STRATEGY', href: 'https://overlookstrategy.com', sub: 'AGENCY' },
        { label: 'OVERLOOK AUDIO', href: 'https://overlookaudio.com', sub: 'STUDIO' },
      ];

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

  // Pocket section entrance — triggers once on first visit
  useEffect(() => {
    if (atmosphere === 'pocket') setPocketEntered(true);
  }, [atmosphere]);

  // Hide default cursor in horizon section — AirplaneCursor renders the SVG replacement
  useEffect(() => {
    if (atmosphere === 'horizon') {
      document.body.classList.add('cursor-none');
    } else {
      document.body.classList.remove('cursor-none');
    }
    return () => document.body.classList.remove('cursor-none');
  }, [atmosphere]);

  const show = (zone: typeof atmosphere) => atmosphere === zone;

  // Staggered entrance animation helper — opacity + lift-in with delay
  const pocketAnim = (delay: number) => ({
    opacity: pocketEntered ? 1 : 0,
    transform: pocketEntered ? 'translateY(0px)' : 'translateY(16px)',
    transition: `opacity 0.75s ease ${delay}s, transform 0.85s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
  });

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
          <div 
            className="glass-panel" 
            style={{ 
              padding: '4rem 6rem', 
              textAlign: 'center', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              zIndex: 1,
              maxWidth: '90vw'
            }}
          >
            <h1
              className="serif-text"
              style={{
                fontSize: 'clamp(3.5rem, 8vw, 7rem)',
                fontWeight: 300,
                color: '#ffffff',
                letterSpacing: '0.05em',
                lineHeight: 1,
              }}
            >
              {heroName}
            </h1>
            
            <p 
              className="sans-text text-gradient-teal" 
              style={{ 
                fontSize: 'clamp(1rem, 2vw, 1.5rem)', 
                fontWeight: 500, 
                letterSpacing: '0.25em', 
                marginTop: '1.5rem', 
                textTransform: 'uppercase',
                maxWidth: '600px',
                lineHeight: 1.6
              }}
            >
              Digital Identity & Engineering
            </p>

            <button 
              className="sans-text magnetic-btn" 
              style={{ 
                marginTop: '3.5rem', 
                padding: '1.2rem 3.5rem', 
                fontSize: '0.85rem', 
                fontWeight: 600,
                letterSpacing: '0.2em', 
                color: '#fff', 
                border: '1px solid rgba(61, 217, 196, 0.3)', 
                borderRadius: '30px', 
                background: 'rgba(61, 217, 196, 0.05)', 
                cursor: 'pointer', 
                textTransform: 'uppercase',
                backdropFilter: 'blur(5px)'
              }}
            >
              <a href="#selected-work" style={{ color: 'inherit', textDecoration: 'none' }}>
                View Masterworks
              </a>
            </button>
          </div>
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
              maxWidth: '1100px',
            }}
          >

            {/* ── Header strip ── */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '0.9rem',
                ...pocketAnim(0),
              }}
            >
              <p className="hud-text" style={{ fontSize: '0.38rem', letterSpacing: '0.42em', color: '#ff8c00', opacity: 0.45, whiteSpace: 'nowrap' }}>
                {audioHeadline}
              </p>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(255,140,0,0.22) 0%, rgba(255,140,0,0.04) 70%, transparent 100%)' }} />
              <p className="hud-text" style={{ fontSize: '0.28rem', letterSpacing: '0.38em', color: '#ff8c00', opacity: 0.2, whiteSpace: 'nowrap' }}>
                SIGNAL FLOW
              </p>
            </div>

            {/* ── Title + Waveform row ── */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '1.5rem',
                marginBottom: '1.6rem',
                ...pocketAnim(0.08),
              }}
            >
              <h2
                className="serif-text"
                style={{
                  fontSize: 'clamp(2.4rem, 5vw, 4rem)',
                  fontWeight: 300,
                  color: '#f5e6d0',
                  letterSpacing: '0.05em',
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                {audioSectionTitle}
              </h2>

              {/* Decorative waveform — fills remaining title row width */}
              <div style={{ flex: 1, overflow: 'hidden', paddingBottom: '0.5rem' }}>
                <svg
                  viewBox="0 0 120 32"
                  preserveAspectRatio="none"
                  width="100%"
                  height="28"
                  style={{ display: 'block' }}
                >
                  {WAVEFORM_BARS.map((h, i) => {
                    const halfH = h * 13;
                    return (
                      <rect
                        key={i}
                        x={i + 0.15}
                        y={16 - halfH}
                        width={0.7}
                        height={halfH * 2}
                        fill={`rgba(255,140,0,${(0.1 + h * 0.38).toFixed(3)})`}
                      />
                    );
                  })}
                </svg>
              </div>

              <p className="hud-text" style={{ fontSize: '0.28rem', letterSpacing: '0.38em', color: '#ff8c00', opacity: 0.2, paddingBottom: '0.5rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {(audioStats.find((s) => s.label?.toUpperCase().includes('YEAR'))?.value ?? '12+') + ' YRS'}
              </p>
            </div>

            {/* ── Three-column body ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '165px 1fr 200px',
                gap: 'clamp(1.25rem, 3vw, 2.5rem)',
                alignItems: 'start',
              }}
            >

              {/* Left col: Stats + Disciplines */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>

                {/* Stat readouts */}
                <div style={{ ...pocketAnim(0.15) }}>
                  <p className="hud-text" style={{ fontSize: '0.26rem', letterSpacing: '0.44em', color: '#ff8c00', opacity: 0.22, marginBottom: '0.65rem' }}>
                    CREDENTIALS
                  </p>
                  {audioStats.map(({ value, label, sub }, i) => (
                    <div
                      key={label}
                      style={{
                        paddingLeft: '0.65rem',
                        paddingTop: '0.5rem',
                        paddingBottom: '0.5rem',
                        borderLeft: `1px solid rgba(255,140,0,${i === 0 ? 0.32 : 0.1})`,
                        marginBottom: '0.08rem',
                      }}
                    >
                      <p
                        className="serif-text"
                        style={{
                          fontSize: 'clamp(1.3rem, 2.2vw, 1.8rem)',
                          fontWeight: 300,
                          color: '#ff8c00',
                          lineHeight: 1,
                          opacity: 1 - i * 0.18,
                        }}
                      >
                        {value}
                      </p>
                      <p className="hud-text" style={{ fontSize: '0.23rem', letterSpacing: '0.34em', color: '#ff8c00', opacity: 0.28, marginTop: '0.07rem' }}>
                        {label}
                      </p>
                      {sub && (
                        <p className="hud-text" style={{ fontSize: '0.21rem', letterSpacing: '0.1em', color: '#f5e6d0', opacity: 0.12, marginTop: '0.04rem' }}>
                          {sub}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Signal-chain disciplines */}
                <div style={{ marginTop: '1.3rem', ...pocketAnim(0.35) }}>
                  <p className="hud-text" style={{ fontSize: '0.26rem', letterSpacing: '0.44em', color: '#ff8c00', opacity: 0.22, marginBottom: '0.5rem' }}>
                    DISCIPLINES
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.28rem' }}>
                    {disciplines.map((d, i) => (
                      <div key={d.code} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span
                          className="hud-text"
                          style={{
                            fontSize: '0.24rem',
                            letterSpacing: '0.22em',
                            color: '#ff8c00',
                            opacity: 0.48,
                            padding: '0.1rem 0.3rem',
                            border: '1px solid rgba(255,140,0,0.16)',
                            background: 'rgba(255,140,0,0.03)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {d.code}
                        </span>
                        {i < disciplines.length - 1 && (
                          <span className="hud-text" style={{ fontSize: '0.22rem', color: '#ff8c00', opacity: 0.16 }}>→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Center col: Spotify embed */}
              <div style={{ position: 'relative', ...pocketAnim(0.22) }}>

                {/* Corner brackets */}
                <div style={{ position: 'absolute', top: -9, left: -9, width: 16, height: 16, borderTop: '1px solid rgba(255,140,0,0.22)', borderLeft: '1px solid rgba(255,140,0,0.22)', zIndex: 2, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: -9, right: -9, width: 16, height: 16, borderTop: '1px solid rgba(255,140,0,0.22)', borderRight: '1px solid rgba(255,140,0,0.22)', zIndex: 2, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -9, left: -9, width: 16, height: 16, borderBottom: '1px solid rgba(255,140,0,0.22)', borderLeft: '1px solid rgba(255,140,0,0.22)', zIndex: 2, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -9, right: -9, width: 16, height: 16, borderBottom: '1px solid rgba(255,140,0,0.22)', borderRight: '1px solid rgba(255,140,0,0.22)', zIndex: 2, pointerEvents: 'none' }} />

                {/* Ambient glow */}
                <div
                  style={{
                    position: 'absolute',
                    inset: '-50px -35px',
                    background: 'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(255,140,0,0.055) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }}
                />

                <iframe
                  title="Overlook Audio — Selected Works"
                  src={`https://open.spotify.com/embed/playlist/${spotifyPlaylistId}?utm_source=generator&theme=0`}
                  width="100%"
                  style={{
                    height: 'clamp(280px, 38vh, 352px)',
                    border: 'none',
                    borderRadius: '8px',
                    display: 'block',
                    position: 'relative',
                    zIndex: 1,
                  }}
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.55rem', padding: '0 0.2rem' }}>
                  <p className="hud-text" style={{ fontSize: '0.23rem', letterSpacing: '0.28em', color: '#ff8c00', opacity: 0.16 }}>
                    SELECTED WORKS
                  </p>
                  <p className="hud-text" style={{ fontSize: '0.23rem', letterSpacing: '0.28em', color: '#ff8c00', opacity: 0.16 }}>
                    SPOTIFY
                  </p>
                </div>

              </div>

              {/* Right col: Touring credits + Specialties */}
              <div style={{ ...pocketAnim(0.30) }}>

                <p className="hud-text" style={{ fontSize: '0.26rem', letterSpacing: '0.44em', color: '#ff8c00', opacity: 0.22, marginBottom: '0.65rem' }}>
                  TOURING CREDITS
                </p>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {touringCredits.map(({ artistName, role, context }, i) => (
                    <div
                      key={artistName}
                      style={{
                        padding: '0.65rem 0',
                        borderBottom: `1px solid rgba(255,140,0,${i === 0 ? 0.1 : 0.04})`,
                      }}
                    >
                      <p className="hud-text" style={{ fontSize: '0.21rem', letterSpacing: '0.34em', color: '#ff8c00', opacity: 0.18, marginBottom: '0.25rem' }}>
                        {String(i + 1).padStart(2, '0')}
                      </p>
                      <p
                        className="serif-text"
                        style={{
                          fontSize: 'clamp(0.85rem, 1.3vw, 1.05rem)',
                          fontWeight: 400,
                          color: '#f5e6d0',
                          letterSpacing: '0.04em',
                          lineHeight: 1.15,
                          marginBottom: '0.25rem',
                          opacity: 0.88,
                        }}
                      >
                        {artistName}
                      </p>
                      <p className="hud-text" style={{ fontSize: '0.23rem', letterSpacing: '0.18em', color: '#ff8c00', opacity: 0.32 }}>
                        {role}{context ? `  //  ${context}` : ''}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Specialties */}
                <div style={{ marginTop: '1.2rem' }}>
                  <p className="hud-text" style={{ fontSize: '0.26rem', letterSpacing: '0.44em', color: '#ff8c00', opacity: 0.22, marginBottom: '0.5rem' }}>
                    SPECIALTIES
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {specialties.map((s) => (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,140,0,0.32)', flexShrink: 0 }} />
                        <span className="hud-text" style={{ fontSize: '0.23rem', letterSpacing: '0.2em', color: '#ff8c00', opacity: 0.28 }}>
                          {s}
                        </span>
                      </div>
                    ))}
                  </div>
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

          <h2
            className="serif-text"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              fontWeight: 300,
              color: '#ffffff',
              letterSpacing: '0.05em',
              marginBottom: '2rem',
              textAlign: 'center',
            }}
          >
            Engineering
          </h2>

          {/* Premium Portfolio gallery */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '2rem',
              width: '100%',
              maxWidth: '1200px',
              padding: '0 2rem',
              maxHeight: '65vh',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none', // IE and Edge
            }}
          >
            {activeDevProjects.map((p) => {
              const cardStyle = {
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column' as const,
                cursor: p.url ? 'pointer' : 'default',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 0.4s ease, box-shadow 0.4s ease',
              };
              
              const cardContent = (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <span className="hud-text" style={{ fontSize: '0.6rem', color: '#888', opacity: 0.5 }}>{p.num}</span>
                    <span className="hud-text" style={{ fontSize: '0.5rem', color: '#00ff88', opacity: 0.7, padding: '0.3rem 0.6rem', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '12px' }}>{p.status}</span>
                  </div>
                  
                  <h3 className="serif-text" style={{ fontSize: '1.8rem', fontWeight: 300, color: '#fff', marginBottom: '0.6rem' }}>{p.name}</h3>
                  <p className="sans-text" style={{ fontSize: '0.95rem', color: '#ccc', lineHeight: 1.5, opacity: 0.8, marginBottom: '2rem', flex: 1 }}>{p.desc}</p>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: 'auto' }}>
                    {p.tech?.map((t) => (
                      <span key={t} className="sans-text" style={{ fontSize: '0.7rem', padding: '0.3rem 0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', color: '#aaa' }}>{t}</span>
                    ))}
                  </div>
                </>
              );
              return p.url ? (
                <a
                  key={p._id}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-panel magnetic-btn"
                  style={cardStyle}
                >
                  {cardContent}
                </a>
              ) : (
                <div key={p._id} className="glass-panel" style={cardStyle}>
                  {cardContent}
                </div>
              );
            })}
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
          }}
        >
          {/* Section header */}
          <p
            className="hud-text"
            style={{ fontSize: '0.45rem', letterSpacing: '0.4em', color: '#888', opacity: 0.4 }}
          >
            SELECTED WORK  //  WEB
          </p>

          {/* Single browser mockup with tab switcher */}
          <SelectedWorkBrowser projects={activeWebProjects} />
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
              {aviationCallsign}  //  {aviationCertLabel}
            </p>

            <div style={{ width: '80px', height: '1px', background: 'rgba(68,68,68,0.3)', margin: '0.5rem 0' }} />

            <p
              className="hud-text"
              style={{ fontSize: '0.35rem', letterSpacing: '0.5em', color: '#333', opacity: 0.3 }}
            >
              {aviationCoordinates}
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
              {aviationGauges.map(({ label, value }) => (
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
