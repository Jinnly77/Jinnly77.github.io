# AGENTS.md

This file provides guidance for agentic coding assistants working in this TypeScript + React blog repository.

## Essential Commands

### Development
- `npm run dev` - Start Vite dev server (http://localhost:5173)
- `npm run build` - Build for production (outputs to `dist/`)
- `npm run preview` - Preview production build locally

### CLI Tool
- `blog new [title]` - Create a new post in `content/posts/` (format: YYYY-MM-DD-slug.md)
- `blog run` - Start Vite dev server
- `blog build` - Build for production

### Build Pipeline
- `npm run build:cli` - Build the CLI from TypeScript using `tsconfig.cli.json` (auto-runs on `npm install`)
- CLI source is in `src-cli/cli.ts`, compiled to `bin/cli.js`

## Code Style Guidelines

### TypeScript Configuration
- **Strict mode enabled** - All type checking rules are enforced
- Target: ES2020 with React JSX transform (`react-jsx`)
- Path alias: `@/` maps to `./src`
- Virtual module: `virtual:posts` maps to `./src/posts-data.d.ts` (type declaration)
- Additional strict rules: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`

### Imports
- Use standard ES6 imports
- Prefer `import type` for type-only imports: `import type { Post } from "./posts-data.d"`
- Import posts from virtual module: `import { posts } from "virtual:posts"`
- Keep imports grouped: external libraries first, then internal modules

### Naming Conventions
- **Components**: PascalCase (e.g., `Layout`, `SearchModal`, `NavBar`)
- **Functions/Hooks**: camelCase (e.g., `loadPosts`, `useTheme`, `toggleTheme`)
- **Variables**: camelCase (e.g., `query`, `setVisits`, `contentDir`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `BADGE_ID`, `STORAGE_KEY`)
- **Interfaces/Types**: PascalCase without `I` prefix (e.g., `PostMeta`, `Post`, `Theme`)

### Component Patterns
- Use functional components exclusively (no class components)
- Define props as interfaces inline or separately
- Use TypeScript for all props and function parameters
- Prefer default exports for page components
- Use named exports for shared utilities/types

```tsx
// Good
export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return <div>...</div>;
}

// Also good
interface Props {
  open: boolean;
  onClose: () => void;
}
export default function SearchModal({ open, onClose }: Props) {
  return <div>...</div>;
}
```

### React Hooks
- Use standard hooks: `useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`
- Custom hooks prefixed with `use` (e.g., `useTheme`, `useVisitStats`)
- Always include cleanup functions in `useEffect`
- Use `useMemo` for expensive computations
- Use `useCallback` for functions passed to child components
- Use `useRef` to prevent duplicate effects in React StrictMode

```tsx
// Good - prevent duplicate effect calls
const countedRef = useRef(false);
useEffect(() => {
  if (countedRef.current) return;
  countedRef.current = true;
  // effect logic...
}, []);

// Good cleanup
useEffect(() => {
  window.addEventListener("keydown", handleKey);
  return () => window.removeEventListener("keydown", handleKey);
}, []);
```

### Type Safety
- Use interfaces for object shapes with optional fields
- Use type aliases for unions and primitives
- Avoid `any` - use `unknown` when type is truly unknown
- Use type guards for runtime type checking

```tsx
// Good
function getCategory(data: { category?: string; categories?: string | string[] }): string | undefined {
  if (data.category != null && data.category !== "") return String(data.category);
  return undefined;
}

// Good error handling
catch (err) {
  console.warn(`[posts] Skip ${file}:`, err instanceof Error ? err.message : err);
}
```

### Error Handling
- Use try-catch blocks for file operations and external calls
- Log warnings with descriptive messages (use `console.warn`)
- Type check error objects: `err instanceof Error ? err.message : err`
- Provide fallback values for optional data
- Use null coalescing for optional arrays: `post.meta.tags?.length ?? 0`

### Storage & External APIs
- Use `localStorage` with proper type conversion: `parseInt(localStorage.getItem("key") ?? "0", 10)`
- Handle no-cors fetch requests for external APIs (e.g., Visitor Badge)
- Use refs to deduplicate API calls in StrictMode

### Accessibility
- Include semantic attributes on interactive elements: `role`, `aria-modal`, `aria-label`
- Use native HTML elements when possible
- Ensure keyboard navigation works (handle Escape, Enter, Space keys)

### Frontmatter Handling
Posts use YAML frontmatter with flexible formats:
- Dates can be strings or Date objects (convert with `dateToString`)
- Categories: `category` or `categories` (array takes first)
- Tags: array, YAML list, or comma-separated string
- Always use helper functions (`getCategory`, `getTags`, `dateToString`) from `src/posts.ts`
- Post file naming: `YYYY-MM-DD-slug.md`

### CLI Scripts
- Include shebang: `#!/usr/bin/env node`
- Use `process.cwd()` for resolving paths from project root
- Use `spawn`/`spawnSync` from `node:child_process` for subprocess execution
- Handle errors and exit codes appropriately
- Type-cast imported CJS modules when needed

### Localization & Comments
- UI strings and user-facing text are in Chinese
- Code comments may be in Chinese (e.g., `// 跳过 ${file}`)
- Keep error messages consistent: use `[category]` prefix for logging

## Architecture Notes

### Virtual Posts Module
Posts are served via a Vite virtual plugin (`virtual:posts`) defined in `vite.config.ts`. The plugin watches `content/posts/` for hot module replacement. The virtual module maps to `src/posts-data.d.ts` for TypeScript types.

### Routing
Routes defined in `src/App.tsx` using react-router-dom. Blog posts are at `/post/:slug`.

### File Organization
- `src/` - Frontend React code
- `src-cli/` - CLI tool source (TypeScript)
- `bin/` - Compiled CLI output
- `content/posts/*.md` - Blog posts with frontmatter (YYYY-MM-DD-slug.md)
- `public/` - Static assets (avatar, etc.)
- `dist/` - Production build output

## Testing & Linting

**Note**: This project does not currently have ESLint, Prettier, or a test framework configured. When adding new code, follow the TypeScript compiler's strict mode rules and existing code patterns.

## Deployment

GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and deploys to GitHub Pages on push to `main`. The workflow uses Node 20, runs `npm ci` and `npm run build`, copies `dist/index.html` to `dist/404.html` for SPA routing support.
