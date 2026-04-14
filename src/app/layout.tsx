import type { Metadata, Viewport } from 'next';
import { draftMode } from 'next/headers';
import { VisualEditing } from 'next-sanity/visual-editing';
import { ScrollProvider } from '@/contexts/ScrollContext';
import { SanityLive } from '@/lib/sanity/live';
import { DisableDraftMode } from '@/components/ui/DisableDraftMode';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Finn Bennett — The Three Altitudes',
  description: 'A cinematic portfolio traversing Music, Ocean, and Aviation.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* JetBrains Mono — HUD / technical data */}
        {/* Cormorant Garamond — cinematic identity / title cards */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ScrollProvider>{children}</ScrollProvider>
        <SanityLive />
        {(await draftMode()).isEnabled && (
          <>
            <DisableDraftMode />
            <VisualEditing />
          </>
        )}
      </body>
    </html>
  );
}
