import { useEffect, useRef } from "react";
import type { EditorView } from "@codemirror/view";
import { useAppStore } from "../app/store";
import { createMarkdownEditor } from "./cmSetup";
import { handleEditorScroll, registerEditorView } from "./scrollSync";

/** 编辑器面板：CodeMirror 6 实例的 React 壳 */
export default function EditorPane() {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const view = createMarkdownEditor(host, useAppStore.getState().source, {
      onDocChange: (text) => useAppStore.getState().setSource(text),
      onCursor: (line, col) => useAppStore.getState().setCursor({ line, col }),
      onPasteImage: (file) => void useAppStore.getState().savePastedImage(file, view),
    });
    viewRef.current = view;
    registerEditorView(view);

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
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  return <div className="editor-host" ref={hostRef} />;
}
