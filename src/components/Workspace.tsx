import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Toolbar } from './Toolbar';
import { MarkdownEditor } from './MarkdownEditor';
import { LivePreview } from './LivePreview';
import { CharacterCounter } from './CharacterCounter';
import { StyleModal } from './StyleModal';
import { HistoryModal } from './HistoryModal';
import { ToastContainer } from './Toast';
import { ErrorBoundary } from './ErrorBoundary';
import { SEO } from './SEO';
import { markdownToSocialText } from '../utils/markdownParser';
import { PLATFORM_CONFIGS } from '../utils/platforms';
import { PLATFORM_TEMPLATES } from '../utils/templates';
import { useHistory } from '../hooks/useHistory';
import { useToast } from '../hooks/useToast';
import './Workspace.css';

interface WorkspaceProps {
  initialPlatform?: string;
}

// Custom hook that safely uses navigate or returns a no-op
const useSafeNavigate = () => {
  try {
    return useNavigate();
  } catch {
    return () => {};
  }
};

// Custom hook for search params
const useSafeSearchParams = (): [
  URLSearchParams,
  (
    params?: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams),
    opts?: { replace?: boolean }
  ) => void,
] => {
  try {
    return useSearchParams();
  } catch {
    return [new URLSearchParams(), () => {}];
  }
};

export const Workspace: React.FC<WorkspaceProps> = ({ initialPlatform = 'default' }) => {
  const navigate = useSafeNavigate();
  const [searchParams, setSearchParams] = useSafeSearchParams();

  const platformParam = searchParams.get('platform');
  const validPlatform =
    platformParam && platformParam in PLATFORM_CONFIGS ? platformParam : initialPlatform;
  const actualPlatform = validPlatform === 'default' ? 'linkedin' : validPlatform;
  const platformConfig = PLATFORM_CONFIGS[actualPlatform] || PLATFORM_CONFIGS.linkedin;
  const finalPlatform = platformConfig ? actualPlatform : 'linkedin';

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [markdown, setMarkdown] = useState(
    () => PLATFORM_TEMPLATES[finalPlatform] || PLATFORM_TEMPLATES.linkedin
  );
  const [platform, setPlatformState] = useState(finalPlatform);
  const seoPlatform = initialPlatform === 'default' ? 'default' : platform;
  const [formatStyle, setFormatStyle] = useState('standard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { drafts, saveDraft, loadError, clearLoadError } = useHistory();
  const { toasts, addToast, removeToast } = useToast();

  // Sync platform with URL
  useEffect(() => {
    const newValidPlatform = PLATFORM_CONFIGS[validPlatform] ? validPlatform : 'linkedin';
    if (newValidPlatform !== platform) {
      setPlatformState(newValidPlatform);
    }
  }, [validPlatform, platform]);

  // Clear platform query param after consuming it
  useEffect(() => {
    if (platformParam && platformParam in PLATFORM_CONFIGS) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('platform');
      setSearchParams(newParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const socialPreview = useMemo(
    () => markdownToSocialText(markdown, formatStyle),
    [markdown, formatStyle]
  );

  useEffect(() => {
    const timeout = setTimeout(() => saveDraft(markdown), 2000);
    return () => clearTimeout(timeout);
  }, [markdown, saveDraft]);

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

  const setPlatform = (newPlatform: string) => {
    setPlatformState(newPlatform);
    navigate(`/${newPlatform}`);
  };

  const handleCopy = useCallback(async () => {
    if (!navigator.clipboard?.writeText) {
      addToast('Clipboard API not available in your browser', 'error');
      return;
    }

    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(socialPreview);
      const config = PLATFORM_CONFIGS[platform];
      addToast(
        `Copied to clipboard! Paste into ${config?.name || 'social media'} to see formatted content.`,
        'success'
      );
    } catch {
      addToast('Failed to copy to clipboard', 'error');
    } finally {
      setTimeout(() => setIsCopying(false), 300);
    }
  }, [socialPreview, addToast, platform]);

  const handleOpenSettings = () => setIsModalOpen(true);

  const handleOpenHistory = useCallback(() => {
    setIsLoadingHistory(true);
    setTimeout(() => {
      setIsLoadingHistory(false);
      setIsHistoryOpen(true);
    }, 150);
  }, []);

  const handleLoadDraft = useCallback(
    (draft: { markdown: string }) => {
      setIsLoadingHistory(true);
      setMarkdown(draft.markdown);
      setIsHistoryOpen(false);
      addToast('Draft loaded successfully', 'success');
      setTimeout(() => setIsLoadingHistory(false), 200);
    },
    [addToast]
  );

  return (
    <>
      <SEO platform={seoPlatform} />
      <main className="workspace" role="main" aria-label="Markdown to Social converter workspace">
        <a href="#markdown-editor" className="skip-link">
          Skip to editor
        </a>
        <Toolbar
          onCopy={handleCopy}
          onOpenSettings={handleOpenSettings}
          onOpenHistory={handleOpenHistory}
          platform={platform}
          setPlatform={setPlatform}
          theme={theme}
          toggleTheme={toggleTheme}
          isCopying={isCopying}
          isLoadingHistory={isLoadingHistory}
        />
        <div className="workspace-panes">
          <div className="pane left-pane">
            <MarkdownEditor
              value={markdown}
              onChange={setMarkdown}
              theme={theme === 'dark' ? 'dark' : 'light'}
            />
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
          onLoadDraft={handleLoadDraft}
        />
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </main>
    </>
  );
};
