import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../api/client';

export default function AdminPage() {
    const { data: statsData } = useQuery({ queryKey: ['admin-stats'], queryFn: adminAPI.stats });
    const { data: usersData } = useQuery({ queryKey: ['admin-users'], queryFn: adminAPI.users });

    const stats = statsData?.stats || {};
    const users = usersData?.users || [];

    return (
        <div className="admin-page">
            <div className="container">
                <div className="section-header anim-fade-up">
                    <span className="overline">Administration</span>
                    <h2>Platform Dashboard</h2>
                    <div className="divider-line" />
                </div>

                {/* Stats */}
                <div className="stats-grid anim-fade-up anim-delay-1" style={{ marginBottom: 'var(--space-2xl)' }}>
                    {[
                        { label: 'Total Users', value: stats.totalUsers || 0 },
                        { label: 'Total Rooms', value: stats.totalRooms || 0 },
                        { label: 'Redesigns', value: stats.totalRedesigns || 0 },
                        { label: 'Saved Layouts', value: stats.totalLayouts || 0 },
                    ].map((s, i) => (
                        <div key={i} className="stat-card">
                            <div className="stat-number">{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Users Table */}
                <div className="anim-fade-up anim-delay-2" style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Plan</th>
                                <th>Credits</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td style={{ fontWeight: 500 }}>{u.name}</td>
                                    <td>{u.email}</td>
                                    <td><span className={`badge ${u.role === 'admin' ? 'badge-gold' : 'badge-sand'}`}>{u.role}</span></td>
                                    <td><span className={`badge ${u.plan === 'pro' ? 'badge-olive' : 'badge-sand'}`}>{u.plan}</span></td>
                                    <td>{u.credits}</td>
                                    <td style={{ fontSize: '0.85rem', color: 'var(--color-warm-gray)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
