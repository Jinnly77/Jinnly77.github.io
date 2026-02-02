import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "blog-post-visits";

function loadVisits(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return typeof obj === "object" && obj !== null ? obj : {};
  } catch {
    return {};
  }
}

function saveVisits(visits: Record<string, number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
}

export function usePostVisits() {
  const [visits, setVisits] = useState<Record<string, number>>({});

  useEffect(() => {
    setVisits(loadVisits());
  }, []);

  const increment = useCallback((slug: string) => {
    setVisits((prev) => {
      const next = { ...prev, [slug]: (prev[slug] ?? 0) + 1 };
      saveVisits(next);
      return next;
    });
  }, []);

  return { visits, increment };
}
