import { defineArrayMember, defineField, defineType } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fieldsets: [
    {
      name: 'contact',
      title: 'Contact Details',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'media',
      title: 'Media',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'social',
      title: 'Social Links',
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      fieldset: 'contact',
    }),
    defineField({
      name: 'email',
      title: 'Contact Email',
      type: 'string',
      fieldset: 'contact',
    }),
    defineField({
      name: 'heroVideo',
      title: 'Hero Background Video',
      type: 'file',
      description: 'Video displayed fullscreen on the Shoreline (landing) section. Replaces the built-in wave video.',
      options: { accept: 'video/*' },
      fieldset: 'media',
    }),
    defineField({
      name: 'engineRoomVideo',
      title: 'Engine Room Background Video',
      type: 'file',
      description: 'Background video for the Engine Room (dev/code) section. Falls back to built-in code-bg.mp4 if not set.',
      options: { accept: 'video/*' },
      fieldset: 'media',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      fieldset: 'social',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'platform', title: 'Platform', type: 'string', description: 'e.g. Instagram, GitHub' }),
            defineField({ name: 'url', title: 'URL', type: 'url' }),
            defineField({ name: 'handle', title: 'Handle', type: 'string', description: 'e.g. @finn.bennett' }),
          ],
          preview: { select: { title: 'platform', subtitle: 'handle' } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'siteName', subtitle: 'email' },
  },
});
