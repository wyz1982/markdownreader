// CodeMirror 6 编辑器装配：扩展、快捷键、粘贴处理、更新监听
import { EditorState } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { bracketMatching } from "@codemirror/language";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import {
  drawSelection,
  dropCursor,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection,
} from "@codemirror/view";
import { editorHighlight, editorTheme } from "./cmTheme";
import { applyFormat } from "./format";
import { imageFileFromClipboard } from "./imagePaste";
import { runListContinuation } from "./listContinuation";

export interface EditorCallbacks {
  onDocChange(text: string): void;
  onCursor(line: number, col: number): void;
  onPasteImage(file: File): void;
}

export function createMarkdownEditor(
  parent: HTMLElement,
  initialDoc: string,
  callbacks: EditorCallbacks,
): EditorView {
  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged) callbacks.onDocChange(update.state.doc.toString());
    if (update.docChanged || update.selectionSet) {
      const head = update.state.selection.main.head;
      const line = update.state.doc.lineAt(head);
      callbacks.onCursor(line.number, head - line.from + 1);
    }
  });

  const state = EditorState.create({
    doc: initialDoc,
    extensions: [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      drawSelection(),
      dropCursor(),
      rectangularSelection(),
      highlightActiveLine(),
      highlightSelectionMatches(),
      bracketMatching(),
      EditorView.lineWrapping,
      editorTheme,
      editorHighlight,
      // 列表/引用续写与格式化快捷键先于默认行为
      keymap.of([
        { key: "Enter", run: runListContinuation },
        {
          key: "Mod-b",
          run: (view) => {
            applyFormat(view, "bold");
            return true;
          },
        },
        {
          key: "Mod-i",
          run: (view) => {
            applyFormat(view, "italic");
            return true;
          },
        },
        {
          key: "Mod-k",
          run: (view) => {
            applyFormat(view, "link");
            return true;
          },
        },
      ]),
      keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
      markdown({ base: markdownLanguage }),
      EditorView.domEventHandlers({
        paste: (event) => {
          const image = imageFileFromClipboard(event);
          if (!image) return false;
          event.preventDefault();
          callbacks.onPasteImage(image);
          return true;
        },
      }),
      updateListener,
    ],
  });

  return new EditorView({ state, parent });
}
