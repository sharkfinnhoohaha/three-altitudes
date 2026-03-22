'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '../../../../sanity.config';

export function StudioClient() {
  return <NextStudio config={config} />;
}
