import { Link, useParams } from "react-router-dom";
import { posts } from "virtual:posts";

export default function TagPosts() {
  const { name } = useParams<{ name: string }>();
  const decoded = name ? decodeURIComponent(name) : "";
  const list = posts.filter((p) => (p.meta.tags ?? []).includes(decoded));

  return (
    <div>
      <h1>标签：{decoded}</h1>
      <ul className="post-list">
        {list.map((post) => (
          <li key={post.slug} className="post-item">
            <Link to={`/post/${post.slug}`}>
              <time dateTime={post.meta.date}>{post.meta.date}</time>
              <span className="title">{post.meta.title}</span>
            </Link>
            {post.meta.description && (
              <p className="description">{post.meta.description}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
