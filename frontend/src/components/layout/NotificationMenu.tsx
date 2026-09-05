import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/constants/routes';

interface NotificationItem {
  id: string;
  dotColor: string;
  title: string;
  timestamp: string;
  isRead: boolean;
  route?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    dotColor: 'bg-rose-500',
    title: 'Quote #1042 requires approval',
    timestamp: '2 minutes ago',
    isRead: false,
    route: ROUTES.APP.QUOTATION_APPROVAL('quote_1001'),
  },
  {
    id: 'notif_2',
    dotColor: 'bg-amber-500',
    title: 'Deal #1038 has stalled',
    timestamp: '15 minutes ago',
    isRead: false,
    route: ROUTES.APP.DEAL_HEALTH,
  },
  {
    id: 'notif_3',
    dotColor: 'bg-emerald-500',
    title: 'Invoice #INV-102 paid',
    timestamp: '1 hour ago',
    isRead: false,
    route: ROUTES.APP.BILLING,
  },
];

export function NotificationMenu() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClickItem = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );
    if (item.route) {
      navigate(item.route);
    }
  };

  return (
    <DropdownMenu
      trigger={
        <button
          type="button"
          className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          aria-label="View notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow">
              {unreadCount}
            </span>
          )}
        </button>
      }
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/40">
        <span className="text-xs font-bold text-foreground">Notifications</span>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="flex items-center gap-1 text-[10px] text-primary hover:underline"
          >
            <CheckCheck className="h-3 w-3" />
            Mark all read
          </button>
        )}
      </div>

      <div className="divide-y divide-border/30 max-h-80 overflow-y-auto w-72">
        {notifications.map((item) => (
          <div
            key={item.id}
            onClick={() => handleClickItem(item)}
            className={`flex items-start gap-2.5 p-3 hover:bg-secondary/60 cursor-pointer text-xs transition-colors ${
              !item.isRead ? 'bg-primary/5' : ''
            }`}
          >
            <span className={`h-2 w-2 rounded-full mt-1 shrink-0 ${item.dotColor}`} />
            <div className="flex-1 space-y-0.5">
              <p className={`text-xs ${!item.isRead ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                {item.title}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">{item.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </DropdownMenu>
  );
}
