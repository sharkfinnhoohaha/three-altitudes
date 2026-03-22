'use client';

import { useDraftModeEnvironment } from 'next-sanity/hooks';

export function DisableDraftMode() {
  const environment = useDraftModeEnvironment();

  // Don't show inside the Presentation Tool iframe
  if (environment !== 'live' && environment !== 'unknown') return null;

  return (
    <a
      href="/api/draft-mode/disable"
      className="fixed bottom-4 right-4 z-50 bg-black/80 text-white text-xs px-4 py-2 rounded border border-white/20 backdrop-blur"
    >
      Exit Preview
    </a>
  );
}
