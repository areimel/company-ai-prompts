# Project Structure & Organization

## Root Directory Structure
```
/
├── public/              # Static assets (images, favicon, robots.txt)
├── src/                 # Source code
├── .astro/              # Astro build cache and generated files
├── .kiro/               # Kiro AI assistant configuration
├── dist/                # Production build output
├── node_modules/        # Dependencies
├── astro.config.mjs     # Astro configuration
├── tailwind.config.cjs  # TailwindCSS configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project dependencies and scripts
```

## Source Directory (`src/`)
```
src/
├── components/          # Reusable UI components (.astro files)
│   ├── ContentComponents/    # Content-specific components
│   ├── navbar/              # Navigation components
│   ├── PromptComponents/    # Prompt-related components
│   └── ui/                  # Generic UI components
├── content/             # Content collections (Markdown/MDX)
│   ├── blog/           # Blog posts
│   ├── prompts/        # AI prompt library
│   └── config.ts       # Content schema definitions
├── data/               # Static JSON data files
├── layouts/            # Page layout templates
├── pages/              # Site pages and API routes
│   ├── api/           # API endpoints
│   ├── blog/          # Blog-related pages
│   ├── prompts/       # Prompt pages and routes
│   └── index.astro    # Homepage
├── utils/              # Utility functions
└── assets/             # Images and other assets
```

## Path Aliases (TypeScript)
- `@lib/*` → `src/lib/*`
- `@utils/*` → `src/utils/*`
- `@components/*` → `src/components/*`
- `@layouts/*` → `src/layouts/*`
- `@assets/*` → `src/assets/*`
- `@pages/*` → `src/pages/*`
- `@data/*` → `src/data/*`

## Content Collections Schema
- **Prompts**: Title, description, usage instructions, category, sub_category, tags, version, author, dates, featured flag
- **Blog**: Title, snippet, image, publish date, category, author, tags
- **Team**: Name, title, avatar, publish date

## File Naming Conventions
- Components: PascalCase for Astro components (e.g., `ThemeToggle.astro`)
- Pages: kebab-case for routes (e.g., `prompt-generator.astro`)
- Content: kebab-case for markdown files (e.g., `generate-react-component.mdx`)
- Utilities: camelCase for JavaScript files (e.g., `all.js`)

## Component Organization
- Generic UI components in `src/components/ui/`
- Feature-specific components in dedicated folders
- Layout components in `src/layouts/`
- Page components directly in `src/pages/`