import { describe, expect, it } from "vitest";
import { buildExportHtml } from "../../src/app/exportHtml";

describe("单文件 HTML 导出", () => {
  it("包含主题、排版样式与渲染内容，且标题被转义", () => {
    const html = buildExportHtml("# 你好\n\n正文 **加粗**", "dark", "<标题> & 测试");
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain('data-theme="dark"');
    expect(html).toContain("markdown-body");
    expect(html).toContain("<style>"); // 主题/排版/KaTeX 样式内联
    expect(html).toContain(".katex"); // KaTeX CSS 已内联
    expect(html).toContain("<strong>加粗</strong>");
    expect(html).toContain("&lt;标题&gt; &amp; 测试"); // 标题转义
    expect(html).not.toContain("<script");
  });

  it("front matter 信息卡与公式进入导出内容", () => {
    const html = buildExportHtml("---\ntitle: 测试\n---\n\n$E=mc^2$", "light", "t");
    expect(html).toContain("md-front-matter");
    expect(html).toContain("katex");
  });
});
