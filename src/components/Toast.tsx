import React from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { Toast as ToastType } from '../hooks/useToast';
import './Toast.css';

interface ToastProps {
  toast: ToastType;
  onClose: () => void;
}

const ToastItem: React.FC<ToastProps> = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle size={20} aria-hidden="true" />,
    error: <XCircle size={20} aria-hidden="true" />,
    info: <Info size={20} aria-hidden="true" />,
  };

  const ariaLabels = {
    success: 'Success notification',
    error: 'Error notification',
    info: 'Information notification',
  };

  return (
    <div className={`toast toast-${toast.type}`} role="alert" aria-label={ariaLabels[toast.type]}>
      <span className="toast-icon" aria-hidden="true">
        {icons[toast.type]}
      </span>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Dismiss notification">
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => onRemove(toast.id)} />
      ))}
    </div>
  );
};

export { ToastItem };
