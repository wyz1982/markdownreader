import DOMPurify from "dompurify";
import { buildFrontMatterCard } from "./frontmatter";
import { extractOutline, type OutlineItem } from "./outline";
import { md, takePendingFrontMatter } from "./pipeline";

export { createMarkdownIt } from "./pipeline";
export type { OutlineItem } from "./outline";

export interface RenderResult {
  /** 已消毒、可直接 innerHTML 的完整 HTML（含 front matter 信息卡） */
  html: string;
  /** 标题大纲（[TOC] 填充 / M2 大纲面板 / M3 滚动同步共用） */
  outline: OutlineItem[];
}

export function renderMarkdown(source: string): RenderResult {
  const rawHtml = md.render(source);
  const html = DOMPurify.sanitize(buildFrontMatterCard(takePendingFrontMatter()) + rawHtml, {
    ADD_ATTR: ["target"],
  });
  return { html, outline: extractOutline(md.parse(source, {})) };
}
