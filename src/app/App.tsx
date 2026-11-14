import { useEffect, useMemo, useState } from "react";
import sampleDoc from "../sample/sample.md?raw";
import EditorPane from "./EditorPane";
import PreviewPane from "./PreviewPane";
import "../styles/app.css";

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
  const [source, setSource] = useState(sampleDoc);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const stats = useMemo(() => {
    const cjk = source.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
    const words = source.match(/[A-Za-z0-9_]+/g)?.length ?? 0;
    return { total: cjk + words, lines: source.split("\n").length };
  }, [source]);

  return (
    <div className="app-shell">
      <header className="toolbar">
        <span className="toolbar__logo">MD</span>
        <span className="toolbar__title">MarkDownReader</span>
        <span className="toolbar__hint">
          M1 · 渲染引擎已接入（markdown-it + KaTeX + Shiki + Mermaid）
        </span>
      </header>

      <main className="workspace">
        <section className="workspace__pane">
          <EditorPane value={source} onChange={setSource} />
        </section>
        <div className="workspace__divider" />
        <section className="workspace__pane">
          <PreviewPane source={source} theme={theme} />
        </section>
      </main>

      <footer className="statusbar">
        <span>就绪</span>
        <span className="statusbar__spacer" />
        <span>
          字数 {stats.total} · 行数 {stats.lines}
        </span>
        <span>{theme === "dark" ? "深色主题" : "浅色主题"}（跟随系统）</span>
      </footer>
    </div>
  );
}
