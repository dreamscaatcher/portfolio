// sanity/schemas/book.ts
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'book',
  title: 'Book',
  type: 'document',
  fields: [
    defineField({ name: 'title',       type: 'string', title: 'Title',       validation: r => r.required() }),
    defineField({ name: 'author',      type: 'string', title: 'Author',      validation: r => r.required() }),
    defineField({ name: 'year',        type: 'number', title: 'Year' }),
    defineField({ name: 'description', type: 'text',   title: 'Description' }),
    defineField({ name: 'pdfFile',     type: 'file',   title: 'PDF File',    options: { accept: '.pdf' } }),
    defineField({ name: 'coverImage',  type: 'image',  title: 'Cover Image', options: { hotspot: true } }),
  ],
});
