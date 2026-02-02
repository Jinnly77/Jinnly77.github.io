import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { posts } from "virtual:posts";
import type { Post } from "../posts-data.d";

type ArchiveTab = "category" | "tag" | "time";
type ViewMode = "list" | "mindmap";

function groupByCategory(posts: Post[]): Record<string, Post[]> {
  const map: Record<string, Post[]> = {};
  for (const post of posts) {
    const cat = post.meta.category || "未分类";
    if (!map[cat]) map[cat] = [];
    map[cat].push(post);
  }
  const keys = Object.keys(map).sort((a, b) => map[b].length - map[a].length);
  const result: Record<string, Post[]> = {};
  for (const k of keys) result[k] = map[k];
  return result;
}

function groupByTag(posts: Post[]): Record<string, Post[]> {
  const map: Record<string, Post[]> = {};
  for (const post of posts) {
    for (const tag of post.meta.tags ?? []) {
      if (!map[tag]) map[tag] = [];
      map[tag].push(post);
    }
  }
  const keys = Object.keys(map).sort((a, b) => map[b].length - map[a].length);
  const result: Record<string, Post[]> = {};
  for (const k of keys) result[k] = map[k];
  return result;
}

function groupByTime(posts: Post[]): Record<string, Record<string, Post[]>> {
  const map: Record<string, Record<string, Post[]>> = {};
  for (const post of posts) {
    const date = post.meta.date || "";
    const year = date.slice(0, 4) || "未分类";
    const month = date.slice(0, 7) || year;
    if (!map[year]) map[year] = {};
    if (!map[year][month]) map[year][month] = [];
    map[year][month].push(post);
  }
  const years = Object.keys(map).sort((a, b) => b.localeCompare(a));
  const result: Record<string, Record<string, Post[]>> = {};
  for (const y of years) {
    const months = Object.keys(map[y]).sort((a, b) => b.localeCompare(a));
    const sorted: Record<string, Post[]> = {};
    for (const m of months) {
      sorted[m] = [...map[y][m]].sort((a, b) =>
        (b.meta.date || "").localeCompare(a.meta.date || "")
      );
    }
    result[y] = sorted;
  }
  return result;
}

function ArchiveListByCategory({
  byCategory,
  collapsed,
  onToggle,
}: {
  byCategory: Record<string, Post[]>;
  collapsed: Set<string>;
  onToggle: (key: string) => void;
}) {
  return (
    <div className="archive-list archive-list--category">
      {Object.entries(byCategory).map(([name, list]) => {
        const key = `cat:${name}`;
        const isCollapsed = collapsed.has(key);
        return (
          <div key={name} className="archive-group">
            <h2 className="archive-group-title archive-group-title--clickable">
              <button
                type="button"
                className="archive-group-toggle"
                onClick={() => onToggle(key)}
                aria-expanded={!isCollapsed}
              >
                {isCollapsed ? "▶" : "▼"}
              </button>
              <span>{name}</span>
              <span className="archive-group-count">{list.length} 篇</span>
            </h2>
            {!isCollapsed && (
              <ul className="page-list">
                {list.map((post) => (
                  <li key={post.slug}>
                    <Link to={`/post/${post.slug}`}>
                      <span>{post.meta.title}</span>
                      <span className="count">{post.meta.date}</span>
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
}

function ArchiveListByTag({
  byTag,
  collapsed,
  onToggle,
}: {
  byTag: Record<string, Post[]>;
  collapsed: Set<string>;
  onToggle: (key: string) => void;
}) {
  return (
    <div className="archive-list archive-list--tag">
      {Object.entries(byTag).map(([name, list]) => {
        const key = `tag:${name}`;
        const isCollapsed = collapsed.has(key);
        return (
          <div key={name} className="archive-group">
            <h2 className="archive-group-title archive-group-title--clickable">
              <button
                type="button"
                className="archive-group-toggle"
                onClick={() => onToggle(key)}
                aria-expanded={!isCollapsed}
              >
                {isCollapsed ? "▶" : "▼"}
              </button>
              <span>{name}</span>
              <span className="archive-group-count">{list.length} 篇</span>
            </h2>
            {!isCollapsed && (
              <ul className="page-list">
                {list.map((post) => (
                  <li key={post.slug}>
                    <Link to={`/post/${post.slug}`}>
                      <span>{post.meta.title}</span>
                      <span className="count">{post.meta.date}</span>
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
}

function ArchiveListByTime({
  byTime,
  collapsed,
  onToggle,
}: {
  byTime: Record<string, Record<string, Post[]>>;
  collapsed: Set<string>;
  onToggle: (key: string) => void;
}) {
  const years = Object.keys(byTime).sort((a, b) => b.localeCompare(a));
  return (
    <div className="archive-list archive-list--time">
      {years.map((year) => {
        const months = byTime[year];
        const yearKey = `time:${year}`;
        const yearCollapsed = collapsed.has(yearKey);
        return (
          <div key={year} className="archive-group archive-year">
            <h2 className="archive-group-title archive-group-title--clickable">
              <button
                type="button"
                className="archive-group-toggle"
                onClick={() => onToggle(yearKey)}
                aria-expanded={!yearCollapsed}
              >
                {yearCollapsed ? "▶" : "▼"}
              </button>
              <span>{year}</span>
            </h2>
            {!yearCollapsed &&
              Object.entries(months)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([month, list]) => {
                  const monthKey = `time:${year}:${month}`;
                  const monthCollapsed = collapsed.has(monthKey);
                  return (
                    <div key={month} className="archive-month">
                      <h3 className="archive-month-title archive-month-title--clickable">
                        <button
                          type="button"
                          className="archive-group-toggle"
                          onClick={() => onToggle(monthKey)}
                          aria-expanded={!monthCollapsed}
                        >
                          {monthCollapsed ? "▶" : "▼"}
                        </button>
                        <span>{month}</span>
                        <span className="archive-group-count">{list.length} 篇</span>
                      </h3>
                      {!monthCollapsed && (
                        <ul className="page-list">
                          {list.map((post) => (
                            <li key={post.slug}>
                              <Link to={`/post/${post.slug}`}>
                                <span>{post.meta.title}</span>
                                <span className="count">{post.meta.date}</span>
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
    </div>
  );
}

function MindMapCategory({
  byCategory,
  collapsed,
  onToggle,
}: {
  byCategory: Record<string, Post[]>;
  collapsed: Set<string>;
  onToggle: (key: string) => void;
}) {
  const entries = Object.entries(byCategory);
  return (
    <div className="mindmap mindmap--category">
      <div className="mindmap-root">归档 · 分类</div>
      <div className="mindmap-branches">
        {entries.map(([name, list]) => {
          const key = `cat:${name}`;
          const isCollapsed = collapsed.has(key);
          return (
            <div key={name} className="mindmap-branch">
              <div
                className="mindmap-node mindmap-node--branch mindmap-node--clickable"
                role="button"
                tabIndex={0}
                onClick={() => onToggle(key)}
                onKeyDown={(e) => e.key === "Enter" && onToggle(key)}
              >
                <span className="mindmap-toggle">{isCollapsed ? "▶" : "▼"}</span>
                <span>{name}</span>
                <span className="mindmap-count">{list.length} 篇</span>
              </div>
              {!isCollapsed && (
                <div className="mindmap-children">
                  {list.map((post) => (
                    <Link
                      key={post.slug}
                      to={`/post/${post.slug}`}
                      className="mindmap-node mindmap-node--leaf"
                    >
                      {post.meta.title}
                      <span className="mindmap-meta">{post.meta.date}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MindMapTag({
  byTag,
  collapsed,
  onToggle,
}: {
  byTag: Record<string, Post[]>;
  collapsed: Set<string>;
  onToggle: (key: string) => void;
}) {
  return (
    <div className="mindmap mindmap--tag">
      <div className="mindmap-root">归档 · 标签</div>
      <div className="mindmap-branches">
        {Object.entries(byTag).map(([name, list]) => {
          const key = `tag:${name}`;
          const isCollapsed = collapsed.has(key);
          return (
            <div key={name} className="mindmap-branch">
              <div
                className="mindmap-node mindmap-node--branch mindmap-node--clickable"
                role="button"
                tabIndex={0}
                onClick={() => onToggle(key)}
                onKeyDown={(e) => e.key === "Enter" && onToggle(key)}
              >
                <span className="mindmap-toggle">{isCollapsed ? "▶" : "▼"}</span>
                <span>{name}</span>
                <span className="mindmap-count">{list.length} 篇</span>
              </div>
              {!isCollapsed && (
                <div className="mindmap-children">
                  {list.map((post) => (
                    <Link
                      key={post.slug}
                      to={`/post/${post.slug}`}
                      className="mindmap-node mindmap-node--leaf"
                    >
                      {post.meta.title}
                      <span className="mindmap-meta">{post.meta.date}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MindMapTime({
  byTime,
  collapsed,
  onToggle,
}: {
  byTime: Record<string, Record<string, Post[]>>;
  collapsed: Set<string>;
  onToggle: (key: string) => void;
}) {
  const years = Object.keys(byTime).sort((a, b) => b.localeCompare(a));
  return (
    <div className="mindmap mindmap--time">
      <div className="mindmap-root">归档 · 时间</div>
      <div className="mindmap-branches mindmap-branches--time">
        {years.map((year) => {
          const months = byTime[year];
          const yearKey = `time:${year}`;
          const yearCollapsed = collapsed.has(yearKey);
          return (
            <div key={year} className="mindmap-branch mindmap-branch--year">
              <div
                className="mindmap-node mindmap-node--branch mindmap-node--clickable"
                role="button"
                tabIndex={0}
                onClick={() => onToggle(yearKey)}
                onKeyDown={(e) => e.key === "Enter" && onToggle(yearKey)}
              >
                <span className="mindmap-toggle">{yearCollapsed ? "▶" : "▼"}</span>
                <span>{year}</span>
              </div>
              {!yearCollapsed && (
                <div className="mindmap-subbranches">
                  {Object.entries(months)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([month, list]) => {
                      const monthKey = `time:${year}:${month}`;
                      const monthCollapsed = collapsed.has(monthKey);
                      return (
                        <div key={month} className="mindmap-branch mindmap-branch--month">
                          <div
                            className="mindmap-node mindmap-node--sub mindmap-node--clickable"
                            role="button"
                            tabIndex={0}
                            onClick={() => onToggle(monthKey)}
                            onKeyDown={(e) => e.key === "Enter" && onToggle(monthKey)}
                          >
                            <span className="mindmap-toggle">{monthCollapsed ? "▶" : "▼"}</span>
                            <span>{month}</span>
                            <span className="mindmap-count">{list.length} 篇</span>
                          </div>
                          {!monthCollapsed && (
                            <div className="mindmap-children">
                              {list.map((post) => (
                                <Link
                                  key={post.slug}
                                  to={`/post/${post.slug}`}
                                  className="mindmap-node mindmap-node--leaf"
                                >
                                  {post.meta.title}
                                  <span className="mindmap-meta">{post.meta.date}</span>
                                </Link>
                              ))}
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
    </div>
  );
}

export default function Archive() {
  const [tab, setTab] = useState<ArchiveTab>("time");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const byCategory = useMemo(() => groupByCategory(posts), []);
  const byTag = useMemo(() => groupByTag(posts), []);
  const byTime = useMemo(() => groupByTime(posts), []);

  const toggleArchive = (key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const tabs: { id: ArchiveTab; label: string }[] = [
    { id: "category", label: "分类" },
    { id: "tag", label: "标签" },
    { id: "time", label: "时间" },
  ];

  return (
    <div className="archive-page">
      <div className="archive-header">
        <h1>归档</h1>
        <div className="archive-controls">
          <div className="archive-tabs" role="tablist">
            {tabs.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                className={`archive-tab ${tab === id ? "archive-tab--active" : ""}`}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="archive-view-toggle">
            <button
              type="button"
              className={`archive-view-btn ${viewMode === "list" ? "archive-view-btn--active" : ""}`}
              onClick={() => setViewMode("list")}
              title="列表"
            >
              列表
            </button>
            <button
              type="button"
              className={`archive-view-btn ${viewMode === "mindmap" ? "archive-view-btn--active" : ""}`}
              onClick={() => setViewMode("mindmap")}
              title="脑图"
            >
              脑图
            </button>
          </div>
        </div>
      </div>

      <div className="archive-content">
        {viewMode === "list" && (
          <>
            {tab === "category" && (
              <ArchiveListByCategory
                byCategory={byCategory}
                collapsed={collapsed}
                onToggle={toggleArchive}
              />
            )}
            {tab === "tag" && (
              <ArchiveListByTag byTag={byTag} collapsed={collapsed} onToggle={toggleArchive} />
            )}
            {tab === "time" && (
              <ArchiveListByTime byTime={byTime} collapsed={collapsed} onToggle={toggleArchive} />
            )}
          </>
        )}
        {viewMode === "mindmap" && (
          <>
            {tab === "category" && (
              <MindMapCategory
                byCategory={byCategory}
                collapsed={collapsed}
                onToggle={toggleArchive}
              />
            )}
            {tab === "tag" && (
              <MindMapTag byTag={byTag} collapsed={collapsed} onToggle={toggleArchive} />
            )}
            {tab === "time" && (
              <MindMapTime byTime={byTime} collapsed={collapsed} onToggle={toggleArchive} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
