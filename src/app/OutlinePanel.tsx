import { useAppStore } from "./store";

/** 大纲侧栏：标题列表 + 当前阅读位置高亮 + 点击跳转 */
export default function OutlinePanel() {
  const outline = useAppStore((state) => state.outline);
  const activeSlug = useAppStore((state) => state.activeSlug);

  const jumpTo = (slug: string) => {
    document.getElementById(slug)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <aside className="outline-panel">
      <div className="outline-panel__title">大纲</div>
      {outline.length === 0 ? (
        <div className="outline-panel__empty">（暂无标题）</div>
      ) : (
        <nav className="outline-panel__list">
          {outline.map((item) => (
            <button
              key={`${item.slug}-${item.line}`}
              className={[
                "outline-panel__item",
                `outline-panel__item--h${item.level}`,
                item.slug === activeSlug ? "outline-panel__item--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => jumpTo(item.slug)}
              title={item.text}
            >
              {item.text || "(无标题)"}
            </button>
          ))}
        </nav>
      )}
    </aside>
  );
}
