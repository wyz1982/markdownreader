import { useEffect, useRef, useState } from "react";
import { fileNameOf, useAppStore } from "./store";
import { useT } from "../i18n";

/** 最近文件下拉菜单 */
export default function RecentMenu() {
  const recentFiles = useAppStore((state) => state.recentFiles);
  const openPath = useAppStore((state) => state.openPath);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { t } = useT();

  useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div className="recent-menu" ref={rootRef}>
      <button
        className="toolbar__btn"
        onClick={() => setOpen((value) => !value)}
        disabled={recentFiles.length === 0}
      >
        {t("recent")} ▾
      </button>
      {open && (
        <ul className="recent-menu__list">
          {recentFiles.map((path) => (
            <li key={path}>
              <button
                className="recent-menu__item"
                title={path}
                onClick={() => {
                  setOpen(false);
                  void openPath(path);
                }}
              >
                {fileNameOf(path)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
