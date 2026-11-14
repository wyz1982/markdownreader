import { describe, expect, it } from "vitest";
import { continueListItem } from "../../src/editor/listContinuation";

describe("列表续写（回车）", () => {
  it("无序列表", () => {
    expect(continueListItem("- 项目")).toEqual({ insert: "\n- ", removeMarker: false });
  });

  it("任务列表保持复选框", () => {
    expect(continueListItem("- [ ] 任务")).toEqual({ insert: "\n- [ ] ", removeMarker: false });
    expect(continueListItem("- [x] 完成")).toEqual({ insert: "\n- [x] ", removeMarker: false });
  });

  it("有序列表数字递增", () => {
    expect(continueListItem("3. 第三项")).toEqual({ insert: "\n4. ", removeMarker: false });
  });

  it("引用", () => {
    expect(continueListItem("> 引用")).toEqual({ insert: "\n> ", removeMarker: false });
  });

  it("嵌套保持缩进", () => {
    expect(continueListItem("  - 子项")).toEqual({ insert: "\n  - ", removeMarker: false });
  });

  it("空项清除标记退出列表", () => {
    expect(continueListItem("- ")).toEqual({ insert: "", removeMarker: true });
    expect(continueListItem("1. ")).toEqual({ insert: "", removeMarker: true });
    expect(continueListItem("> ")).toEqual({ insert: "", removeMarker: true });
  });

  it("普通文本不续写", () => {
    expect(continueListItem("普通段落")).toBeNull();
    expect(continueListItem("")).toBeNull();
  });
});
