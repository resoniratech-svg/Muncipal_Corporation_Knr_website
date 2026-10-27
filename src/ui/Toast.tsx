import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { usePrefs } from '../i18n';

type ToastKind = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

interface ToastContextType {
  toast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const STYLES: Record<ToastKind, { box: string; icon: React.ReactNode }> = {
  success: { box: 'bg-emerald-700 text-white', icon: <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" /> },
  error: { box: 'bg-rose-700 text-white', icon: <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" /> },
  info: { box: 'bg-slate-900 text-white', icon: <Info className="w-5 h-5 shrink-0" aria-hidden="true" /> },
};

/** Toasts are announced to screen readers through a polite live region (errors use assertive). */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const { t } = usePrefs();

  const dismiss = (id: number) => setItems((list) => list.filter((i) => i.id !== id));

  const toast = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = nextId.current++;
    setItems((list) => [...list.slice(-2), { id, message, kind }]);
    setTimeout(() => dismiss(id), kind === 'error' ? 7000 : 4500);
  }, []);

  useEffect(() => {
    const onFull = () => toast(t('toast.storageFull'), 'error');
    window.addEventListener('kmc:storage-full', onFull);
    return () => window.removeEventListener('kmc:storage-full', onFull);
  }, [toast, t]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] w-[min(92vw,28rem)] space-y-2 pointer-events-none">
        <div aria-live="polite" role="status" className="space-y-2">
          {items.filter((i) => i.kind !== 'error').map((i) => (
            <ToastView key={i.id} item={i} onClose={() => dismiss(i.id)} />
          ))}
        </div>
        <div aria-live="assertive" role="alert" className="space-y-2">
          {items.filter((i) => i.kind === 'error').map((i) => (
            <ToastView key={i.id} item={i} onClose={() => dismiss(i.id)} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};

const ToastView: React.FC<{ item: ToastItem; onClose: () => void }> = ({ item, onClose }) => (
  <div className={`pointer-events-auto flex items-start gap-3 rounded-xl shadow-2xl px-4 py-3 text-base ${STYLES[item.kind].box}`}>
    {STYLES[item.kind].icon}
    <span className="flex-1">{item.message}</span>
    <button type="button" onClick={onClose} aria-label="Close message" className="-m-1 p-2 rounded-lg hover:bg-white/15">
      <X className="w-4 h-4" aria-hidden="true" />
    </button>
  </div>
);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
