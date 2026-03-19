'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useScroll } from '@/contexts/ScrollContext';

const IDENTITIES = ['PILOT', 'PRODUCER', 'DEVELOPER'];

/**
 * ScrollSections — 4-stage cinematic HTML overlay.
 *
 * Stage 1 — Shoreline (0–25%):  Identity. FINN BENNETT title card + surf photos.
 * Stage 2 — Pocket (26–50%):    The Visceral. Live drum photos + touring archive.
 * Stage 3 — Engine Room (51–75%): The Systems. Overlook modules with logo.
 * Stage 4 — Horizon (76–100%):  The Perspective. LA altitude shot + HUD data.
 *
 * Total scroll height: 800vh (200vh × 4 stages)
 */
export function ScrollSections() {
  const { atmosphere } = useScroll();
  const [identityIndex, setIdentityIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIdentityIndex((i) => (i + 1) % IDENTITIES.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const show = (zone: typeof atmosphere) => atmosphere === zone;

  return (
    <div className="scroll-content" style={{ height: '800vh' }}>

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
          {/* B&W paddle photo — floated hard left, cropped portrait */}
          <div
            style={{
              position: 'absolute',
              left: '4vw',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 'clamp(140px, 16vw, 220px)',
              aspectRatio: '3/4',
              overflow: 'hidden',
              opacity: 0.22,
              mixBlendMode: 'screen',
            }}
          >
            <Image
              src="/images/finn-surf-paddle-bw.jpg"
              alt=""
              fill
              style={{ objectFit: 'cover', objectPosition: 'center top' }}
              sizes="220px"
              priority
            />
          </div>

          {/* Surf portrait — floated hard right */}
          <div
            style={{
              position: 'absolute',
              right: '4vw',
              top: '50%',
              transform: 'translateY(-55%)',
              width: 'clamp(100px, 12vw, 180px)',
              aspectRatio: '3/4',
              overflow: 'hidden',
              opacity: 0.18,
              mixBlendMode: 'screen',
            }}
          >
            <Image
              src="/images/finn-surf.jpg"
              alt=""
              fill
              style={{ objectFit: 'cover', objectPosition: 'center top' }}
              sizes="180px"
            />
          </div>

          {/* ── Centre identity block ── */}
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

          {/* Cycling identity */}
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
              fontSize: '0.5rem',
              letterSpacing: '0.35em',
              color: '#3dd9c4',
              opacity: 0.3,
              zIndex: 1,
            }}
          >
            VENTURA, CALIFORNIA  //  34.2746° N  119.2290° W
          </p>
        </div>
      </section>

      {/* ─── Stage 2: The Pocket — The Visceral ───────────────────────── */}
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
          {/* Live photo — Finn at The Mint, left side */}
          <div
            style={{
              position: 'absolute',
              left: '5vw',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 'clamp(130px, 14vw, 200px)',
              aspectRatio: '2/3',
              overflow: 'hidden',
              opacity: 0.35,
              mixBlendMode: 'screen',
            }}
          >
            <Image
              src="/images/finn-drums-mint.jpg"
              alt=""
              fill
              style={{ objectFit: 'cover', objectPosition: 'center top' }}
              sizes="200px"
            />
          </div>

          {/* Band shot — right side */}
          <div
            style={{
              position: 'absolute',
              right: '5vw',
              top: '50%',
              transform: 'translateY(-48%)',
              width: 'clamp(140px, 16vw, 220px)',
              aspectRatio: '4/3',
              overflow: 'hidden',
              opacity: 0.28,
              mixBlendMode: 'screen',
            }}
          >
            <Image
              src="/images/finn-drums-live.jpg"
              alt=""
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              sizes="220px"
            />
          </div>

          {/* Centre content */}
          <p
            className="hud-text"
            style={{
              fontSize: '0.5rem',
              letterSpacing: '0.4em',
              color: '#ff8c00',
              opacity: 0.5,
              marginBottom: '1.5rem',
              zIndex: 1,
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
              zIndex: 1,
            }}
          >
            Sonic Work
          </h2>

          <div
            style={{
              marginTop: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              alignItems: 'center',
              zIndex: 1,
            }}
          >
            {[
              { band: 'MINERAL KING', role: 'LIVE PRODUCTION // TOURING' },
              { band: 'SUBLIME, STRANGE CASE', role: 'FRONT OF HOUSE // ENGINEERING' },
            ].map(({ band, role }) => (
              <div key={band} style={{ textAlign: 'center' }}>
                <p className="hud-text" style={{ fontSize: '0.6rem', letterSpacing: '0.3em', color: '#ff8c00', opacity: 0.8 }}>
                  {band}
                </p>
                <p className="hud-text" style={{ fontSize: '0.45rem', letterSpacing: '0.3em', color: '#ff8c00', opacity: 0.3, marginTop: '0.2rem' }}>
                  {role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stage 3: The Engine Room — The Systems ───────────────────── */}
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
            gap: '1rem',
          }}
        >
          <p
            className="hud-text"
            style={{ fontSize: '0.5rem', letterSpacing: '0.4em', color: '#888', opacity: 0.5, marginBottom: '1rem' }}
          >
            OVERLOOK SYSTEMS
          </p>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>

            {/* Module 01 — Overlook Strategy */}
            <div
              style={{
                border: '1px solid rgba(136,136,136,0.2)',
                padding: '2rem 2.5rem',
                minWidth: '220px',
                position: 'relative',
                backdropFilter: 'blur(8px)',
                background: 'rgba(255,255,255,0.025)',
              }}
            >
              <p className="hud-text" style={{ fontSize: '0.45rem', letterSpacing: '0.3em', color: '#888', opacity: 0.5, marginBottom: '1.2rem' }}>
                MODULE_01
              </p>
              {/* Overlook logo mark */}
              <div style={{ marginBottom: '1rem', opacity: 0.4, width: 36, height: 36, position: 'relative' }}>
                <Image src="/images/overlook-logo.png" alt="Overlook" fill style={{ objectFit: 'contain' }} sizes="36px" />
              </div>
              <h3
                className="serif-text"
                style={{ fontSize: '1.4rem', fontWeight: 400, color: '#ccc', letterSpacing: '0.06em', marginBottom: '0.75rem' }}
              >
                Overlook Strategy
              </h3>
              <p className="hud-text" style={{ fontSize: '0.45rem', letterSpacing: '0.2em', color: '#666', lineHeight: 1.8 }}>
                BRANDING  //  WEB DEVELOPMENT
                <br />
                DIGITAL SYSTEMS  //  IDENTITY
              </p>
              <div style={{ position: 'absolute', top: -1, right: -1, width: 8, height: 8, borderTop: '1px solid #888', borderRight: '1px solid #888' }} />
              <div style={{ position: 'absolute', bottom: -1, left: -1, width: 8, height: 8, borderBottom: '1px solid #888', borderLeft: '1px solid #888' }} />
            </div>

            {/* Module 02 — Overlook Audio */}
            <div
              style={{
                border: '1px solid rgba(136,136,136,0.2)',
                padding: '2rem 2.5rem',
                minWidth: '220px',
                position: 'relative',
                backdropFilter: 'blur(8px)',
                background: 'rgba(255,255,255,0.025)',
              }}
            >
              <p className="hud-text" style={{ fontSize: '0.45rem', letterSpacing: '0.3em', color: '#888', opacity: 0.5, marginBottom: '1.2rem' }}>
                MODULE_02
              </p>
              {/* Reuse logo for Audio module too */}
              <div style={{ marginBottom: '1rem', opacity: 0.4, width: 36, height: 36, position: 'relative' }}>
                <Image src="/images/overlook-logo.png" alt="Overlook" fill style={{ objectFit: 'contain' }} sizes="36px" />
              </div>
              <h3
                className="serif-text"
                style={{ fontSize: '1.4rem', fontWeight: 400, color: '#ccc', letterSpacing: '0.06em', marginBottom: '0.75rem' }}
              >
                Overlook Audio
              </h3>
              <p className="hud-text" style={{ fontSize: '0.45rem', letterSpacing: '0.2em', color: '#666', lineHeight: 1.8 }}>
                LIVE PRODUCTION  //  STUDIO
                <br />
                SIGNAL ENGINEERING  //  TOURING
              </p>
              <div style={{ position: 'absolute', top: -1, right: -1, width: 8, height: 8, borderTop: '1px solid #888', borderRight: '1px solid #888' }} />
              <div style={{ position: 'absolute', bottom: -1, left: -1, width: 8, height: 8, borderBottom: '1px solid #888', borderLeft: '1px solid #888' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stage 4: The Horizon — The Perspective ───────────────────── */}
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
          }}
        >
          {/* LA altitude photo — full bleed background, faint */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              overflow: 'hidden',
            }}
          >
            <Image
              src="/images/la-altitude.jpg"
              alt=""
              fill
              style={{
                objectFit: 'cover',
                objectPosition: 'center 40%',
                opacity: 0.12,
                mixBlendMode: 'multiply',
              }}
              sizes="100vw"
            />
          </div>

          {/* Content */}
          <div
            style={{
              width: '120px',
              height: '1px',
              background: 'rgba(68,68,68,0.3)',
              marginBottom: '2.5rem',
              zIndex: 1,
            }}
          />

          <p
            className="hud-text"
            style={{ fontSize: '0.5rem', letterSpacing: '0.5em', color: '#333', opacity: 0.4, zIndex: 1 }}
          >
            34.2746° N  //  119.2290° W
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
              marginTop: '0.75rem',
              marginBottom: '0.75rem',
              zIndex: 1,
            }}
          >
            From altitude, everything is pattern.
          </h2>

          <div style={{ display: 'flex', gap: '3rem', marginTop: '2rem', zIndex: 1 }}>
            {[
              { label: 'ALTITUDE', value: '+5,200 FT' },
              { label: 'HEADING', value: '270° W' },
              { label: 'ORIGIN', value: 'VNY' },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p className="hud-text" style={{ fontSize: '0.45rem', letterSpacing: '0.3em', color: '#999', marginBottom: '0.3rem' }}>
                  {label}
                </p>
                <p className="hud-text" style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: '#333' }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div style={{ width: '120px', height: '1px', background: 'rgba(68,68,68,0.3)', marginTop: '2.5rem', zIndex: 1 }} />
        </div>
      </section>

    </div>
  );
}
