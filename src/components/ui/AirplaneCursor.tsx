'use client';

import { useEffect, useRef } from 'react';
import { useScroll } from '@/contexts/ScrollContext';

/**
 * AirplaneCursor — Horizon stage only.
 *
 * Replaces the default CSS cursor with an SVG airplane silhouette that:
 *   1. Follows the mouse exactly (position: fixed, rAF loop).
 *   2. Banks (Z-axis rotation) proportional to horizontal mouse velocity.
 *      Moving right → right wing dips (clockwise). Moving left → left wing dips.
 *
 * Velocity is measured in px/ms between consecutive mousemove events,
 * then smoothed with exponential decay so banking eases in/out naturally.
 */
export function AirplaneCursor() {
  const { atmosphere } = useScroll();
  const visible = atmosphere === 'horizon';

  const elRef      = useRef<HTMLDivElement>(null);
  const posRef     = useRef({ x: -200, y: -200 });
  const prevXRef   = useRef(-200);
  const prevTimeRef = useRef(0);
  const velRef     = useRef(0);   // smoothed horizontal velocity (px/s)
  const bankRef    = useRef(0);   // current bank angle (deg)
  const frameRef   = useRef(0);

  // Track mouse position + horizontal velocity
  useEffect(() => {
    if (!visible) return;

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      
      // Initialize refs on first movement to avoid velocity jump from 0/-200
      if (prevTimeRef.current === 0) {
        prevXRef.current = e.clientX;
        prevTimeRef.current = now;
      }

      const dt  = Math.max(now - prevTimeRef.current, 1);          // ms, min 1
      const dx  = e.clientX - prevXRef.current;
      velRef.current = (dx / dt) * 1000;  // px/s (signed: + = right)
      
      prevXRef.current  = e.clientX;
      prevTimeRef.current = now;
      posRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [visible]);

  // rAF loop: smooth bank angle + apply transform
  useEffect(() => {
    if (!visible) return;

    const tick = () => {
      if (elRef.current && posRef.current.x !== -200) {
        // Map velocity → target bank angle, clamped to ±32 °
        const targetBank = Math.max(-32, Math.min(32, velRef.current * 0.038));
        bankRef.current += (targetBank - bankRef.current) * 0.10;

        // Decay raw velocity between events
        velRef.current *= 0.88;

        const { x, y } = posRef.current;
        elRef.current.style.transform = `translate(${x}px, ${y}px) rotate(${bankRef.current}deg)`;
      }
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={elRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        willChange: 'transform',
      }}
    >
      {/*
        Airplane silhouette centred on the hot-spot.
        Nose points upward; positive rotation = right bank (clockwise in screen space).
        Dimensions match the previous CSS data-URI cursor (32 × 32 px).
      */}
      <svg
        width="38"
        height="38"
        viewBox="-19 -19 38 38"
        style={{ transform: 'translate(-50%, -50%)' }}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M0 -15 L1.4 -9.4 L2.3 -1.7 L10.5 1.6 L10.5 3.1 L2.15 2.2 L2.05 9.2 L4.5 12.6 L4.5 14.3 L0 11.2 L-4.5 14.3 L-4.5 12.6 L-2.05 9.2 L-2.15 2.2 L-10.5 3.1 L-10.5 1.6 L-2.3 -1.7 L-1.4 -9.4 Z"
          fill="#20262c"
          opacity="0.92"
        />
        <path
          d="M0 -15 L1.4 -9.4 L2.3 -1.7 L10.5 1.6 L10.5 3.1 L2.15 2.2 L2.05 9.2 L4.5 12.6 L4.5 14.3 L0 11.2 L-4.5 14.3 L-4.5 12.6 L-2.05 9.2 L-2.15 2.2 L-10.5 3.1 L-10.5 1.6 L-2.3 -1.7 L-1.4 -9.4 Z"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="0.5"
        />
        <circle cx="0" cy="-7.2" r="0.85" fill="rgba(230,245,255,0.9)" />
      </svg>
    </div>
  );
}
