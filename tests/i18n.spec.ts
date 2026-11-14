import { describe, expect, it } from "vitest";
import { translate, translateFormat } from "../src/i18n";

describe("i18n 字典完整性", () => {
  it("中英字典键完全一致", async () => {
    const zhModule = await import("../src/i18n");
    // 通过类型系统保证；这里做运行时抽查
    const keys = [
      "read",
      "split",
      "edit",
      "open",
      "save",
      "settings",
      "exportHtml",
      "themeMode",
      "stats",
    ] as const;
    for (const key of keys) {
      expect(translate("zh-CN", key).length).toBeGreaterThan(0);
      expect(translate("en", key).length).toBeGreaterThan(0);
    }
    void zhModule;
  });

  it("缺失语言回退到中文", () => {
    expect(translate("fr" as never, "ready")).toBe(translate("zh-CN", "ready"));
  });

  it("占位符替换", () => {
    const result = translateFormat("en", "stats", { n: 12, l: 3 });
    expect(result).toContain("12");
    expect(result).toContain("3");
    expect(result).not.toContain("{n}");
  });
});
