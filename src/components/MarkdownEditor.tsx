import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import './MarkdownEditor.css';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  theme?: 'light' | 'dark';
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  theme = 'light',
}) => {
  return (
    <section className="editor-container" aria-label="Markdown editor">
      <label htmlFor="markdown-editor" className="visually-hidden">
        Enter your markdown content
      </label>
      <CodeMirror
        id="markdown-editor"
        value={value}
        height="100%"
        extensions={[markdown({ base: markdownLanguage })]}
        onChange={onChange}
        className="codemirror-editor"
        theme={theme}
        aria-label="Markdown editor text area"
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: false,
        }}
      />
    </section>
  );
};
