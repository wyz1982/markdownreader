import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderMarkdown } from "../../src/renderer";

// vitest jsdom 环境下 import.meta.url 非 file 协议，改用相对 cwd 的路径（vitest 从项目根运行）
const sample = readFileSync("src/sample/sample.md", "utf-8");

describe("完整样例渲染快照", () => {
  it("sample.md 渲染结果保持稳定（防回归）", () => {
    const { html, outline } = renderMarkdown(sample);
    expect(html).toMatchSnapshot();
    // 大纲也应包含样例中的关键标题
    expect(outline.map((item) => item.text)).toContain("基础语法");
    expect(outline.map((item) => item.text)).toContain("扩展语法");
  });
});
