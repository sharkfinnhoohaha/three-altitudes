import { defineArrayMember, defineField, defineType } from 'sanity';

export const aviation = defineType({
  name: 'aviation',
  title: 'Aviation',
  type: 'document',
  fieldsets: [
    {
      name: 'content',
      title: 'Flight Identity',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'display',
      title: 'Display Data',
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
      name: 'callsign',
      title: 'Callsign',
      type: 'string',
      description: 'e.g. N12345',
      fieldset: 'content',
    }),
    defineField({
      name: 'certLabel',
      title: 'Certificate Label',
      type: 'string',
      description: 'e.g. COMMERCIAL PILOT',
      fieldset: 'content',
    }),
    defineField({
      name: 'coordinates',
      title: 'Coordinates',
      type: 'string',
      description: 'e.g. 34°12′48″N  //  119°05′39″W',
      fieldset: 'display',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Italic serif quote (e.g. From altitude, everything is pattern.)',
      fieldset: 'display',
    }),
    defineField({
      name: 'gauges',
      title: 'Flight Gauges',
      type: 'array',
      fieldset: 'display',
      of: [
        defineArrayMember({
          name: 'gaugeItem',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', description: 'e.g. ALTITUDE' }),
            defineField({ name: 'value', title: 'Value', type: 'string', description: 'e.g. +5,200 FT' }),
          ],
          preview: { select: { title: 'label', subtitle: 'value' } },
        }),
      ],
    }),
    defineField({
      name: 'beaconLinks',
      title: 'Beacon Links',
      type: 'array',
      fieldset: 'display',
      of: [
        defineArrayMember({
          name: 'beaconItem',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', description: 'e.g. @FINN.BENNETT' }),
            defineField({ name: 'href', title: 'URL', type: 'url' }),
            defineField({ name: 'sub', title: 'Sub-label', type: 'string', description: 'e.g. INSTAGRAM' }),
          ],
          preview: { select: { title: 'label', subtitle: 'sub' } },
        }),
      ],
    }),
    defineField({
      name: 'primaryPhoto',
      title: 'Primary Background Photo',
      type: 'image',
      description: 'The main full-screen background photo shown in the aviation section.',
      options: { hotspot: true },
      fieldset: 'media',
    }),
    defineField({
      name: 'accentPhoto',
      title: 'Secondary Background Photo',
      type: 'image',
      description: 'An optional second photo layered on top of the primary in the aviation section.',
      options: { hotspot: true },
      fieldset: 'media',
    }),
  ],
  preview: {
    select: { title: 'callsign', subtitle: 'certLabel' },
  },
});
