import { defineArrayMember, defineField, defineType } from 'sanity';

export const audioWork = defineType({
  name: 'audioWork',
  title: 'Audio Work',
  type: 'document',
  fieldsets: [
    {
      name: 'content',
      title: 'Section Content',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'credits',
      title: 'Credits & Stats',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'media',
      title: 'Media',
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      description: 'Studio/brand name shown above the section title (e.g. OVERLOOK AUDIO).',
      validation: (r) => r.required(),
      fieldset: 'content',
    }),
    defineField({
      name: 'sectionTitle',
      title: 'Section Title',
      type: 'string',
      description: 'Large serif heading (e.g. The Work).',
      fieldset: 'content',
    }),
    defineField({
      name: 'spotifyPlaylistId',
      title: 'Spotify Playlist ID',
      type: 'string',
      description: 'The ID portion of the Spotify playlist URL (not the full URL).',
      fieldset: 'content',
    }),
    defineField({
      name: 'stats',
      title: 'Credential Stats',
      type: 'array',
      description: 'Key numbers displayed in the Credentials column (e.g. 8M+ Streams).',
      fieldset: 'credits',
      of: [
        defineArrayMember({
          name: 'statItem',
          type: 'object',
          fields: [
            defineField({ name: 'value', title: 'Value', type: 'string', description: 'e.g. 8M+' }),
            defineField({ name: 'label', title: 'Label', type: 'string', description: 'e.g. STREAMS' }),
            defineField({ name: 'sub', title: 'Sub-label', type: 'string', description: 'Small caption beneath the label (e.g. catalog total).' }),
          ],
          preview: { select: { title: 'value', subtitle: 'label' } },
        }),
      ],
    }),
    defineField({
      name: 'touringCredits',
      title: 'Touring Credits',
      type: 'array',
      description: 'Artists and projects listed in the Touring Credits column.',
      fieldset: 'credits',
      of: [
        defineArrayMember({
          name: 'creditItem',
          type: 'object',
          fields: [
            defineField({ name: 'artistName', title: 'Artist / Project Name', type: 'string' }),
            defineField({ name: 'role', title: 'Role', type: 'string', description: 'e.g. Front of House' }),
            defineField({ name: 'context', title: 'Context', type: 'string', description: 'e.g. Touring, Engineering, Studio' }),
          ],
          preview: { select: { title: 'artistName', subtitle: 'role' } },
        }),
      ],
    }),
    defineField({
      name: 'disciplines',
      title: 'Disciplines',
      type: 'array',
      description: 'Signal-chain disciplines shown in the left column (e.g. LIVE FOH, STUDIO, PRODUCTION).',
      fieldset: 'content',
      of: [
        defineArrayMember({
          name: 'disciplineItem',
          type: 'object',
          fields: [
            defineField({ name: 'code', title: 'Short Label', type: 'string', description: 'Uppercase abbreviation displayed on screen (e.g. LIVE FOH).' }),
            defineField({ name: 'description', title: 'Description', type: 'string', description: 'Full description shown on hover or in detail view (e.g. Touring front-of-house).' }),
          ],
          preview: { select: { title: 'code', subtitle: 'description' } },
        }),
      ],
    }),
    defineField({
      name: 'specialties',
      title: 'Specialties',
      type: 'array',
      description: 'Bullet-point specialties listed in the Touring Credits column (e.g. FRONT OF HOUSE, MIX ENGINEERING).',
      fieldset: 'credits',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'primaryPhoto',
      title: 'Primary Background Media',
      type: 'object',
      description: 'The main full-screen background media shown behind the audio section. Upload either an image or a video.',
      fieldset: 'media',
      fields: [
        defineField({
          name: 'image',
          title: 'Image',
          type: 'image',
          options: { hotspot: true },
          hidden: ({ parent }) => Boolean(parent?.video),
        }),
        defineField({
          name: 'video',
          title: 'Video',
          type: 'file',
          options: { accept: 'video/*' },
          hidden: ({ parent }) => Boolean(parent?.image),
        }),
      ],
      validation: (r) =>
        r.custom((value) => {
          if (!value?.image && !value?.video) return true;
          if (value?.image && value?.video) return 'Choose either an image or a video, not both.';
          return true;
        }),
    }),
    defineField({
      name: 'accentPhoto',
      title: 'Secondary Background Media',
      type: 'object',
      description: 'An optional second background media layer shown on top of the primary behind the audio section.',
      fieldset: 'media',
      fields: [
        defineField({
          name: 'image',
          title: 'Image',
          type: 'image',
          options: { hotspot: true },
          hidden: ({ parent }) => Boolean(parent?.video),
        }),
        defineField({
          name: 'video',
          title: 'Video',
          type: 'file',
          options: { accept: 'video/*' },
          hidden: ({ parent }) => Boolean(parent?.image),
        }),
      ],
      validation: (r) =>
        r.custom((value) => {
          if (!value?.image && !value?.video) return true;
          if (value?.image && value?.video) return 'Choose either an image or a video, not both.';
          return true;
        }),
    }),
  ],
  preview: {
    select: { title: 'headline', subtitle: 'sectionTitle' },
  },
});
