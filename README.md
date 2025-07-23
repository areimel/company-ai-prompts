# AI Prompt Directory

A comprehensive AI prompt library designed for teams, organizations, and individuals. Discover, share, and master powerful AI prompts that unlock your potential across various use cases including writing, coding, analysis, creative tasks, and business applications.

Built with modern web technologies for performance and ease of customization, this directory features curated prompts, AI personas, and a growing community of practitioners sharing knowledge.

## Key Features

*   **Comprehensive Prompt Library**: Browse 500+ curated AI prompts across multiple categories (Coding, Writing, Analysis, Creative, Business, Marketing)
*   **AI Personas Collection**: Ready-to-use AI personas including Creative Collaborator, Technical Mentor, Strategic Business Advisor, and more
*   **Search & Filtering**: Find exactly what you need with intuitive categorization and filtering system
*   **Individual Prompt Pages**: Detailed pages with usage instructions, examples, and copy-to-clipboard functionality
*   **Blog & Resources**: Educational content about AI prompt engineering and best practices
*   **Mobile-Responsive Design**: Optimized experience across all devices
*   **Template System**: Create your own prompt templates for team consistency
*   **Free & Open Source**: Available for personal and commercial use

## Live Features

*   **Landing Page**: Modern hero section with feature highlights and FAQ
*   **Prompt Directory**: Organized browsing by category with detailed individual pages
*   **AI Personas**: Specialized AI character profiles for different use cases
*   **Blog**: Educational articles about AI prompting techniques
*   **Contact Forms**: Community engagement and contribution system
*   **Newsletter Integration**: Stay updated with latest prompts and techniques
*   **Social Media Integration**: Connect across platforms
*   **Legal Pages**: Privacy policy, terms, and CCPA compliance

## Technical Stack

*   **Framework**: [Astro 5.7+](https://astro.build/) - Fast, modern static site generator
*   **Styling**: [TailwindCSS 3.4+](https://tailwindcss.com/) - Utility-first CSS framework
*   **Content Management**: [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) with TypeScript schemas
*   **AI Integration**: Google Gemini API integration for dynamic features
*   **Icons**: Astro Icon with Iconify icons (Boxicons, Simple Icons)
*   **Typography**: Inter Variable & Bricolage Grotesque fonts
*   **Testing**: Vitest for unit testing
*   **Deployment**: Netlify-ready with optimized build process

## Getting Started

### Prerequisites

*   Node.js 18+ or 20+
*   pnpm (recommended) or npm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/company-ai-prompts.git
    cd company-ai-prompts
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Start development server:**
    ```bash
    pnpm dev
    ```

Visit `http://localhost:4321` to view your site.

## Available Commands

*   **`pnpm dev`**: Start development server at `localhost:4321`
*   **`pnpm build`**: Build production site to `./dist/`
*   **`pnpm preview`**: Preview production build locally
*   **`pnpm test`**: Run test suite
*   **`pnpm test:watch`**: Run tests in watch mode
*   **`pnpm test:ui`**: Run tests with UI interface
*   **`pnpm img-compress`**: Optimize images in public folder

## Project Structure

```
/
├── public/                    # Static assets
│   ├── *.png, *.jpg          # Images and logos
│   ├── favicon.svg           # Site favicon
│   └── robots.txt            # SEO robots file
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── LandingComponents/ # Landing page specific components
│   │   ├── PromptComponents/  # Prompt directory components
│   │   ├── navbar/           # Navigation components
│   │   └── ui/               # Generic UI components
│   ├── content/              # Content collections
│   │   ├── blog/             # Blog posts (MDX)
│   │   ├── prompts/          # AI prompts (MDX)
│   │   ├── personas/         # AI personas (MDX)
│   │   └── config.ts         # Content collection schemas
│   ├── data/                 # JSON configuration files
│   │   ├── branding.json     # Site branding & SEO
│   │   ├── homeContent.json  # Homepage content
│   │   └── announcements.json # Site announcements
│   ├── layouts/              # Page layouts
│   ├── lib/                  # Utilities and services
│   ├── pages/                # Site routes
│   │   ├── index.astro       # Homepage
│   │   ├── prompts/          # Prompt directory pages
│   │   ├── ai-personas/      # AI personas pages
│   │   ├── blog/             # Blog pages
│   │   └── *.astro           # Legal & other pages
│   └── utils/                # Helper functions
├── astro.config.mjs          # Astro configuration
├── tailwind.config.cjs       # TailwindCSS configuration
├── tsconfig.json             # TypeScript configuration
└── vitest.config.ts          # Testing configuration
```

## Content Management

### Adding New Prompts

1. Create a new `.mdx` file in `src/content/prompts/`
2. Use the defined schema with required frontmatter:
   ```yaml
   ---
   draft: false
   title: "Your Prompt Title"
   description: "Brief description"
   usage_instructions: "How to use this prompt"
   category: "Coding" # Coding, Writing, Analysis, Creative, Business, Marketing, Other
   sub_category: "ChatGPT" # ChatGPT, Claude, Gemini, Cursor, MidJourney, Other
   tags: ["javascript", "debugging"]
   author: "Your Name"
   publishDate: "2025-01-15"
   lastUpdated: "2025-01-15"
   featured: false
   ---
   ```

### Adding AI Personas

1. Create a new `.mdx` file in `src/content/personas/`
2. Follow the personas schema with appropriate categories

### Configuration

*   **Branding**: Edit `src/data/branding.json` for site identity, logos, and social links
*   **Homepage**: Modify `src/data/homeContent.json` for landing page content
*   **Announcements**: Update `src/data/announcements.json` for site-wide notifications

## Deployment

The site is optimized for Netlify deployment with the `@astrojs/netlify` adapter. Other deployment options include Vercel, GitHub Pages, or any static hosting service.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is available for free personal and commercial use. See the LICENSE file for details.

## Support

*   **Issues**: Report bugs or request features via GitHub Issues
*   **Community**: Join our growing community of AI prompt engineers
*   **Documentation**: Comprehensive guides available in the `/blog` section

---

Built with ❤️ by [Alec Reimel](https://alecreimel.com) | Empowering teams to master AI prompt engineering
