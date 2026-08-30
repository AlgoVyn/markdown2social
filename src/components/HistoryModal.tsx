import React from 'react';
import { Clock } from 'lucide-react';
import { Draft } from '../hooks/useHistory';
import { useModalAccessibility } from '../hooks/useModalAccessibility';
import './HistoryModal.css';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  drafts: Draft[];
  onLoadDraft: (draft: Draft) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  drafts,
  onLoadDraft,
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
        className="modal-content history-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-modal-title"
      >
        <div className="modal-header">
          <h2 id="history-modal-title">Conversion History</h2>
          <button onClick={onClose} className="close-icon-btn" aria-label="Close history modal">
            ×
          </button>
        </div>

        <div className="history-list" role="list" aria-label="Saved drafts">
          {drafts.length === 0 ? (
            <div className="no-history" role="status">
              <Clock size={40} strokeWidth={1.5} aria-hidden="true" className="no-history-icon" />
              <p className="no-history-title">No drafts saved yet</p>
              <p className="no-history-hint">
                Start typing to save! Edits are captured automatically a moment after you stop
                typing.
              </p>
            </div>
          ) : (
            drafts.map((draft, index) => (
              <div key={draft.id} className="history-item" role="listitem">
                <div className="history-preview" id={`draft-${draft.id}-preview`}>
                  {draft.markdown.slice(0, 100) + (draft.markdown.length > 100 ? '...' : '')}
                </div>
                <div className="history-meta">
                  <span aria-label={`Saved on ${new Date(draft.updatedAt).toLocaleString()}`}>
                    {new Date(draft.updatedAt).toLocaleString()}
                  </span>
                  <button
                    onClick={() => {
                      onLoadDraft(draft);
                      onClose();
                    }}
                    className="load-btn"
                    aria-describedby={`draft-${draft.id}-preview`}
                    aria-label={`Load draft ${index + 1} of ${drafts.length}`}
                  >
                    Load
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
