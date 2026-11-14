import type { Token } from "markdown-it";

export interface OutlineItem {
  level: number;
  text: string;
  slug: string;
  line: number;
}

function headingText(inlineToken: Token | undefined): string {
  if (!inlineToken?.children) return "";
  return inlineToken.children
    .filter((child) => child.type === "text" || child.type === "code_inline")
    .map((child) => child.content)
    .join("");
}

/** 从 token 流提取标题大纲（含锚点 slug 与行号，供目录 / M2 大纲面板 / M3 滚动同步共用） */
export function extractOutline(tokens: Token[]): OutlineItem[] {
  const items: OutlineItem[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type !== "heading_open") continue;
    items.push({
      level: Number(token.tag.slice(1)),
      text: headingText(tokens[i + 1]),
      slug: String(token.attrGet("id") ?? ""),
      line: token.map?.[0] ?? 0,
    });
  }
  return items;
}
