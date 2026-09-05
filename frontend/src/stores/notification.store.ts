import { create } from 'zustand';
import { NotificationItem } from '@/types';
import { notificationsApi } from '@/services/api/notifications.api';
import { showToast } from '@/stores/toast.store';

interface NotificationState {
  unreadCount: number;
  notifications: NotificationItem[];
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
  setNotifications: (items: NotificationItem[]) => void;
  loadNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  triggerSimulatedEvent: (event: Partial<NotificationItem>) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  unreadCount: 3,
  notifications: [],
  isDropdownOpen: false,

  setIsDropdownOpen: (open) => set({ isDropdownOpen: open }),

  setNotifications: (notifications) => {
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    set({ notifications, unreadCount });
  },

  loadNotifications: async () => {
    try {
      const items = await notificationsApi.getNotifications();
      const unreadCount = items.filter((n) => !n.isRead).length;
      set({ notifications: items, unreadCount });
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  },

  markAsRead: async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      const updated = get().notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      const unreadCount = updated.filter((n) => !n.isRead).length;
      set({ notifications: updated, unreadCount });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationsApi.markAllAsRead();
      const updated = get().notifications.map((n) => ({ ...n, isRead: true }));
      set({ notifications: updated, unreadCount: 0 });
      showToast('All notifications marked as read', 'green');
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  },

  deleteNotification: async (id) => {
    try {
      await notificationsApi.deleteNotification(id);
      const updated = get().notifications.filter((n) => n.id !== id);
      const unreadCount = updated.filter((n) => !n.isRead).length;
      set({ notifications: updated, unreadCount });
      showToast('Notification dismissed', 'blue');
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  },

  triggerSimulatedEvent: async (event) => {
    try {
      const newItem = await notificationsApi.simulateIncomingEvent(event);
      const current = get().notifications;
      const updated = [newItem, ...current];
      set({ notifications: updated, unreadCount: get().unreadCount + 1 });

      // Trigger instant toast notification banner
      showToast(`🔔 ${newItem.title}: ${newItem.message}`, newItem.priority === 'HIGH' ? 'red' : 'blue');
    } catch (err) {
      console.error('Failed to simulate incoming event:', err);
    }
  },
}));
