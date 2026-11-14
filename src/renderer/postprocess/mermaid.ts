type MermaidModule = typeof import("mermaid");

let mermaidPromise: Promise<MermaidModule["default"]> | null = null;
let mermaidTheme: "light" | "dark" | null = null;
let renderCounter = 0;

async function getMermaid(theme: "light" | "dark"): Promise<MermaidModule["default"]> {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((module) => module.default);
  }
  const mermaid = await mermaidPromise;
  if (mermaidTheme !== theme) {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      fontFamily: "Segoe UI, Microsoft YaHei, sans-serif",
      theme: theme === "dark" ? "dark" : "neutral",
    });
    mermaidTheme = theme;
  }
  return mermaid;
}

/** Mermaid 图表懒加载渲染：```mermaid 代码块 → SVG（首次使用时才加载 ~1MB 模块） */
export async function applyMermaid(root: HTMLElement, theme: "light" | "dark"): Promise<void> {
  const blocks = Array.from(root.querySelectorAll<HTMLElement>("pre > code.language-mermaid"));
  if (blocks.length === 0) return;

  for (const codeEl of blocks) {
    const source = codeEl.textContent ?? "";
    const placeholder = document.createElement("div");
    placeholder.className = "md-mermaid md-mermaid--loading";
    placeholder.textContent = "正在渲染图表…";
    codeEl.parentElement?.replaceWith(placeholder);

    try {
      const mermaid = await getMermaid(theme);
      renderCounter += 1;
      const { svg } = await mermaid.render(`mdr-mermaid-${renderCounter}`, source);
      placeholder.classList.remove("md-mermaid--loading");
      placeholder.innerHTML = svg;
    } catch (error) {
      placeholder.classList.remove("md-mermaid--loading");
      placeholder.classList.add("md-mermaid--error");
      placeholder.textContent = `图表渲染失败: ${
        error instanceof Error ? error.message : String(error)
      }`;
      const pre = document.createElement("pre");
      pre.textContent = source;
      placeholder.appendChild(pre);
    }
  }
}
