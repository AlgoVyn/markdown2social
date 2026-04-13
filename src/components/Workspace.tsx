import React, { useState, useEffect, useMemo } from 'react';
import { Toolbar } from './Toolbar';
import { MarkdownEditor } from './MarkdownEditor';
import { LivePreview } from './LivePreview';
import { CharacterCounter } from './CharacterCounter';
import { StyleModal } from './StyleModal';
import { HistoryModal } from './HistoryModal';
import { ToastContainer } from './Toast';
import { ErrorBoundary } from './ErrorBoundary';
import { markdownToSocialText } from '../utils/markdownParser';
import { useHistory } from '../hooks/useHistory';
import { useToast } from '../hooks/useToast';
import './Workspace.css';

export const Workspace: React.FC = () => {
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || 'light');
  const [markdown, setMarkdown] = useState<string>('# Hello LinkedIn\n\nWrite your post here...');
  const [platform, setPlatform] = useState<string>('linkedin');
  const [formatStyle, setFormatStyle] = useState<string>('standard');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const { drafts, saveDraft, loadError, clearLoadError } = useHistory();
  const { toasts, addToast, removeToast } = useToast();

  // Memoize the parsed markdown to avoid recomputation
  const socialPreview = useMemo(() => {
    return markdownToSocialText(markdown, formatStyle);
  }, [markdown, formatStyle]);

  useEffect(() => {
    // Auto-save debounced roughly
    const timeout = setTimeout(() => {
      saveDraft(markdown);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [markdown, saveDraft]);

  // Show toast when localStorage error occurs
  useEffect(() => {
    if (loadError) {
      addToast(loadError, 'error');
      clearLoadError();
    }
  }, [loadError, clearLoadError, addToast]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const handleCopy = async () => {
    // Check if clipboard API is available
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      addToast('Clipboard API not available in your browser', 'error');
      return;
    }

    try {
      // Use the memoized socialPreview value instead of recalculating
      await navigator.clipboard.writeText(socialPreview);
      addToast('Copied to clipboard! Paste into LinkedIn to see formatted content.', 'success');
    } catch {
      addToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleOpenSettings = () => {
    setIsModalOpen(true);
  };

  return (
    <main className="workspace" role="main" aria-label="Markdown to Social converter workspace">
      <a href="#markdown-editor" className="skip-link">
        Skip to editor
      </a>
      <Toolbar
        onCopy={handleCopy}
        onOpenSettings={handleOpenSettings}
        onOpenHistory={() => setIsHistoryOpen(true)}
        platform={platform}
        setPlatform={setPlatform}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <div className="workspace-panes">
        <div className="pane left-pane">
          <MarkdownEditor value={markdown} onChange={setMarkdown} />
        </div>
        <div className="pane right-pane">
          <ErrorBoundary
            fallback={
              <div className="error-boundary" role="alert">
                <h2>Preview Error</h2>
                <p>Unable to render preview. Please check your markdown syntax.</p>
              </div>
            }
          >
            <LivePreview contentText={socialPreview} platform={platform} />
            <CharacterCounter text={socialPreview} platform={platform} />
          </ErrorBoundary>
        </div>
      </div>
      <StyleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formatStyle={formatStyle}
        setFormatStyle={setFormatStyle}
      />
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        drafts={drafts}
        onLoadDraft={(draft) => setMarkdown(draft.markdown)}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </main>
  );
};
