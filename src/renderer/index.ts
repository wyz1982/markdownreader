import DOMPurify from "dompurify";
import { buildFrontMatterCard } from "./frontmatter";
import { extractOutline, type OutlineItem } from "./outline";
import { md, takePendingFrontMatter } from "./pipeline";

export { createMarkdownIt } from "./pipeline";
export type { OutlineItem } from "./outline";

export interface RenderResult {
  /** 已消毒、可直接 innerHTML 的完整 HTML（含 front matter 信息卡） */
  html: string;
  /** 标题大纲（[TOC] 填充 / 大纲面板 / 滚动同步共用） */
  outline: OutlineItem[];
  /** 顶层块级 token 的起始行（0 基），顺序与预览 DOM 顶层块元素一致（滚动同步用） */
  blockLines: number[];
  /** 是否注入了 front matter 信息卡（预览 DOM 第一个元素） */
  hasFrontMatter: boolean;
}

/** 收集顶层块级 token 的起始行：深度为 0 且带 map 的 open/standalone token。
 *  front_matter token 不计入 —— 它渲染为空，信息卡是独立注入的 DOM 元素 */
function topLevelBlockStartLines(source: string): number[] {
  const tokens = md.parse(source, {});
  const lines: number[] = [];
  let depth = 0;
  for (const token of tokens) {
    if (token.type === "front_matter") continue;
    if (depth === 0 && token.map && (token.nesting === 1 || token.nesting === 0)) {
      lines.push(token.map[0]);
    }
    depth += token.nesting;
  }
  return lines;
}

export function renderMarkdown(source: string): RenderResult {
  const rawHtml = md.render(source);
  const frontMatterRaw = takePendingFrontMatter();
  const html = DOMPurify.sanitize(buildFrontMatterCard(frontMatterRaw) + rawHtml, {
    ADD_ATTR: ["target"],
  });
  return {
    html,
    outline: extractOutline(md.parse(source, {})),
    blockLines: topLevelBlockStartLines(source),
    hasFrontMatter: frontMatterRaw != null,
  };
}
