import { defineField, defineType } from 'sanity';

export const audioWork = defineType({
  name: 'audioWork',
  title: 'Audio Work',
  type: 'document',
  fields: [
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      description: 'Studio/brand name shown above the section title (e.g. OVERLOOK AUDIO).',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'sectionTitle',
      title: 'Section Title',
      type: 'string',
      description: 'Large serif heading (e.g. The Work).',
    }),
    defineField({
      name: 'spotifyPlaylistId',
      title: 'Spotify Playlist ID',
      type: 'string',
      description: 'The ID portion of the Spotify playlist URL (not the full URL).',
    }),
    defineField({
      name: 'tracks',
      title: 'Featured Tracks',
      type: 'array',
      description: 'Individual tracks to showcase in the Sonic Work section. Each track links to Spotify.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'trackName', title: 'Track Name', type: 'string' }),
            defineField({ name: 'artistName', title: 'Artist / Project Name', type: 'string' }),
            defineField({ name: 'albumName', title: 'Album / Release', type: 'string' }),
            defineField({
              name: 'albumArt',
              title: 'Album Art',
              type: 'image',
              options: { hotspot: true },
            }),
            defineField({ name: 'spotifyUrl', title: 'Spotify Track URL', type: 'url' }),
            defineField({ name: 'role', title: 'Your Role', type: 'string', description: 'e.g. Producer, FOH Engineer' }),
          ],
          preview: { select: { title: 'trackName', subtitle: 'artistName', media: 'albumArt' } },
        },
      ],
    }),
    defineField({
      name: 'stats',
      title: 'Stats',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'value', title: 'Value', type: 'string', description: 'e.g. 8M+' }),
            defineField({ name: 'label', title: 'Label', type: 'string', description: 'e.g. STREAMS' }),
          ],
          preview: { select: { title: 'value', subtitle: 'label' } },
        },
      ],
    }),
    defineField({
      name: 'touringCredits',
      title: 'Touring Credits',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'artistName', title: 'Artist Name', type: 'string' }),
            defineField({ name: 'role', title: 'Role', type: 'string', description: 'e.g. FOH · Touring' }),
          ],
          preview: { select: { title: 'artistName', subtitle: 'role' } },
        },
      ],
    }),
    defineField({
      name: 'disciplines',
      title: 'Disciplines',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'code', title: 'Code', type: 'string', description: 'Short label (e.g. LIVE FOH)' }),
            defineField({ name: 'description', title: 'Description', type: 'string', description: 'e.g. Touring front-of-house' }),
          ],
          preview: { select: { title: 'code', subtitle: 'description' } },
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'headline' },
  },
});
