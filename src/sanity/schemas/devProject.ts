import { defineArrayMember, defineField, defineType } from 'sanity';

export const devProject = defineType({
  name: 'devProject',
  title: 'Development Project',
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
      name: 'num',
      title: 'Display Number',
      type: 'string',
      description: 'Display number (e.g. 01, 02).',
      fieldset: 'meta',
    }),
    defineField({
      name: 'name',
      title: 'Project Name',
      type: 'string',
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
      fieldset: 'content',
    }),
    defineField({
      name: 'url',
      title: 'Project URL',
      type: 'url',
      description: 'Link opened when the project card is clicked.',
      fieldset: 'meta',
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      description: 'e.g. SOLO BUILD, FULL STACK, LEAD DEV',
      fieldset: 'meta',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        layout: 'radio',
        list: [
          { title: 'Deployed', value: 'DEPLOYED' },
          { title: 'Live', value: 'LIVE' },
          { title: 'Beta', value: 'BETA' },
          { title: 'WIP', value: 'WIP' },
          { title: 'Archived', value: 'ARCHIVED' },
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
    select: { title: 'name', num: 'num', status: 'status' },
    prepare({ title, num, status }) {
      return {
        title,
        subtitle: [num, status].filter(Boolean).join(' • '),
      };
    },
  },
});
