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
      <div
        className="hud-text"
        style={{
          position: 'fixed',
          top: '2rem',
          left: '2rem',
          zIndex: 10,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        <span
          style={{
            fontSize: '0.55rem',
            letterSpacing: '0.25em',
            color,
            opacity: 0.85,
            transition: 'color 0.8s ease, opacity 0.8s ease',
          }}
        >
          {primaryLabel}
        </span>
        <span
          style={{
            fontSize: '0.42rem',
            letterSpacing: '0.3em',
            color,
            opacity: 0.35,
            transition: 'color 0.8s ease',
          }}
        >
          {secondaryLabel}
        </span>

        {/* Altimeter — scrollY → altitude */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.4em',
            marginTop: '0.6rem',
            paddingTop: '0.5rem',
            borderTop: `1px solid ${color}22`,
          }}
        >
          <span
            style={{
              fontSize: '0.35rem',
              letterSpacing: '0.3em',
              color,
              opacity: 0.35,
              transition: 'color 0.8s ease',
            }}
          >
            ALT
          </span>
          <span
            style={{
              fontSize: '0.65rem',
              letterSpacing: '0.12em',
              color,
              opacity: 0.8,
              fontVariantNumeric: 'tabular-nums',
              transition: 'color 0.8s ease',
            }}
          >
            {altDisplay}
          </span>
          <span
            style={{
              fontSize: '0.32rem',
              letterSpacing: '0.25em',
              color,
              opacity: 0.35,
              transition: 'color 0.8s ease',
            }}
          >
            FT MSL
          </span>
        </div>
      </div>

      <div
        className="hud-text"
        style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
          zIndex: 10,
          pointerEvents: 'none',
          fontSize: '0.42rem',
          letterSpacing: '0.35em',
          color,
          opacity: 0.2,
          transition: 'color 0.8s ease',
        }}
      >
        FINN BENNETT
      </div>

      <div
        style={{
          position: 'fixed',
          right: '2rem',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '1px',
          height: '100px',
          background: 'rgba(255,255,255,0.06)',
          zIndex: 10,
          borderRadius: '1px',
          overflow: 'visible',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: '100%',
            height: `${progress * 100}%`,
            background: color,
            transition: 'background 0.8s ease',
            borderRadius: '1px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '-2px',
            top: `${progress * 100}%`,
            width: '5px',
            height: '1px',
            background: color,
            transition: 'background 0.8s ease',
          }}
        />
      </div>

      <div
        className="hud-text"
        style={{
          position: 'fixed',
          right: '2rem',
          top: 'calc(50% + 62px)',
          fontSize: '0.42rem',
          letterSpacing: '0.2em',
          opacity: 0.2,
          color,
          zIndex: 10,
          pointerEvents: 'none',
          transition: 'color 0.8s ease',
        }}
      >
        {(progress * 100).toFixed(0).padStart(3, '0')}
      </div>
    </>
  );
}
