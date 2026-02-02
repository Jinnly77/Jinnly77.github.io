import React, { createContext, useContext, useState } from "react";

export const ReadingProgressContext = createContext<{
  progress: number | null;
  setProgress: (v: number | null) => void;
}>({ progress: null, setProgress: () => {} });

export function ReadingProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<number | null>(null);
  return (
    <ReadingProgressContext.Provider value={{ progress, setProgress }}>
      {children}
    </ReadingProgressContext.Provider>
  );
}

export function useReadingProgress() {
  return useContext(ReadingProgressContext);
}
