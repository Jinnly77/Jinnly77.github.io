import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { posts } from "virtual:posts";
import KeywordSphere from "../components/KeywordSphere";
import WelcomeMessage from "../components/WelcomeMessage";
import HeatRanking from "../components/HeatRanking";
import { useMobileSidebar } from "../context/MobileSidebarContext";

function getExcerpt(post: { content: string; meta: { description?: string } }): string {
  if (post.meta.description) {
    return post.meta.description;
  }
  const text = post.content
    .replace(/^---[\s\S]*?---/, "")
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*?|__?/g, "")
    .replace(/`/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s*[-*+]\s/gm, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 150);
  return text.length > 150 ? `${text}...` : text;
}

const POSTS_PER_PAGE = 10;

export default function Index() {
  const { rightOpen, closeRight, toggleLeft, toggleRight } = useMobileSidebar();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = posts.slice(startIndex, endIndex);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in-visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const items = document.querySelectorAll(".post-item");
    items.forEach((item) => observerRef.current?.observe(item));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
            {currentPosts.map((post, index) => (
              <li key={`${post.slug}-${currentPage}-${index}`} className="post-item">
                <Link to={`/post/${post.slug}`}>
                  <time dateTime={post.meta.date}>{post.meta.date}</time>
                  <span className="title">{post.meta.title}</span>
                </Link>
                <p className="description">{getExcerpt(post)}</p>
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
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                上一页
              </button>
              <span className="pagination-info">
                {currentPage} / {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                下一页
              </button>
            </div>
          )}
        </div>
        <aside className={`index-sidebar ${rightOpen ? "mobile-open" : ""}`}>
          <HeatRanking onClose={closeRight} />
        </aside>
      </div>
      <button
        type="button"
        className="mobile-sidebar-toggle-left"
        onClick={toggleLeft}
        aria-label="查看文章列表"
        title="文章列表"
      >
        📝
      </button>
      <button
        type="button"
        className="mobile-sidebar-toggle-right"
        onClick={toggleRight}
        aria-label="查看热度榜"
        title="热度榜"
      >
        🔥
      </button>
      {rightOpen && (
        <div
          className="sidebar-overlay sidebar-overlay--right"
          onClick={closeRight}
        />
      )}
    </div>
  );
}
