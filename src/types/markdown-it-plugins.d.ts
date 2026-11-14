// 无类型声明的 markdown-it 插件垫片（与 @types/markdown-it 的类导出对齐）
declare module "markdown-it-deflist" {
  import type MarkdownIt from "markdown-it";
  const deflist: (md: MarkdownIt) => void;
  export default deflist;
}

declare module "markdown-it-footnote" {
  import type MarkdownIt from "markdown-it";
  const footnote: (md: MarkdownIt) => void;
  export default footnote;
}

declare module "markdown-it-emoji" {
  import type MarkdownIt from "markdown-it";
  // v3 命名导出：bare（最小集）/ light / full（完整集）
  const bare: (md: MarkdownIt) => void;
  const light: (md: MarkdownIt) => void;
  const full: (md: MarkdownIt) => void;
  export { bare, light, full };
}

declare module "markdown-it-mark" {
  import type MarkdownIt from "markdown-it";
  const mark: (md: MarkdownIt) => void;
  export default mark;
}

declare module "markdown-it-sub" {
  import type MarkdownIt from "markdown-it";
  const sub: (md: MarkdownIt) => void;
  export default sub;
}

declare module "markdown-it-sup" {
  import type MarkdownIt from "markdown-it";
  const sup: (md: MarkdownIt) => void;
  export default sup;
}

declare module "markdown-it-container" {
  import type { MarkdownIt, Token } from "markdown-it";
  interface ContainerOptions {
    validate?: (params: string) => boolean;
    render?: (tokens: Token[], idx: number) => string;
    marker?: string;
  }
  const container: (md: MarkdownIt, name: string, options?: ContainerOptions) => void;
  export default container;
}

declare module "markdown-it-front-matter" {
  import type MarkdownIt from "markdown-it";
  const frontMatter: (md: MarkdownIt, callback: (raw: string) => void) => void;
  export default frontMatter;
}
