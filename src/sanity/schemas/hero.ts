import { defineField, defineType } from 'sanity';

export const hero = defineType({
  name: 'hero',
  title: 'Hero',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Full name displayed as the main headline.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'identities',
      title: 'Identities',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Rotating ticker labels (e.g. PILOT, PRODUCER, DEVELOPER).',
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'locationLabel',
      title: 'Location Label',
      type: 'string',
      description: 'e.g. VENTURA, CALIFORNIA',
    }),
    defineField({
      name: 'coordinates',
      title: 'Coordinates',
      type: 'string',
      description: 'e.g. 34.2746° N  119.2290° W',
    }),
    defineField({
      name: 'primaryPhoto',
      title: 'Primary Background Photo (Shoreline section — main hero image)',
      type: 'image',
      description:
        'The main full-screen background photo shown in the Shoreline / hero section at the top of the page. Falls back to the built-in surf paddle photo if not set.',
      options: { hotspot: true },
    }),
    defineField({
      name: 'accentPhoto',
      title: 'Secondary Background Photo (Shoreline section — accent layer)',
      type: 'image',
      description:
        'An optional second photo layered subtly on top of the primary. Falls back to the built-in surf ride photo if not set.',
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: 'name' },
  },
});
