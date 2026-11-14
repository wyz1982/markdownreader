import type { MarkdownIt } from "markdown-it";

const CHECKBOX_RE = /^\[([ xX])\]\s+/;

/** GFM 任务列表：把 "- [x] 文本" 渲染成带复选框的列表项 */
export function tasklist(md: MarkdownIt): void {
  md.core.ruler.after("inline", "mdr_tasklist", (state) => {
    const tokens = state.tokens;
    for (let i = 1; i < tokens.length; i++) {
      const inline = tokens[i];
      if (inline.type !== "inline" || !inline.children) continue;

      const prev = tokens[i - 1];
      const isTightItem = prev?.type === "list_item_open";
      const isLooseItem =
        prev?.type === "paragraph_open" && tokens[i - 2]?.type === "list_item_open";
      if (!isTightItem && !isLooseItem) continue;

      const first = inline.children[0];
      if (!first || first.type !== "text") continue;
      const matched = CHECKBOX_RE.exec(first.content);
      if (!matched) continue;

      const checked = matched[1] !== " ";
      first.content = first.content.slice(matched[0].length);

      const itemOpen = isLooseItem ? tokens[i - 2] : prev;
      itemOpen.attrJoin("class", "task-list-item");

      const checkbox = new state.Token("html_inline", "", 0);
      checkbox.content = `<input class="task-list-item-checkbox" disabled type="checkbox"${
        checked ? " checked" : ""
      }>`;
      inline.children.unshift(checkbox);
    }
    return true;
  });
}
