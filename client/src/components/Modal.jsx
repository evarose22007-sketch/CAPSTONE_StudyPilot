import { useEffect, useId, useRef } from 'react';
import { CloseIcon } from './Icons';

/**
 * Accessible modal built on the native <dialog> element:
 * focus is kept inside, Escape closes it, focus returns to the opener.
 */
export default function Modal({ open, title, onClose, children, size = 'md' }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`modal modal--${size}`}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Click on the backdrop (outside the panel) closes the dialog.
        if (e.target === ref.current) onClose();
      }}
    >
      {open && (
        <div className="modal__panel">
          <div className="modal__head">
            <h2 id={titleId}>{title}</h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
              <CloseIcon />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onClose, busy }) {
  return (
    <Modal open={open} title={title} onClose={onClose} size="sm">
      <p className="modal__message">{message}</p>
      <div className="form-actions">
        <button type="button" className="btn btn--quiet" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn btn--danger" onClick={onConfirm} disabled={busy}>
          {busy ? 'Deleting…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
