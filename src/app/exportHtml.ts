// 单文件 HTML 导出：内联主题/排版样式 + KaTeX（?inline 会把字体转 base64，离线可用）
import { renderMarkdown } from "../renderer";
import themeCss from "../styles/theme.css?inline";
import markdownCss from "../styles/markdown.css?inline";
import katexCss from "katex/dist/katex.min.css?inline";

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function buildExportHtml(source: string, theme: "light" | "dark", title: string): string {
  const { html } = renderMarkdown(source);
  return `<!doctype html>
<html lang="zh-CN" data-theme="${theme}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<style>${katexCss}</style>
<style>${themeCss}</style>
<style>${markdownCss}</style>
<style>body { margin: 0; padding: 32px 16px; background: var(--bg-primary); }</style>
</head>
<body>
<article class="markdown-body markdown-body--read">
${html}
</article>
</body>
</html>
`;
}
