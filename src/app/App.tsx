import { useEffect, useMemo, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { getLaunchArgs, openFileDialog } from "../ipc";
import { loadRecentFiles } from "./recent";
import { notifyFileChanged, useAppStore } from "./store";
import Toolbar from "./Toolbar";
import PreviewPane from "./PreviewPane";
import OutlinePanel from "./OutlinePanel";
import ChangedBanner from "./ChangedBanner";
import EditorPane from "../editor/EditorPane";
import "../styles/app.css";

type Theme = "light" | "dark";

const MARKDOWN_PATH_RE = /\.(md|markdown|mdown|mkd|txt)$/i;

/** 从一组路径中挑出第一个 Markdown 文件（启动参数 / 拖拽共用） */
function pickMarkdownPath(paths: string[] | null | undefined): string | null {
  return paths?.find((path) => MARKDOWN_PATH_RE.test(path)) ?? null;
}

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
  const mode = useAppStore((state) => state.mode);
  const source = useAppStore((state) => state.source);
  const dirty = useAppStore((state) => state.dirty);
  const filePath = useAppStore((state) => state.filePath);
  const encoding = useAppStore((state) => state.encoding);
  const size = useAppStore((state) => state.size);
  const cursor = useAppStore((state) => state.cursor);
  const error = useAppStore((state) => state.error);
  const setRecentFiles = useAppStore((state) => state.setRecentFiles);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // 初始化：最近文件、启动参数（文件关联）、单实例转发、磁盘变更、拖拽
  useEffect(() => {
    let disposed = false;

    void (async () => {
      setRecentFiles(await loadRecentFiles());
      const launchPath = pickMarkdownPath(await getLaunchArgs());
      if (launchPath && !disposed) void useAppStore.getState().openPath(launchPath);
    })();

    const unlisteners = [
      listen<string[]>("open-from-args", (event) => {
        const path = pickMarkdownPath(event.payload);
        if (path) void useAppStore.getState().openPath(path);
      }),
      listen<string>("file-changed-on-disk", (event) => {
        notifyFileChanged(event.payload, useAppStore.getState().filePath);
      }),
      getCurrentWebview().onDragDropEvent((event) => {
        if (event.payload.type === "drop") {
          const path = pickMarkdownPath(event.payload.paths);
          if (path) void useAppStore.getState().openPath(path);
        }
      }),
    ];

    return () => {
      disposed = true;
      void Promise.all(unlisteners).then((offs) => offs.forEach((off) => off()));
    };
  }, [setRecentFiles]);

  // 快捷键：Ctrl+S 保存 / Ctrl+O 打开
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey) return;
      if (event.key === "s") {
        event.preventDefault();
        void useAppStore.getState().save();
      }
      if (event.key === "o") {
        event.preventDefault();
        void openFileDialog().then((path) => {
          if (path) void useAppStore.getState().openPath(path);
        });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const stats = useMemo(() => {
    const cjk = source.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
    const words = source.match(/[A-Za-z0-9_]+/g)?.length ?? 0;
    return { total: cjk + words, lines: source.split("\n").length };
  }, [source]);

  return (
    <div className="app-shell">
      <Toolbar />
      <ChangedBanner />

      <main className="workspace">
        {mode === "split" && (
          <>
            <section className="workspace__pane">
              <EditorPane />
            </section>
            <div className="workspace__divider" />
          </>
        )}
        {mode === "edit" && (
          <section className="workspace__pane">
            <EditorPane />
          </section>
        )}
        {mode === "read" && (
          <>
            <OutlinePanel />
            <div className="workspace__divider" />
          </>
        )}
        {mode !== "edit" && (
          <section className="workspace__pane">
            <PreviewPane source={source} theme={theme} mode={mode} />
          </section>
        )}
      </main>

      <footer className="statusbar">
        <span>{error ? `错误：${error}` : dirty ? "已修改" : "就绪"}</span>
        <span className="statusbar__spacer" />
        {mode !== "read" && cursor && (
          <span>
            行 {cursor.line}, 列 {cursor.col}
          </span>
        )}
        {filePath && encoding && (
          <span>
            {encoding}
            {size != null ? ` · ${(size / 1024).toFixed(1)} KB` : ""}
          </span>
        )}
        <span>
          字数 {stats.total} · 行数 {stats.lines}
        </span>
        <span>{theme === "dark" ? "深色主题" : "浅色主题"}（跟随系统）</span>
      </footer>
    </div>
  );
}
