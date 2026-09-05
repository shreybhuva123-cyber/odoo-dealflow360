import React, { useEffect, useRef } from 'react';
import { useNotificationStore } from '@/stores/notification.store';
import { NotificationDropdown } from './NotificationDropdown';

export function NotificationBell() {
  const { unreadCount, isDropdownOpen, setIsDropdownOpen, loadNotifications } =
    useNotificationStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, setIsDropdownOpen]);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface2 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
        title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
        aria-label="Notifications"
        aria-expanded={isDropdownOpen}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isDropdownOpen && <NotificationDropdown onClose={() => setIsDropdownOpen(false)} />}
    </div>
  );
}
