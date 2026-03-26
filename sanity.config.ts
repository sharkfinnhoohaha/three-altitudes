import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { presentationTool, defineLocations } from 'sanity/presentation';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './src/sanity/schemas';

const singletonLocation = defineLocations({
  locations: [{ title: 'Home', href: '/' }],
});

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'hzmbpiur';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';

export default defineConfig({
  name: 'three-altitudes',
  title: 'Three Altitudes',
  basePath: '/studio',

  projectId,
  dataset,

  plugins: [
    presentationTool({
      resolve: {
        locations: {
          hero: singletonLocation,
          audioWork: singletonLocation,
          aviation: singletonLocation,
          siteSettings: singletonLocation,
          webProject: singletonLocation,
          devProject: singletonLocation,
        },
      },
      previewUrl: {
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
    }),
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // Singletons
            S.listItem()
              .title('Hero')
              .id('hero')
              .child(S.document().schemaType('hero').documentId('hero')),
            S.listItem()
              .title('Audio Work')
              .id('audioWork')
              .child(S.document().schemaType('audioWork').documentId('audioWork')),
            S.listItem()
              .title('Aviation')
              .id('aviation')
              .child(S.document().schemaType('aviation').documentId('aviation')),
            S.listItem()
              .title('Site Settings')
              .id('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            S.divider(),
            // Lists
            S.documentTypeListItem('webProject').title('Web Projects'),
            S.documentTypeListItem('devProject').title('Dev Projects'),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});
