import { describe, expect, it } from "vitest";
import { createMarkdownIt } from "../../src/renderer/pipeline";
import { renderMarkdown } from "../../src/renderer";

const md = createMarkdownIt();

describe("扩展语法渲染", () => {
  it("脚注：引用 + 定义区", () => {
    const html = md.render("文本[^1]\n\n[^1]: 脚注内容");
    expect(html).toContain("footnote-ref");
    expect(html).toContain("footnotes");
    expect(html).toContain("脚注内容");
  });

  it("数学公式：行内与块级", () => {
    expect(md.render("$E=mc^2$")).toContain("katex");
    expect(md.render("$$\n\\int_a^b f(x)dx\n$$")).toContain("katex");
  });

  it("公式转义：\\$ 保持字面量", () => {
    expect(md.render("单价 \\$5")).not.toContain("katex");
    expect(md.render("单价 \\$5")).toContain("$5");
  });

  it("提示容器：默认标题与自定义标题", () => {
    const html = md.render("::: tip\n内容\n:::");
    expect(html).toContain("md-callout--tip");
    expect(html).toContain("提示");
    expect(md.render("::: warning 小心\n内容\n:::")).toContain("小心");
  });

  it("定义列表", () => {
    const html = md.render("术语\n: 定义内容");
    expect(html).toContain("<dl>");
    expect(html).toContain("<dt>术语</dt>");
    expect(html).toContain("<dd>定义内容</dd>");
  });

  it("高亮 / 下标 / 上标", () => {
    expect(md.render("==重点==")).toContain("<mark>重点</mark>");
    expect(md.render("H~2~O")).toContain("<sub>2</sub>");
    expect(md.render("X^2^")).toContain("<sup>2</sup>");
  });

  it("Emoji 短代码", () => {
    expect(md.render(":tada: :smile:")).toContain("🎉");
    expect(md.render(":tada: :smile:")).toContain("😄");
  });

  it("[TOC] 占位容器", () => {
    const html = md.render("[TOC]\n\n# 标题");
    expect(html).toContain('class="md-toc"');
  });

  it("任务列表：复选框 + 列表项类名", () => {
    const html = md.render("- [x] 已完成\n- [ ] 待办");
    expect(html).toContain("task-list-item-checkbox");
    expect(html).toContain("checked");
    expect(html).toContain("task-list-item");
  });

  it("front matter 信息卡", () => {
    const { html } = renderMarkdown("---\ntitle: 测试文档\n---\n\n正文内容");
    expect(html).toContain("md-front-matter");
    expect(html).toContain("测试文档");
    expect(html).toContain("正文内容");
  });

  it("Mermaid 代码块保留待后处理渲染", () => {
    const html = md.render("```mermaid\nflowchart TD\n  A --> B\n```");
    expect(html).toContain("language-mermaid");
  });

  it("DOMPurify 剔除脚本标签", () => {
    const { html } = renderMarkdown("<script>alert(1)</script>\n\n正文");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("alert(1)");
    expect(html).toContain("正文");
  });

  it("内嵌 HTML 白名单放行", () => {
    const { html } = renderMarkdown("<kbd>Ctrl</kbd>");
    expect(html).toContain("<kbd>Ctrl</kbd>");
  });
});
