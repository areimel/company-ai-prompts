# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Development Server:**
- `pnpm dev` - Start development server at localhost:4321
- `pnpm start` - Alternative dev command

**Building & Testing:**
- `pnpm build` - Build production site to ./dist/
- `pnpm preview` - Preview production build locally
- `pnpm test` - Run test suite with Vitest
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:ui` - Run tests with UI interface

**Asset Optimization:**
- `pnpm img-compress` - Optimize images in public folder using optimizt

## Architecture Overview

This is an **Astro 5.7+ static site** for an AI prompt directory with the following key characteristics:

### Content Management System
- Uses **Astro Content Collections** with TypeScript schemas in `src/content/config.ts`
- Four main content types: `blog`, `prompts`, `personas`, `team`
- Content stored as MDX files with validated frontmatter schemas
- Prompts categorized by: Coding, Writing, Analysis, Creative, Business, Marketing, Other
- Sub-categories include: Cursor, ChatGPT, Claude, Gemini, MidJourney, Other

### AI Integration
- Google Gemini API integration via `@ai-sdk/google` and `ai` packages
- AI service located in `src/lib/ai-service.ts` with comprehensive error handling
- Environment variable: `PUBLIC_GOOGLE_GEMINI_API_KEY`
- Supports both streaming and non-streaming text generation

### Component Architecture
- **Landing Components**: Hero, Features, CTA, Contact, FAQ sections
- **Prompt Components**: Cards, grids, search/filter, directory grouping
- **Form Components**: Newsletter, contact, prompt submission forms
- **UI Components**: Buttons, links, icons, copy functionality, loading states
- **Navbar Components**: Logo, dropdown navigation, responsive design

### TypeScript Configuration
- Path aliases configured for clean imports:
  - `@lib/*`, `@utils/*`, `@components/*`, `@layouts/*`
  - `@assets/*`, `@pages/*`, `@data/*`
- Strict null checks enabled
- Astro client types included

### Data Management
- JSON configuration files in `src/data/`:
  - `branding.json` - Site identity, logos, social links
  - `homeContent.json` - Landing page content
  - `announcements.json` - Site-wide notifications

### Styling
- **TailwindCSS 3.4+** with typography plugin
- Variable fonts: Inter and Bricolage Grotesque
- Icon system via `astro-icon` with Iconify (Boxicons, Simple Icons)
- Scoped component styles in .astro files

### Routing Structure
- File-based routing with dynamic routes for content collections
- Key routes: `/prompts/[slug]`, `/ai-personas/[slug]`, `/blog/[slug]`
- Static pages: privacy, terms, CCPA compliance

## Development Guidelines

### Adding Content
- **New Prompts**: Create MDX files in `src/content/prompts/` following the schema
- **New Personas**: Create MDX files in `src/content/personas/` following the schema
- **Blog Posts**: Create MDX files in `src/content/blog/` following the schema

### Component Development
- Follow Astro component structure with frontmatter section (---)
- Use TypeScript path aliases for imports
- Include component CSS as `<style>` tags within component files
- Reference `@apply` directive for repeated Tailwind patterns
- Use `client:*` directives sparingly for partial hydration

### User Authentication System
- **Feature Flag Controlled**: Authentication enabled via `ENABLE_USER_AUTH=true`
- **Provider**: Supabase Auth with PostgreSQL backend
- **Flow Type**: PKCE (Proof Key for Code Exchange) for security
- **Services**: 
  - `AuthService` - Main authentication operations
  - `FavoritesService` - User favorites management
  - `FeatureFlags` - Runtime feature toggles
- **Components**: Located in `src/components/AuthComponents/`
- **Database**: User profiles and favorites tables with RLS policies
- **Social Auth**: Google, GitHub, Discord, Twitter (configurable)

#### Authentication Setup
1. **Environment Variables**:
   ```bash
   ENABLE_USER_AUTH=true
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```

2. **Quick Setup**:
   - See `docs/authentication-setup.md` for complete setup guide
   - Run database migrations from `src/lib/database/`
   - Configure Supabase project and OAuth providers

3. **Development Testing**:
   ```bash
   pnpm test:auth  # Run authentication tests
   pnpm dev        # Start with auth enabled
   ```

### Testing
- Tests located in `src/**/*.{test,spec}.{js,ts}`
- Uses Vitest with Node environment and globals enabled
- Test suites include:
  - `src/lib/ai-service.test.ts` - AI service functionality
  - `src/lib/auth-service.test.ts` - Authentication operations
  - `src/lib/favorites-service.test.ts` - Favorites management
  - `src/lib/feature-flags.test.ts` - Feature flag system
- Authentication tests use comprehensive mocking of Supabase client
- Run specific test suites: `pnpm test auth` or `pnpm test:watch`

### Cursor IDE Rules
The project includes specific Cursor IDE rules emphasizing:
- Astro framework best practices and performance optimization
- TailwindCSS utility-first approach with `@apply` for repeated patterns
- TypeScript with path aliases and proper component structure
- Static generation priority with minimal client-side JavaScript
- Authentication feature integration with proper error handling