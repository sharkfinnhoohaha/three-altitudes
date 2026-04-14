'use client';

import { useScroll, type Atmosphere } from '@/contexts/ScrollContext';

interface AtmosphereConfig {
  primaryLabel: string;
  secondaryLabel: string;
  color: string;
}

const ATMOSPHERE_CONFIG: Record<Atmosphere, AtmosphereConfig> = {
  shoreline: {
    primaryLabel: '34.2746° N  119.2290° W',
    secondaryLabel: 'VENTURA, CA',
    color: '#3dd9c4',
  },
  pocket: {
    primaryLabel: 'OVERLOOK AUDIO',
    secondaryLabel: 'SONIC ARCHIVE // ACTIVE',
    color: '#ff8c00',
  },
  'engine-room': {
    primaryLabel: 'OVERLOOK STRATEGY',
    secondaryLabel: 'SYSTEMS // DEVELOPMENT',
    color: '#888888',
  },
  'selected-work': {
    primaryLabel: 'FINN BENNETT',
    secondaryLabel: 'WEB // DESIGN + DEV',
    color: '#888888',
  },
  horizon: {
    primaryLabel: 'MSL +5,200 FT',
    secondaryLabel: 'KCMA → KVTA // IFR CLR',
    color: '#444444',
  },
};

export function HUD() {
  const { progress, atmosphere, scrollY, maxScroll } = useScroll();

  const config = ATMOSPHERE_CONFIG[atmosphere] || ATMOSPHERE_CONFIG.shoreline;
  const { primaryLabel, secondaryLabel, color } = config;

  // ── Altimeter — maps scrollY to simulated altitude (0 – 5 200 ft MSL) ───────
  const altitudeRaw = Math.round((scrollY / Math.max(maxScroll, 1)) * 5200);
  const altitudeFt = Math.round(altitudeRaw / 100) * 100;
  const altDisplay = altitudeFt.toLocaleString('en-US');

  return (
    <>
      {/* Premium Top Navigation Bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          padding: '2rem 3rem',
          zIndex: 50,
          pointerEvents: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span
            className="sans-text"
            style={{
              fontSize: '0.85rem',
              fontWeight: 500,
              letterSpacing: '0.15em',
              color: '#ffffff',
              opacity: 0.9,
            }}
          >
            FINN BENNETT
          </span>
          <span
            className="hud-text"
            style={{
              fontSize: '0.5rem',
              letterSpacing: '0.3em',
              color,
              opacity: 0.6,
              transition: 'color 0.8s ease',
            }}
          >
            {primaryLabel}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <span
            className="hud-text"
            style={{
              fontSize: '0.55rem',
              letterSpacing: '0.25em',
              color,
              opacity: 0.6,
              transition: 'color 0.8s ease',
            }}
          >
            {secondaryLabel}
          </span>
          
          <div
            style={{
              width: '40px',
              height: '2px',
              background: color,
              opacity: 0.4,
              transition: 'background 0.8s ease',
            }}
          />
        </div>
      </div>
    </>
  );
}
