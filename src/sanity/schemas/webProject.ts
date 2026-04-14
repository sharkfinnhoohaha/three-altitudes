import { defineArrayMember, defineField, defineType } from 'sanity';

export const webProject = defineType({
  name: 'webProject',
  title: 'Web Project',
  type: 'document',
  fieldsets: [
    {
      name: 'content',
      title: 'Project Details',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'meta',
      title: 'Display & Metadata',
      options: { collapsible: true, collapsed: false },
    },
  ],
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
      fieldset: 'content',
    }),
    defineField({
      name: 'domain',
      title: 'Domain',
      type: 'string',
      description: 'Shown in the browser mockup URL bar (e.g. overlookaudio.com).',
      validation: (r) => r.required(),
      fieldset: 'content',
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'Full URL loaded in the iframe preview.',
      validation: (r) => r.required(),
      fieldset: 'content',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      fieldset: 'content',
    }),
    defineField({
      name: 'tech',
      title: 'Tech Stack',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Technologies used (e.g. Next.js, Three.js, GSAP).',
      fieldset: 'content',
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      description: 'e.g. DESIGN + DEV',
      fieldset: 'meta',
    }),
    defineField({
      name: 'projectType',
      title: 'Project Type',
      type: 'string',
      options: {
        layout: 'radio',
        list: [
          { title: 'Agency Site', value: 'AGENCY SITE' },
          { title: 'Studio Site', value: 'STUDIO SITE' },
          { title: 'App', value: 'APP' },
          { title: 'Other', value: 'OTHER' },
        ],
      },
      fieldset: 'meta',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first.',
      fieldset: 'meta',
    }),
  ],
  preview: {
    select: { title: 'name', domain: 'domain', role: 'role' },
    prepare({ title, domain, role }) {
      return {
        title,
        subtitle: [domain, role].filter(Boolean).join(' • '),
      };
    },
  },
});
