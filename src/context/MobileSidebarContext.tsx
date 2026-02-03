import { createContext, useContext, useState, ReactNode } from "react";

interface MobileSidebarContextType {
  leftOpen: boolean;
  rightOpen: boolean;
  toggleLeft: () => void;
  toggleRight: () => void;
  closeLeft: () => void;
  closeRight: () => void;
}

const MobileSidebarContext = createContext<MobileSidebarContextType | null>(null);

export function MobileSidebarProvider({ children }: { children: ReactNode }) {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const toggleLeft = () => setLeftOpen((prev) => !prev);
  const toggleRight = () => setRightOpen((prev) => !prev);
  const closeLeft = () => setLeftOpen(false);
  const closeRight = () => setRightOpen(false);

  return (
    <MobileSidebarContext.Provider value={{ leftOpen, rightOpen, toggleLeft, toggleRight, closeLeft, closeRight }}>
      {children}
    </MobileSidebarContext.Provider>
  );
}

export function useMobileSidebar() {
  const ctx = useContext(MobileSidebarContext);
  if (!ctx) throw new Error("useMobileSidebar must be used within MobileSidebarProvider");
  return ctx;
}
