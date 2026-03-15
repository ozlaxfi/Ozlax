import { MouseEvent, PropsWithChildren, useEffect, useRef } from "react";

type Props = PropsWithChildren<{
  open: boolean;
  title: string;
  confirmLabel: string;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}>;

export default function ConfirmModal({ open, title, confirmLabel, loading = false, onConfirm, onCancel, children }: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={handleOverlayClick} role="presentation">
      <div ref={panelRef} className="confirm-modal glass-card" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
        <div className="confirm-modal-head">
          <div>
            <span className="card-eyebrow">Confirm action</span>
            <h3 id="confirm-modal-title">{title}</h3>
          </div>
          <button type="button" className="confirm-modal-close" onClick={onCancel} aria-label="Close confirmation">
            <span aria-hidden="true">x</span>
          </button>
        </div>
        <div className="confirm-modal-body">{children}</div>
        <div className="confirm-modal-actions">
          <button type="button" className="button-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="button-primary" onClick={() => void onConfirm()} disabled={loading} autoFocus>
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
