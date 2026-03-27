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
      name: 'photos',
      title: 'Shoreline Background Media',
      type: 'array',
      description:
        'Background media for the Shoreline (hero) section. Slot 1 = primary surf/hero image, Slot 2 = secondary surf image. Falls back to built-in images if empty.',
      of: [
        { type: 'image', title: 'Image', options: { hotspot: true } },
        { type: 'file', title: 'Video', options: { accept: 'video/*' } },
      ],
    }),
  ],
  preview: {
    select: { title: 'name' },
  },
});
