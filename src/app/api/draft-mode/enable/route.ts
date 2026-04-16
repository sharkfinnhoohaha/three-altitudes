import { defineEnableDraftMode } from 'next-sanity/draft-mode';
import { client, isSanityConfigured } from '@/lib/sanity/client';

const { GET: enableDraftMode } = defineEnableDraftMode({
  client: client.withConfig({ token: process.env.SANITY_API_READ_TOKEN }),
});

export const GET = isSanityConfigured
  ? enableDraftMode
  : async function unavailableHandler() {
      return Response.json(
        { error: 'Sanity is not configured. Set NEXT_PUBLIC_SANITY_PROJECT_ID to enable draft mode.' },
        { status: 503 },
      );
    };
