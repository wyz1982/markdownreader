import { describe, expect, it } from "vitest";
import { dedupeRecents } from "../../src/app/persist";

describe("最近文件列表去重", () => {
  it("新文件插入最前", () => {
    expect(dedupeRecents(["a.md", "b.md"], "c.md")).toEqual(["c.md", "a.md", "b.md"]);
  });

  it("已有文件提前且不重复", () => {
    expect(dedupeRecents(["a.md", "b.md", "c.md"], "b.md")).toEqual(["b.md", "a.md", "c.md"]);
  });

  it("超过上限时截断", () => {
    const list = Array.from({ length: 12 }, (_, index) => `${index}.md`);
    const next = dedupeRecents(list, "new.md");
    expect(next).toHaveLength(10);
    expect(next[0]).toBe("new.md");
  });
});
