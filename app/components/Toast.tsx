import Link from "next/link";
import { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";

type ToastTone = "success" | "error";

type ToastInput = {
  tone: ToastTone;
  title: string;
  message: string;
  signature?: string;
};

type ToastItem = ToastInput & {
  id: number;
};

type ToastContextValue = {
  showToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const explorerUrl = (signature: string) => {
  const cluster = process.env.NEXT_PUBLIC_NETWORK === "mainnet-beta" ? "" : "?cluster=devnet";
  return `https://explorer.solana.com/tx/${signature}${cluster}`;
};

function ToastViewport({ toasts, removeToast }: { toasts: ToastItem[]; removeToast: (id: number) => void }) {
  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <article key={toast.id} className={`toast toast-${toast.tone}`} role="status">
          <div className="toast-head">
            <strong>{toast.title}</strong>
            <button type="button" className="toast-close" aria-label="Dismiss notification" onClick={() => removeToast(toast.id)}>
              <span aria-hidden="true">x</span>
            </button>
          </div>
          <p>{toast.message}</p>
          {toast.signature ? (
            <Link href={explorerUrl(toast.signature)} target="_blank" rel="noopener noreferrer" className="toast-link">
              View transaction {toast.signature.slice(0, 4)}...{toast.signature.slice(-4)}
            </Link>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = (id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast: (toast) => {
        const id = Date.now() + Math.floor(Math.random() * 1000);
        setToasts((current) => [...current.slice(-2), { ...toast, id }]);
        window.setTimeout(() => {
          setToasts((current) => current.filter((item) => item.id !== id));
        }, 5000);
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
