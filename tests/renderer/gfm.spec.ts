import { describe, expect, it } from "vitest";
import { createMarkdownIt } from "../../src/renderer/pipeline";

const md = createMarkdownIt();

describe("GFM 扩展", () => {
  it("表格：基本结构与对齐", () => {
    const html = md.render("| a | b |\n| --- | :-: |\n| 1 | 2 |");
    expect(html).toContain("<table>");
    expect(html).toContain('style="text-align:center"');
    expect(html).toContain("<td>1</td>");
  });

  it("删除线", () => {
    expect(md.render("~~gone~~")).toContain("<del>gone</del>");
  });

  it("自动链接：完整 URL", () => {
    expect(md.render("访问 https://example.com 了解")).toContain('<a href="https://example.com"');
  });

  it("自动链接：www 前缀", () => {
    expect(md.render("见 www.example.com")).toContain('<a href="http://www.example.com"');
  });

  it("单波浪线不是删除线（是下标）", () => {
    expect(md.render("~x~")).not.toContain("<del>");
    expect(md.render("~x~")).toContain("<sub>x</sub>");
  });
});
