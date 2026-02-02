import { useState, useEffect, useRef } from "react";

// 使用 Visitor Badge API 获取真实访问统计
// 这个服务会记录所有访问，跨浏览器统计
const BADGE_ID = "Jinnly77.github.io"; // 你的唯一标识符

export function useVisitStats() {
  const [visits, setVisits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const countedRef = useRef(false);

  useEffect(() => {
    // 防止 StrictMode 导致的重复调用
    if (countedRef.current) return;
    countedRef.current = true;

    // 发送请求来增加计数（通过 img 标签或 fetch）
    // Visitor Badge API 会在每次访问时自动增加计数
    const badgeUrl = `https://visitor-badge.laobi.icu/badge?page_id=${BADGE_ID}`;

    // 先增加计数
    fetch(badgeUrl, { mode: 'no-cors' })
      .catch(() => {
        // 忽略 no-cors 错误，请求仍然会发送
      });

    // 然后获取当前的访问次数
    fetch(badgeUrl)
      .then((res) => res.text())
      .then((svgText) => {
        // 从 SVG 中提取访问次数
        const match = svgText.match(/(\d+)/);
        if (match) {
          setVisits(parseInt(match[1], 10));
        }
        setLoading(false);
      })
      .catch(() => {
        // 如果 API 失败，使用本地计数作为后备
        const localVisits = parseInt(localStorage.getItem("blog-visits-fallback") ?? "0", 10) || 0;
        localStorage.setItem("blog-visits-fallback", String(localVisits + 1));
        setVisits(localVisits + 1);
        setLoading(false);
      });
  }, []);

  return { visits, loading };
}
