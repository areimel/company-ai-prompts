# In-House AI Prompt Directory

Your own custom AI prompt library. Free for personal and commercial use. Share AI prompts across your company, or with your friends.

This project is based on the Astroship template, and is largely based on [cursor.directory/rules](https://cursor.directory/rules), but designed to be lightweight and easy for anyone with basic coding skills to customize and update themselves.

## Key Features

*   Directory-style landing page with prompt browsing.
*   Search and filtering capabilities (planned/implemented based on project plan).
*   Individual prompt pages with details.
*   Built with modern web technologies for performance.

## Technical Stack

*   Framework: [Astro](https://astro.build/)
*   Styling: [TailwindCSS](https://tailwindcss.com/)
*   Content Management: [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) (using Markdown/MDX)

## Getting Started

### Prerequisites

*   Node.js (Check Astro documentation for compatible versions)
*   pnpm (Install using `npm install -g pnpm` or see [pnpm installation guide](https://pnpm.io/installation))

### Installation

1.  **Clone the repository:**
    ```bash
    # Replace <your-repository-url> with the actual URL
    git clone <your-repository-url> company-ai-prompts
    cd company-ai-prompts
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

## Available Commands

*   **`pnpm dev`**: Starts the local development server at `localhost:4321`.
*   **`pnpm build`**: Builds the production-ready site to `./dist/`.
*   **`pnpm preview`**: Previews the production build locally before deploying.
*   **`pnpm astro ...`**: Run CLI commands like `astro add`, `astro check`.
*   **`pnpm astro -- --help`**: Get help with the Astro CLI.

## Project Structure

```
/
├── public/              # Static assets (images, fonts, etc.)
├── src/
│   ├── components/      # Reusable UI components (.astro, .jsx, etc.)
│   │   ├── prompt/      # Components specific to prompt pages
│   │   └── directory/   # Components specific to the directory landing page
│   ├── content/
│   │   └── prompts/     # Markdown/MDX files for each prompt
│   │       └── schema.ts # Defines the frontmatter schema for prompts
│   ├── layouts/         # Base page layouts
│   ├── pages/           # Site pages and API endpoints
│   │   ├── index.astro  # Directory landing page
│   │   └── prompts/     # Dynamic routes for individual prompt pages
│   └── styles/          # Global styles
├── astro.config.mjs     # Astro configuration file
├── tailwind.config.cjs  # TailwindCSS configuration file
└── package.json         # Project dependencies and scripts
```

## Credits

This project is based on the [Astroship](https://github.com/surjithctly/astroship) template, originally created by [Surjith S M](https://github.com/surjithctly) and sponsored by [Web3Templates](https://web3templates.com).
