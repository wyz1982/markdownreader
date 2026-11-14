import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/** 跟随系统的明暗主题（设置页做好后可手动覆盖） */
function useFollowSystemTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? "dark" : "light");
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return theme;
}

export default function App() {
  const theme = useFollowSystemTheme();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="app-shell">
      <header className="toolbar">
        <span className="toolbar__logo">MD</span>
        <span className="toolbar__title">MarkDownReader</span>
        <span className="toolbar__hint">M0 · 脚手架就绪，渲染引擎 M1 接入</span>
      </header>

      <main className="workspace">
        <section className="workspace__pane">
          <div className="placeholder">
            编辑器面板
            <br />
            <small>M3 接入 CodeMirror 6</small>
          </div>
        </section>
        <div className="workspace__divider" />
        <section className="workspace__pane">
          <div className="placeholder">
            预览面板
            <br />
            <small>M1 接入 markdown-it 渲染管线</small>
          </div>
        </section>
      </main>

      <footer className="statusbar">
        <span>就绪</span>
        <span className="statusbar__spacer" />
        <span>{theme === "dark" ? "深色主题" : "浅色主题"}（跟随系统）</span>
      </footer>
    </div>
  );
}
