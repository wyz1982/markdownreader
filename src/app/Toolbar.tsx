import { openFileDialog } from "../ipc";
import { useAppStore } from "./store";
import { useT } from "../i18n";
import RecentMenu from "./RecentMenu";
import ExportMenu from "./ExportMenu";

const MODES = [
  { value: "read", labelKey: "read" },
  { value: "split", labelKey: "split" },
  { value: "edit", labelKey: "edit" },
] as const;

/** 顶部工具栏：三态布局切换 / 打开 / 保存 / 导出 / 最近 / 设置 */
export default function Toolbar() {
  const { t } = useT();
  const mode = useAppStore((state) => state.mode);
  const dirty = useAppStore((state) => state.dirty);
  const filePath = useAppStore((state) => state.filePath);
  const setMode = useAppStore((state) => state.setMode);
  const openPath = useAppStore((state) => state.openPath);
  const save = useAppStore((state) => state.save);
  const setSettingsOpen = useAppStore((state) => state.setSettingsOpen);
  const setAboutOpen = useAppStore((state) => state.setAboutOpen);

  const canSave = dirty || filePath == null;

  return (
    <header className="toolbar">
      <span className="toolbar__logo">MD</span>
      <span className="toolbar__title">MarkDownReader</span>
      <div className="toolbar__actions">
        <div className="toolbar__modes">
          {MODES.map((item) => (
            <button
              key={item.value}
              className={`toolbar__mode${mode === item.value ? " toolbar__mode--active" : ""}`}
              onClick={() => setMode(item.value)}
            >
              {t(item.labelKey)}
            </button>
          ))}
        </div>
        <button
          className="toolbar__btn"
          onClick={() =>
            void openFileDialog().then((path) => {
              if (path) void openPath(path);
            })
          }
        >
          {t("open")}
        </button>
        <button className="toolbar__btn" onClick={() => void save()} disabled={!canSave}>
          {t("save")}
        </button>
        <ExportMenu />
        <RecentMenu />
        <button
          className="toolbar__btn"
          title={t("settings")}
          onClick={() => setSettingsOpen(true)}
        >
          ⚙
        </button>
        <button className="toolbar__btn" title={t("about")} onClick={() => setAboutOpen(true)}>
          ⓘ
        </button>
      </div>
    </header>
  );
}
