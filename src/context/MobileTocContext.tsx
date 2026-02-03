import { createContext, useContext, useState, ReactNode } from "react";

interface MobileTocContextType {
  tocOpen: boolean;
  toggleToc: () => void;
  closeToc: () => void;
}

const MobileTocContext = createContext<MobileTocContextType | null>(null);

export function MobileTocProvider({ children }: { children: ReactNode }) {
  const [tocOpen, setTocOpen] = useState(false);

  const toggleToc = () => setTocOpen((prev) => !prev);
  const closeToc = () => setTocOpen(false);

  return (
    <MobileTocContext.Provider value={{ tocOpen, toggleToc, closeToc }}>
      {children}
    </MobileTocContext.Provider>
  );
}

export function useMobileToc() {
  const ctx = useContext(MobileTocContext);
  if (!ctx) throw new Error("useMobileToc must be used within MobileTocProvider");
  return ctx;
}
