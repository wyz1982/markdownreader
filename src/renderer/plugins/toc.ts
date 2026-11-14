import type { MarkdownIt, StateBlock } from "markdown-it";

const TOC_RE = /^\[(?:TOC|toc|目录)\]$/;

/** [TOC] / [toc] / [目录] 占位符：渲染为空导航容器，postprocess 阶段按大纲填充 */
export function toc(md: MarkdownIt): void {
  md.block.ruler.before(
    "heading",
    "mdr_toc",
    (state: StateBlock, startLine: number, _endLine: number, silent: boolean) => {
      const startPos = state.bMarks[startLine] + state.tShift[startLine];
      const maxPos = state.eMarks[startLine];
      const line = state.src.slice(startPos, maxPos).trim();
      if (!TOC_RE.test(line)) return false;
      if (silent) return true;

      const open = state.push("mdr_toc_open", "nav", 1);
      open.attrSet("class", "md-toc");
      open.map = [startLine, startLine + 1];
      state.push("mdr_toc_close", "nav", -1);
      // 块规则的约定：state.line = 下一个待解析行（单行规则）；设成 endLine 会吞掉全文
      state.line = startLine + 1;
      return true;
    },
  );
}
