export default function Footer({
  visits,
  visitors,
}: {
  visits: number;
  visitors: number;
}) {
  return (
    <footer className="footer-wrap">
      <span title="总访问次数">📊 访问次数：{visits}</span>
      <span title="独立访客数">👤 访客数：{visitors}</span>
    </footer>
  );
}
