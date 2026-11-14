import { useAppStore } from "./store";

/** 文件被外部修改时的提示条 */
export default function ChangedBanner() {
  const changedOnDisk = useAppStore((state) => state.changedOnDisk);
  const dirty = useAppStore((state) => state.dirty);
  const reloadFromDisk = useAppStore((state) => state.reloadFromDisk);
  const dismissChanged = useAppStore((state) => state.dismissChanged);

  if (!changedOnDisk) return null;

  return (
    <div className="changed-banner">
      <span>文件已在磁盘上被外部修改{dirty ? "，且本地有未保存的更改" : ""}。</span>
      <button className="changed-banner__btn" onClick={() => void reloadFromDisk()}>
        重新加载
      </button>
      <button className="changed-banner__btn changed-banner__btn--ghost" onClick={dismissChanged}>
        忽略
      </button>
    </div>
  );
}
