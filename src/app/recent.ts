// 最近文件列表：持久化到 settings.json（tauri-plugin-store，存于应用数据目录）
import { load, type Store } from "@tauri-apps/plugin-store";

const RECENT_KEY = "recentFiles";
const RECENT_MAX = 10;

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
