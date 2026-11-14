import type { MarkdownIt } from "markdown-it";
import container from "markdown-it-container";

const CALLOUT_TYPES = ["note", "info", "tip", "warning", "danger"] as const;

type CalloutType = (typeof CALLOUT_TYPES)[number];

const DEFAULT_TITLES: Record<CalloutType, string> = {
  note: "笔记",
  info: "信息",
  tip: "提示",
  warning: "警告",
  danger: "危险",
};

/** ::: tip 自定义标题 … ::: 提示容器（VuePress 风格，5 种类型） */
export function registerCallouts(md: MarkdownIt): void {
  for (const type of CALLOUT_TYPES) {
    md.use(container, type, {
      render(tokens, idx) {
        if (tokens[idx].nesting === 1) {
          // info 形如 "tip 自定义标题"
          const info = tokens[idx].info.trim().slice(type.length).trim();
          const title = info || DEFAULT_TITLES[type];
          return `<aside class="md-callout md-callout--${type}">\n<p class="md-callout__title">${md.utils.escapeHtml(
            title,
          )}</p>\n`;
        }
        return "</aside>\n";
      },
    });
  }
}
