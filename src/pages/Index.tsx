import { Link } from "react-router-dom";
import { posts } from "virtual:posts";
import KeywordSphere from "../components/KeywordSphere";
import WelcomeMessage from "../components/WelcomeMessage";
import HeatRanking from "../components/HeatRanking";
import { useMobileSidebar } from "../context/MobileSidebarContext";

export default function Index() {
  const { rightOpen, closeRight } = useMobileSidebar();

  return (
    <div className="index-page">
      <section className="index-cloud-section">
        <div className="index-cloud-left">
          <WelcomeMessage />
        </div>
        <div className="index-cloud-right">
          <KeywordSphere posts={posts} />
        </div>
      </section>
      <div className="index-content-layout">
        <div className="index-main">
          <h1>文章</h1>
          <ul className="post-list">
            {posts.map((post) => (
              <li key={post.slug} className="post-item">
                <Link to={`/post/${post.slug}`}>
                  <time dateTime={post.meta.date}>{post.meta.date}</time>
                  <span className="title">{post.meta.title}</span>
                </Link>
                {post.meta.description && (
                  <p className="description">{post.meta.description}</p>
                )}
                {(post.meta.tags?.length ?? 0) > 0 && (
                  <div className="tags-inline">
                    {post.meta.tags!.map((tag) => (
                      <span key={tag} className="tag-pill">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        <aside className={`index-sidebar ${rightOpen ? "mobile-open" : ""}`}>
          <HeatRanking onClose={closeRight} />
        </aside>
      </div>
      {rightOpen && (
        <div
          className="sidebar-overlay sidebar-overlay--right"
          onClick={closeRight}
        />
      )}
    </div>
  );
}
