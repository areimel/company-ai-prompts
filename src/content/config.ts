// 1. Import utilities from `astro:content`
import { z, defineCollection } from 'astro:content';

// 2. Define your collection(s)
const blogCollection = defineCollection({
  schema: z.object({
    draft: z.boolean().optional(),
    title: z.string(),
    snippet: z.string(),
    image: z.object({
      src: z.string(),
      alt: z.string()
    }).optional(),
    publishDate: z.string().transform(str => new Date(str)),
    category: z.string(),
    author: z.string(),
    tags: z.array(z.string())
  }),
});

const promptsCollection = defineCollection({
  schema: z.object({
    draft: z.boolean(),
    title: z.string(),
    description: z.string(),
    usage_instructions: z.string(),
    category: z.enum([
      'Coding',
      'Writing',
      'Analysis',
      'Creative',
      'Business',
      'Marketing',
      'Other'
    ]),
    sub_category: z.enum([
      'Cursor',
      'ChatGPT',
      'Claude',
      'Gemini',
      'MidJourney',
      'Other'
    ]),
    template: z.boolean().default(false).optional(), // Optional template field with default value false
    tags: z.array(z.string()),
    version: z.string().default('1.0'),
    author: z.string().default('Anonymous'),
    publishDate: z.string().transform(str => new Date(str)),
    lastUpdated: z.string().transform(str => new Date(str)),
    featured: z.boolean().default(false),
  }),
});

const teamCollection = defineCollection({
  schema: z.object({
    draft: z.boolean(),
    name: z.string(),
    title: z.string(),
    avatar: z.object({
      src: z.string(),
      alt: z.string(),
    }),
    publishDate: z.string().transform(str => new Date(str)),
  }),
});

// 3. Export a single `collections` object to register your collection(s)
//    This key should match your collection directory name in "src/content"
export const collections = {
  'blog': blogCollection,
  'prompts': promptsCollection,
  'team': teamCollection,
};