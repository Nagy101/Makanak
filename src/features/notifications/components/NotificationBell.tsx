import { memo } from 'react';
import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useUnreadCount } from '../useNotifications';
import NotificationList from './NotificationList';

const NotificationBell = memo(() => {
  const { data: count = 0 } = useUnreadCount();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-auto p-0 border border-border bg-card shadow-lg"
      >
        <NotificationList />
      </PopoverContent>
    </Popover>
  );
});

NotificationBell.displayName = 'NotificationBell';
export default NotificationBell;
