import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Copy, Loader2 } from 'lucide-react';
import { Toolbar } from './Toolbar';
import { MarkdownEditor } from './MarkdownEditor';
import { LivePreview } from './LivePreview';
import { CharacterCounter } from './CharacterCounter';
import { StyleModal } from './StyleModal';
import { HistoryModal } from './HistoryModal';
import { ToastContainer } from './Toast';
import { ErrorBoundary } from './ErrorBoundary';
import { SEO } from './SEO';
import {
  markdownToSocialText,
  markdownToSocialSegments,
  type FormatStyle,
} from '../utils/markdownParser';
import {
  copyToClipboard,
  formatForHtmlClipboard,
  ClipboardUnavailableError,
} from '../utils/clipboard';
import { PLATFORM_CONFIGS } from '../utils/platforms';
import { PLATFORM_TEMPLATES } from '../utils/templates';
import { useHistory } from '../hooks/useHistory';
import { useToast } from '../hooks/useToast';
import './Workspace.css';

interface WorkspaceProps {
  initialPlatform?: string;
}

// Timing constants (in milliseconds)
const TIMING = {
  /** Debounce delay for auto-saving drafts */
  DRAFT_SAVE_DELAY: 2000,
  /** Minimum loading state duration for history button feedback */
  HISTORY_LOADING_MIN: 150,
  /** Loading state duration after draft load completes */
  HISTORY_LOADING_COMPLETE: 200,
  /** Duration to show copying state for visual feedback */
  COPY_FEEDBACK_DURATION: 300,
} as const;

// Note: This component must be rendered within a Router context.
// The useNavigate and useSearchParams hooks will throw if used outside Router.
export const Workspace: React.FC<WorkspaceProps> = ({ initialPlatform = 'default' }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const hasProcessedQueryParam = useRef(false);
  const pendingSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const platformParam = searchParams.get('platform');

  // Get valid platform from URL param or initialPlatform, default to linkedin
  const getValidPlatform = (p: string | null): string =>
    p && p in PLATFORM_CONFIGS ? p : 'linkedin';

  const platformFromUrl = getValidPlatform(platformParam);
  const defaultPlatform =
    initialPlatform === 'default' ? 'linkedin' : getValidPlatform(initialPlatform);
  const initialPlatformValue = platformParam ? platformFromUrl : defaultPlatform;

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [markdown, setMarkdown] = useState(
    () => PLATFORM_TEMPLATES[initialPlatformValue] || PLATFORM_TEMPLATES.linkedin
  );
  const [platform, setPlatformState] = useState(initialPlatformValue);
  // Content present on first render; auto-save should only persist user edits
  const initialMarkdownRef = useRef(markdown);
  const seoPlatform = initialPlatform === 'default' ? 'default' : platform;
  const [formatStyle, setFormatStyle] = useState<FormatStyle>('standard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  // Which pane fills the screen on narrow viewports (segmented control)
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const { drafts, saveDraft, loadError, clearLoadError } = useHistory();
  const { toasts, addToast, removeToast } = useToast();

  // Clear platform query param after consuming it (runs only once per mount)
  useEffect(() => {
    if (!hasProcessedQueryParam.current && platformParam && platformParam in PLATFORM_CONFIGS) {
      hasProcessedQueryParam.current = true;
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('platform');
      setSearchParams(newParams, { replace: true });
    }
  }, [platformParam, searchParams, setSearchParams]);

  const socialSegments = useMemo(
    () => markdownToSocialSegments(markdown, formatStyle),
    [markdown, formatStyle]
  );

  const socialPreview = useMemo(
    () => markdownToSocialText(markdown, formatStyle),
    [markdown, formatStyle]
  );

  // HTML flavor for the clipboard, derived from the same segments as the
  // plain text so the two flavors always agree on what is code
  const clipboardHtml = useMemo(() => formatForHtmlClipboard(socialSegments), [socialSegments]);

  useEffect(() => {
    // Clear any existing timeout
    if (pendingSaveRef.current) {
      clearTimeout(pendingSaveRef.current);
      pendingSaveRef.current = null;
    }

    // Skip the initial mount save — untouched content is not a draft yet
    if (markdown === initialMarkdownRef.current) {
      return;
    }

    // Set new timeout
    pendingSaveRef.current = setTimeout(() => {
      saveDraft(markdown);
      pendingSaveRef.current = null;
    }, TIMING.DRAFT_SAVE_DELAY);

    return () => {
      if (pendingSaveRef.current) {
        clearTimeout(pendingSaveRef.current);
      }
    };
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
    setIsCopying(true);
    try {
      // Writes both text/plain and text/html so rich editors keep formatting
      await copyToClipboard(socialPreview, clipboardHtml);
      const config = PLATFORM_CONFIGS[platform];
      addToast(
        `Copied to clipboard! Paste into ${config?.name || 'social media'} to see formatted content.`,
        'success'
      );
    } catch (e) {
      addToast(
        e instanceof ClipboardUnavailableError
          ? 'Clipboard API not available in your browser'
          : 'Failed to copy to clipboard',
        'error'
      );
    } finally {
      setTimeout(() => setIsCopying(false), TIMING.COPY_FEEDBACK_DURATION);
    }
  }, [socialPreview, clipboardHtml, addToast, platform]);

  const handleOpenSettings = () => setIsModalOpen(true);

  const handleOpenHistory = useCallback(() => {
    setIsLoadingHistory(true);
    setTimeout(() => {
      setIsLoadingHistory(false);
      setIsHistoryOpen(true);
    }, TIMING.HISTORY_LOADING_MIN);
  }, []);

  const handleLoadDraft = useCallback(
    (draft: { markdown: string }) => {
      setIsLoadingHistory(true);
      setMarkdown(draft.markdown);
      setIsHistoryOpen(false);
      addToast('Draft loaded successfully', 'success');
      setTimeout(() => setIsLoadingHistory(false), TIMING.HISTORY_LOADING_COMPLETE);
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
        <div
          className="mobile-view-switch"
          role="group"
          aria-label="Switch between editor and preview"
        >
          <button
            type="button"
            aria-pressed={mobileView === 'editor'}
            className={`mobile-view-tab ${mobileView === 'editor' ? 'active' : ''}`}
            onClick={() => setMobileView('editor')}
          >
            Editor
          </button>
          <button
            type="button"
            aria-pressed={mobileView === 'preview'}
            className={`mobile-view-tab ${mobileView === 'preview' ? 'active' : ''}`}
            onClick={() => setMobileView('preview')}
          >
            Preview
          </button>
        </div>
        <div className={`workspace-panes mobile-${mobileView}`}>
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
              <LivePreview
                contentText={socialPreview}
                platform={platform}
                markdown={markdown}
                formatStyle={formatStyle}
              />
              <CharacterCounter text={socialPreview} platform={platform} />
            </ErrorBoundary>
          </div>
        </div>
        <div className="mobile-copy-bar">
          <button
            type="button"
            className="mobile-copy-button"
            onClick={handleCopy}
            disabled={isCopying}
            aria-busy={isCopying}
            aria-label="Copy formatted content"
          >
            {isCopying ? (
              <Loader2 size={18} aria-hidden="true" className="spin-animation" />
            ) : (
              <Copy size={18} aria-hidden="true" />
            )}
            {isCopying ? 'Copying...' : 'Copy formatted text'}
          </button>
        </div>
        <StyleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          formatStyle={formatStyle}
          setFormatStyle={setFormatStyle}
          markdown={markdown}
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
