import { Link, NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { siteConfig } from "../config";

export default function NavBar({
  onSearchOpen,
}: {
  onSearchOpen: () => void;
}) {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { to: "/", label: "首页" },
    { to: "/categories", label: "类别" },
    { to: "/tags", label: "标签" },
    { to: "/archive", label: "归档" },
    { to: "/about", label: "关于" },
  ];

  return (
    <nav className="nav-bar">
      <div className="nav-start">
        <Link to="/" className="logo">
          {siteConfig.title}
        </Link>
      </div>
      <ul className="nav-links">
        {navItems.map(({ to, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) => (isActive ? "active" : undefined)}
              end={to === "/"}
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="nav-actions">
        <button
          type="button"
          className="search-btn"
          onClick={onSearchOpen}
          aria-label="搜索"
        >
          <span aria-hidden>🔍</span>
          <span>搜索</span>
          <span className="search-kbd">⌘K</span>
        </button>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "切换到浅色" : "切换到深色"}
          title={theme === "dark" ? "浅色模式" : "深色模式"}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
}
