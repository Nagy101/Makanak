import { memo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNotificationList, useMarkAsRead } from "../useNotifications";
import NotificationItem from "./NotificationItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell } from "lucide-react";

const NotificationList = memo(() => {
  const { t } = useTranslation();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const filter = showUnreadOnly ? { isRead: false } : undefined;
  const { data: notifications = [], isLoading } = useNotificationList(filter);
  const markAsRead = useMarkAsRead();

  const handleClick = useCallback(
    (id: number) => {
      markAsRead.mutate(id);
    },
    [markAsRead],
  );

  return (
    <div className="w-80 sm:w-96 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <h3 className="text-sm font-semibold text-foreground">
          {t("notifications.title")}
        </h3>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setShowUnreadOnly(false)}
            className={`text-xs px-2 py-1 rounded-md transition-colors ${
              !showUnreadOnly
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-primary hover:text-primary-foreground"
            }`}
          >
            {t("notifications.all")}
          </button>
          <button
            type="button"
            onClick={() => setShowUnreadOnly(true)}
            className={`text-xs px-2 py-1 rounded-md transition-colors ${
              showUnreadOnly
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-primary hover:text-primary-foreground"
            }`}
          >
            {t("notifications.unread")}
          </button>
        </div>
      </div>

      {/* List with ScrollArea */}
      <ScrollArea className="h-[400px]">
        <div className="flex flex-col">
          {isLoading && (
            <div className="p-6 flex justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}

          {!isLoading && notifications.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
              <Bell className="h-8 w-8 opacity-30" />
              <p className="text-sm">{t("notifications.noNotifications")}</p>
            </div>
          )}

          {!isLoading &&
            notifications.map((n) => (
              <NotificationItem
                key={n.id}
                id={n.id}
                title={n.title}
                message={n.message}
                senderName={n.senderName}
                createdAt={n.createdAt}
                isRead={n.isRead}
                onClick={handleClick}
              />
            ))}
        </div>
      </ScrollArea>
    </div>
  );
});

NotificationList.displayName = "NotificationList";
export default NotificationList;
