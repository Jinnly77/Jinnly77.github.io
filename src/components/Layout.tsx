import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { posts } from "virtual:posts";
import NavBar from "./NavBar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import SearchModal from "./SearchModal";
import BackToTop from "./BackToTop";
import { useMobileSidebar } from "../context/MobileSidebarContext";
import { useMobileToc } from "../context/MobileTocContext";

export default function Layout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { leftOpen, rightOpen, toggleLeft, toggleRight, closeLeft, closeRight } = useMobileSidebar();
  const { tocOpen, toggleToc, closeToc } = useMobileToc();
  const location = useLocation();
  const isIndexPage = location.pathname === "/";
  const isPostPage = location.pathname.startsWith("/post/");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="app-layout">
      <NavBar
        onSearchOpen={() => setSearchOpen(true)}
        onToggleLeftSidebar={leftOpen ? closeLeft : toggleLeft}
        onToggleRightSidebar={rightOpen ? closeRight : toggleRight}
        showRightToggle={isIndexPage}
      />
      <div className={`sidebar-wrap ${leftOpen ? "mobile-open" : ""}`}>
        <Sidebar posts={posts} onClose={closeLeft} />
      </div>
      <main className="main-wrap">
        <Outlet />
      </main>
      <Footer />
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        posts={posts}
      />
      <BackToTop />
      {/* Mobile left sidebar overlay */}
      {leftOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeLeft}
        />
      )}
      {/* Mobile right sidebar overlay */}
      {rightOpen && (
        <div
          className="sidebar-overlay sidebar-overlay--right"
          onClick={closeRight}
        />
      )}
      {/* Mobile TOC overlay */}
      {tocOpen && (
        <div
          className="toc-overlay"
          onClick={closeToc}
        />
      )}
    </div>
  );
}
