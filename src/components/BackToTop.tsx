import { useState, useEffect } from "react";
import { useContext } from "react";
import { ReadingProgressContext } from "../context/ReadingProgressContext";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const { progress } = useContext(ReadingProgressContext);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  const showProgress = progress != null;

  return (
    <button
      type="button"
      className="back-to-top"
      onClick={scrollToTop}
      aria-label="回到顶部"
      title={showProgress ? `阅读进度 ${progress}%` : "回到顶部"}
    >
      {showProgress ? (
        <span className="back-to-top-progress">{progress}%</span>
      ) : (
        "↑"
      )}
    </button>
  );
}
