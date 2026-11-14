// Rust 命令的类型化封装。所有 IPC 调用集中在这里，方便 mock 与搜索。
import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";

export interface ReadFileResult {
  /** 绝对路径 */
  path: string;
  /** 解码后的 UTF-8 文本 */
  content: string;
  /** 检测出的原编码（UTF-8 / UTF-8 BOM / GBK / …） */
  encoding: string;
  /** 原始字节数 */
  size: number;
}

/** 读取磁盘上的 Markdown 文件（Rust 侧自动做编码检测） */
export function readMarkdownFile(path: string): Promise<ReadFileResult> {
  return invoke<ReadFileResult>("read_file", { path });
}

/** 保存 Markdown 文件（Rust 侧原子写入，统一 UTF-8） */
export function saveMarkdownFile(path: string, content: string): Promise<void> {
  return invoke<void>("save_file", { path, content });
}

/** 监视指定文件的外部修改；传 null 停止监视 */
export function watchFile(path: string | null): Promise<void> {
  return invoke<void>("watch_file", { path });
}

/** 获取启动参数（文件关联双击打开时携带的文件路径） */
export function getLaunchArgs(): Promise<string[]> {
  return invoke<string[]>("get_launch_args");
}

/** 保存粘贴的图片到文档同目录 assets/，返回相对引用路径 */
export function savePasteImage(dir: string, fileName: string, bytes: number[]): Promise<string> {
  return invoke<string>("save_paste_image", { dir, fileName, bytes });
}

/** 弹出系统「打开文件」对话框 */
export async function openFileDialog(): Promise<string | null> {
  const selected = await open({
    multiple: false,
    title: "打开 Markdown 文件",
    filters: [
      { name: "Markdown", extensions: ["md", "markdown", "mdown", "mkd"] },
      { name: "文本文件", extensions: ["txt"] },
      { name: "所有文件", extensions: ["*"] },
    ],
  });
  return typeof selected === "string" ? selected : null;
}

/** 弹出系统「保存文件」对话框 */
export async function saveFileDialog(defaultName: string): Promise<string | null> {
  const selected = await save({
    title: "保存 Markdown 文件",
    defaultPath: defaultName,
    filters: [{ name: "Markdown", extensions: ["md"] }],
  });
  return selected;
}
