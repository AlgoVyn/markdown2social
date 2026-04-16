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

const STYLE_OPTIONS = [
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
          {STYLE_OPTIONS.map(({ value, label, description, descId, labelId }) => (
            <label
              key={value}
              className={classNames('style-option', { active: formatStyle === value })}
            >
              <input
                type="radio"
                name="format-style"
                value={value}
                checked={formatStyle === value}
                onChange={() => setFormatStyle(value)}
                aria-describedby={descId}
              />
              <div>
                <strong id={labelId}>{label}</strong>
                <p id={descId}>{description}</p>
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
