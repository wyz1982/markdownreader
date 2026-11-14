// 图片粘贴：文件名生成与剪贴板提取（纯函数，便于单测）

/** 粘贴图片落盘的文件名（时间戳 + 随机后缀，不含扩展名） */
export function pasteImageName(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(
    now.getHours(),
  )}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `image-${stamp}-${Math.random().toString(36).slice(2, 6)}`;
}

/** 从粘贴事件提取图片文件；非图片返回 null */
export function imageFileFromClipboard(event: ClipboardEvent): File | null {
  const items = event.clipboardData?.items;
  if (!items) return null;
  for (const item of Array.from(items)) {
    if (item.type.startsWith("image/")) return item.getAsFile();
  }
  return null;
}

/** MIME → 扩展名规范化（image/jpeg → jpg） */
export function imageExtFromMime(mime: string): string {
  return (mime.split("/")[1] ?? "png").replace("jpeg", "jpg");
}
