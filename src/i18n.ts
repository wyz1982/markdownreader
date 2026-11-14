// 极简 i18n：中英字典 + useT hook（界面 chrome 文案；文档内容不做翻译）
import { useMemo } from "react";
import { useAppStore } from "./app/store";

export type Locale = "zh-CN" | "en";

const zh = {
  read: "阅读",
  split: "分栏",
  edit: "编辑",
  open: "打开",
  save: "保存",
  recent: "最近",
  settings: "设置",
  export: "导出",
  exportHtml: "导出 HTML…",
  exportPdf: "导出 PDF（打印）…",
  settingsTitle: "设置",
  language: "界面语言",
  themeMode: "主题",
  followSystem: "跟随系统",
  light: "浅色",
  dark: "深色",
  readingFontSize: "正文字号",
  readingLineHeight: "行高",
  readingFont: "正文字体",
  sans: "无衬线",
  serif: "衬线",
  editorFontSize: "编辑器字号",
  shortcuts: "快捷键",
  shortcutsHint:
    "Ctrl+S 保存 · Ctrl+O 打开 · Ctrl+F 搜索 · Ctrl+B 加粗 · Ctrl+I 斜体 · Ctrl+K 链接",
  close: "关闭",
  ready: "就绪",
  modified: "已修改",
  errorPrefix: "错误：",
  stats: "字数 {n} · 行数 {l}",
  darkTheme: "深色主题",
  lightTheme: "浅色主题",
  followHint: "（跟随系统）",
  outline: "大纲",
  outlineEmpty: "（暂无标题）",
  untitled: "（无标题）",
  changedOnDisk: "文件已在磁盘上被外部修改",
  unsavedSuffix: "，且本地有未保存的更改",
  reload: "重新加载",
  ignore: "忽略",
  line: "行",
  col: "列",
  fmtHeading: "标题 H2",
  fmtBold: "加粗 (Ctrl+B)",
  fmtItalic: "斜体 (Ctrl+I)",
  fmtCode: "行内代码",
  fmtLink: "链接 (Ctrl+K)",
  fmtQuote: "引用",
  fmtUl: "无序列表",
  fmtOl: "有序列表",
  fmtHr: "分割线",
  saveImageFirst: "请先保存文档（Ctrl+S）后再粘贴图片",
} as const;

type Dict = Record<keyof typeof zh, string>;

const en: Dict = {
  read: "Read",
  split: "Split",
  edit: "Edit",
  open: "Open",
  save: "Save",
  recent: "Recent",
  settings: "Settings",
  export: "Export",
  exportHtml: "Export HTML…",
  exportPdf: "Export PDF (Print)…",
  settingsTitle: "Settings",
  language: "Language",
  themeMode: "Theme",
  followSystem: "System",
  light: "Light",
  dark: "Dark",
  readingFontSize: "Body size",
  readingLineHeight: "Line height",
  readingFont: "Body font",
  sans: "Sans-serif",
  serif: "Serif",
  editorFontSize: "Editor size",
  shortcuts: "Shortcuts",
  shortcutsHint:
    "Ctrl+S Save · Ctrl+O Open · Ctrl+F Search · Ctrl+B Bold · Ctrl+I Italic · Ctrl+K Link",
  close: "Close",
  ready: "Ready",
  modified: "Modified",
  errorPrefix: "Error: ",
  stats: "{n} words · {l} lines",
  darkTheme: "Dark theme",
  lightTheme: "Light theme",
  followHint: " (system)",
  outline: "Outline",
  outlineEmpty: "(No headings)",
  untitled: "(Untitled)",
  changedOnDisk: "The file was modified on disk",
  unsavedSuffix: ", and you have unsaved changes",
  reload: "Reload",
  ignore: "Ignore",
  line: "Ln",
  col: "Col",
  fmtHeading: "Heading H2",
  fmtBold: "Bold (Ctrl+B)",
  fmtItalic: "Italic (Ctrl+I)",
  fmtCode: "Inline code",
  fmtLink: "Link (Ctrl+K)",
  fmtQuote: "Quote",
  fmtUl: "Bullet list",
  fmtOl: "Numbered list",
  fmtHr: "Horizontal rule",
  saveImageFirst: "Save the document (Ctrl+S) before pasting images",
};

const DICT: Record<Locale, Dict> = { "zh-CN": zh, en };

export type I18nKey = keyof typeof zh;

/** 直接翻译（非组件场景使用） */
export function translate(locale: Locale, key: I18nKey): string {
  return DICT[locale]?.[key] ?? zh[key];
}

/** 带占位符替换的翻译 */
export function translateFormat(
  locale: Locale,
  key: I18nKey,
  params: Record<string, string | number>,
): string {
  return Object.entries(params).reduce(
    (text, [name, value]) => text.split(`{${name}}`).join(String(value)),
    translate(locale, key),
  );
}

/** 组件内使用：跟随设置里的语言自动更新 */
export function useT() {
  const locale = useAppStore((state) => state.settings.locale);
  return useMemo(
    () => ({
      t: (key: I18nKey) => translate(locale, key),
      tf: (key: I18nKey, params: Record<string, string | number>) =>
        translateFormat(locale, key, params),
    }),
    [locale],
  );
}
