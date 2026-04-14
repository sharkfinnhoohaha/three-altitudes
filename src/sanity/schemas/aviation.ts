import { defineField, defineType } from 'sanity';

export const aviation = defineType({
  name: 'aviation',
  title: 'Aviation',
  type: 'document',
  fields: [
    defineField({
      name: 'callsign',
      title: 'Callsign',
      type: 'string',
      description: 'e.g. N12345',
    }),
    defineField({
      name: 'certLabel',
      title: 'Certificate Label',
      type: 'string',
      description: 'e.g. COMMERCIAL PILOT',
    }),
    defineField({
      name: 'coordinates',
      title: 'Coordinates',
      type: 'string',
      description: 'e.g. 34°12′48″N  //  119°05′39″W',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Italic serif quote (e.g. From altitude, everything is pattern.)',
    }),
    defineField({
      name: 'gauges',
      title: 'Flight Gauges',
      type: 'array',
      of: [
        {
          name: 'gaugeItem',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', description: 'e.g. ALTITUDE' }),
            defineField({ name: 'value', title: 'Value', type: 'string', description: 'e.g. +5,200 FT' }),
          ],
          preview: { select: { title: 'label', subtitle: 'value' } },
        },
      ],
    }),
    defineField({
      name: 'beaconLinks',
      title: 'Beacon Links',
      type: 'array',
      of: [
        {
          name: 'beaconItem',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', description: 'e.g. @FINN.BENNETT' }),
            defineField({ name: 'href', title: 'URL', type: 'url' }),
            defineField({ name: 'sub', title: 'Sub-label', type: 'string', description: 'e.g. INSTAGRAM' }),
          ],
          preview: { select: { title: 'label', subtitle: 'sub' } },
        },
      ],
    }),
    defineField({
      name: 'primaryPhoto',
      title: 'Primary Background Photo (Aviation section — main sky/flight image)',
      type: 'image',
      description:
        'The main full-screen background photo shown in the Aviation section at the bottom of the page. Falls back to a built-in aerial photo if not set.',
      options: { hotspot: true },
    }),
    defineField({
      name: 'accentPhoto',
      title: 'Secondary Background Photo (Aviation section — accent layer)',
      type: 'image',
      description:
        'An optional second photo layered subtly on top of the primary in the Aviation section.',
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: 'callsign', subtitle: 'tagline' },
  },
});
