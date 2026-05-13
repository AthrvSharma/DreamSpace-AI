import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useToastStore from '../store/toastStore';
import { notificationAPI } from '../api/client';
import { Bell, Check, CheckCheck, Trash2, CreditCard, Sparkles, AlertTriangle, Info, Settings } from 'lucide-react';

const typeConfig = {
    info: { icon: <Info size={16} />, color: '#6B7F5E', bg: 'rgba(107,127,94,0.1)' },
    success: { icon: <Sparkles size={16} />, color: '#6B7F5E', bg: 'rgba(107,127,94,0.1)' },
    warning: { icon: <AlertTriangle size={16} />, color: '#D4915D', bg: 'rgba(212,145,93,0.1)' },
    payment: { icon: <CreditCard size={16} />, color: '#C8A96E', bg: 'rgba(200,169,110,0.1)' },
    system: { icon: <Settings size={16} />, color: '#71717A', bg: 'rgba(113,113,122,0.1)' },
};

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const addToast = useToastStore((s) => s.addToast);

    const loadNotifications = async () => {
        try {
            const data = await notificationAPI.list();
            setNotifications(data.notifications || []);
        } catch (err) {
            addToast('Failed to load notifications', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadNotifications(); }, []);

    const handleMarkRead = async (id) => {
        try {
            await notificationAPI.markRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch {}
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationAPI.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            addToast('All marked as read');
        } catch {}
    };

    const handleDelete = async (id) => {
        try {
            await notificationAPI.delete(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            addToast('Notification deleted');
        } catch {}
    };

    const unread = notifications.filter(n => !n.read);

    return (
        <div className="dashboard">
            <div className="container" style={{ maxWidth: 700 }}>
                <div className="dashboard-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Bell size={24} style={{ color: 'var(--color-olive)' }} />
                        <div>
                            <h1>Notifications</h1>
                            <p>{unread.length > 0 ? `${unread.length} unread` : 'All caught up!'}</p>
                        </div>
                    </div>
                    {unread.length > 0 && (
                        <button className="btn btn-secondary btn-sm" onClick={handleMarkAllRead} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CheckCheck size={14} /> Mark all read
                        </button>
                    )}
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
                ) : notifications.length === 0 ? (
                    <div className="empty-state">
                        <Bell size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                        <h3>No notifications yet</h3>
                        <p>We'll let you know when something important happens</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {notifications.map((notif) => {
                            const config = typeConfig[notif.type] || typeConfig.info;
                            const NotificationContent = notif.link
                                ? (props) => <Link to={notif.link} {...props} style={{ textDecoration: 'none', color: 'inherit' }} />
                                : (props) => <div {...props} />;

                            return (
                                <NotificationContent key={notif.id}>
                                    <div
                                        style={{
                                            display: 'flex', gap: 14, padding: '14px 16px',
                                            borderRadius: 12, cursor: notif.link ? 'pointer' : 'default',
                                            background: notif.read ? 'transparent' : config.bg,
                                            border: notif.read ? '1px solid var(--color-beige)' : `1px solid ${config.color}33`,
                                            borderLeft: notif.read ? 'none' : `3px solid ${config.color}`,
                                            transition: 'background 0.2s',
                                        }}
                                        onClick={() => !notif.read && handleMarkRead(notif.id)}
                                    >
                                        <div style={{
                                            width: 36, height: 36, borderRadius: '50%',
                                            background: config.bg, display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            color: config.color, flexShrink: 0,
                                        }}>
                                            {config.icon}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontWeight: notif.read ? 400 : 600,
                                                fontSize: '0.9rem', marginBottom: 2,
                                            }}>
                                                {notif.title}
                                            </div>
                                            <div style={{
                                                fontSize: '0.82rem', opacity: 0.7,
                                                lineHeight: 1.4, marginBottom: 4,
                                            }}>
                                                {notif.message}
                                            </div>
                                            <div style={{ fontSize: '0.72rem', opacity: 0.5 }}>
                                                {timeAgo(notif.createdAt)}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                padding: 4, opacity: 0.3, transition: 'opacity 0.2s',
                                            }}
                                            onMouseEnter={(e) => e.target.style.opacity = 1}
                                            onMouseLeave={(e) => e.target.style.opacity = 0.3}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </NotificationContent>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
