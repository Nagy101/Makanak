import { memo, useCallback, useState } from 'react';
import { useNotificationList, useMarkAsRead } from '../useNotifications';
import NotificationItem from './NotificationItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell } from 'lucide-react';

const NotificationList = memo(() => {
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const filter = showUnreadOnly ? { isRead: false } : undefined;
  const { data: notifications = [], isLoading } = useNotificationList(filter);
  const markAsRead = useMarkAsRead();

  const handleClick = useCallback(
    (id: number) => {
      markAsRead.mutate(id);
    },
    [markAsRead]
  );

  return (
    <div className="w-80 sm:w-96">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setShowUnreadOnly(false)}
            className={`text-xs px-2 py-1 rounded-md transition-colors ${
              !showUnreadOnly
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setShowUnreadOnly(true)}
            className={`text-xs px-2 py-1 rounded-md transition-colors ${
              showUnreadOnly
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {/* List */}
      <ScrollArea className="max-h-[360px]">
        {isLoading && (
          <div className="p-6 flex justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
            <Bell className="h-8 w-8 opacity-30" />
            <p className="text-sm">No notifications</p>
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
      </ScrollArea>
    </div>
  );
});

NotificationList.displayName = 'NotificationList';
export default NotificationList;
