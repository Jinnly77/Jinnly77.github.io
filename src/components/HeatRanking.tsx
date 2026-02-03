import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { posts } from "virtual:posts";
import type { Post } from "../posts-data.d";
import { usePostVisitsContext } from "../context/PostVisitsContext";

function getTags(posts: Post[]): string[] {
  const set = new Set<string>();
  for (const post of posts) {
    for (const tag of post.meta.tags ?? []) {
      if (tag) set.add(tag);
    }
  }
  return Array.from(set).sort();
}

export default function HeatRanking({ onClose }: { onClose?: () => void }) {
  const { visits } = usePostVisitsContext();
  const [tagFilter, setTagFilter] = useState<string>("");

  const sorted = useMemo(() => {
    let list = posts.map((p) => ({
      post: p,
      count: visits[p.slug] ?? 0,
    }));
    if (tagFilter) {
      list = list.filter((item) => (item.post.meta.tags ?? []).includes(tagFilter));
    }
    list.sort((a, b) => b.count - a.count);
    return list;
  }, [visits, tagFilter]);

  const tags = useMemo(() => getTags(posts), []);

  return (
    <aside className="heat-ranking">
      <div className="heat-ranking-header">
        <div className="heat-ranking-title">热度榜</div>
        {onClose && (
          <button
            type="button"
            className="heat-ranking-close"
            onClick={onClose}
            aria-label="关闭热度榜"
          >
            ✕
          </button>
        )}
      </div>
      <div className="heat-ranking-filter">
        <label htmlFor="heat-tag" className="heat-ranking-label">
          标签
        </label>
        <select
          id="heat-tag"
          className="heat-ranking-select"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
        >
          <option value="">全部</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>
      <ul className="heat-ranking-list">
        {sorted.slice(0, 15).map(({ post, count }, i) => (
          <li key={post.slug} className="heat-ranking-item">
            <span className="heat-ranking-rank">{i + 1}</span>
            <Link to={`/post/${post.slug}`} className="heat-ranking-link" title={post.meta.title}>
              <span className="heat-ranking-link-title">{post.meta.title}</span>
              <span className="heat-ranking-count">{count} 次</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
