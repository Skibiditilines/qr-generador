"use client";

import MDEditor, { commands } from "@uiw/react-md-editor";

interface SimpleMarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
}

export const MarkdownEditor: React.FC<SimpleMarkdownEditorProps> = ({
  value,
  onChange,
}) => {
  return (
    <div>
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || "")}
        height={240}
        preview="edit"
        commands={[
          commands.bold,
          commands.italic,
          commands.strikethrough,
          commands.divider,
          commands.orderedListCommand,
          commands.unorderedListCommand,
          commands.checkedListCommand,
        ]}
        extraCommands={[]}
      />
    </div>
  );
};

export default MarkdownEditor;
