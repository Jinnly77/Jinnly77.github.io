import { useEffect, useRef } from "react";
import { ANIMATION_DURATION_S, ANIMATION_OFFSET_PX } from "../config/animationConfig";

export function usePostFadeIn(currentPage = 1) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--animation-duration', `${ANIMATION_DURATION_S}s`);
    root.style.setProperty('--animation-offset', `${ANIMATION_OFFSET_PX}px`);
    return () => {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--animation-offset');
    };
  }, []);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            target.classList.add("fade-in-visible");
            target.dataset.animated = "true";
          } else if (entry.boundingClientRect.top > 0) {
            target.classList.remove("fade-in-visible");
            delete target.dataset.animated;
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: "50px 0px 50px 0px",
      }
    );

    const items = document.querySelectorAll(".post-item");
    items.forEach((item) => {
      const htmlItem = item as HTMLElement;
      htmlItem.classList.remove("fade-in-visible");
      delete htmlItem.dataset.animated;
      observerRef.current?.observe(htmlItem);
    });

    items.forEach((item) => {
      const htmlItem = item as HTMLElement;
      const rect = htmlItem.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
      if (isInViewport) {
        htmlItem.classList.add("fade-in-visible");
        htmlItem.dataset.animated = "true";
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [currentPage]);
}
