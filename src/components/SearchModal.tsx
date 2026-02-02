import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Post } from "../posts-data.d";

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ");
}

function matchPost(q: string, post: Post): boolean {
  const nq = normalize(q);
  if (!nq) return true;
  const title = normalize(post.meta.title);
  const desc = normalize(post.meta.description ?? "");
  const content = normalize(post.content);
  const date = post.meta.date ?? "";
  const tags = (post.meta.tags ?? []).join(" ");
  const category = normalize(post.meta.category ?? "");
  return (
    title.includes(nq) ||
    desc.includes(nq) ||
    content.includes(nq) ||
    date.includes(nq) ||
    tags.includes(nq) ||
    category.includes(nq)
  );
}

export default function SearchModal({
  open,
  onClose,
  posts,
}: {
  open: boolean;
  onClose: () => void;
  posts: Post[];
}) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (!query.trim()) return posts.slice(0, 20);
    return posts.filter((p) => matchPost(query, p));
  }, [query, posts]);

  const close = useCallback(() => {
    setQuery("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleSelect = (slug: string) => {
    navigate(`/post/${slug}`);
    close();
  };

  if (!open) return null;

  return (
    <div
      className="search-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="全局搜索"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-wrap">
          <input
            type="search"
            placeholder="按标题、标签、分类、时间、内容搜索…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            autoComplete="off"
          />
        </div>
        <div className="search-results">
          {results.length === 0 ? (
            <div className="search-no-result">未找到匹配文章</div>
          ) : (
            results.map((post) => (
              <Link
                key={post.slug}
                to={`/post/${post.slug}`}
                onClick={() => handleSelect(post.slug)}
              >
                <div className="search-item-title">{post.meta.title}</div>
                <div className="search-item-meta">
                  {post.meta.date}
                  {post.meta.category ? ` · ${post.meta.category}` : ""}
                  {(post.meta.tags?.length ?? 0) > 0
                    ? ` · ${post.meta.tags?.join(", ")}`
                    : ""}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
