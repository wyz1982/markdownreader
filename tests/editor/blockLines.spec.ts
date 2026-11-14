// 块级行号映射验证：滚动同步的数据基础
import { describe, expect, it } from "vitest";
import { renderMarkdown } from "../../src/renderer";
import { assignBlockLines } from "../../src/renderer/postprocess/lines";

function renderToDom(markdown: string): { blockLines: number[]; lines: (string | null)[] } {
  const { html, blockLines } = renderMarkdown(markdown);
  const article = document.createElement("article");
  article.innerHTML = html;
  assignBlockLines(article, blockLines);
  const elements = Array.from(article.children).filter(
    (el) => !(el instanceof HTMLElement && el.classList.contains("md-front-matter")),
  );
  return {
    blockLines,
    lines: elements.map((el) => (el as HTMLElement).dataset.line ?? null),
  };
}

describe("块级行号映射（滚动同步基础）", () => {
  it("基础文档：顶层块与行号一一对应", () => {
    const source = "# 标题\n\n段落一\n\n- 列表项\n\n```ts\nconst a = 1;\n```\n";
    const { blockLines, lines } = renderToDom(source);
    expect(blockLines).toEqual([0, 2, 4, 6]);
    expect(lines).toEqual(["0", "2", "4", "6"]);
  });

  it("front matter 卡片不占用块映射（行号含 front matter 偏移）", () => {
    const source = "---\ntitle: 测试\n---\n\n# 标题\n\n段落\n";
    const { blockLines, lines } = renderToDom(source);
    // 行 4 = h1，行 6 = 段落（前 4 行是 front matter）
    expect(blockLines).toEqual([4, 6]);
    expect(lines).toEqual(["4", "6"]);
  });

  it("表格与提示容器各自映射到起始行", () => {
    const source = "| a | b |\n| - | - |\n| 1 | 2 |\n\n::: tip\n内容\n:::\n";
    const { blockLines, lines } = renderToDom(source);
    expect(blockLines).toEqual([0, 4]);
    expect(lines).toEqual(["0", "4"]);
  });
});
