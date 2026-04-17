'use client';

import { useEffect, useRef, useState } from 'react';
import { useScroll, type Atmosphere } from '@/contexts/ScrollContext';

interface FlashConfig {
  label: string;
  sublabel: string;
  accentColor: string;
}

const FLASH_CONFIG: Record<Atmosphere, FlashConfig> = {
  shoreline: {
    label: 'THE SHORELINE',
    sublabel: 'VENTURA, CALIFORNIA  //  STAGE I',
    accentColor: '#3dd9c4',
  },
  pocket: {
    label: 'THE POCKET',
    sublabel: 'SONIC WORK  //  STAGE II',
    accentColor: '#ff8c00',
  },
  'engine-room': {
    label: 'THE ENGINE ROOM',
    sublabel: 'SYSTEMS + DEVELOPMENT  //  STAGE III',
    accentColor: '#888888',
  },
  'selected-work': {
    label: 'SELECTED WORK',
    sublabel: 'WEB + DESIGN  //  STAGE IV',
    accentColor: '#888888',
  },
  horizon: {
    label: 'THE HORIZON',
    sublabel: 'COMMERCIAL PILOT  //  STAGE V',
    accentColor: '#444444',
  },
};

export function SectionFlash() {
  const { atmosphere } = useScroll();
  const prevAtmosphere = useRef<Atmosphere>(atmosphere);
  const [visible, setVisible] = useState(false);
  const [currentAtmos, setCurrentAtmos] = useState<Atmosphere>(atmosphere);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Skip the very first render (page load)
    if (prevAtmosphere.current === atmosphere) return;
    prevAtmosphere.current = atmosphere;

    // Cancel any ongoing hide timer
    if (hideTimer.current) clearTimeout(hideTimer.current);

    setCurrentAtmos(atmosphere);
    setVisible(true);

    // Auto-hide after 900ms
    hideTimer.current = setTimeout(() => {
      setVisible(false);
    }, 900);

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [atmosphere]);

  const config = FLASH_CONFIG[currentAtmos];
  const isHorizon = currentAtmos === 'horizon';

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 45,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: visible ? 1 : 0,
        transition: visible ? 'opacity 0.15s ease' : 'opacity 0.55s ease',
      }}
    >
      {/* Horizontal accent bar — sweeps across */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent 0%, ${config.accentColor} 25%, ${config.accentColor} 75%, transparent 100%)`,
          opacity: visible ? 0.35 : 0,
          transform: `scaleX(${visible ? 1 : 0})`,
          transformOrigin: 'center',
          transition: visible
            ? 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s ease'
            : 'transform 0.4s ease, opacity 0.55s ease',
        }}
      />

      {/* Section title */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.6rem',
          transform: `translateY(${visible ? '0' : '8px'})`,
          transition: visible
            ? 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            : 'transform 0.4s ease',
        }}
      >
        <p
          className="serif-text"
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 3.5rem)',
            fontWeight: 300,
            fontStyle: 'italic',
            color: isHorizon ? '#2a2a2a' : '#ffffff',
            letterSpacing: '0.12em',
            lineHeight: 1,
            textShadow: isHorizon ? 'none' : '0 2px 20px rgba(0,0,0,0.6)',
          }}
        >
          {config.label}
        </p>
        <p
          className="hud-text"
          style={{
            fontSize: '0.5rem',
            letterSpacing: '0.45em',
            color: config.accentColor,
            opacity: 0.6,
          }}
        >
          {config.sublabel}
        </p>
      </div>
    </div>
  );
}
