import { useEffect, useRef } from "react";
import type { EditorView } from "@codemirror/view";
import { useAppStore } from "../app/store";
import { createMarkdownEditor } from "./cmSetup";
import { handleEditorScroll, registerEditorView } from "./scrollSync";
import FormatBar from "../app/FormatBar";
import { translate } from "../i18n";

/** 编辑器面板：CodeMirror 6 实例的 React 壳（含格式工具栏） */
export default function EditorPane() {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const view = createMarkdownEditor(host, useAppStore.getState().source, {
      onDocChange: (text) => useAppStore.getState().setSource(text),
      onCursor: (line, col) => useAppStore.getState().setCursor({ line, col }),
      onPasteImage: (file) => {
        const state = useAppStore.getState();
        // 无文件路径时先给本地化提示，再走 store 的兜底
        if (!state.filePath) {
          useAppStore.setState({ error: translate(state.settings.locale, "saveImageFirst") });
          return;
        }
        void state.savePastedImage(file, view);
      },
    });
    viewRef.current = view;
    registerEditorView(view);
    useAppStore.getState().setEditorView(view);

    const scrollEl = view.scrollDOM;
    const onScroll = () => handleEditorScroll();
    scrollEl.addEventListener("scroll", onScroll, { passive: true });

    // 外部 source 变化（打开文件/磁盘重载）→ 重置编辑器内容
    // （编辑器自身输入也会写入 store，此处用内容比对防止回环）
    const unsubscribe = useAppStore.subscribe((state, prev) => {
      if (
        state.source !== prev.source &&
        viewRef.current &&
        viewRef.current.state.doc.toString() !== state.source
      ) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: viewRef.current.state.doc.length,
            insert: state.source,
          },
        });
      }
    });

    return () => {
      unsubscribe();
      scrollEl.removeEventListener("scroll", onScroll);
      registerEditorView(null);
      useAppStore.getState().setEditorView(null);
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  return (
    <div className="editor-col">
      <FormatBar />
      <div className="editor-host" ref={hostRef} />
    </div>
  );
}
