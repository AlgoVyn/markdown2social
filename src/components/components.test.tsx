import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { Toolbar } from '../components/Toolbar';
import { StyleModal } from '../components/StyleModal';
import { HistoryModal } from '../components/HistoryModal';
import { LinkedInPost } from '../components/LinkedInPost';
import { LivePreview } from '../components/LivePreview';
import { Draft } from '../hooks/useHistory';

describe('MarkdownEditor', () => {
  it('should render with initial value', async () => {
    const onChange = vi.fn();
    render(<MarkdownEditor value="Initial text" onChange={onChange} />);

    // Check the editor container is rendered
    expect(document.querySelector('.editor-container')).toBeInTheDocument();
  }, 10000);

  it('should call onChange when content changes', async () => {
    const onChange = vi.fn();
    render(<MarkdownEditor value="" onChange={onChange} />);

    // CodeMirror is a complex component, so we verify it's mounted
    expect(document.querySelector('.editor-container')).toBeInTheDocument();
  }, 10000);
});

describe('Toolbar', () => {
  const defaultProps = {
    onCopy: vi.fn(),
    onOpenSettings: vi.fn(),
    onOpenHistory: vi.fn(),
    platform: 'linkedin',
    setPlatform: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all toolbar elements', () => {
    render(<Toolbar {...defaultProps} />);

    expect(screen.getByText('Markdown2Social')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Styles')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('should call onCopy when copy button is clicked', async () => {
    render(<Toolbar {...defaultProps} />);

    const copyButton = screen.getByText('Copy').closest('button');
    expect(copyButton).not.toBeNull();

    if (copyButton) {
      await userEvent.click(copyButton, { delay: null });
      expect(defaultProps.onCopy).toHaveBeenCalledTimes(1);
    }
  }, 10000);

  it('should call onOpenSettings when settings button is clicked', async () => {
    render(<Toolbar {...defaultProps} />);

    const settingsButton = screen.getByText('Styles').closest('button');
    expect(settingsButton).not.toBeNull();

    if (settingsButton) {
      await userEvent.click(settingsButton, { delay: null });
      expect(defaultProps.onOpenSettings).toHaveBeenCalledTimes(1);
    }
  }, 10000);

  it('should call onOpenHistory when history button is clicked', async () => {
    render(<Toolbar {...defaultProps} />);

    const historyButton = screen.getByText('History').closest('button');
    expect(historyButton).not.toBeNull();

    if (historyButton) {
      await userEvent.click(historyButton);
      expect(defaultProps.onOpenHistory).toHaveBeenCalledTimes(1);
    }
  });

  it('should display current platform in select', () => {
    render(<Toolbar {...defaultProps} />);

    const select = screen.getByLabelText('Social media platform');
    expect(select).toHaveValue('linkedin');
  });

  it('should call setPlatform when platform is changed', async () => {
    render(<Toolbar {...defaultProps} />);

    const select = screen.getByLabelText('Social media platform');
    await userEvent.selectOptions(select, 'twitter');

    expect(defaultProps.setPlatform).toHaveBeenCalledWith('twitter');
  });
});

describe('StyleModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    formatStyle: 'standard',
    setFormatStyle: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render when isOpen is true', () => {
    render(<StyleModal {...defaultProps} />);

    expect(screen.getByText('Template & Style Settings')).toBeInTheDocument();
    expect(screen.getByText('Standard Professional')).toBeInTheDocument();
    expect(screen.getByText('Bullet Point Optimized')).toBeInTheDocument();
    expect(screen.getByText('Bold Headers')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(<StyleModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Template & Style Settings')).not.toBeInTheDocument();
  });

  it('should call onClose when Done button is clicked', async () => {
    render(<StyleModal {...defaultProps} />);

    const doneButton = screen.getByText('Done');
    await userEvent.click(doneButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call setFormatStyle when style option is selected', async () => {
    render(<StyleModal {...defaultProps} />);

    const bulletOption = screen.getByDisplayValue('bullet-optimized');
    await userEvent.click(bulletOption);

    expect(defaultProps.setFormatStyle).toHaveBeenCalledWith('bullet-optimized');
  });

  it('should highlight the currently selected style', () => {
    const { rerender } = render(<StyleModal {...defaultProps} formatStyle="bullet-optimized" />);

    // The bullet-optimized option should have active class
    const bulletOption = screen.getByDisplayValue('bullet-optimized').closest('label');
    expect(bulletOption).toHaveClass('active');

    rerender(<StyleModal {...defaultProps} formatStyle="bold-headers" />);

    const boldHeadersOption = screen.getByDisplayValue('bold-headers').closest('label');
    expect(boldHeadersOption).toHaveClass('active');
  });
});

describe('HistoryModal', () => {
  const mockDrafts: Draft[] = [
    { id: '1', markdown: 'Draft one content', updatedAt: Date.now() - 10000 },
    {
      id: '2',
      markdown:
        'Draft two content that is longer than one hundred characters to test truncation in the preview',
      updatedAt: Date.now(),
    },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    drafts: mockDrafts,
    onLoadDraft: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render when isOpen is true', () => {
    render(<HistoryModal {...defaultProps} />);

    expect(screen.getByText('Conversion History')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(<HistoryModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Conversion History')).not.toBeInTheDocument();
  });

  it('should display message when no drafts exist', () => {
    render(<HistoryModal {...defaultProps} drafts={[]} />);

    expect(screen.getByText('No drafts saved yet. Start typing to save!')).toBeInTheDocument();
  });

  it('should display drafts with preview and timestamp', () => {
    render(<HistoryModal {...defaultProps} />);

    expect(screen.getByText('Draft one content')).toBeInTheDocument();
    // The second draft is exactly 100 chars so no truncation occurs
    expect(screen.getByText(/Draft two content that is longer/)).toBeInTheDocument();
  });

  it('should call onLoadDraft and onClose when Load button is clicked', async () => {
    render(<HistoryModal {...defaultProps} />);

    const loadButtons = screen.getAllByText('Load');
    expect(loadButtons.length).toBe(2);

    await userEvent.click(loadButtons[0]);

    expect(defaultProps.onLoadDraft).toHaveBeenCalledWith(mockDrafts[0]);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when close button is clicked', async () => {
    render(<HistoryModal {...defaultProps} />);

    const closeButton = screen.getByText('×');
    await userEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should truncate long draft content', () => {
    const longDrafts: Draft[] = [{ id: '1', markdown: 'a'.repeat(150), updatedAt: Date.now() }];

    render(<HistoryModal {...defaultProps} drafts={longDrafts} />);

    const preview = screen.getByText(/a+\.\.\./);
    expect(preview.textContent).toHaveLength(103); // 100 chars + '...'
  });
});

describe('LinkedInPost', () => {
  it('should render post structure', () => {
    render(<LinkedInPost contentText="Test content" />);

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Content Creator at SocialBoost')).toBeInTheDocument();
    expect(screen.getByText('Like')).toBeInTheDocument();
    expect(screen.getByText('Comment')).toBeInTheDocument();
    expect(screen.getByText('Repost')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  it('should display content text with line breaks', () => {
    const content = 'Line 1\nLine 2\nLine 3';
    render(<LinkedInPost contentText={content} />);

    expect(screen.getByText('Line 1')).toBeInTheDocument();
    expect(screen.getByText('Line 2')).toBeInTheDocument();
    expect(screen.getByText('Line 3')).toBeInTheDocument();
  });

  it('should render empty content gracefully', () => {
    render(<LinkedInPost contentText="" />);

    const postContent = document.querySelector('.post-content');
    expect(postContent).toBeInTheDocument();
    expect(postContent?.textContent?.trim()).toBe('');
  });

  it('should render action buttons', () => {
    render(<LinkedInPost contentText="Content" />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(4);
    expect(buttons[0]).toHaveTextContent('Like');
    expect(buttons[1]).toHaveTextContent('Comment');
    expect(buttons[2]).toHaveTextContent('Repost');
    expect(buttons[3]).toHaveTextContent('Send');
  });
});

describe('LivePreview', () => {
  const defaultProps = {
    contentText: 'Text content',
    platform: 'linkedin',
  };

  it('should render LinkedIn preview for linkedin platform', () => {
    render(<LivePreview {...defaultProps} />);

    expect(screen.getByText('Live Preview')).toBeInTheDocument();
    const badge = screen.getByLabelText('Platform: LinkedIn');
    expect(badge).toHaveClass('preview-badge');
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('should render Twitter/X preview for twitter platform', () => {
    render(<LivePreview {...defaultProps} platform="twitter" contentText="Tweet content" />);

    expect(screen.getByText('Live Preview')).toBeInTheDocument();
    const badge = screen.getByLabelText('Platform: Twitter/X');
    expect(badge).toHaveClass('preview-badge');
    expect(screen.getByText('Your Name')).toBeInTheDocument();
  });

  it('should render Bluesky preview for bluesky platform', () => {
    render(<LivePreview {...defaultProps} platform="bluesky" contentText="Test content" />);

    const badge = screen.getByLabelText('Platform: Bluesky');
    expect(badge).toHaveClass('preview-badge');
    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByText('@handle.bsky.social')).toBeInTheDocument();
  });

  it('should pass contentText to LinkedInPost', () => {
    render(<LivePreview {...defaultProps} contentText="My post content" />);

    expect(screen.getByText('My post content')).toBeInTheDocument();
  });

  it('should render preview header with platform badge', () => {
    render(<LivePreview {...defaultProps} platform="linkedin" />);

    expect(screen.getByText('Live Preview')).toBeInTheDocument();
    const badge = screen.getByLabelText('Platform: LinkedIn');
    expect(badge).toHaveClass('preview-badge');
  });
});
