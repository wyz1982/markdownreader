// 分栏双向滚动同步：编辑器 ↔ 预览
// 数据基础：渲染时把顶层块级 token 的起始行写入预览元素的 data-line 属性
// 锁机制：一侧主动滚动时上锁 100ms，另一侧由联动产生的滚动事件在锁窗口内被忽略，防止乒乓循环
import { EditorView } from "@codemirror/view";

type Side = "editor" | "preview";

let lock: Side | null = null;
let lockTimer = 0;
let editorView: EditorView | null = null;
let previewEl: HTMLElement | null = null;
let rafPending = false;

export function registerEditorView(view: EditorView | null): void {
  editorView = view;
}

export function registerPreview(el: HTMLElement | null): void {
  previewEl = el;
}

function acquireLock(side: Side): void {
  lock = side;
  window.clearTimeout(lockTimer);
  lockTimer = window.setTimeout(() => {
    lock = null;
  }, 100);
}

function schedule(sync: () => void): void {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    rafPending = false;
    sync();
  });
}

/** 编辑器滚动 → 预览跟随（rAF 节流） */
export function handleEditorScroll(): void {
  if (!editorView || !previewEl) return;
  if (lock === "preview") return;
  acquireLock("editor");
  schedule(() => {
    const view = editorView;
    const container = previewEl;
    if (!view || !container) return;
    const line = topVisibleEditorLine(view);
    if (line == null) return;
    const blocks = Array.from(container.querySelectorAll<HTMLElement>("[data-line]"));
    if (blocks.length === 0) return;
    let target: HTMLElement | null = null;
    for (const el of blocks) {
      if (Number(el.dataset.line) <= line) target = el;
      else break;
    }
    target ??= blocks[0];
    const contRect = container.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    container.scrollTop += rect.top - contRect.top - 12;
  });
}

/** 预览滚动 → 编辑器跟随（rAF 节流） */
export function handlePreviewScroll(): void {
  if (!editorView || !previewEl) return;
  if (lock === "editor") return;
  acquireLock("preview");
  schedule(() => {
    const view = editorView;
    const container = previewEl;
    if (!view || !container) return;
    const el = firstVisiblePreviewBlock(container);
    if (!el) return;
    const line = Number(el.dataset.line);
    if (!Number.isFinite(line)) return;
    const clamped = Math.min(line + 1, view.state.doc.lines);
    const pos = view.state.doc.line(clamped).from;
    view.dispatch({
      effects: EditorView.scrollIntoView(pos, { y: "start", yMargin: 0 }),
    });
  });
}

/** 编辑器视口顶部对应的源码行（0 基） */
function topVisibleEditorLine(view: EditorView): number | null {
  const rect = view.scrollDOM.getBoundingClientRect();
  const pos = view.posAtCoords({ x: rect.left + 8, y: rect.top + 2 });
  if (pos == null) return null;
  return view.state.doc.lineAt(pos).number - 1;
}

/** 预览容器顶部第一个可见块（bottom 越过容器顶边的第一个元素） */
function firstVisiblePreviewBlock(container: HTMLElement): HTMLElement | null {
  const contRect = container.getBoundingClientRect();
  const blocks = Array.from(container.querySelectorAll<HTMLElement>("[data-line]"));
  for (const el of blocks) {
    if (el.getBoundingClientRect().bottom > contRect.top + 1) return el;
  }
  return blocks[blocks.length - 1] ?? null;
}
