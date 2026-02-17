import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as notificationService from './notifications.service';
import type { Notification, NotificationListFilter } from './notifications.types';

const KEYS = {
  list: (filter?: NotificationListFilter) => ['notifications', 'list', filter ?? {}] as const,
  count: ['notifications', 'count'] as const,
};

export const useNotificationList = (filter?: NotificationListFilter) =>
  useQuery({
    queryKey: KEYS.list(filter),
    queryFn: () => notificationService.getNotifications(filter),
    select: (res) => res.data,
  });

export const useUnreadCount = () =>
  useQuery({
    queryKey: KEYS.count,
    queryFn: notificationService.getUnreadCount,
    select: (res) => res.data.unreadCount,
    refetchInterval: 30_000,
  });

export const useMarkAsRead = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: notificationService.markAsRead,
    onMutate: async (id: number) => {
      // Optimistic: update list caches
      await qc.cancelQueries({ queryKey: ['notifications'] });

      const listQueries = qc.getQueriesData<{ data: Notification[] }>({
        queryKey: ['notifications', 'list'],
      });

      listQueries.forEach(([key, old]) => {
        if (!old?.data) return;
        qc.setQueryData(key, {
          ...old,
          data: old.data.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        });
      });

      // Optimistic: decrement count
      const prevCount = qc.getQueryData(KEYS.count);
      qc.setQueryData(KEYS.count, (old: any) => {
        if (!old?.data) return old;
        return { ...old, data: { unreadCount: Math.max(0, old.data.unreadCount - 1) } };
      });

      return { prevCount };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prevCount) qc.setQueryData(KEYS.count, ctx.prevCount);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
