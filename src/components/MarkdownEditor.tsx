import React, { useCallback, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { EditorView, keymap, placeholder } from '@codemirror/view';
import { Prec } from '@codemirror/state';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Quote,
  List,
  ListOrdered,
  Link2,
  Code,
  Braces,
} from 'lucide-react';
import {
  insertAtCursor,
  toggleLinePrefix,
  wrapSelection,
  type EditOperation,
} from '../utils/editorCommands';
import './MarkdownEditor.css';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  theme?: 'light' | 'dark';
}

interface ToolbarAction {
  label: string;
  title: string;
  icon: React.ReactNode;
  run: (view: EditorView) => void;
}

// Everything below is a pure function of the EditorView it is handed, so it
// lives at module scope: the extensions object and toolbar stay identical
// across renders instead of being rebuilt on every keystroke.

const applyEdit = (view: EditorView, op: EditOperation) => {
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: op.text },
    selection: { anchor: op.selectionStart, head: op.selectionEnd },
  });
  view.focus();
};

const getSelection = (view: EditorView) => {
  const range = view.state.selection.main;
  return { text: view.state.doc.toString(), start: range.from, end: range.to };
};

const runWrap = (view: EditorView, before: string, after: string = before) => {
  const { text, start, end } = getSelection(view);
  applyEdit(view, wrapSelection(text, start, end, before, after));
};

const runPrefix = (view: EditorView, prefix: string) => {
  const { text, start, end } = getSelection(view);
  applyEdit(view, toggleLinePrefix(text, start, end, prefix));
};

// Prec.high so the markdown shortcuts win over CodeMirror's built-in bindings
const shortcuts = Prec.high(
  keymap.of([
    {
      key: 'Mod-b',
      run: (view) => {
        runWrap(view, '**');
        return true;
      },
    },
    {
      key: 'Mod-i',
      run: (view) => {
        runWrap(view, '*');
        return true;
      },
    },
    {
      key: 'Mod-e',
      run: (view) => {
        runWrap(view, '`');
        return true;
      },
    },
    {
      key: 'Mod-Shift-x',
      run: (view) => {
        runWrap(view, '~~');
        return true;
      },
    },
    {
      key: 'Mod-k',
      run: (view) => {
        runWrap(view, '[', '](https://)');
        return true;
      },
    },
  ])
);

const editorExtensions = [
  markdown({ base: markdownLanguage }),
  EditorView.lineWrapping,
  placeholder('Start writing your post...'),
  shortcuts,
];

const toolbarActions: ToolbarAction[] = [
  {
    label: 'Bold',
    title: 'Bold (Ctrl/Cmd+B)',
    icon: <Bold size={15} aria-hidden="true" />,
    run: (view) => runWrap(view, '**'),
  },
  {
    label: 'Italic',
    title: 'Italic (Ctrl/Cmd+I)',
    icon: <Italic size={15} aria-hidden="true" />,
    run: (view) => runWrap(view, '*'),
  },
  {
    label: 'Strikethrough',
    title: 'Strikethrough (Ctrl/Cmd+Shift+X)',
    icon: <Strikethrough size={15} aria-hidden="true" />,
    run: (view) => runWrap(view, '~~'),
  },
  {
    label: 'Inline code',
    title: 'Inline code (Ctrl/Cmd+E)',
    icon: <Code size={15} aria-hidden="true" />,
    run: (view) => runWrap(view, '`'),
  },
  {
    label: 'Link',
    title: 'Link (Ctrl/Cmd+K)',
    icon: <Link2 size={15} aria-hidden="true" />,
    run: (view) => runWrap(view, '[', '](https://)'),
  },
  {
    label: 'Heading 1',
    title: 'Heading 1',
    icon: <Heading1 size={15} aria-hidden="true" />,
    run: (view) => runPrefix(view, '# '),
  },
  {
    label: 'Heading 2',
    title: 'Heading 2',
    icon: <Heading2 size={15} aria-hidden="true" />,
    run: (view) => runPrefix(view, '## '),
  },
  {
    label: 'Quote',
    title: 'Quote',
    icon: <Quote size={15} aria-hidden="true" />,
    run: (view) => runPrefix(view, '> '),
  },
  {
    label: 'Bullet list',
    title: 'Bullet list',
    icon: <List size={15} aria-hidden="true" />,
    run: (view) => runPrefix(view, '- '),
  },
  {
    label: 'Numbered list',
    title: 'Numbered list',
    icon: <ListOrdered size={15} aria-hidden="true" />,
    run: (view) => runPrefix(view, '1. '),
  },
  {
    label: 'Code block',
    title: 'Code block',
    icon: <Braces size={15} aria-hidden="true" />,
    run: (view) => {
      const { text, start, end } = getSelection(view);
      if (start === end) {
        applyEdit(view, insertAtCursor(text, start, '\n```\ncode\n```\n'));
      } else {
        applyEdit(view, wrapSelection(text, start, end, '\n```\n', '\n```\n'));
      }
    },
  },
];

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  theme = 'light',
}) => {
  const viewRef = useRef<EditorView | null>(null);

  const handleAction = useCallback((action: ToolbarAction) => {
    if (viewRef.current) action.run(viewRef.current);
  }, []);

  return (
    <section className="editor-container" aria-label="Markdown editor">
      <label htmlFor="markdown-editor" className="visually-hidden">
        Enter your markdown content
      </label>
      <div className="editor-toolbar" role="toolbar" aria-label="Formatting tools">
        {toolbarActions.map((action) => (
          <button
            key={action.label}
            type="button"
            className="editor-toolbar-btn"
            aria-label={action.label}
            title={action.title}
            onClick={() => handleAction(action)}
          >
            {action.icon}
          </button>
        ))}
      </div>
      <CodeMirror
        id="markdown-editor"
        value={value}
        height="100%"
        extensions={editorExtensions}
        onCreateEditor={(view) => {
          viewRef.current = view;
        }}
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
