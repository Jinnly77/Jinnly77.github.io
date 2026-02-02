import { Link } from "react-router-dom";
import { posts } from "virtual:posts";
import type { Post } from "../posts-data.d";

function getTags(posts: Post[]): { name: string; count: number }[] {
  const map: Record<string, number> = {};
  for (const post of posts) {
    for (const tag of post.meta.tags ?? []) {
      map[tag] = (map[tag] ?? 0) + 1;
    }
  }
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export default function Tags() {
  const tags = getTags(posts);

  return (
    <div>
      <h1>标签</h1>
      <ul className="page-list">
        {tags.map(({ name, count }) => (
          <li key={name}>
            <Link to={`/tags/${encodeURIComponent(name)}`}>
              <span>{name}</span>
              <span className="count">{count} 篇</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
