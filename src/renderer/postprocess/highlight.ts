type ShikiHighlighter = Awaited<ReturnType<typeof import("shiki").createHighlighter>>;

const PRELOAD_LANGS = [
  "typescript",
  "javascript",
  "python",
  "rust",
  "json",
  "bash",
  "css",
  "html",
  "yaml",
  "markdown",
  "c",
  "cpp",
  "go",
  "java",
  "sql",
  "xml",
  "diff",
];

const LANG_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  sh: "bash",
  zsh: "bash",
  shell: "bash",
  yml: "yaml",
  golang: "go",
  "c++": "cpp",
  md: "markdown",
  text: "plaintext",
  txt: "plaintext",
};

let highlighterPromise: Promise<ShikiHighlighter> | null = null;

function getHighlighter(): Promise<ShikiHighlighter> {
  if (!highlighterPromise) {
    highlighterPromise = import("shiki").then(({ createHighlighter }) =>
      createHighlighter({
        themes: ["github-light", "github-dark"],
        langs: PRELOAD_LANGS,
      }),
    );
  }
  return highlighterPromise;
}

/** Shiki 代码高亮：懒加载 + 双主题 CSS 变量（明暗切换无需重渲染） */
export async function applyShiki(root: HTMLElement): Promise<void> {
  const codeBlocks = Array.from(
    root.querySelectorAll<HTMLElement>("pre > code[class*='language-']"),
  ).filter((code) => !code.closest(".md-mermaid"));

  if (codeBlocks.length === 0) return;

  let highlighter: ShikiHighlighter;
  try {
    highlighter = await getHighlighter();
  } catch {
    return; // Shiki 加载失败时保留原始代码块
  }

  for (const codeEl of codeBlocks) {
    const raw = /language-([\w+-]+)/.exec(codeEl.className)?.[1] ?? "";
    const lang = LANG_ALIASES[raw] ?? raw;
    if (!lang || lang === "mermaid" || lang === "plaintext") continue;
    try {
      const html = highlighter.codeToHtml(codeEl.textContent ?? "", {
        lang,
        themes: { light: "github-light", dark: "github-dark" },
        defaultColor: "light",
      });
      const template = document.createElement("template");
      template.innerHTML = html;
      const newPre = template.content.firstElementChild as HTMLElement | null;
      const oldPre = codeEl.parentElement;
      if (!newPre || !oldPre) continue;
      // 保留 data-* 属性（M3 滚动同步的行号映射依赖它）
      for (const attr of Array.from(oldPre.attributes)) {
        if (attr.name.startsWith("data-")) newPre.setAttribute(attr.name, attr.value);
      }
      oldPre.replaceWith(newPre);
    } catch {
      // 语言不支持 → 保持默认渲染
    }
  }
}
