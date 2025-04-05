# AI Prompts Directory - Project Plan

## Project Overview
Converting the Astroship template into an AI prompts directory website similar to cursor.directory/rules. The site will use the existing blog functionality to manage individual prompts, with a searchable directory-style landing page.

## Technical Stack
- Framework: Astro
- Styling: TailwindCSS
- Content: Markdown/MDX
- Search: Client-side search implementation

## Phase 1: Initial Setup & Content Structure (Week 1)
1. Modify content schema
   - Update blog post schema to match prompt requirements
   - Add new frontmatter fields: app_type, category, prompt_type
   - Create sample prompt posts for testing

2. Landing Page Redesign
   - Convert homepage to directory-style layout
   - Implement grid/list view of prompts
   - Add filtering UI components
   - Implement search functionality

## Phase 2: Features & Functionality (Week 2)
1. Search Implementation
   - Add client-side search functionality
   - Implement filtering by app type and category
   - Add tag-based filtering
   - Implement sort options (date, popularity)

2. Prompt Page Template
   - Design individual prompt page layout
   - Add copy-to-clipboard functionality
   - Implement prompt versioning if needed
   - Add social sharing buttons

## Phase 3: UX Enhancements (Week 3)
1. Directory Features
   - Implement instant search
   - Add keyboard shortcuts
   - Create category pages
   - Add pagination or infinite scroll

2. User Experience
   - Add loading states
   - Implement smooth transitions
   - Add prompt preview functionality
   - Optimize mobile experience

## Phase 4: Polish & Launch (Week 4)
1. Performance Optimization
   - Implement view transitions
   - Optimize images and assets
   - Add proper meta tags
   - Implement analytics

2. Launch Preparation
   - Content migration
   - SEO optimization
   - Documentation
   - Testing & bug fixes

## File Structure Changes
```
src/
├── content/
│   └── prompts/           # (renamed from blog)
│       └── schema.ts      # Updated schema for prompts
├── pages/
│   ├── index.astro       # New directory-style landing
│   └── prompts/          # (renamed from blog)
└── components/
    ├── prompt/           # New prompt-specific components
    └── directory/        # New directory components
```

## Next Steps
1. Begin with Phase 1 by modifying the content schema
2. Create sample prompt posts
3. Start redesigning the landing page

Would you like to begin with any specific phase or task from this plan? 