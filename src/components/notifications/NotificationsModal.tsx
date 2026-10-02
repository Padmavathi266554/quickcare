import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CalendarCheck,
  Ban,
  Check,
  Volume2
} from 'lucide-react';
import { NotificationItem } from '../../types';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  patientId?: string;
  onSelectToken?: (token: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  userId,
  patientId,
  onSelectToken
}) => {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const data = await api.getNotifications(userId, patientId);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen, userId, patientId]);

  if (!isOpen) return null;

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead(userId);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'turn_now':
        return <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800"><Bell className="h-4 w-4 stroke-[2.5]" /></div>;
      case 'turn_approaching':
        return <div className="p-2 rounded-xl bg-teal-100 text-teal-800"><Clock className="h-4 w-4 stroke-[2.5]" /></div>;
      case 'booked':
        return <div className="p-2 rounded-xl bg-indigo-100 text-indigo-800"><CalendarCheck className="h-4 w-4 stroke-[2.5]" /></div>;
      case 'cancelled':
        return <div className="p-2 rounded-xl bg-rose-100 text-rose-800"><Ban className="h-4 w-4 stroke-[2.5]" /></div>;
      case 'delay':
        return <div className="p-2 rounded-xl bg-amber-100 text-amber-800"><AlertTriangle className="h-4 w-4 stroke-[2.5]" /></div>;
      case 'reminder':
      default:
        return <div className="p-2 rounded-xl bg-slate-100 text-slate-700"><CheckCircle2 className="h-4 w-4 stroke-[2.5]" /></div>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>{t('notifications', 'Notifications & Alerts')}</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                    {unreadCount} {t('liveBroadcast', 'new')}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Real-time alerts for queue progression</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 px-2 py-1 rounded-md hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                {t('markAllAsRead', 'Mark all read')}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body Notification list */}
        <div className="p-4 max-h-96 overflow-y-auto divide-y divide-slate-100">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => {
                  if (!notif.read) handleMarkRead(notif._id);
                  if (notif.tokenNumber && onSelectToken) {
                    onSelectToken(notif.tokenNumber);
                    onClose();
                  }
                }}
                className={`py-3.5 px-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 ${
                  !notif.read ? 'bg-emerald-50/50 hover:bg-emerald-50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="shrink-0">{getIcon(notif.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs ${!notif.read ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                  {notif.tokenNumber && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-mono font-bold text-emerald-700 shadow-2xs">
                      <span>Token: {notif.tokenNumber}</span>
                      <span className="text-slate-400 font-sans">• Click to track</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              No notifications at this time.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-center text-[11px] text-slate-400">
          Alerts dispatch automatically when turns approach or delays occur
        </div>
      </div>
    </div>
  );
};
