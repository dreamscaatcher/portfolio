// sanity/sanity.config.ts
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import book from './schemas/book';

export default defineConfig({
  name: 'portfolio',
  title: 'Portfolio CMS',
  projectId: 'll3vc1lz',
  dataset: 'production',
  plugins: [structureTool(), visionTool()],
  schema: { types: [book] },
});
