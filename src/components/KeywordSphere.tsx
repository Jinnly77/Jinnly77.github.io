import { useMemo, useRef, useEffect, useState } from "react";
import type { Post } from "../posts-data.d";

const RADIUS = 130;
const WORD_COUNT = 60;

function extractKeywords(posts: Post[]): { word: string; count: number }[] {
  const map: Record<string, number> = {};
  for (const post of posts) {
    for (const tag of post.meta.tags ?? []) {
      const t = tag.trim();
      if (t) map[t] = (map[t] ?? 0) + 1;
    }
    const text = (post.meta.title + " " + (post.meta.description ?? "") + " " + post.content)
      .replace(/^---[\s\S]*?---/, "")
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*?|__?/g, "")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/`/g, "")
      .replace(/\s+/g, " ");

    const tokens = text.split(/[\s\p{P}\p{S}]+/u).filter((s) => s.length >= 2);
    for (const t of tokens) {
      if (t) {
        const w = t.slice(0, 12);
        map[w] = (map[w] ?? 0) + 1;
      }
    }
  }
  const arr = Object.entries(map)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, WORD_COUNT);
  return arr;
}

function spherePosition(index: number, total: number) {
  const phi = Math.acos(-1 + (2 * index) / total);
  const theta = Math.sqrt(total * Math.PI) * phi;
  const x = RADIUS * Math.cos(theta) * Math.sin(phi);
  const y = RADIUS * Math.sin(theta) * Math.sin(phi);
  const z = RADIUS * Math.cos(phi);
  return { x, y, z };
}

// Calculate transformed Z position after rotation
function getTransformedZ(x: number, y: number, z: number, rotateX: number, rotateY: number): number {
  const radX = (rotateX * Math.PI) / 180;
  const radY = (rotateY * Math.PI) / 180;

  // Apply rotation around Y axis
  let x1 = x * Math.cos(radY) - z * Math.sin(radY);
  let z1 = x * Math.sin(radY) + z * Math.cos(radY);

  // Apply rotation around X axis
  let y1 = y * Math.cos(radX) - z1 * Math.sin(radX);
  let z2 = y * Math.sin(radX) + z1 * Math.cos(radX);

  return z2;
}

export default function KeywordSphere({ posts }: { posts: Post[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const dragRef = useRef({ down: false, startX: 0, startY: 0, startRotX: 0, startRotY: 0 });

  const words = useMemo(() => extractKeywords(posts), [posts]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMouseDown = (e: MouseEvent) => {
      dragRef.current = {
        down: true,
        startX: e.clientX,
        startY: e.clientY,
        startRotX: rotate.x,
        startRotY: rotate.y,
      };
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.down) return;
      setRotate({
        x: dragRef.current.startRotX + (e.clientY - dragRef.current.startY) * 0.5,
        y: dragRef.current.startRotY + (e.clientX - dragRef.current.startX) * 0.5,
      });
    };
    const onMouseUp = () => {
      dragRef.current.down = false;
    };
    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [rotate.x, rotate.y]);

  if (words.length === 0) return null;

  return (
    <div className="keyword-sphere-wrap" ref={containerRef}>
      <div
        className="keyword-sphere"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        }}
      >
        {words.map(({ word }, i) => {
          const { x, y, z } = spherePosition(i, words.length);

          // Calculate actual Z position after rotation for dynamic effects
          const transformedZ = getTransformedZ(x, y, z, rotate.x, rotate.y);
          const zNormalized = (transformedZ + RADIUS) / (2 * RADIUS);

          // Very strong opacity contrast for depth
          const opacity = 0.15 + zNormalized * 0.85;

          // Maximum scale variation (0.3 to 1.7) for strongest 3D effect
          const depthScale = 0.3 + zNormalized * 1.4;

          // Stronger blur for back words
          const blur = zNormalized < 0.4 ? (1 - zNormalized * 2.5) * 5 : 0;

          return (
            <span
              key={`${word}-${i}`}
              className="keyword-sphere-word"
              style={{
                transform: `translate(-50%, -50%) translate3d(${x}px,${y}px,${z}px) scale(${depthScale}) rotateY(${-rotate.y}deg) rotateX(${-rotate.x}deg)`,
                opacity,
                filter: blur > 0.3 ? `blur(${blur}px)` : 'none',
                zIndex: Math.round(transformedZ + RADIUS),
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
}
