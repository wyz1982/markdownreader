import { openFileDialog } from "../ipc";
import { useAppStore } from "./store";
import RecentMenu from "./RecentMenu";

/** 顶部工具栏：打开 / 保存 / 阅读模式切换 / 最近文件 */
export default function Toolbar() {
  const mode = useAppStore((state) => state.mode);
  const dirty = useAppStore((state) => state.dirty);
  const filePath = useAppStore((state) => state.filePath);
  const setMode = useAppStore((state) => state.setMode);
  const openPath = useAppStore((state) => state.openPath);
  const save = useAppStore((state) => state.save);

  const canSave = dirty || filePath == null;

  return (
    <header className="toolbar">
      <span className="toolbar__logo">MD</span>
      <span className="toolbar__title">MarkDownReader</span>
      <div className="toolbar__actions">
        <button
          className="toolbar__btn"
          onClick={() =>
            void openFileDialog().then((path) => {
              if (path) void openPath(path);
            })
          }
        >
          打开
        </button>
        <button className="toolbar__btn" onClick={() => void save()} disabled={!canSave}>
          保存
        </button>
        <button
          className="toolbar__btn"
          onClick={() => setMode(mode === "read" ? "split" : "read")}
        >
          {mode === "read" ? "分栏编辑" : "阅读模式"}
        </button>
        <RecentMenu />
      </div>
    </header>
  );
}
