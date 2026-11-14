import { useEffect, useRef, useState } from "react";
import { saveExportDialog, saveMarkdownFile } from "../ipc";
import { fileNameOf, useAppStore } from "./store";
import { buildExportHtml } from "./exportHtml";
import { useT } from "../i18n";

/** 导出下拉菜单：单文件 HTML / PDF（系统打印） */
export default function ExportMenu() {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const exportHtml = async () => {
    setOpen(false);
    const { source, resolvedTheme, filePath } = useAppStore.getState();
    const base = filePath ? fileNameOf(filePath).replace(/\.[^.]+$/, "") : "document";
    const target = await saveExportDialog(`${base}.html`);
    if (!target) return;
    await saveMarkdownFile(target, buildExportHtml(source, resolvedTheme, base));
  };

  return (
    <div className="recent-menu" ref={rootRef}>
      <button className="toolbar__btn" onClick={() => setOpen((value) => !value)}>
        {t("export")} ▾
      </button>
      {open && (
        <ul className="recent-menu__list">
          <li>
            <button
              className="recent-menu__item"
              onClick={() => {
                void exportHtml();
              }}
            >
              {t("exportHtml")}
            </button>
          </li>
          <li>
            <button
              className="recent-menu__item"
              onClick={() => {
                setOpen(false);
                window.print();
              }}
            >
              {t("exportPdf")}
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
