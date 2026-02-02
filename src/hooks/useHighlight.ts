import { useEffect } from "react";
import hljs from "highlight.js";

// Import theme styles dynamically based on current theme
let currentTheme: string | null = null;

function loadTheme(theme: "light" | "dark") {
  const themeName = theme === "dark" ? "github-dark" : "github";
  if (currentTheme === themeName) return;

  // Remove old theme
  const oldLink = document.querySelector(`link[data-highlight-theme]`);
  if (oldLink) oldLink.remove();

  // Add new theme
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${themeName}.min.css`;
  link.setAttribute("data-highlight-theme", "true");
  document.head.appendChild(link);
  currentTheme = themeName;
}

export function useHighlight(theme: "light" | "dark" = "dark", deps: React.DependencyList = []) {
  useEffect(() => {
    loadTheme(theme);

    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      document.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [theme, ...deps]);
}
