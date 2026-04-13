import React from 'react';
import classNames from 'classnames';
import { useModalAccessibility } from '../hooks/useModalAccessibility';
import './StyleModal.css';

interface StyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  formatStyle: string;
  setFormatStyle: (style: string) => void;
}

export const StyleModal: React.FC<StyleModalProps> = ({
  isOpen,
  onClose,
  formatStyle,
  setFormatStyle,
}) => {
  const { modalRef } = useModalAccessibility({ isOpen, onClose });

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
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

          <label className={classNames('style-option', { active: formatStyle === 'standard' })}>
            <input
              type="radio"
              name="format-style"
              value="standard"
              checked={formatStyle === 'standard'}
              onChange={() => setFormatStyle('standard')}
              aria-describedby="style-standard-desc"
            />
            <div>
              <strong id="style-standard-label">Standard Professional</strong>
              <p id="style-standard-desc">Default parsing for clean, readable posts.</p>
            </div>
          </label>

          <label
            className={classNames('style-option', { active: formatStyle === 'bullet-optimized' })}
          >
            <input
              type="radio"
              name="format-style"
              value="bullet-optimized"
              checked={formatStyle === 'bullet-optimized'}
              onChange={() => setFormatStyle('bullet-optimized')}
              aria-describedby="style-bullet-desc"
            />
            <div>
              <strong id="style-bullet-label">Bullet Point Optimized</strong>
              <p id="style-bullet-desc">Converts lists to checkmarks for better engagement.</p>
            </div>
          </label>

          <label className={classNames('style-option', { active: formatStyle === 'bold-headers' })}>
            <input
              type="radio"
              name="format-style"
              value="bold-headers"
              checked={formatStyle === 'bold-headers'}
              onChange={() => setFormatStyle('bold-headers')}
              aria-describedby="style-bold-desc"
            />
            <div>
              <strong id="style-bold-label">Bold Headers</strong>
              <p id="style-bold-desc">Makes top-level headers extra bold.</p>
            </div>
          </label>
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
