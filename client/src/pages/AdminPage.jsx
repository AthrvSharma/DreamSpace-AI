import { useState } from 'react';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';
import { adminAPI } from '../api/client';
import { Users, BarChart3, CreditCard, TrendingUp, Search, Plus, Minus, Shield } from 'lucide-react';

export default function AdminPage() {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState(null);
    const [orders, setOrders] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [creditModal, setCreditModal] = useState(null);
    const [creditAmount, setCreditAmount] = useState('');
    const [creditReason, setCreditReason] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const addToast = useToastStore((s) => s.addToast);

    const loadData = async (tab) => {
        setLoading(true);
        try {
            if (tab === 'overview' || tab === 'users') {
                const [s, u] = await Promise.all([adminAPI.stats(), adminAPI.users()]);
                setStats(s.stats);
                setUsers(u.users);
            }
            if (tab === 'orders') {
                const o = await adminAPI.orders();
                setOrders(o.orders);
            }
        } catch (err) {
            addToast('Failed to load admin data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useState(() => loadData('overview'));

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        loadData(tab);
    };

    const handleCreditAdjust = async () => {
        if (!creditAmount) return addToast('Enter credit amount', 'error');
        try {
            await adminAPI.adjustCredits(creditModal.id, parseInt(creditAmount), creditReason);
            addToast(`Credits adjusted by ${creditAmount}`, 'success');
            setCreditModal(null);
            setCreditAmount('');
            setCreditReason('');
            loadData(activeTab);
        } catch (err) {
            addToast(err.message, 'error');
        }
    };

    const handlePlanChange = async (userId, plan) => {
        try {
            await adminAPI.setPlan(userId, plan);
            addToast(`User plan updated to ${plan}`, 'success');
            loadData(activeTab);
        } catch (err) {
            addToast(err.message, 'error');
        }
    };

    const filteredUsers = (users || []).filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard">
            <div className="container" style={{ maxWidth: 1100 }}>
                <div className="dashboard-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Shield size={24} style={{ color: 'var(--color-olive)' }} />
                        <div>
                            <h1>Admin Panel</h1>
                            <p>Platform management & analytics</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--color-beige)', marginBottom: 24 }}>
                    {[
                        { key: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
                        { key: 'users', label: 'Users', icon: <Users size={16} /> },
                        { key: 'orders', label: 'Orders', icon: <CreditCard size={16} /> },
                    ].map((tab) => (
                        <button key={tab.key} onClick={() => handleTabChange(tab.key)} style={{
                            padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
                            fontWeight: activeTab === tab.key ? 600 : 400, fontSize: '0.9rem',
                            color: activeTab === tab.key ? 'var(--color-olive)' : 'var(--color-charcoal)',
                            borderBottom: activeTab === tab.key ? '2px solid var(--color-olive)' : '2px solid transparent',
                            marginBottom: -2, display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>}

                {activeTab === 'overview' && stats && !loading && (
                    <div>
                        <div className="stats-grid" style={{ marginBottom: 32 }}>
                            {[
                                { label: 'Total Users', value: stats.totalUsers, icon: <Users size={20} /> },
                                { label: 'Pro Users', value: stats.proUsers, icon: <TrendingUp size={20} /> },
                                { label: 'Total Rooms', value: stats.totalRooms, icon: <BarChart3 size={20} /> },
                                { label: 'Redesigns', value: stats.totalRedesigns, icon: <BarChart3 size={20} /> },
                                { label: 'Revenue', value: `₹${(stats.totalRevenue / 100).toLocaleString()}`, icon: <CreditCard size={20} /> },
                                { label: 'Credits Used', value: stats.totalCreditsUsed, icon: <CreditCard size={20} /> },
                                { label: 'New Users (7d)', value: stats.recentUsers, icon: <TrendingUp size={20} /> },
                                { label: 'Avg Rev/User', value: `₹${stats.avgRevenuePerUser}`, icon: <TrendingUp size={20} /> },
                            ].map((s, i) => (
                                <div key={i} className="stat-card">
                                    <div style={{ opacity: 0.5, marginBottom: 4 }}>{s.icon}</div>
                                    <div className="stat-number">{s.value}</div>
                                    <div className="stat-label">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'users' && !loading && (
                    <div>
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ position: 'relative', maxWidth: 320 }}>
                                <Search size={16} style={{ position: 'absolute', left: 12, top: 10, opacity: 0.5 }} />
                                <input
                                    className="input"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ paddingLeft: 36 }}
                                />
                            </div>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--color-beige)', textAlign: 'left' }}>
                                        <th style={{ padding: '10px 12px' }}>User</th>
                                        <th style={{ padding: '10px 12px' }}>Plan</th>
                                        <th style={{ padding: '10px 12px' }}>Credits</th>
                                        <th style={{ padding: '10px 12px' }}>Verified</th>
                                        <th style={{ padding: '10px 12px' }}>Joined</th>
                                        <th style={{ padding: '10px 12px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((u) => (
                                        <tr key={u.id} style={{ borderBottom: '1px solid var(--color-beige)' }}>
                                            <td style={{ padding: '10px 12px' }}>
                                                <div style={{ fontWeight: 500 }}>{u.name}</div>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{u.email}</div>
                                            </td>
                                            <td style={{ padding: '10px 12px' }}>
                                                <span className="badge" style={{
                                                    background: u.plan === 'pro' ? 'rgba(107,127,94,0.15)' : 'rgba(0,0,0,0.05)',
                                                    color: u.plan === 'pro' ? '#6B7F5E' : 'var(--color-charcoal)',
                                                }}>{u.plan}</span>
                                            </td>
                                            <td style={{ padding: '10px 12px', fontWeight: 600 }}>{u.credits}</td>
                                            <td style={{ padding: '10px 12px' }}>{u.isEmailVerified ? '✅' : '❌'}</td>
                                            <td style={{ padding: '10px 12px', fontSize: '0.75rem' }}>
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '10px 12px' }}>
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    <button className="btn btn-ghost btn-sm" onClick={() => setCreditModal(u)} title="Adjust credits">
                                                        <CreditCard size={14} />
                                                    </button>
                                                    <button className="btn btn-ghost btn-sm" onClick={() => handlePlanChange(u.id, u.plan === 'pro' ? 'free' : 'pro')} title="Toggle plan">
                                                        <Shield size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && !loading && (
                    <div>
                        {(!orders || orders.length === 0) ? (
                            <p style={{ opacity: 0.7 }}>No orders yet</p>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--color-beige)', textAlign: 'left' }}>
                                            <th style={{ padding: '10px 12px' }}>User</th>
                                            <th style={{ padding: '10px 12px' }}>Package</th>
                                            <th style={{ padding: '10px 12px' }}>Amount</th>
                                            <th style={{ padding: '10px 12px' }}>Credits</th>
                                            <th style={{ padding: '10px 12px' }}>Status</th>
                                            <th style={{ padding: '10px 12px' }}>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((o) => (
                                            <tr key={o.id} style={{ borderBottom: '1px solid var(--color-beige)' }}>
                                                <td style={{ padding: '10px 12px' }}>{o.User?.name || 'N/A'}</td>
                                                <td style={{ padding: '10px 12px', textTransform: 'capitalize' }}>{o.packageId}</td>
                                                <td style={{ padding: '10px 12px' }}>₹{o.amount / 100}</td>
                                                <td style={{ padding: '10px 12px' }}>{o.credits}</td>
                                                <td style={{ padding: '10px 12px' }}>
                                                    <span className="badge" style={{
                                                        background: o.status === 'paid' ? 'rgba(107,127,94,0.15)' : 'rgba(196,91,74,0.15)',
                                                        color: o.status === 'paid' ? '#6B7F5E' : '#C45B4A',
                                                    }}>{o.status}</span>
                                                </td>
                                                <td style={{ padding: '10px 12px', fontSize: '0.75rem' }}>
                                                    {new Date(o.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Credit Adjustment Modal */}
                {creditModal && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    }} onClick={() => setCreditModal(null)}>
                        <div className="auth-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
                            <h3>Adjust Credits</h3>
                            <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: 16 }}>
                                User: <strong>{creditModal.name}</strong> ({creditModal.email}) — Current: {creditModal.credits}
                            </p>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                                <button className="btn btn-sm" onClick={() => setCreditAmount('-10')}><Minus size={14} /> -10</button>
                                <button className="btn btn-sm" onClick={() => setCreditAmount('-50')}><Minus size={14} /> -50</button>
                                <button className="btn btn-sm" onClick={() => setCreditAmount('10')}><Plus size={14} /> +10</button>
                                <button className="btn btn-sm" onClick={() => setCreditAmount('50')}><Plus size={14} /> +50</button>
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <label>Amount (+/- credits)</label>
                                <input className="input" type="number" value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label>Reason (optional)</label>
                                <input className="input" value={creditReason} onChange={(e) => setCreditReason(e.target.value)} placeholder="e.g. promotional bonus" />
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn btn-primary" onClick={handleCreditAdjust}>Apply</button>
                                <button className="btn btn-secondary" onClick={() => setCreditModal(null)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
