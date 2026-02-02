import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import type { Post } from "../posts-data.d";

/** 按年、月分组，年月倒序（新在前） */
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

export default function Sidebar({ posts }: { posts: Post[] }) {
  const [search, setSearch] = useState("");
  const [collapsedYears, setCollapsedYears] = useState<Set<string>>(new Set());
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());

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

  return (
    <aside className="sidebar-wrap">
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
      <p className="sidebar-title">文章列表</p>
      {filtered.map(({ year, months }) => {
        const yearCollapsed = collapsedYears.has(year);
        return (
          <div key={year} className="sidebar-group sidebar-group--year">
            <p className="sidebar-date sidebar-date--clickable">
              <button
                type="button"
                className="sidebar-toggle"
                onClick={() => toggleYear(year)}
                aria-expanded={!yearCollapsed}
              >
                {yearCollapsed ? "▶" : "▼"}
              </button>
              <span>{year}</span>
            </p>
            {!yearCollapsed &&
              months.map(({ month, list }) => {
                const key = `${year}:${month}`;
                const monthCollapsed = collapsedMonths.has(key);
                return (
                  <div key={month} className="sidebar-group sidebar-group--month">
                    <p className="sidebar-month sidebar-month--clickable">
                      <button
                        type="button"
                        className="sidebar-toggle"
                        onClick={() => toggleMonth(year, month)}
                        aria-expanded={!monthCollapsed}
                      >
                        {monthCollapsed ? "▶" : "▼"}
                      </button>
                      <span>{month}</span>
                    </p>
                    {!monthCollapsed && (
                      <ul className="sidebar-list">
                        {list.map((post) => (
                          <li key={post.slug}>
                            <Link
                              to={`/post/${post.slug}`}
                              className="sidebar-link"
                              title={post.meta.title}
                            >
                              <span className="sidebar-link-title">{post.meta.title}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
          </div>
        );
      })}
    </aside>
  );
}
