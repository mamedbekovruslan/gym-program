import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  title?: string;
  onClose: () => void;
  children: ReactNode;
}

const modalRoot = typeof document !== 'undefined' ? document.body : null;

const Modal = ({ title, onClose, children }: Props) => {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!modalRoot) return null;

  return createPortal(
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-content">
        <header className="modal-header">
          {title && <h2>{title}</h2>}
          <button type="button" className="ghost close-button" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </header>
        <div>{children}</div>
      </div>
      <div className="modal-overlay" onClick={onClose} />
    </div>,
    modalRoot
  );
};

export default Modal;
