import type { FormatAction } from "../editor/format";
import { applyFormat } from "../editor/format";
import { useT, type I18nKey } from "../i18n";
import { useAppStore } from "./store";

const BUTTONS: { action: FormatAction; label: string; titleKey: I18nKey }[] = [
  { action: "heading", label: "H2", titleKey: "fmtHeading" },
  { action: "bold", label: "B", titleKey: "fmtBold" },
  { action: "italic", label: "I", titleKey: "fmtItalic" },
  { action: "code", label: "<>", titleKey: "fmtCode" },
  { action: "link", label: "🔗", titleKey: "fmtLink" },
  { action: "quote", label: "❝", titleKey: "fmtQuote" },
  { action: "ul", label: "•", titleKey: "fmtUl" },
  { action: "ol", label: "1.", titleKey: "fmtOl" },
  { action: "hr", label: "―", titleKey: "fmtHr" },
];

/** 编辑器格式工具栏：对选中内容/当前行应用 Markdown 语法 */
export default function FormatBar() {
  const editorView = useAppStore((state) => state.editorView);
  const { t } = useT();

  if (!editorView) return null;

  return (
    <div className="format-bar">
      {BUTTONS.map((button) => (
        <button
          key={button.action}
          className="format-bar__btn"
          title={t(button.titleKey)}
          onClick={() => applyFormat(editorView, button.action)}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
}
