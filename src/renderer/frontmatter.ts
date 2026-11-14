import { parse as parseYaml } from "yaml";

export type FrontMatterData = Record<string, unknown>;

export function parseFrontMatter(raw?: string): FrontMatterData | undefined {
  if (!raw || !raw.trim()) return undefined;
  try {
    const data: unknown = parseYaml(raw);
    if (typeof data !== "object" || data === null || Array.isArray(data)) return undefined;
    return data as FrontMatterData;
  } catch {
    return undefined; // 解析失败时静默忽略，不阻塞正文渲染
  }
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.map((item) => String(item)).join("、");
  if (typeof value === "object" && value !== null) return "";
  return String(value);
}

/** front matter 渲染为文档信息卡（置于正文之前） */
export function buildFrontMatterCard(raw: string | undefined): string {
  const data = parseFrontMatter(raw);
  if (!data) return "";
  const rows = Object.entries(data)
    .map(([key, value]) => {
      const text = formatValue(value);
      if (!text) return "";
      return `<tr><th>${esc(key)}</th><td>${esc(text)}</td></tr>`;
    })
    .join("");
  if (!rows) return "";
  return `<section class="md-front-matter"><table><tbody>${rows}</tbody></table></section>\n`;
}
