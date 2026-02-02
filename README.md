# My Blog

TypeScript blog with Vite + React. Posts are Markdown files in `content/posts/` with YAML frontmatter. Deploys to GitHub Pages.

## Commands

- **`blog new [标题]`** — Create a new post in `content/posts/` as `YYYY-MM-DD-slug.md` with frontmatter (title, date, description, tags). If no title is given, uses "untitled".
- **`blog run`** — Start the Vite dev server (e.g. http://localhost:5173) to write and preview locally.
- **`blog build`** — Run `vite build` and output to `dist/` for deployment.

Use the CLI via `npx` (after `npm install` the CLI is built automatically):

```bash
npx blog new "My First Post"
npx blog run
npx blog build
```

Or link globally: `npm link` then `blog new`, `blog run`, `blog build`.

## Project structure

- `content/posts/*.md` — Blog posts (Markdown + YAML frontmatter: `title`, `date`, `description`, `tags`).
- `src/` — Frontend (React, Vite). Posts are loaded at build time via a Vite virtual module.
- `bin/cli.js` — CLI entry (built from `src-cli/cli.ts`).

## GitHub Pages deployment

1. In the repo **Settings → Pages**, choose **Deploy from a branch**.
2. Select branch **github-pages** (or use the **GitHub Actions** workflow).
3. This repo uses the **Deploy to GitHub Pages** workflow: on push to `main`, it runs `GITHUB_PAGES=1 npm run build` (so `base` is `/MyBlog/`), copies `dist/index.html` to `dist/404.html` for client-side routing, and deploys the `dist` artifact. Enable the **pages** environment if prompted.
4. The site will be at `https://<username>.github.io/MyBlog/`.
