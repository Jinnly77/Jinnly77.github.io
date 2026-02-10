import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import type { Post } from "../posts-data.d";

function groupPostsByYearMonth(posts: Post[]): { year: string; months: { month: string; list: Post[] }[] }[] {
  const map: Record<string, Record<string, Post[]>> = {};
  for (const post of posts) {
    const date = (post.meta.date || "").slice(0, 10);
    const year = date.slice(0, 4) || "未分类";
    const month = date.slice(0, 7) || year;
    if (!map[year]) map[year] = {};
    if (!map[year][month]) map[year][month] = [];
    map[year][month].push(post);
  }
  const years = Object.keys(map).sort((a, b) => b.localeCompare(a));
  return years.map((year) => {
    const months = Object.keys(map[year])
      .sort((a, b) => b.localeCompare(a))
      .map((month) => ({ month, list: map[year][month] }));
    return { year, months };
  });
}

function matchPost(post: Post, q: string): boolean {
  if (!q.trim()) return true;
  const lower = q.trim().toLowerCase();
  const title = (post.meta.title || "").toLowerCase();
  const date = (post.meta.date || "").toLowerCase();
  return title.includes(lower) || date.includes(lower);
}

export default function Sidebar({ posts, onClose }: { posts: Post[]; onClose?: () => void }) {
  const [search, setSearch] = useState("");
  const [collapsedYears, setCollapsedYears] = useState<Set<string>>(new Set());
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const location = useLocation();

  const byYearMonth = useMemo(() => groupPostsByYearMonth(posts), [posts]);

  const filtered = useMemo(() => {
    if (!search.trim()) return byYearMonth;
    return byYearMonth
      .map(({ year, months }) => ({
        year,
        months: months
          .map(({ month, list }) => ({
            month,
            list: list.filter((p) => matchPost(p, search)),
          }))
          .filter((m) => m.list.length > 0),
      }))
      .filter((g) => g.months.length > 0);
  }, [byYearMonth, search]);

  const toggleYear = (year: string) => {
    setCollapsedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  };

  const toggleMonth = (year: string, month: string) => {
    const key = `${year}:${month}`;
    setCollapsedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-id");
            if (id) {
              setVisibleItems((prev) => new Set(prev).add(id));
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    document.querySelectorAll(".timeline-item").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [filtered, search]);

  return (
    // <aside className="sidebar-wrap">
    <aside >
      <div className="sidebar-header">
        <p className="sidebar-title">文章列表</p>
        {onClose && (
          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            aria-label="关闭导航"
          >
            ✕
          </button>
        )}
      </div>
      <div className="sidebar-search-wrap">
        <input
          type="search"
          className="sidebar-search"
          placeholder="搜索文章…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="搜索文章"
        />
      </div>
      <div className="timeline-container">
        <div className="timeline-line" />
        {filtered.map(({ year, months }) => {
          const yearCollapsed = collapsedYears.has(year);
          const yearId = `year-${year}`;
          return (
            <div key={year} className="timeline-group timeline-group--year">
              <button
                type="button"
                className="timeline-toggle timeline-toggle--year"
                onClick={() => toggleYear(year)}
                aria-expanded={!yearCollapsed}
                aria-controls={yearId}
              >
                <span className="timeline-toggle-icon">{yearCollapsed ? "+" : "−"}</span>
                <span className="timeline-toggle-text">{year}</span>
                <span className="timeline-toggle-count">
                  {months.reduce((acc, m) => acc + m.list.length, 0)}
                </span>
              </button>
              {!yearCollapsed && (
                <div id={yearId} className="timeline-content">
                  {months.map(({ month, list }) => {
                    const key = `${year}:${month}`;
                    const monthCollapsed = collapsedMonths.has(key);
                    const monthId = `month-${key}`;
                    return (
                      <div key={month} className="timeline-group timeline-group--month">
                        <button
                          type="button"
                          className="timeline-toggle timeline-toggle--month"
                          onClick={() => toggleMonth(year, month)}
                          aria-expanded={!monthCollapsed}
                          aria-controls={monthId}
                        >
                          <span className="timeline-toggle-icon">{monthCollapsed ? "+" : "−"}</span>
                          <span className="timeline-toggle-text">{month}</span>
                          <span className="timeline-toggle-count">{list.length}</span>
                        </button>
                        {!monthCollapsed && (
                          <div id={monthId} className="timeline-content timeline-content--posts">
                            {list.map((post) => {
                              const itemId = `${year}-${month}-${post.slug}`;
                              const isVisible = visibleItems.has(itemId) || !search;
                              const isActive = location.pathname === `/post/${post.slug}`;
                              return (
                                <Link
                                  key={post.slug}
                                  to={`/post/${post.slug}`}
                                  className={`timeline-item ${isVisible ? "timeline-item--visible" : ""} ${isActive ? "timeline-item--active" : ""}`}
                                  data-id={itemId}
                                  title={post.meta.title}
                                  onClick={onClose}
                                >
                                  <span className="timeline-marker" />
                                  <div className="timeline-item-content">
                                    <div className="timeline-item-header">
                                      <span className="timeline-item-date">{post.meta.date?.slice(0, 10)}</span>
                                      {post.meta.category && (
                                        <span className="timeline-item-category">{post.meta.category}</span>
                                      )}
                                    </div>
                                    <span className="timeline-item-title">{post.meta.title}</span>
                                    {post.meta.tags && post.meta.tags.length > 0 && (
                                      <div className="timeline-item-tags">
                                        {post.meta.tags.slice(0, 3).map((tag) => (
                                          <span key={tag} className="timeline-tag">
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
