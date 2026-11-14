// 编辑器格式化：加粗/斜体/行内代码/链接（包裹式）+ 标题/引用/列表（行前缀 toggle）+ 分割线
import type { EditorView } from "@codemirror/view";

export type FormatAction =
  "bold" | "italic" | "code" | "link" | "heading" | "quote" | "ul" | "ol" | "hr";

const WRAP: Partial<Record<FormatAction, [string, string]>> = {
  bold: ["**", "**"],
  italic: ["*", "*"],
  code: ["`", "`"],
  link: ["[", "](https://)"],
};

const LINE_PREFIX: Partial<Record<FormatAction, string>> = {
  heading: "## ",
  quote: "> ",
  ul: "- ",
  ol: "1. ",
};

export function applyFormat(view: EditorView, action: FormatAction): void {
  if (action === "hr") {
    const pos = view.state.selection.main.head;
    const line = view.state.doc.lineAt(pos);
    const prefix = line.text.trim() === "" ? "" : "\n\n";
    const insert = `${prefix}---\n\n`;
    view.dispatch({
      changes: { from: pos, insert },
      selection: { anchor: pos + insert.length },
    });
    view.focus();
    return;
  }

  const wrap = WRAP[action];
  if (wrap) {
    const sel = view.state.selection.main;
    const text = view.state.sliceDoc(sel.from, sel.to);
    const already =
      text.startsWith(wrap[0]) &&
      text.endsWith(wrap[1]) &&
      text.length >= wrap[0].length + wrap[1].length;
    const insert = already
      ? text.slice(wrap[0].length, text.length - wrap[1].length)
      : `${wrap[0]}${text || "文本"}${wrap[1]}`;
    view.dispatch({
      changes: { from: sel.from, to: sel.to, insert },
      selection: { anchor: sel.from + insert.length },
    });
    view.focus();
    return;
  }

  const prefix = LINE_PREFIX[action];
  if (prefix) {
    const sel = view.state.selection.main;
    const startLine = view.state.doc.lineAt(sel.from);
    const endLine = view.state.doc.lineAt(sel.to);
    const changes: { from: number; to?: number; insert: string }[] = [];
    for (let n = startLine.number; n <= endLine.number; n++) {
      const line = view.state.doc.line(n);
      if (line.text.startsWith(prefix)) {
        changes.push({ from: line.from, to: line.from + prefix.length, insert: "" });
      } else {
        changes.push({ from: line.from, insert: prefix });
      }
    }
    view.dispatch({ changes }); // CM 会自动把选区映射到变更后的位置
    view.focus();
  }
}
