import { useState, useEffect } from "react";

const VISITS_KEY = "blog-visits";
const VISITORS_KEY = "blog-visitors";
const VISITOR_ID_KEY = "blog-visitor-id";

function getOrCreateVisitorId(): string {
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = "v_" + Date.now() + "_" + Math.random().toString(36).slice(2, 11);
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

function loadVisitors(): Set<string> {
  try {
    const raw = localStorage.getItem(VISITORS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveVisitors(set: Set<string>) {
  localStorage.setItem(VISITORS_KEY, JSON.stringify([...set]));
}

export function useVisitStats() {
  const [visits, setVisits] = useState(0);
  const [visitors, setVisitors] = useState(0);

  useEffect(() => {
    const visitCount = parseInt(localStorage.getItem(VISITS_KEY) ?? "0", 10) || 0;
    const nextVisits = visitCount + 1;
    localStorage.setItem(VISITS_KEY, String(nextVisits));
    setVisits(nextVisits);

    const visitorId = getOrCreateVisitorId();
    const visitorSet = loadVisitors();
    visitorSet.add(visitorId);
    saveVisitors(visitorSet);
    setVisitors(visitorSet.size);
  }, []);

  return { visits, visitors };
}
