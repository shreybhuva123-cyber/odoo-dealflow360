import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/services/api/notifications.api';
import { NotificationFilterOptions, NotificationPreferences } from '@/types';
import { showToast } from '@/stores/toast.store';
import { useNotificationStore } from '@/stores/notification.store';

export function useNotifications(filters?: NotificationFilterOptions) {
  const { setNotifications } = useNotificationStore();

  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: async () => {
      const data = await notificationsApi.getNotifications(filters);
      setNotifications(data);
      return data;
    },
    staleTime: 15000,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ['unread-notifications-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
    staleTime: 15000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const { markAsRead } = useNotificationStore();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: (item) => {
      markAsRead(item.id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { markAllAsRead } = useNotificationStore();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  const { deleteNotification } = useNotificationStore();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.deleteNotification(id),
    onSuccess: (_, id) => {
      deleteNotification(id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
    },
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => notificationsApi.getPreferences(),
    staleTime: 30000,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<NotificationPreferences>) =>
      notificationsApi.updatePreferences(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      showToast('Notification channels updated', 'green');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Failed to update preferences', 'red');
    },
  });
}
