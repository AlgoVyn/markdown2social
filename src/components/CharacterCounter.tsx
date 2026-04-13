import React from 'react';
import { getCharacterCountStatus } from '../utils/platforms';
import './CharacterCounter.css';

interface CharacterCounterProps {
  text: string;
  platform: string;
  className?: string;
}

export const CharacterCounter: React.FC<CharacterCounterProps> = ({
  text,
  platform,
  className = '',
}) => {
  const status = getCharacterCountStatus(text, platform);

  const getStatusClass = () => {
    if (status.isOver) return 'counter-over';
    if (status.isWarning) return 'counter-warning';
    return 'counter-ok';
  };

  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - Math.min(status.percentage, 1) * circumference;

  return (
    <div
      className={`character-counter ${getStatusClass()} ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="counter-display">
        <span className="counter-text">
          <strong>{status.count}</strong>
          <span className="counter-separator">/</span>
          <span className="counter-limit">{status.limit}</span>
        </span>

        <svg className="counter-ring" viewBox="0 0 40 40" aria-hidden="true">
          <circle
            className="counter-ring-bg"
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <circle
            className="counter-ring-progress"
            cx="20"
            cy="20"
            r="18"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 20 20)"
          />
        </svg>
      </div>

      {status.isOver && (
        <span className="counter-message" role="alert">
          Over by {status.count - status.limit} characters
        </span>
      )}

      {status.isWarning && !status.isOver && (
        <span className="counter-message">
          {Math.round((1 - status.percentage) * 100)}% remaining
        </span>
      )}
    </div>
  );
};
