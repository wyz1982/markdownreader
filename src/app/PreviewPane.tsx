import { useEffect, useRef } from "react";
import { renderMarkdown } from "../renderer";
import { postprocess } from "../renderer/postprocess";
import "katex/dist/katex.min.css";
import "../styles/markdown.css";

interface PreviewPaneProps {
  source: string;
  theme: "light" | "dark";
}

/** 预览面板：markdown-it 渲染 + DOMPurify 消毒 + 后处理（Shiki/Mermaid/TOC） */
export default function PreviewPane({ source, theme }: PreviewPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      const { html, outline } = renderMarkdown(source);
      if (cancelled) return;
      el.innerHTML = html;
      try {
        await postprocess(el, { theme, outline });
      } catch (error) {
        console.error("预览后处理失败:", error);
      }
    }, 150);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [source, theme]);

  return (
    <div className="preview-scroll">
      <article ref={containerRef} className="markdown-body" />
    </div>
  );
}
