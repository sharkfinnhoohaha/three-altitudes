import { defineField, defineType } from 'sanity';

export const webProject = defineType({
  name: 'webProject',
  title: 'Web Project',
  type: 'document',
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Project Name',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'domain',
      title: 'Domain',
      type: 'string',
      description: 'Shown in the browser mockup URL bar (e.g. overlookaudio.com).',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'Full URL loaded in the iframe preview.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'tech',
      title: 'Tech Stack',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Technologies used (e.g. Next.js, Three.js, GSAP).',
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      description: 'e.g. DESIGN + DEV',
    }),
    defineField({
      name: 'projectType',
      title: 'Project Type',
      type: 'string',
      options: {
        list: [
          { title: 'Agency Site', value: 'AGENCY SITE' },
          { title: 'Studio Site', value: 'STUDIO SITE' },
          { title: 'App', value: 'APP' },
          { title: 'Other', value: 'OTHER' },
        ],
      },
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first.',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'domain' },
  },
});
