import { useEffect, useState } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useAppStore } from "./store";
import { useT } from "../i18n";

const REPO_URL = "https://github.com/wyz1982/markdownreader";

/** 关于对话框：版本信息（来自 tauri.conf.json）+ 技术栈 + 仓库链接 */
export default function AboutDialog() {
  const open = useAppStore((state) => state.aboutOpen);
  const setAboutOpen = useAppStore((state) => state.setAboutOpen);
  const { t } = useT();
  const [version, setVersion] = useState("");

  useEffect(() => {
    if (!open) return;
    void getVersion()
      .then(setVersion)
      .catch(() => setVersion("?"));
  }, [open]);

  if (!open) return null;

  return (
    <div className="dialog-overlay" onClick={() => setAboutOpen(false)}>
      <div className="dialog dialog--about" onClick={(event) => event.stopPropagation()}>
        <div className="about__logo">MD</div>
        <div className="about__name">MarkDownReader</div>
        <div className="about__version">
          {t("aboutVersion")} {version || "…"}
        </div>
        <div className="about__desc">{t("aboutDesc")}</div>
        <div className="about__tech">{t("aboutTech")}</div>
        <button className="toolbar__btn about__repo" onClick={() => void openUrl(REPO_URL)}>
          {t("aboutRepo")} ↗
        </button>
        <div className="dialog__footer">
          <button className="toolbar__btn" onClick={() => setAboutOpen(false)}>
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
