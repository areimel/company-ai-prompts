# Technology Stack

## Framework & Core Technologies
- **Astro 5.7+** - Static site generator with component islands architecture
- **TypeScript** - Type-safe JavaScript with strict null checks enabled
- **TailwindCSS 3.4+** - Utility-first CSS framework with typography plugin
- **MDX** - Markdown with JSX components for rich content

## Key Dependencies
- **Content Management**: Astro Content Collections with Zod schema validation
- **Styling**: TailwindCSS with typography plugin, Inter Variable font
- **Icons**: Astro Icon with Iconify collections (bx, simple-icons, uil)
- **SEO**: astro-seo for meta tags and sitemap generation
- **Navigation**: astro-navbar for responsive navigation
- **Image Processing**: Sharp for optimization, passthrough service for build
- **AI Integration**: @google/genai for Gemini API integration

## Build System & Commands
- **Package Manager**: pnpm (preferred)
- **Development**: `pnpm dev` - starts dev server at localhost:4321
- **Build**: `pnpm build` - creates production build in ./dist/
- **Preview**: `pnpm preview` - preview production build locally
- **Image Optimization**: `pnpm img-compress` - compress images in public/
- **Astro CLI**: `pnpm astro` - access Astro CLI commands

## Deployment
- **Platform**: Netlify with @astrojs/netlify adapter
- **Output**: Static site generation
- **Site URL**: https://company-ai-prompts.netlify.app

## Development Environment
- **Node.js**: ES modules (type: "module" in package.json)
- **TypeScript Config**: Extends astro/tsconfigs/base with path aliases
- **Dark Mode**: Class-based dark mode support in Tailwind