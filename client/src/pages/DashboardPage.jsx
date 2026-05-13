import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';
import { roomsAPI, paymentAPI } from '../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Clock, ArrowUpRight, ArrowDownRight, Download, Eye, Trash2, Palette, Sparkles, Box, Sofa, ChevronRight } from 'lucide-react';

function CreditActivity({ history = [] }) {
    if (history.length === 0) return <p className="sidebar-muted">No credit activity yet</p>;

    const typeIcons = {
        purchase: <ArrowDownRight size={14} style={{ color: 'var(--c-sage)' }} />,
        usage: <ArrowUpRight size={14} style={{ color: '#C45B4A' }} />,
        daily_reset: <Clock size={14} style={{ color: 'var(--c-sage-light)' }} />,
        admin_adjustment: <CreditCard size={14} style={{ color: 'var(--c-text-muted)' }} />,
        refund: <Download size={14} style={{ color: 'var(--c-sage)' }} />,
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {history.slice(0, 10).map((h) => (
                <div key={h.id} className="credit-row glass-bg">
                    <div className="credit-icon-wrap">{typeIcons[h.type] || <Clock size={14} />}</div>
                    <div style={{ flex: 1 }}>
                        <div className="credit-desc">{h.description || h.type}</div>
                        <div className="credit-date">
                            {new Date(h.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                    <div className={`credit-amount ${h.amount > 0 ? 'pos' : 'neg'}`}>
                        {h.amount > 0 ? '+' : ''}{h.amount}
                    </div>
                </div>
            ))}
        </div>
    );
}

function AnimatedCounter({ target }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    useEffect(() => {
        if (!inView) return;
        const duration = 1500;
        const startTime = Date.now();
        const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(target * eased));
            if (progress >= 1) clearInterval(timer);
        }, 16);
        return () => clearInterval(timer);
    }, [inView, target]);
    return <span ref={ref}>{count.toLocaleString()}</span>;
}

function SkeletonCard() {
    return (
        <div className="room-card skeleton-wrap">
            <div className="skeleton" style={{ height: 200 }} />
            <div style={{ padding: 16 }}>
                <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, width: '40%' }} />
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const user = useAuthStore((s) => s.user);
    const addToast = useToastStore((s) => s.addToast);
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [activeTab, setActiveTab] = useState('rooms');

    const { data, isLoading } = useQuery({ queryKey: ['rooms'], queryFn: roomsAPI.list });
    const { data: paymentData } = useQuery({ queryKey: ['payment-history'], queryFn: paymentAPI.getHistory, staleTime: 60000 });

    const deleteMutation = useMutation({
        mutationFn: roomsAPI.delete,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['rooms'] }); addToast('Room deleted'); },
    });

    const rooms = data?.rooms || [];
    const creditHistory = paymentData?.creditHistory || [];

    return (
        <div className="dashboard-page page-padding">
            <div className="container">
                {/* Premium Welcome Section */}
                <div className="dashboard-header anim-fade-up" style={{ 
                    position: 'relative', 
                    padding: '40px', 
                    borderRadius: '24px', 
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)', 
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.8)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
                    overflow: 'hidden',
                    marginBottom: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(194, 167, 126, 0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: '-50%', left: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(107, 127, 94, 0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                    
                    <div className="welcome-text" style={{ position: 'relative', zIndex: 1 }}>
                        <span className="overline" style={{ color: 'var(--c-sage)', fontWeight: 700, letterSpacing: '1px' }}>Studio Overview</span>
                        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', margin: '8px 0 16px 0' }}>Welcome back, {user?.name?.split(' ')[0] || 'Designer'} <span className="hand-wave">✨</span></h1>
                        <p style={{ color: 'var(--c-text-secondary)', fontSize: '1.1rem', maxWidth: '500px' }}>Your creative sanctuary is ready. What shall we design today?</p>
                    </div>
                    <div className="header-actions" style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '16px' }}>
                        <Link to="/pricing" className="btn btn-secondary hover-lift" style={{ backgroundColor: '#fff', border: '1px solid var(--c-border-light)' }}>
                            <CreditCard size={18} /> Buy Credits
                        </Link>
                        <Link to="/upload" className="btn btn-sage hover-lift" style={{ boxShadow: '0 8px 24px rgba(107, 127, 94, 0.2)' }}>
                            <Sparkles size={18} /> New Project
                        </Link>
                    </div>
                </div>

                {/* Advanced Stats Grid */}
                <div className="stats-grid anim-fade-up anim-delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '48px' }}>
                    <div className="stat-card glass-bg hover-glow" onClick={() => setActiveTab('rooms')} style={{ padding: '24px', cursor: 'pointer', transition: 'all 0.3s ease', borderRadius: '20px', border: '1px solid var(--c-border)' }}>
                        <div className="stat-icon" style={{ background: 'var(--c-sage-glass)', color: 'var(--c-sage)', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}><Palette size={24} /></div>
                        <div className="stat-content">
                            <div className="stat-number" style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}><AnimatedCounter target={rooms.length} /></div>
                            <div className="stat-label" style={{ color: 'var(--c-text-muted)', fontSize: '0.9rem', marginTop: '8px', fontWeight: 500 }}>Total Projects</div>
                        </div>
                    </div>
                    <div className="stat-card glass-bg hover-glow" style={{ padding: '24px', borderRadius: '20px', border: '1px solid var(--c-border)' }}>
                        <div className="stat-icon" style={{ background: 'rgba(194, 167, 126, 0.15)', color: 'var(--c-gold)', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}><Sparkles size={24} /></div>
                        <div className="stat-content">
                            <div className="stat-number" style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}><AnimatedCounter target={rooms.reduce((a, r) => a + (r.Redesigns?.length || 0), 0)} /></div>
                            <div className="stat-label" style={{ color: 'var(--c-text-muted)', fontSize: '0.9rem', marginTop: '8px', fontWeight: 500 }}>AI Renders</div>
                        </div>
                    </div>
                    <div className="stat-card glass-bg hover-glow" onClick={() => navigate('/studio')} style={{ padding: '24px', cursor: 'pointer', borderRadius: '20px', border: '1px solid var(--c-border)' }}>
                        <div className="stat-icon" style={{ background: 'rgba(139, 127, 199, 0.15)', color: '#8B7FC7', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}><Box size={24} /></div>
                        <div className="stat-content">
                            <div className="stat-number" style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}><AnimatedCounter target={rooms.reduce((a, r) => a + (r.Layouts?.length || 0), 0)} /></div>
                            <div className="stat-label" style={{ color: 'var(--c-text-muted)', fontSize: '0.9rem', marginTop: '8px', fontWeight: 500 }}>3D Layouts</div>
                        </div>
                    </div>
                    <div className="stat-card glass-bg hover-glow highlight" onClick={() => setActiveTab('credits')} style={{ padding: '24px', cursor: 'pointer', borderRadius: '20px', border: '1px solid var(--c-sage)', background: 'linear-gradient(to bottom right, #fff, var(--c-sage-glass))' }}>
                        <div className="stat-icon" style={{ background: 'var(--c-sage)', color: '#fff', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 8px 16px rgba(107,127,94,0.3)' }}><CreditCard size={24} /></div>
                        <div className="stat-content">
                            <div className="stat-number" style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}><AnimatedCounter target={user?.credits || 0} /></div>
                            <div className="stat-label" style={{ color: 'var(--c-sage-dark)', fontSize: '0.9rem', marginTop: '8px', fontWeight: 600 }}>Remaining Credits</div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="dashboard-tabs anim-fade-up anim-delay-2" style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--c-border)', marginBottom: '32px' }}>
                    <button style={{ padding: '0 0 16px 0', fontSize: '1.1rem', fontWeight: activeTab === 'rooms' ? 600 : 500, color: activeTab === 'rooms' ? 'var(--c-text)' : 'var(--c-text-muted)', borderBottom: activeTab === 'rooms' ? '2px solid var(--c-sage)' : '2px solid transparent' }} onClick={() => setActiveTab('rooms')}>
                        My Projects
                    </button>
                    <button style={{ padding: '0 0 16px 0', fontSize: '1.1rem', fontWeight: activeTab === 'credits' ? 600 : 500, color: activeTab === 'credits' ? 'var(--c-text)' : 'var(--c-text-muted)', borderBottom: activeTab === 'credits' ? '2px solid var(--c-sage)' : '2px solid transparent' }} onClick={() => setActiveTab('credits')}>
                        Credit History
                    </button>
                </div>

                {/* Content Area */}
                <div className="dashboard-content anim-fade-up anim-delay-2">
                    {activeTab === 'rooms' ? (
                        <>
                            {isLoading ? (
                                <div className="room-grid">
                                    {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                                </div>
                            ) : rooms.length === 0 ? (
                                <div className="empty-state glass-bg" style={{ padding: '80px 40px', textAlign: 'center', borderRadius: '24px', border: '1px dashed var(--c-border-light)' }}>
                                    <div className="empty-icon" style={{ fontSize: '48px', marginBottom: '24px', opacity: 0.8 }}>🛋️</div>
                                    <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', marginBottom: '12px' }}>No designs yet</h3>
                                    <p style={{ color: 'var(--c-text-secondary)', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto 32px' }}>Upload a photo of your room to get started with AI redesigns and 3D studio features.</p>
                                    <Link to="/upload" className="btn btn-sage btn-lg hover-lift" style={{ padding: '16px 40px', borderRadius: 'var(--r-full)' }}>Start Designing</Link>
                                </div>
                            ) : (
                                <div className="room-grid">
                                    {rooms.map((room) => (
                                        <div key={room.id} className="room-card glass-bg hover-lift">
                                            <div className="room-thumb-wrap">
                                                <img src={room.originalImageUrl} alt={room.title} className="room-thumb" />
                                                <div className="room-badge">{room.type}</div>
                                                <div className="room-actions-overlay">
                                                    <Link to={`/room/${room.id}`} className="btn-icon" title="View Details"><Eye size={18} /></Link>
                                                    <button className="btn-icon danger" onClick={() => deleteMutation.mutate(room.id)} title="Delete"><Trash2 size={18} /></button>
                                                </div>
                                            </div>
                                            <div className="room-info">
                                                <h4>{room.title || 'Untitled Room'}</h4>
                                                <div className="room-meta">
                                                    <span>{room.Redesigns?.length || 0} versions</span>
                                                    <span className="dot" />
                                                    <span>{new Date(room.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="credits-section glass-bg anim-fade-up">
                            <div className="section-header-mini">
                                <h3>Transaction History</h3>
                                <p>View your credit usage and purchases.</p>
                            </div>
                            <div className="credit-activity-wrap">
                                <CreditActivity history={creditHistory} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
