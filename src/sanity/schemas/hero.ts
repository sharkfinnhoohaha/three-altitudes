import { defineArrayMember, defineField, defineType } from 'sanity';

export const hero = defineType({
  name: 'hero',
  title: 'Homepage Hero',
  type: 'document',
  fieldsets: [
    {
      name: 'content',
      title: 'Content',
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
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Full name displayed as the main headline.',
      validation: (r) => r.required(),
      fieldset: 'content',
    }),
    defineField({
      name: 'identities',
      title: 'Identities',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Rotating ticker labels (e.g. PILOT, PRODUCER, DEVELOPER).',
      validation: (r) => r.required().min(1),
      fieldset: 'content',
    }),
    defineField({
      name: 'locationLabel',
      title: 'Location Label',
      type: 'string',
      description: 'e.g. VENTURA, CALIFORNIA',
      fieldset: 'content',
    }),
    defineField({
      name: 'coordinates',
      title: 'Coordinates',
      type: 'string',
      description: 'e.g. 34.2746° N  119.2290° W',
      fieldset: 'content',
    }),
    defineField({
      name: 'primaryPhoto',
      title: 'Primary Background Photo',
      type: 'image',
      description: 'The main full-screen background photo shown in the homepage hero section.',
      options: { hotspot: true },
      fieldset: 'media',
    }),
    defineField({
      name: 'accentPhoto',
      title: 'Secondary Background Photo',
      type: 'image',
      description: 'An optional second photo layered on top of the primary hero image.',
      options: { hotspot: true },
      fieldset: 'media',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'locationLabel' },
  },
});
