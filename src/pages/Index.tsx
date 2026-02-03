import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { posts } from "virtual:posts";
import KeywordSphere from "../components/KeywordSphere";
import WelcomeMessage from "../components/WelcomeMessage";
import HeatRanking from "../components/HeatRanking";

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

    // 观察所有文章项，处理进入和离开视口的动画
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 元素进入视口：显示并添加动画
            entry.target.classList.add("fade-in-visible");
            entry.target.dataset.animated = "true";
          } else if (entry.boundingClientRect.top > 0) {
            // 元素离开视口上方：重置动画状态以便下次进入时重新动画
            // boundingClientRect.top > 0 表示元素在视口上方
            entry.target.classList.remove("fade-in-visible");
            delete entry.target.dataset.animated;
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: "50px 0px 50px 0px", // 上下各扩展50px，提前触发动画
      }
    );

    // 观察所有文章项（包括已动画的，因为可能需要重新触发）
    const items = document.querySelectorAll(".post-item");
    items.forEach((item) => {
      // 先重置状态，确保翻页后所有元素都能正确触发动画
      item.classList.remove("fade-in-visible");
      delete item.dataset.animated;
      observerRef.current?.observe(item);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [currentPage]); // 翻页时重新设置观察器，确保新内容正确触发动画

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
        <aside className="index-sidebar">
          <HeatRanking />
        </aside>
      </div>
      {/* 移除重复的遮罩层，使用 Layout.tsx 中的统一样式，避免移动端弹窗被遮罩覆盖无法显示内容 */}
    </div>
  );
}
