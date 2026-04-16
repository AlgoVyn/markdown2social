import React from 'react';
import { getCharacterCountStatus } from '../utils/platforms';
import './CharacterCounter.css';

interface CharacterCounterProps {
  text: string;
  platform: string;
  className?: string;
}

const RADIUS = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const CharacterCounter: React.FC<CharacterCounterProps> = ({
  text,
  platform,
  className = '',
}) => {
  const { count, limit, percentage, isOver, isWarning } = getCharacterCountStatus(text, platform);

  const statusClass = isOver ? 'counter-over' : isWarning ? 'counter-warning' : 'counter-ok';
  const strokeDashoffset = CIRCUMFERENCE - Math.min(percentage, 1) * CIRCUMFERENCE;

  return (
    <div
      className={`character-counter ${statusClass} ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="counter-display">
        <span className="counter-text">
          <strong>{count}</strong>
          <span className="counter-separator">/</span>
          <span className="counter-limit">{limit}</span>
        </span>

        <svg className="counter-ring" viewBox="0 0 40 40" aria-hidden="true">
          <circle
            className="counter-ring-bg"
            cx="20"
            cy="20"
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <circle
            className="counter-ring-progress"
            cx="20"
            cy="20"
            r={RADIUS}
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 20 20)"
          />
        </svg>
      </div>

      {isOver ? (
        <span className="counter-message" role="alert">
          Over by {count - limit} characters
        </span>
      ) : isWarning ? (
        <span className="counter-message">{Math.round((1 - percentage) * 100)}% remaining</span>
      ) : null}
    </div>
  );
};
