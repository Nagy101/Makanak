export interface Notification {
  id: number;
  title: string;
  message: string;
  notificationType: string;
  createdAt: string;
  isRead: boolean;
  about: string;
  senderName: string;
}

export interface UnreadCountData {
  unreadCount: number;
}

export interface NotificationApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

export interface NotificationListFilter {
  isRead?: boolean;
}
