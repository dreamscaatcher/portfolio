// src/lib/sanity.ts
import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET ?? 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
});

export interface Book {
  title: string;
  author: string;
  year: number;
  description: string;
  pdfUrl: string | null;
  coverUrl: string | null;
}

export async function getBook(): Promise<Book | null> {
  return sanityClient.fetch<Book | null>(
    `*[_type == "book"][0]{
      title,
      author,
      year,
      description,
      "pdfUrl": pdfFile.asset->url,
      "coverUrl": coverImage.asset->url
    }`
  );
}
