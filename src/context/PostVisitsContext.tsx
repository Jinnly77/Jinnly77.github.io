import React, { createContext, useContext } from "react";
import { usePostVisits } from "../hooks/usePostVisits";

const PostVisitsContext = createContext<ReturnType<typeof usePostVisits> | null>(null);

export function PostVisitsProvider({ children }: { children: React.ReactNode }) {
  const value = usePostVisits();
  return (
    <PostVisitsContext.Provider value={value}>
      {children}
    </PostVisitsContext.Provider>
  );
}

export function usePostVisitsContext() {
  const ctx = useContext(PostVisitsContext);
  if (!ctx) throw new Error("usePostVisitsContext must be used within PostVisitsProvider");
  return ctx;
}
