import { Link } from "react-router-dom";
import { posts } from "virtual:posts";
import type { Post } from "../posts-data.d";

function getCategories(posts: Post[]): { name: string; count: number }[] {
  const map: Record<string, number> = {};
  for (const post of posts) {
    const cat = post.meta.category || "未分类";
    map[cat] = (map[cat] ?? 0) + 1;
  }
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export default function Categories() {
  const categories = getCategories(posts);

  return (
    <div>
      <h1>类别</h1>
      <ul className="page-list">
        {categories.map(({ name, count }) => (
          <li key={name}>
            <Link to={`/categories/${encodeURIComponent(name)}`}>
              <span>{name}</span>
              <span className="count">{count} 篇</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
