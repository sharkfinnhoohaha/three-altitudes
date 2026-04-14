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
        width="36"
        height="36"
        viewBox="-18 -18 36 36"
        style={{ transform: 'translate(-50%, -50%)' }}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Fuselage — narrow teardrop, nose at top */}
        <polygon points="0,-14 3.5,-2 0,2 -3.5,-2" fill="#1a1a1a" opacity="0.90" />
        {/* Wings — swept horizontal span */}
        <polygon points="-13,2 0,-2 13,2 0,5.5" fill="#1a1a1a" opacity="0.85" />
        {/* Horizontal stabiliser */}
        <polygon points="-5.5,8.5 0,6 5.5,8.5 0,10.5" fill="#1a1a1a" opacity="0.80" />
      </svg>
    </div>
  );
}
