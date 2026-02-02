import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { posts } from "virtual:posts";
import NavBar from "./NavBar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import SearchModal from "./SearchModal";
import BackToTop from "./BackToTop";

export default function Layout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

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
        onToggleLeftSidebar={() => setLeftSidebarOpen((prev) => !prev)}
        onToggleRightSidebar={() => setRightSidebarOpen((prev) => !prev)}
      />
      <div className={`sidebar-wrap ${leftSidebarOpen ? "mobile-open" : ""}`}>
        <Sidebar posts={posts} />
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
      {/* Mobile sidebar overlay */}
      {leftSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setLeftSidebarOpen(false)}
        />
      )}
    </div>
  );
}
