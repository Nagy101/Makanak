import axios from "axios";
import { storage } from "@/lib/storage";
import { setup401Interceptor } from "@/lib/api";
import type {
  Notification,
  NotificationApiResponse,
  NotificationListFilter,
  UnreadCountData,
} from "./notifications.types";

const api = axios.create({
  baseURL: "/api/Notifications",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});
setup401Interceptor(api);

export const getNotifications = (filter?: NotificationListFilter) =>
  api
    .get<NotificationApiResponse<Notification[]>>("", {
      params:
        filter?.isRead !== undefined ? { isRead: filter.isRead } : undefined,
    })
    .then((r) => r.data);

export const markAsRead = (id: number) =>
  api.put<NotificationApiResponse<string>>(`/${id}/read`).then((r) => r.data);

export const getUnreadCount = () =>
  api
    .get<NotificationApiResponse<UnreadCountData>>("/count")
    .then((r) => r.data);
