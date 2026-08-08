import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

export default function Header({ onMenuToggle }) {
  const { notifications, markNotificationsRead } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const ref = useRef(null);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowNotifs(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleBellClick = () => {
    setShowNotifs(!showNotifs);
    if (!showNotifs && unread > 0) markNotificationsRead();
  };

  const typeColors = { task_assigned: 'bg-blue-500', comment: 'bg-green-500', project_invite: 'bg-purple-500', task_updated: 'bg-yellow-500' };

  return (
    <header className="h-14 bg-surface-card border-b border-surface-border flex items-center justify-between px-4 flex-shrink-0">
      <button onClick={onMenuToggle} className="btn-ghost p-1.5">
        <Menu className="w-5 h-5" />
      </button>

      <div className="relative" ref={ref}>
        <button onClick={handleBellClick} className="relative btn-ghost p-1.5">
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {showNotifs && (
          <div className="absolute right-0 top-10 w-80 card shadow-2xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-surface-border flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Notifications</span>
              {unread > 0 && <button onClick={markNotificationsRead} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"><Check className="w-3 h-3" /> Mark all read</button>}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No notifications</p>
              ) : (
                notifications.slice(0, 20).map((n, i) => (
                  <div key={i} className={`flex gap-3 px-4 py-3 border-b border-surface-border last:border-0 ${!n.read ? 'bg-primary-900/10' : ''}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${typeColors[n.type] || 'bg-gray-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300">{n.message}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
