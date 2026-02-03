import { useParams, Link } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import { posts } from "virtual:posts";
import { useReadingProgress } from "../context/ReadingProgressContext";
import { usePostVisitsContext } from "../context/PostVisitsContext";
import { useHighlight } from "../hooks/useHighlight";
import { useTheme } from "../context/ThemeContext";
import { useMobileToc } from "../context/MobileTocContext";

/** 约 300 字/分钟（中文） */
const CHARS_PER_MINUTE = 300;

/** 统计正文有效字数（去除空白与 markdown 符号） */
function countChars(content: string): number {
  const text = content
    .replace(/^---[\s\S]*?---/, "") // 去掉 frontmatter
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*?|__?/g, "")
    .replace(/`/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s*[-*+]\s/gm, "")
    .replace(/\s+/g, "");
  return text.length;
}

function getReadingMinutes(chars: number): number {
  return Math.max(1, Math.ceil(chars / CHARS_PER_MINUTE));
}

export interface TocItem {
  level: number;
  text: string;
  id: string;
}

/** 将扁平目录按层级转为“节”（与最小级别同级的为节标题，更深层级为子项），用于折叠 */
function tocToSections(toc: TocItem[]): { section: TocItem; children: TocItem[] }[] {
  if (toc.length === 0) return [];
  const sectionLevel = Math.min(...toc.map((t) => t.level));
  const sections: { section: TocItem; children: TocItem[] }[] = [];
  let current: { section: TocItem; children: TocItem[] } | null = null;

  for (const item of toc) {
    if (item.level === sectionLevel) {
      current = { section: item, children: [] };
      sections.push(current);
    } else if (current) {
      current.children.push(item);
    }
  }
  return sections;
}

export default function Post() {
  const { slug } = useParams<{ slug: string }>();
  const post = posts.find((p) => p.slug === slug);
  const bodyRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  const visitedRef = useRef<Set<string>>(new Set());
  const [toc, setToc] = useState<TocItem[]>([]);
  const [tocCollapsed, setTocCollapsed] = useState<Set<string>>(new Set());
  const { tocOpen: mobileTocOpen, toggleToc, closeToc } = useMobileToc();
  const { setProgress } = useReadingProgress();
  const { increment: incrementVisit } = usePostVisitsContext();
  const { theme } = useTheme();

  // Apply syntax highlighting to code blocks when post or theme changes
  useHighlight(theme, [post?.slug]);

  useEffect(() => {
    if (!post || !bodyRef.current) return;
    const root = bodyRef.current;
    const headings = root.querySelectorAll("h1, h2, h3, h4, h5, h6");
    const usedIds = new Set<string>();

    function slugify(text: string): string {
      const s = text
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\u4e00-\u9fa5-]/g, "");
      return s || "heading";
    }

    function ensureId(el: Element, text: string): string {
      let id = el.id?.trim();
      if (!id) {
        id = slugify(text);
        let base = id;
        let n = 0;
        while (usedIds.has(id)) {
          n += 1;
          id = `${base}-${n}`;
        }
        (el as HTMLElement).id = id;
      }
      usedIds.add(id);
      return id;
    }

    const items: TocItem[] = [];
    headings.forEach((el) => {
      const text = el.textContent ?? "";
      if (!text) return;
      const id = ensureId(el, text);
      const level = parseInt(el.tagName.slice(1), 10);
      items.push({ level, text, id });
    });
    setToc(items);
  }, [post?.slug]);

  useEffect(() => {
    if (!post) return;
    const onScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const articleTop = el.getBoundingClientRect().top + window.scrollY;
      const articleH = el.offsetHeight;
      const viewH = window.innerHeight;
      const maxScroll = Math.max(0, articleH - viewH);
      if (maxScroll <= 0) {
        setProgress(100);
        return;
      }
      const scrolled = window.scrollY - articleTop;
      const pct = Math.round((scrolled / maxScroll) * 100);
      setProgress(Math.max(0, Math.min(100, pct)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      setProgress(null);
    };
  }, [post?.slug, setProgress]);

  useEffect(() => {
    if (post?.slug && !visitedRef.current.has(post.slug)) {
      visitedRef.current.add(post.slug);
      incrementVisit(post.slug);
    }
  }, [post?.slug, incrementVisit]);

  if (!post) {
    return (
      <div className="not-found">
        <p>文章未找到。</p>
        <Link to="/">← 返回首页</Link>
      </div>
    );
  }

  const chars = countChars(post.content);
  const readingMinutes = getReadingMinutes(chars);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleTocSection = (id: string) => {
    setTocCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const tocSections = tocToSections(toc);

  return (
    <div className="post-page-layout">
      <article ref={articleRef} className="post-detail post-detail--with-toc">
        <header className="post-header">
          <h1>{post.meta.title}</h1>
          <div className="post-meta-row">
            <time dateTime={post.meta.date}>{post.meta.date}</time>
            {post.meta.category && (
              <span className="post-meta-category">· {post.meta.category}</span>
            )}
          </div>
          <div className="post-meta-stats">
            <span className="post-word-count">约 {chars} 字</span>
            <span className="post-reading-time">阅读约 {readingMinutes} 分钟</span>
          </div>
          {post.meta.tags?.length ? (
            <ul className="tags">
              {post.meta.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          ) : null}
        </header>
        <div
          ref={bodyRef}
          className="post-body"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
        <p className="back">
          <Link to="/">← 返回列表</Link>
        </p>
      </article>

      {toc.length > 0 ? (
        <>
          <button
            type="button"
            className="mobile-toc-toggle"
            onClick={toggleToc}
            aria-label="查看目录"
            title="目录"
          >
            📑
          </button>
          <aside className={`post-toc-wrap ${mobileTocOpen ? "mobile-open" : ""}`}>
            <nav className="post-toc" aria-label="文章目录">
              <div className="post-toc-title">
                目录
                <button
                  type="button"
                  className="post-toc-close"
                  onClick={closeToc}
                  aria-label="关闭目录"
                >
                  ✕
                </button>
              </div>
              <ul className="post-toc-list">
                {tocSections.map(({ section, children }) => {
                  const isCollapsed = tocCollapsed.has(section.id);
                  const hasChildren = children.length > 0;
                  return (
                    <li key={section.id} className="post-toc-section">
                      <div className="post-toc-section-head">
                        {hasChildren ? (
                          <button
                            type="button"
                            className="post-toc-toggle"
                            onClick={() => toggleTocSection(section.id)}
                            aria-expanded={!isCollapsed}
                            title={isCollapsed ? "展开" : "折叠"}
                          >
                            {isCollapsed ? "▶" : "▼"}
                          </button>
                        ) : null}
                        <a
                          href={`#${section.id}`}
                          className="post-toc-link"
                          onClick={(e) => {
                            e.preventDefault();
                            scrollToHeading(section.id);
                            closeToc();
                          }}
                        >
                          {section.text}
                        </a>
                      </div>
                      {hasChildren && !isCollapsed ? (
                        <ul className="post-toc-sublist">
                          {children.map(({ level, text, id }) => (
                            <li
                              key={id}
                              className="post-toc-item"
                              style={{ paddingLeft: `${(level - 1) * 0.75}rem` }}
                            >
                              <a
                                href={`#${id}`}
                                className="post-toc-link"
                                onClick={(e) => {
                                  e.preventDefault();
                                  scrollToHeading(id);
                                  closeToc();
                                }}
                              >
                                {text}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
          {/* 移除重复的 TOC 遮罩层，使用 Layout.tsx 中的统一样式 */}
        </>
      ) : null}
    </div>
  );
}
