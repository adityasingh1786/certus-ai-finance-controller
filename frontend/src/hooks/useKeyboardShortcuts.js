import { useEffect } from 'react';

/**
 * Custom React Hook for Global Keyboard Navigation & Accessibility Shortcuts
 */
export function useKeyboardShortcuts({
  onToggleSearch,
  onCloseModals,
  onSwitchTab,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K -> Focus Search / Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (onToggleSearch) onToggleSearch();
      }

      // Esc -> Close active modals
      if (e.key === 'Escape') {
        if (onCloseModals) onCloseModals();
      }

      // Cmd/Ctrl + 1..5 -> Switch Tab
      if ((e.metaKey || e.ctrlKey) && ['1', '2', '3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        const tabIndex = parseInt(e.key, 10) - 1;
        const tabKeys = ['reconciliation', 'quarantine', 'treasury', 'copilot', 'about'];
        if (onSwitchTab && tabKeys[tabIndex]) {
          onSwitchTab(tabKeys[tabIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleSearch, onCloseModals, onSwitchTab]);
}
