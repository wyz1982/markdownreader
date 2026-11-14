import { useAppStore } from "./store";
import { useT } from "../i18n";

/** 文件被外部修改时的提示条 */
export default function ChangedBanner() {
  const changedOnDisk = useAppStore((state) => state.changedOnDisk);
  const dirty = useAppStore((state) => state.dirty);
  const reloadFromDisk = useAppStore((state) => state.reloadFromDisk);
  const dismissChanged = useAppStore((state) => state.dismissChanged);
  const { t } = useT();

  if (!changedOnDisk) return null;

  return (
    <div className="changed-banner">
      <span>
        {t("changedOnDisk")}
        {dirty ? t("unsavedSuffix") : ""}。
      </span>
      <button className="changed-banner__btn" onClick={() => void reloadFromDisk()}>
        {t("reload")}
      </button>
      <button className="changed-banner__btn changed-banner__btn--ghost" onClick={dismissChanged}>
        {t("ignore")}
      </button>
    </div>
  );
}
