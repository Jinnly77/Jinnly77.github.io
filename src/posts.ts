import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const contentDir = path.resolve(process.cwd(), "content/posts");

marked.setOptions({
  headerIds: true,
  mangle: false,
});

export interface PostMeta {
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  category?: string;
}

export interface Post {
  slug: string;
  meta: PostMeta;
  content: string;
  html: string;
}

/** 将 frontmatter 的 date 转为字符串（gray-matter 可能返回 Date） */
function dateToString(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
}

/** 从 frontmatter 取分类：支持 category 或 categories（取第一个） */
function getCategory(data: { category?: string; categories?: string | string[] }): string | undefined {
  if (data.category != null && data.category !== "") return String(data.category);
  const cat = data.categories;
  if (Array.isArray(cat) && cat.length > 0) return String(cat[0]);
  if (typeof cat === "string" && cat !== "") return cat;
  return undefined;
}

/** 从 frontmatter 取标签：支持数组 [a,b]、YAML 多行、或逗号分隔字符串 */
function getTags(data: unknown): string[] {
  const t = data;
  if (Array.isArray(t)) {
    return t.map((x) => String(x).trim()).filter(Boolean);
  }
  if (typeof t === "string") {
    return t.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export function loadPosts(): Post[] {
  if (!fs.existsSync(contentDir)) return [];
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));
  const posts: Post[] = [];

  for (const file of files) {
    try {
      const fullPath = path.join(contentDir, file);
      const raw = fs.readFileSync(fullPath, "utf-8");
      const { data, content } = matter(raw);
      const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
      const html = marked(content) as string;
      posts.push({
        slug,
        meta: {
          title: data.title ?? "Untitled",
          date: dateToString(data.date),
          description: data.description,
          tags: getTags(data.tags),
          category: getCategory(data),
        },
        content,
        html,
      });
    } catch (err) {
      console.warn(`[posts] 跳过 ${file}:`, err instanceof Error ? err.message : err);
    }
  }

  posts.sort((a, b) => {
    const dA = a.meta.date ?? "";
    const dB = b.meta.date ?? "";
    return dB.localeCompare(dA);
  });
  return posts;
}
