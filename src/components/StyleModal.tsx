import React from 'react';
import classNames from 'classnames';
import { useModalAccessibility } from '../hooks/useModalAccessibility';
import { markdownToSocialText, type FormatStyle } from '../utils/markdownParser';
import './StyleModal.css';

interface StyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  formatStyle: FormatStyle;
  setFormatStyle: (style: FormatStyle) => void;
  /** Current editor content, used for the live per-style previews. */
  markdown?: string;
}

const STYLE_OPTIONS: Array<{
  value: FormatStyle;
  label: string;
  description: string;
  descId: string;
  labelId: string;
}> = [
  {
    value: 'standard',
    label: 'Standard Professional',
    description: 'Default parsing for clean, readable posts.',
    descId: 'style-standard-desc',
    labelId: 'style-standard-label',
  },
  {
    value: 'bullet-optimized',
    label: 'Bullet Point Optimized',
    description: 'Converts lists to checkmarks for better engagement.',
    descId: 'style-bullet-desc',
    labelId: 'style-bullet-label',
  },
  {
    value: 'bold-headers',
    label: 'Bold Headers',
    description: 'Makes top-level headers extra bold.',
    descId: 'style-bold-desc',
    labelId: 'style-bold-label',
  },
];

// Shown when the editor is empty so the options still demonstrate the difference
const PREVIEW_SAMPLE = '# Launch day\n\n- Fast\n- Simple\n\nRead more: https://example.com';

const snippet = (text: string, max = 110): string =>
  text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;

export const StyleModal: React.FC<StyleModalProps> = ({
  isOpen,
  onClose,
  formatStyle,
  setFormatStyle,
  markdown,
}) => {
  const { modalRef } = useModalAccessibility({ isOpen, onClose });

  if (!isOpen) return null;

  const source = markdown?.trim() ? markdown : PREVIEW_SAMPLE;

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={modalRef}
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="style-modal-title"
      >
        <h2 id="style-modal-title">Template & Style Settings</h2>

        <fieldset className="style-options">
          <legend className="visually-hidden">Select formatting style</legend>
          {STYLE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={classNames('style-option', { active: formatStyle === option.value })}
            >
              <input
                type="radio"
                name="format-style"
                value={option.value}
                checked={formatStyle === option.value}
                onChange={() => setFormatStyle(option.value)}
                aria-describedby={option.descId}
              />
              <div>
                <strong id={option.labelId}>{option.label}</strong>
                <p id={option.descId}>{option.description}</p>
                <div className="style-option-preview" aria-hidden="true">
                  <span className="style-preview-row">
                    <span className="style-preview-tag">Markdown</span>
                    <span className="style-preview-text mono">{snippet(source)}</span>
                  </span>
                  <span className="style-preview-row">
                    <span className="style-preview-tag">Copied</span>
                    <span className="style-preview-text">
                      {snippet(markdownToSocialText(source, option.value))}
                    </span>
                  </span>
                </div>
              </div>
            </label>
          ))}
        </fieldset>

        <div className="modal-actions">
          <button onClick={onClose} className="close-btn" aria-label="Close style settings">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
