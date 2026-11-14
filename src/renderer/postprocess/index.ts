import type { OutlineItem } from "../outline";
import { applyShiki } from "./highlight";
import { applyMermaid } from "./mermaid";

export interface PostprocessOptions {
  theme: "light" | "dark";
  outline: OutlineItem[];
}

/** 渲染后处理：填目录 → Mermaid → Shiki（Mermaid 先替换 DOM，Shiki 跳过图表块） */
export async function postprocess(root: HTMLElement, options: PostprocessOptions): Promise<void> {
  fillToc(root, options.outline);
  await applyMermaid(root, options.theme);
  await applyShiki(root);
}

function fillToc(root: HTMLElement, outline: OutlineItem[]): void {
  const nav = root.querySelector("nav.md-toc");
  if (!nav) return;
  nav.textContent = "";
  if (outline.length === 0) {
    nav.textContent = "（本文档暂无标题）";
    return;
  }
  nav.appendChild(buildTocTree(outline));
}

function buildTocTree(items: OutlineItem[]): HTMLUListElement {
  const rootUl = document.createElement("ul");
  const stack: { level: number; li: HTMLLIElement }[] = [];
  for (const item of items) {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = `#${item.slug}`;
    link.textContent = item.text || "(无标题)";
    li.appendChild(link);
    while (stack.length > 0 && stack[stack.length - 1].level >= item.level) stack.pop();
    if (stack.length === 0) {
      rootUl.appendChild(li);
    } else {
      const parentLi = stack[stack.length - 1].li;
      let sub = parentLi.querySelector(":scope > ul");
      if (!sub) {
        sub = document.createElement("ul");
        parentLi.appendChild(sub);
      }
      sub.appendChild(li);
    }
    stack.push({ level: item.level, li });
  }
  return rootUl;
}
