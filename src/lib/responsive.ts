export const COMPACT_LAYOUT_MEDIA_QUERY = '(pointer: coarse), (max-width: 900px)';

/**
 * Returns true when running on a compact/mobile device (coarse pointer or narrow viewport).
 * Safe to call only in browser context (e.g. inside useMemo, useEffect, or R3F component setup).
 */
export function isCompactLayout(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(COMPACT_LAYOUT_MEDIA_QUERY).matches;
}
