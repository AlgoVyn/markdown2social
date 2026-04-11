import React, { useState, useEffect, useMemo } from 'react';
import { Toolbar } from './Toolbar';
import { MarkdownEditor } from './MarkdownEditor';
import { LivePreview } from './LivePreview';
import { CharacterCounter } from './CharacterCounter';
import { StyleModal } from './StyleModal';
import { HistoryModal } from './HistoryModal';
import { ToastContainer } from './Toast';
import { markdownToSocialText } from '../utils/markdownParser';
import { useHistory } from '../hooks/useHistory';
import { useToast } from '../hooks/useToast';
import './Workspace.css';

export const Workspace: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>('# Hello LinkedIn\n\nWrite your post here...');
  const [platform, setPlatform] = useState<string>('linkedin');
  const [formatStyle, setFormatStyle] = useState<string>('standard');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const { drafts, saveDraft } = useHistory();
  const { toasts, addToast, removeToast } = useToast();

  // Memoize the parsed markdown to avoid recomputation
  const socialPreview = useMemo(() => {
    return markdownToSocialText(markdown, formatStyle, platform);
  }, [markdown, formatStyle, platform]);

  useEffect(() => {
    // Auto-save debounced roughly
    const timeout = setTimeout(() => {
      saveDraft(markdown);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [markdown, saveDraft]);

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
    } catch (e) {
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
      />
      <div className="workspace-panes">
        <div className="pane left-pane">
          <MarkdownEditor value={markdown} onChange={setMarkdown} />
        </div>
        <div className="pane right-pane">
          <LivePreview contentText={socialPreview} platform={platform} />
          <CharacterCounter text={socialPreview} platform={platform} />
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
