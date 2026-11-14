// 块级行号标注：预览 DOM 顶层元素 ↔ markdown-it 顶层 token 顺序一一对应。
// 这是 M3 双向滚动同步的数据基础（data-line 属性）。
export function assignBlockLines(root: HTMLElement, blockLines: number[]): void {
  const elements = Array.from(root.children).filter(
    (el) => !(el instanceof HTMLElement && el.classList.contains("md-front-matter")),
  );
  const count = Math.min(elements.length, blockLines.length);
  for (let i = 0; i < count; i++) {
    (elements[i] as HTMLElement).dataset.line = String(blockLines[i]);
  }
}
