import React, { useState, useEffect } from 'react';
import { X, CheckCheck, Bell, Calendar, Star, Info } from 'lucide-react';
import { NotificationItem } from '../../types';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/api';
import { Button } from '../ui/Button';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationChange?: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNotificationChange,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await getNotifications();
      setNotifications(res.data.results || res.data || []);
    } catch (e) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen]);

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      onNotificationChange?.();
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      onNotificationChange?.();
    } catch (e) {}
  };

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking_confirmed':
      case 'booking_request':
        return <Calendar className="w-4 h-4 text-brand-600 dark:text-brand-400" />;
      case 'review_request':
        return <Star className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm border-l border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Notifications</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium"
                title="Mark all as read"
              >
                Mark all read
              </button>
              <button
                onClick={onClose}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900">
            {loading ? (
              <div className="p-6 text-center text-sm text-zinc-500">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">
                No notifications right now.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.is_read && handleMarkRead(item.id)}
                  className={`p-4 transition-colors cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/60 ${
                    !item.is_read ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0">
                      {getIcon(item.notification_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          {item.title}
                        </p>
                        {!item.is_read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                        {item.message}
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-1.5">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
