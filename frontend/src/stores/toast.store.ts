import { create } from 'zustand';

export interface ToastItem {
  id: string;
  message: string;
  type: 'green' | 'amber' | 'red' | 'blue';
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (message: string, type?: 'green' | 'amber' | 'red' | 'blue') => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message: string, type = 'blue') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3200);
  },
  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

export function showToast(message: string, type: 'green' | 'amber' | 'red' | 'blue' = 'blue') {
  useToastStore.getState().addToast(message, type);
}
