import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { loadPosts } from "./src/posts";

// Copy content/images to dist/images
function copyImages(): import("vite").Plugin {
  return {
    name: "copy-images",
    closeBundle() {
      const srcDir = path.resolve(__dirname, "content/images");
      const destDir = path.resolve(__dirname, "dist/images");

      if (!fs.existsSync(srcDir)) return;

      // Create destination directory
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Copy all files recursively
      function copyDir(src: string, dest: string) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }

        const entries = fs.readdirSync(src, { withFileTypes: true });
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);

          if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      }

      copyDir(srcDir, destDir);
    },
  };
}

const contentDir = path.resolve(process.cwd(), "content/posts");
const contentPostsPrefix = path.normalize("content/posts");
const virtualId = "virtual:posts";
const resolvedId = "\0" + virtualId;

export default defineConfig({
  plugins: [react(), postsVirtualModule(), copyNojekyll(), copyImages()],
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

function postsVirtualModule(): import("vite").Plugin {
  return {
    name: "posts-virtual-module",
    resolveId(id: string) {
      if (id === virtualId) return resolvedId;
    },
    load(id: string) {
      if (id !== resolvedId) return;
      const posts = loadPosts();
      return `export const posts = ${JSON.stringify(posts)};`;
    },
    configureServer(server) {
      server.watcher.add(contentDir);
    },
    handleHotUpdate(ctx) {
      const normalized = path.normalize(ctx.file);
      if (normalized.includes(contentPostsPrefix) && normalized.endsWith(".md")) {
        const mod = ctx.server.moduleGraph.getModuleById(resolvedId);
        if (mod) {
          ctx.server.moduleGraph.invalidateModule(mod);
          return [mod];
        }
      }
    },
  };
}

function copyNojekyll(): import("vite").Plugin {
  return {
    name: "copy-nojekyll",
    closeBundle() {
      const nojekyllPath = path.resolve(__dirname, ".nojekyll");
      if (fs.existsSync(nojekyllPath)) {
        const outPath = path.resolve(__dirname, "dist", ".nojekyll");
        fs.copyFileSync(nojekyllPath, outPath);
      }
    },
  };
}
