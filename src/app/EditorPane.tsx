interface EditorPaneProps {
  value: string;
  onChange: (value: string) => void;
}

/** M0~M2 的临时编辑器（纯 textarea），M3 替换为 CodeMirror 6 */
export default function EditorPane({ value, onChange }: EditorPaneProps) {
  return (
    <textarea
      className="editor-textarea"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      spellCheck={false}
      placeholder="在这里输入 Markdown…（M3 将替换为 CodeMirror 6）"
    />
  );
}
