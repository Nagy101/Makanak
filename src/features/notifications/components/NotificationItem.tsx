import { memo } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  id: number;
  title: string;
  message: string;
  senderName: string;
  createdAt: string;
  isRead: boolean;
  onClick: (id: number) => void;
}

const NotificationItem = memo(
  ({ id, title, message, senderName, createdAt, isRead, onClick }: NotificationItemProps) => {
    const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

    return (
      <button
        type="button"
        onClick={() => onClick(id)}
        className={`w-full text-left px-4 py-3 flex gap-3 items-start transition-colors hover:bg-muted/50 ${
          isRead ? 'bg-card' : 'bg-primary/5'
        }`}
      >
        {/* Unread dot */}
        <div className="mt-1.5 flex-shrink-0">
          {!isRead && <span className="block h-2 w-2 rounded-full bg-primary" />}
          {isRead && <span className="block h-2 w-2" />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{title}</p>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{message}</p>
          <div className="flex items-center gap-2 mt-1">
            {senderName && (
              <span className="text-xs text-muted-foreground font-medium">{senderName}</span>
            )}
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>
        </div>
      </button>
    );
  }
);

NotificationItem.displayName = 'NotificationItem';
export default NotificationItem;
