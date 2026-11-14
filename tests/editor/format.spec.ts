import { describe, expect, it } from "vitest";
import { EditorSelection, EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { applyFormat } from "../../src/editor/format";

function createView(doc: string, from = 0, to = from): EditorView {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const state = EditorState.create({ doc, selection: EditorSelection.single(from, to) });
  return new EditorView({ state, parent: host });
}

function textOf(view: EditorView): string {
  return view.state.doc.toString();
}

describe("编辑器格式化", () => {
  it("加粗：选中内容包裹", () => {
    const view = createView("hello", 0, 5);
    applyFormat(view, "bold");
    expect(textOf(view)).toBe("**hello**");
  });

  it("加粗：空选区插入占位", () => {
    const view = createView("");
    applyFormat(view, "bold");
    expect(textOf(view)).toBe("**文本**");
  });

  it("加粗：已包裹内容再执行则移除（toggle）", () => {
    const view = createView("**hello**", 0, 9);
    applyFormat(view, "bold");
    expect(textOf(view)).toBe("hello");
  });

  it("标题前缀 toggle：添加与移除", () => {
    const view = createView("标题", 0, 2);
    applyFormat(view, "heading");
    expect(textOf(view)).toBe("## 标题");
    applyFormat(view, "heading");
    expect(textOf(view)).toBe("标题");
  });

  it("多行列表前缀", () => {
    const view = createView("甲\n乙", 0, 3);
    applyFormat(view, "ul");
    expect(textOf(view)).toBe("- 甲\n- 乙");
  });

  it("分割线插入", () => {
    const view = createView("前文", 2);
    applyFormat(view, "hr");
    expect(textOf(view)).toBe("前文\n\n---\n\n");
  });

  it("链接包裹", () => {
    const view = createView("官网", 0, 2);
    applyFormat(view, "link");
    expect(textOf(view)).toBe("[官网](https://)");
  });
});
