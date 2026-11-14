// 列表 / 引用 / 任务列表的回车续写：核心逻辑为纯函数（便于单测），视图侧只做光标处理
import type { EditorView } from "@codemirror/view";

export interface Continuation {
  /** 光标处应插入的文本（含换行前缀） */
  insert: string;
  /** 空项：删除本行标记以退出列表，而不是续写 */
  removeMarker: boolean;
}

const BULLET = /^([ \t]*)([-*+])([ \t]+)(\[[xX ][\]][ \t]+)?/;
const ORDERED = /^([ \t]*)(\d+)([.)])([ \t]+)/;
const QUOTE = /^([ \t]*)(>)([ \t]?)/;

/** 计算一行行文本的续写行为；非列表/引用返回 null */
export function continueListItem(lineText: string): Continuation | null {
  const bulletMatch = BULLET.exec(lineText);
  if (bulletMatch) {
    const [, indent, marker, space, task = ""] = bulletMatch;
    const rest = lineText.slice(bulletMatch[0].length);
    if (rest.trim() === "") return { insert: "", removeMarker: true };
    return { insert: `\n${indent}${marker}${space}${task}`, removeMarker: false };
  }

  const orderedMatch = ORDERED.exec(lineText);
  if (orderedMatch) {
    const [, indent, num, delim, space] = orderedMatch;
    const rest = lineText.slice(orderedMatch[0].length);
    if (rest.trim() === "") return { insert: "", removeMarker: true };
    return { insert: `\n${indent}${Number(num) + 1}${delim}${space}`, removeMarker: false };
  }

  const quoteMatch = QUOTE.exec(lineText);
  if (quoteMatch) {
    const [, indent, gt, space = ""] = quoteMatch;
    const rest = lineText.slice(quoteMatch[0].length);
    if (rest.trim() === "") return { insert: "", removeMarker: true };
    return { insert: `\n${indent}${gt}${space}`, removeMarker: false };
  }

  return null;
}

/** CodeMirror Enter 键处理：光标在行尾时续写；空项时清除标记退出列表 */
export function runListContinuation(view: EditorView): boolean {
  const { state } = view;
  const selection = state.selection.main;
  if (!selection.empty) return false;
  const line = state.doc.lineAt(selection.head);
  if (selection.head !== line.to) return false; // 仅行尾续写，行中回车走默认行为

  const result = continueListItem(line.text);
  if (!result) return false;

  if (result.removeMarker) {
    view.dispatch({ changes: { from: line.from, to: line.to, insert: "" } });
    return true;
  }
  view.dispatch({
    changes: { from: selection.head, insert: result.insert },
    selection: { anchor: selection.head + result.insert.length },
  });
  return true;
}
