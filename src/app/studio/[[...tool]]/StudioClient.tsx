'use client';

import dynamic from 'next/dynamic';

const Studio = dynamic(
  async () => {
    const [{ NextStudio }, { default: config }] = await Promise.all([
      import('next-sanity/studio'),
      import('../../../../sanity.config'),
    ]);
    function StudioInner() {
      return <NextStudio config={config} />;
    }
    return StudioInner;
  },
  { ssr: false }
);

export function StudioClient() {
  return <Studio />;
}
