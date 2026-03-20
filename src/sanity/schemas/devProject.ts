import { defineField, defineType } from 'sanity';

export const devProject = defineType({
  name: 'devProject',
  title: 'Dev Project',
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
      name: 'num',
      title: 'Number',
      type: 'string',
      description: 'Display number (e.g. 01, 02).',
    }),
    defineField({
      name: 'name',
      title: 'Project Name',
      type: 'string',
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
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      description: 'e.g. SOLO BUILD, FULL STACK, LEAD DEV',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Deployed', value: 'DEPLOYED' },
          { title: 'Live', value: 'LIVE' },
          { title: 'Beta', value: 'BETA' },
          { title: 'WIP', value: 'WIP' },
          { title: 'Archived', value: 'ARCHIVED' },
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
    select: { title: 'name', subtitle: 'status' },
  },
});
