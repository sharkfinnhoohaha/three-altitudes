import { createClient } from 'next-sanity';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export const isSanityConfigured = Boolean(projectId);

export const client = createClient({
  projectId: projectId || 'missing-project-id',
  dataset,
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
  stega: {
    studioUrl: '/studio',
  },
});
