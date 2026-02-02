export default function Footer({
  visits,
  loading,
}: {
  visits: number | null;
  loading?: boolean;
}) {
  return (
    <footer className="footer-wrap">
      <span title="总访问次数">
        📊 访问次数：{loading ? "加载中..." : visits ?? "暂无数据"}
      </span>
    </footer>
  );
}
