import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchStore } from '@/stores/search.store';
import { showToast } from '@/stores/toast.store';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const { toggleCommandPalette, closeCommandPalette, isCommandPaletteOpen } = useSearchStore();
  const pendingSequenceRef = useRef<string | null>(null);
  const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInputActive =
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        activeTag === 'select' ||
        (document.activeElement as HTMLElement)?.isContentEditable;

      // 1. Ctrl + K or Cmd + K (Global, works even in inputs)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }

      // 2. Escape (Global, closes command palette)
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          e.preventDefault();
          closeCommandPalette();
        }
        return;
      }

      // If user is currently typing in an input field, do not trigger single/sequence keys
      if (isInputActive) {
        return;
      }

      // 3. 'G then ...' navigation sequence
      if (e.key.toLowerCase() === 'g' && !pendingSequenceRef.current) {
        pendingSequenceRef.current = 'g';
        if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
        sequenceTimeoutRef.current = setTimeout(() => {
          pendingSequenceRef.current = null;
        }, 1200);
        return;
      }

      if (pendingSequenceRef.current === 'g') {
        const nextKey = e.key.toLowerCase();
        pendingSequenceRef.current = null;
        if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);

        switch (nextKey) {
          case 'd':
            navigate('/app/dashboard');
            showToast('Navigated to Dashboard (G → D)', 'blue');
            break;
          case 'p':
            navigate('/app/pipeline');
            showToast('Navigated to Pipeline (G → P)', 'blue');
            break;
          case 'q':
            navigate('/app/quotations');
            showToast('Navigated to Quotations (G → Q)', 'blue');
            break;
          case 'a':
            navigate('/app/approvals');
            showToast('Navigated to Approvals (G → A)', 'blue');
            break;
          case 'h':
            navigate('/app/deal-health');
            showToast('Navigated to Deal Health (G → H)', 'blue');
            break;
          case 'n':
            navigate('/app/notifications');
            showToast('Navigated to Notifications (G → N)', 'blue');
            break;
          case 'l':
            navigate('/app/audit-logs');
            showToast('Navigated to Audit Logs (G → L)', 'blue');
            break;
          default:
            break;
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
    };
  }, [navigate, toggleCommandPalette, closeCommandPalette, isCommandPaletteOpen]);
}
