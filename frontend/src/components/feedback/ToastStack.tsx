import React from 'react';
import { useToastStore } from '@/stores/toast.store';

export function ToastStack() {
  const { toasts, removeToast } = useToastStore();

  const icons: Record<string, string> = {
    green: '✓',
    amber: '⚠',
    red: '✕',
    blue: 'ℹ',
  };

  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast ${t.type}`}
          onClick={() => removeToast(t.id)}
          style={{ cursor: 'pointer' }}
        >
          <span className="font-bold">{icons[t.type] || 'ℹ'}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
