// 持久化：settings.json（tauri-plugin-store，存于应用数据目录）— 最近文件 + 应用设置
import { load, type Store } from "@tauri-apps/plugin-store";

const RECENT_KEY = "recentFiles";
const SETTINGS_KEY = "settings";
const RECENT_MAX = 10;

export interface AppSettings {
  /** 主题：跟随系统 / 强制明 / 强制暗 */
  themeMode: "system" | "light" | "dark";
  /** 正文字号（px） */
  readingFontSize: number;
  /** 正文行高 */
  readingLineHeight: number;
  /** 正文字体：无衬线 / 衬线 */
  readingFont: "sans" | "serif";
  /** 编辑器字号（px） */
  editorFontSize: number;
  locale: "zh-CN" | "en";
}

export const DEFAULT_SETTINGS: AppSettings = {
  themeMode: "system",
  readingFontSize: 15,
  readingLineHeight: 1.75,
  readingFont: "sans",
  editorFontSize: 13,
  locale: "zh-CN",
};

let storePromise: Promise<Store> | null = null;

function getStore(): Promise<Store> {
  if (!storePromise) {
    storePromise = load("settings.json", { autoSave: false });
  }
  return storePromise;
}

/** 去重并截断的纯函数（便于单测） */
export function dedupeRecents(list: string[], path: string, max = RECENT_MAX): string[] {
  return [path, ...list.filter((item) => item !== path)].slice(0, max);
}

export async function loadRecentFiles(): Promise<string[]> {
  try {
    const store = await getStore();
    return (await store.get<string[]>(RECENT_KEY)) ?? [];
  } catch {
    return [];
  }
}

export async function pushRecentFile(path: string): Promise<string[]> {
  const store = await getStore();
  const current = (await store.get<string[]>(RECENT_KEY)) ?? [];
  const next = dedupeRecents(current, path);
  await store.set(RECENT_KEY, next);
  await store.save();
  return next;
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const store = await getStore();
    const stored = (await store.get<Partial<AppSettings>>(SETTINGS_KEY)) ?? {};
    return { ...DEFAULT_SETTINGS, ...stored };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    const store = await getStore();
    await store.set(SETTINGS_KEY, settings);
    await store.save();
  } catch {
    // 持久化失败不阻塞当前会话
  }
}

/** 把阅读/编辑器设置落到 CSS 变量（data-theme 由 App 处理） */
export function applyReadingVars(settings: AppSettings): void {
  const root = document.documentElement;
  root.style.setProperty("--reading-font-size", `${settings.readingFontSize}px`);
  root.style.setProperty("--reading-line-height", String(settings.readingLineHeight));
  root.style.setProperty(
    "--font-reading",
    settings.readingFont === "serif"
      ? 'Georgia, "Source Han Serif SC", "Noto Serif SC", SimSun, serif'
      : "var(--font-ui)",
  );
  root.style.setProperty("--editor-font-size", `${settings.editorFontSize}px`);
}
