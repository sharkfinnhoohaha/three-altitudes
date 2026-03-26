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
    defineField({
      name: 'photos',
      title: 'Photos / Videos',
      type: 'array',
      description: 'Background media for the Pocket section. Each item can be an image or a video file. Upload a video file (MP4/WebM) to replace a photo.',
      of: [
        {
          type: 'image',
          title: 'Image',
          options: { hotspot: true },
        },
        {
          type: 'file',
          title: 'Video',
          options: { accept: 'video/*' },
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'headline' },
  },
});
