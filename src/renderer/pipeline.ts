import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import deflist from "markdown-it-deflist";
import footnote from "markdown-it-footnote";
import { full as emoji } from "markdown-it-emoji";
import frontMatter from "markdown-it-front-matter";
import mark from "markdown-it-mark";
import sub from "markdown-it-sub";
import sup from "markdown-it-sup";
import { katex as katexPlugin } from "@mdit/plugin-katex";
import { registerCallouts } from "./plugins/container";
import { tasklist } from "./plugins/tasklist";
import { toc } from "./plugins/toc";

export interface PipelineOptions {
  /** 规范测试模式：关闭 linkify 与全部扩展插件，验证纯 CommonMark 核心兼容性 */
  specMode?: boolean;
}

/** 最近一次 render 捕获的 YAML front matter 原文（markdown-it-front-matter 只提供回调） */
let pendingFrontMatter: string | undefined;

export function createMarkdownIt(options: PipelineOptions = {}) {
  // xhtmlOut: 输出 <br />/<hr /> 等自闭合标签 —— CommonMark 规范的期望格式
  const md = new MarkdownIt({ html: true, xhtmlOut: true, linkify: !options.specMode });

  if (options.specMode) {
    return md;
  }

  // linkify-it 5 起默认关闭模糊链接（www. 前缀），与 GitHub 行为对齐需显式打开
  md.linkify.set({ fuzzyLink: true });

  // 删除线输出 <del>（markdown-it 15 默认 <s>），与 GFM / GitHub 对齐
  md.renderer.rules.s_open = () => "<del>";
  md.renderer.rules.s_close = () => "</del>";

  return md
    .use(frontMatter, (raw: string) => {
      pendingFrontMatter = raw;
    })
    .use(anchor, { slugify: cjkSlugify })
    .use(footnote)
    .use(deflist)
    .use(mark)
    .use(sub)
    .use(sup)
    .use(emoji)
    .use(tasklist)
    .use(katexPlugin, { throwOnError: false })
    .use(toc)
    .use(registerCallouts);
}

/** 应用主实例：全插件开启 */
export const md = createMarkdownIt();

/** 取走并清空 pending 的 front matter 原文（渲染后调用） */
export function takePendingFrontMatter(): string | undefined {
  const raw = pendingFrontMatter;
  pendingFrontMatter = undefined;
  return raw;
}

/** CJK 友好的标题 slug：保留汉字/字母/数字，空白转连字符，去标点 */
export function cjkSlugify(text: string): string {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "");
  return slug || "section";
}
