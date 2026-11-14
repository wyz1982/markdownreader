// 应用全局状态（Zustand）：文件、编辑、模式、大纲、最近文件、磁盘变更提示
import { create } from "zustand";
import { getCurrentWindow } from "@tauri-apps/api/window";
import sampleDoc from "../sample/sample.md?raw";
import type { OutlineItem } from "../renderer/outline";
import { readMarkdownFile, saveFileDialog, saveMarkdownFile, watchFile } from "../ipc";
import { pushRecentFile } from "./recent";

export type AppMode = "read" | "split";

interface AppState {
  filePath: string | null;
  encoding: string | null;
  size: number | null;
  source: string;
  dirty: boolean;
  mode: AppMode;
  outline: OutlineItem[];
  activeSlug: string | null;
  recentFiles: string[];
  /** 文件在磁盘上被外部修改（显示重载提示条） */
  changedOnDisk: boolean;
  error: string | null;
  /** 自己刚保存导致的事件在短暂窗口内忽略，避免误报 */
  suppressChangedUntil: number;

  openPath(path: string): Promise<void>;
  setSource(source: string): void;
  save(): Promise<void>;
  reloadFromDisk(): Promise<void>;
  setMode(mode: AppMode): void;
  setOutline(outline: OutlineItem[]): void;
  setActiveSlug(slug: string): void;
  setRecentFiles(list: string[]): void;
  dismissChanged(): void;
}

export function fileNameOf(path: string): string {
  return path.split(/[\\/]/).pop() ?? path;
}

async function applyTitle(path: string | null, dirty: boolean): Promise<void> {
  const name = path ? fileNameOf(path) : "未命名";
  try {
    await getCurrentWindow().setTitle(`${name}${dirty ? " *" : ""} — MarkDownReader`);
  } catch {
    // 标题更新失败不阻塞主流程
  }
}

export const useAppStore = create<AppState>()((set, get) => ({
  filePath: null,
  encoding: null,
  size: null,
  source: sampleDoc,
  dirty: false,
  mode: "split",
  outline: [],
  activeSlug: null,
  recentFiles: [],
  changedOnDisk: false,
  error: null,
  suppressChangedUntil: 0,

  async openPath(path) {
    try {
      const result = await readMarkdownFile(path);
      set({
        filePath: result.path,
        source: result.content,
        encoding: result.encoding,
        size: result.size,
        dirty: false,
        changedOnDisk: false,
        error: null,
        activeSlug: null,
      });
      set({ recentFiles: await pushRecentFile(result.path) });
      await watchFile(result.path);
      await applyTitle(result.path, false);
    } catch (error) {
      set({ error: String(error) });
    }
  },

  setSource(source) {
    const wasDirty = get().dirty;
    set({ source, dirty: true });
    if (!wasDirty) void applyTitle(get().filePath, true);
  },

  async save() {
    const { filePath, source, dirty } = get();
    try {
      const target = filePath ?? (await saveFileDialog("未命名.md"));
      if (!target) return;
      await saveMarkdownFile(target, source);
      set({
        filePath: target,
        dirty: false,
        error: null,
        // 自己的保存也会触发监视事件，短暂忽略
        suppressChangedUntil: Date.now() + 800,
      });
      if (!filePath || dirty) await applyTitle(target, false);
      set({ recentFiles: await pushRecentFile(target) });
      await watchFile(target);
    } catch (error) {
      set({ error: String(error) });
    }
  },

  async reloadFromDisk() {
    const { filePath } = get();
    if (filePath) await get().openPath(filePath);
  },

  setMode(mode) {
    set({ mode });
  },
  setOutline(outline) {
    set({ outline });
  },
  setActiveSlug(activeSlug) {
    set({ activeSlug });
  },
  setRecentFiles(recentFiles) {
    set({ recentFiles });
  },
  dismissChanged() {
    set({ changedOnDisk: false });
  },
}));

/** 「file-changed-on-disk」事件到达时由 App 层调用 */
export function notifyFileChanged(path: string, currentPath: string | null): void {
  const state = useAppStore.getState();
  if (Date.now() < state.suppressChangedUntil) return;
  if (path !== currentPath) return;
  useAppStore.setState({ changedOnDisk: true });
}
