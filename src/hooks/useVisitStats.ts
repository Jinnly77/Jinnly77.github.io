import { useState, useEffect } from "react";

// 使用 Visitor Badge API 获取真实访问统计
// 这个服务会记录所有访问，跨浏览器统计
const BADGE_ID = "Jinnly77.github.io"; // 你的唯一标识符

export function useVisitStats() {
  const [visits, setVisits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 使用 Visitor Badge 服务获取真实访问量
    // 第一次访问时会创建计数器，后续访问会累加
    fetch(`https://visitor-badge.laobi.icu/badge?page_id=${BADGE_ID}`)
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
