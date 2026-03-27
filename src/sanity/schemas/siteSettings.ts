import { defineField, defineType } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Contact Email',
      type: 'string',
    }),
    defineField({
      name: 'engineRoomVideo',
      title: 'Engine Room Background Video',
      type: 'file',
      description: 'Background video for the Engine Room (dev/code) section. Falls back to built-in code-bg.mp4 if not set.',
      options: { accept: 'video/*' },
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'platform', title: 'Platform', type: 'string', description: 'e.g. Instagram, GitHub' }),
            defineField({ name: 'url', title: 'URL', type: 'url' }),
            defineField({ name: 'handle', title: 'Handle', type: 'string', description: 'e.g. @finn.bennett' }),
          ],
          preview: { select: { title: 'platform', subtitle: 'handle' } },
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'siteName' },
  },
});
