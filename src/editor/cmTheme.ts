// CodeMirror 主题：全部颜色走 CSS 变量（--md-syntax-* / --text-* 等），
// 明暗主题随应用 data-theme 自动切换，无需重建编辑器
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";

export const editorHighlight = syntaxHighlighting(
  HighlightStyle.define([
    { tag: t.heading, color: "var(--md-syntax-heading)", fontWeight: "600" },
    { tag: t.strong, fontWeight: "700" },
    { tag: t.emphasis, fontStyle: "italic" },
    { tag: t.strikethrough, textDecoration: "line-through" },
    { tag: t.link, color: "var(--md-syntax-link)" },
    { tag: t.url, color: "var(--md-syntax-link)", textDecoration: "underline" },
    { tag: t.monospace, color: "var(--md-syntax-code)" },
    { tag: t.quote, color: "var(--md-syntax-quote)", fontStyle: "italic" },
    { tag: t.list, color: "var(--md-syntax-list)" },
    { tag: t.contentSeparator, color: "var(--md-syntax-separator)" },
    { tag: t.processingInstruction, color: "var(--md-syntax-marker)" },
    { tag: t.meta, color: "var(--md-syntax-marker)" },
    { tag: t.escape, color: "var(--md-syntax-code)" },
    { tag: t.documentMeta, color: "var(--md-syntax-quote)" },
  ]),
);

export const editorTheme = EditorView.theme(
  {
    "&": {
      color: "var(--text-primary)",
      backgroundColor: "var(--bg-primary)",
      fontSize: "var(--editor-font-size, 13px)",
      height: "100%",
    },
    ".cm-scroller": {
      fontFamily: "var(--font-mono)",
      lineHeight: "1.7",
    },
    ".cm-content": {
      // 底部留白：文档最后一段也能滚到视口顶部
      padding: "12px 0 40vh",
      caretColor: "var(--accent)",
    },
    ".cm-line": {
      padding: "0 16px",
    },
    ".cm-gutters": {
      backgroundColor: "var(--bg-primary)",
      color: "var(--text-muted)",
      border: "none",
    },
    ".cm-activeLine": {
      backgroundColor: "var(--accent-soft)",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "var(--accent-soft)",
      color: "var(--text-primary)",
    },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
      backgroundColor: "var(--accent-soft) !important",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "var(--accent)",
    },
    ".cm-searchMatch": {
      backgroundColor: "rgba(255, 214, 0, 0.3)",
    },
    ".cm-panels": {
      backgroundColor: "var(--bg-secondary)",
      borderColor: "var(--border-color)",
    },
    ".cm-panel.cm-search input, .cm-panel.cm-search button": {
      background: "var(--bg-primary)",
      color: "var(--text-primary)",
      border: "1px solid var(--border-color)",
      borderRadius: "4px",
    },
  },
  { dark: false },
);
