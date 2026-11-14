import type { AppSettings } from "./persist";
import { useAppStore } from "./store";
import { useT } from "../i18n";

/** 设置对话框：语言 / 主题 / 阅读排版 / 编辑器字号（即时生效并持久化） */
export default function SettingsDialog() {
  const open = useAppStore((state) => state.settingsOpen);
  const settings = useAppStore((state) => state.settings);
  const setSettings = useAppStore((state) => state.setSettings);
  const setSettingsOpen = useAppStore((state) => state.setSettingsOpen);
  const { t } = useT();

  if (!open) return null;

  const segment = <K extends keyof AppSettings>(
    field: K,
    options: { value: AppSettings[K]; label: string }[],
  ) => (
    <div className="dialog__segment">
      {options.map((option) => (
        <button
          key={String(option.value)}
          className={`dialog__seg-btn${settings[field] === option.value ? " dialog__seg-btn--active" : ""}`}
          onClick={() => setSettings({ [field]: option.value } as Partial<AppSettings>)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="dialog-overlay" onClick={() => setSettingsOpen(false)}>
      <div className="dialog" onClick={(event) => event.stopPropagation()}>
        <div className="dialog__title">{t("settingsTitle")}</div>

        <label className="dialog__row">
          <span>{t("language")}</span>
          <select
            className="dialog__input"
            value={settings.locale}
            onChange={(event) =>
              setSettings({ locale: event.target.value as AppSettings["locale"] })
            }
          >
            <option value="zh-CN">中文</option>
            <option value="en">English</option>
          </select>
        </label>

        <div className="dialog__row">
          <span>{t("themeMode")}</span>
          {segment("themeMode", [
            { value: "system", label: t("followSystem") },
            { value: "light", label: t("light") },
            { value: "dark", label: t("dark") },
          ])}
        </div>

        <label className="dialog__row">
          <span>
            {t("readingFontSize")} · {settings.readingFontSize}px
          </span>
          <input
            type="range"
            min={13}
            max={20}
            step={1}
            value={settings.readingFontSize}
            onChange={(event) => setSettings({ readingFontSize: Number(event.target.value) })}
          />
        </label>

        <label className="dialog__row">
          <span>{t("readingLineHeight")}</span>
          <select
            className="dialog__input"
            value={settings.readingLineHeight}
            onChange={(event) => setSettings({ readingLineHeight: Number(event.target.value) })}
          >
            {[1.5, 1.75, 2].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <div className="dialog__row">
          <span>{t("readingFont")}</span>
          {segment("readingFont", [
            { value: "sans", label: t("sans") },
            { value: "serif", label: t("serif") },
          ])}
        </div>

        <label className="dialog__row">
          <span>
            {t("editorFontSize")} · {settings.editorFontSize}px
          </span>
          <input
            type="range"
            min={12}
            max={18}
            step={1}
            value={settings.editorFontSize}
            onChange={(event) => setSettings({ editorFontSize: Number(event.target.value) })}
          />
        </label>

        <div className="dialog__shortcuts">
          <div className="dialog__section-title">{t("shortcuts")}</div>
          <div>{t("shortcutsHint")}</div>
        </div>

        <div className="dialog__footer">
          <button className="toolbar__btn" onClick={() => setSettingsOpen(false)}>
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
