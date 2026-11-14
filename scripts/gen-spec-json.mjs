// 从 CommonMark 官方 spec.txt 提取规范测试用例 → tests/spec/spec.json
// 用法：node scripts/gen-spec-json.mjs [spec.txt 路径]
// 说明：spec.txt 中每个示例块 = 32 个反引号的围栏 + " example"，
//       markdown 源码与期望 HTML 用单独一行 "." 分隔。
//       文档中 →（U+2192）代表制表符，需还原为 \t；
//       期望 HTML 恒以换行结尾（cmark 参考实现的块级输出约定），
//       与官方 spec.json 的字段一致。
import { readFileSync, writeFileSync } from "node:fs";

const specPath = process.argv[2] ?? "tests/spec/spec.txt";
const outPath = "tests/spec/spec.json";
const lines = readFileSync(specPath, "utf-8").split(/\r?\n/);

const OPEN = /^`{32,}\s*example((?:\s+\w+)*)\s*$/;
const CLOSE = /^`{32,}\s*$/;
const SECTION = /^#{1,6}\s+(.+)$/;

const cases = [];
let section = "";

for (let i = 0; i < lines.length; i++) {
  const sectionMatch = SECTION.exec(lines[i]);
  if (sectionMatch) {
    section = sectionMatch[1].trim();
    continue;
  }
  const openMatch = OPEN.exec(lines[i]);
  if (!openMatch) continue;

  const flags = openMatch[1].trim().split(/\s+/).filter(Boolean);
  const mdLines = [];
  i++;
  while (i < lines.length && lines[i] !== ".") {
    mdLines.push(lines[i]);
    i++;
  }
  i++; // 跳过 "." 分隔行
  const htmlLines = [];
  while (i < lines.length && !CLOSE.test(lines[i])) {
    htmlLines.push(lines[i]);
    i++;
  }

  if (flags.includes("disabled")) continue;
  cases.push({
    example: cases.length + 1,
    markdown: mdLines.join("\n").replace(/→/g, "\t"),
    html: `${htmlLines.join("\n").replace(/→/g, "\t")}\n`,
    section,
  });
}

writeFileSync(outPath, `${JSON.stringify(cases, null, 2)}\n`, "utf-8");
console.log(`生成 ${cases.length} 个规范用例 → ${outPath}`);
