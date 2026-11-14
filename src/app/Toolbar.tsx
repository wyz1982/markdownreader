import { openFileDialog } from "../ipc";
import { useAppStore } from "./store";
import RecentMenu from "./RecentMenu";

const MODES = [
  { value: "read", label: "阅读" },
  { value: "split", label: "分栏" },
  { value: "edit", label: "编辑" },
] as const;

/** 顶部工具栏：三态布局切换 / 打开 / 保存 / 最近文件 */
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
        <div className="toolbar__modes">
          {MODES.map((item) => (
            <button
              key={item.value}
              className={`toolbar__mode${mode === item.value ? " toolbar__mode--active" : ""}`}
              onClick={() => setMode(item.value)}
            >
              {item.label}
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
          打开
        </button>
        <button className="toolbar__btn" onClick={() => void save()} disabled={!canSave}>
          保存
        </button>
        <RecentMenu />
      </div>
    </header>
  );
}
