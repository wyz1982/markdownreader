import { useEffect, useRef } from "react";
import { renderMarkdown } from "../renderer";
import { postprocess } from "../renderer/postprocess";
import { assignBlockLines } from "../renderer/postprocess/lines";
import type { AppMode } from "./store";
import { useAppStore } from "./store";
import { handlePreviewScroll, registerPreview } from "../editor/scrollSync";
import "katex/dist/katex.min.css";
import "../styles/markdown.css";

interface PreviewPaneProps {
  source: string;
  theme: "light" | "dark";
  mode: AppMode;
}

/** 预览面板：渲染 + 消毒 + 后处理 + data-line 标注 + scroll-spy + 滚动同步 */
export default function PreviewPane({ source, theme, mode }: PreviewPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      const { html, outline, blockLines } = renderMarkdown(source);
      if (cancelled) return;
      el.innerHTML = html;
      useAppStore.getState().setOutline(outline);
      try {
        await postprocess(el, { theme, outline });
      } catch (error) {
        console.error("预览后处理失败:", error);
      }
      if (cancelled) return;
      // 行号标注放在后处理之后：Shiki/Mermaid 的 DOM 替换会保留元素顺序
      assignBlockLines(el, blockLines);
      observerRef.current?.disconnect();
      observerRef.current = setupScrollSpy(el, scrollRef.current);
    }, 150);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [source, theme]);

  // 滚动同步：注册预览容器并监听滚动
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    registerPreview(scrollEl);
    const onScroll = () => handlePreviewScroll();
    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scrollEl.removeEventListener("scroll", onScroll);
      registerPreview(null);
    };
  }, []);

  // 卸载时清理观察器
  useEffect(() => () => observerRef.current?.disconnect(), []);

  return (
    <div className="preview-scroll" ref={scrollRef}>
      <article
        ref={containerRef}
        className={`markdown-body${mode === "read" ? " markdown-body--read" : ""}`}
      />
    </div>
  );
}

/** 标题 scroll-spy：视口顶部 30% 区域内最靠上的标题视为当前阅读位置 */
function setupScrollSpy(root: HTMLElement, scrollRoot: HTMLElement | null): IntersectionObserver {
  const headings = Array.from(root.querySelectorAll<HTMLElement>("h1,h2,h3,h4,h5,h6")).filter(
    (heading) => heading.id,
  );

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      if (visible.length === 0) return;
      const top = [...visible].sort(
        (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
      )[0];
      useAppStore.getState().setActiveSlug(top.target.id);
    },
    { root: scrollRoot, rootMargin: "0px 0px -70% 0px", threshold: 0 },
  );
  headings.forEach((heading) => observer.observe(heading));
  return observer;
}
