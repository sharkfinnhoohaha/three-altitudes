import { createClient } from 'next-sanity';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'hzmbpiur';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';

export const isSanityConfigured = true;

export const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
});
