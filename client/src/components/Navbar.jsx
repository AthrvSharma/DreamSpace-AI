import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import { Menu, X, Settings, LogOut, Bell } from 'lucide-react';
import { notificationAPI } from '../api/client';

export default function Navbar() {
    const { user, logout } = useAuthStore();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close menus on route change
    useEffect(() => {
        setMobileOpen(false);
        setUserMenuOpen(false);
    }, [location.pathname]);

    // Fetch notification count
    useEffect(() => {
        if (!user) return;
        notificationAPI.list().then(data => setUnreadCount(data.unreadCount || 0)).catch(() => {});
        const interval = setInterval(() => {
            notificationAPI.list().then(data => setUnreadCount(data.unreadCount || 0)).catch(() => {});
        }, 60000);
        return () => clearInterval(interval);
    }, [user]);

    const isActive = (path) => location.pathname === path ? 'active' : '';

    // Hide navbar on AR page (fullscreen)
    if (location.pathname.startsWith('/ar')) return null;

    // Compact navbar on studio page
    if (location.pathname.startsWith('/studio')) {
        return (
            <nav className="navbar scrolled">
                <div className="navbar-scrolled-line" />
                <div className="container">
                    <Link to="/" className="navbar-brand">
                        <span className="brand-icon">✦</span>
                        DreamSpace AI
                    </Link>
                    <div className="navbar-links">
                        <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
                        <Link to="/upload" className={isActive('/upload')}>Upload</Link>
                        <Link to="/studio" className={isActive('/studio')}>3D Studio</Link>
                        <Link to="/ar" className={isActive('/ar')}>AR</Link>
                        {user && (
                            <Link to="/pricing" className={`navbar-credits-link ${isActive('/pricing')}`}>
                                <span className="navbar-credits">✦ {user.credits}</span>
                                <span className="navbar-buy-text">Buy More</span>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <>
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="navbar-scrolled-line" />
                <div className="container">
                    <Link to="/" className="navbar-brand">
                        <span className="brand-icon">✦</span>
                        DreamSpace AI
                    </Link>

                    {/* Desktop Nav */}
                    <div className="navbar-links navbar-desktop">
                        {user ? (
                            <>
                                <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
                                <Link to="/upload" className={isActive('/upload')}>Upload</Link>
                                <Link to="/studio" className={isActive('/studio')}>3D Studio</Link>
                                <Link to="/ar" className={isActive('/ar')}>AR</Link>
                                <Link to="/about" className={isActive('/about')}>About</Link>
                                <Link to="/contact" className={isActive('/contact')}>Contact</Link>
                                {user.role === 'admin' && <Link to="/admin" className={isActive('/admin')}>Admin</Link>}
                                <Link to="/pricing" className={`navbar-credits-link ${isActive('/pricing')}`}>
                                    <span className="navbar-credits">✦ {user.credits}</span>
                                    <span className="navbar-buy-text">Buy More</span>
                                </Link>

                                {/* Notification Bell */}
                                <Link to="/notifications" className="navbar-icon-btn" style={{ position: 'relative' }}>
                                    <Bell size={18} />
                                    {unreadCount > 0 && (
                                        <span style={{
                                            position: 'absolute', top: -4, right: -6,
                                            background: '#C45B4A', color: '#fff', fontSize: '0.6rem',
                                            fontWeight: 700, width: 16, height: 16, borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </Link>

                                {/* User Menu */}
                                <div style={{ position: 'relative' }}>
                                    <button
                                        className="navbar-avatar"
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    >
                                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                        {!user.isEmailVerified && <span className="avatar-unverified-dot" />}
                                        {!user.isEmailVerified && <span className="avatar-ring-pulse" />}
                                    </button>

                                    {userMenuOpen && (
                                        <div className="user-dropdown glass-bg glass-blur" onClick={() => setUserMenuOpen(false)}>
                                            <div className="user-dropdown-header">
                                                <div className="user-name">{user.name}</div>
                                                <div className="user-email">{user.email}</div>
                                                <span className="badge-premium">
                                                    {user.plan} Plan
                                                </span>
                                            </div>
                                            <div className="user-dropdown-divider" />
                                            <Link to="/settings" className="user-dropdown-item">
                                                <Settings size={14} /> Settings
                                            </Link>
                                            <button className="user-dropdown-item sign-out" onClick={logout}>
                                                <LogOut size={14} /> Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/about" className={isActive('/about')}>About</Link>
                                <Link to="/contact" className={isActive('/contact')}>Contact</Link>
                                <Link to="/login" className={isActive('/login')}>Sign In</Link>
                                <Link to="/register" className="btn btn-sage btn-sm">Get Started</Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Hamburger */}
                    <button className="navbar-hamburger" onClick={() => setMobileOpen(v => !v)} aria-label="Toggle menu">
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="mobile-menu-overlay" onClick={() => setMobileOpen(false)}>
                    <div className="mobile-menu" onClick={e => e.stopPropagation()}>
                        {user ? (
                            <>
                                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-beige)' }}>
                                    <div style={{ fontWeight: 600 }}>{user.name}</div>
                                    <div style={{ fontSize: '0.82rem', opacity: 0.7 }}>{user.email}</div>
                                </div>
                                <Link to="/dashboard" className="mobile-menu-link">🏠 Dashboard</Link>
                                <Link to="/upload" className="mobile-menu-link">📷 Upload Room</Link>
                                <Link to="/studio" className="mobile-menu-link">🎮 3D Studio</Link>
                                <Link to="/ar" className="mobile-menu-link">📱 AR Preview</Link>
                                <Link to="/settings" className="mobile-menu-link">⚙️ Settings</Link>
                                <Link to="/pricing" className="mobile-menu-link" style={{ color: '#6B7F5E', fontWeight: 'bold' }}>
                                    💎 Buy Credits (✦ {user.credits})
                                </Link>
                                {user.role === 'admin' && <Link to="/admin" className="mobile-menu-link">🛡️ Admin</Link>}
                                <div className="mobile-menu-divider" />
                                <Link to="/about" className="mobile-menu-link">About</Link>
                                <Link to="/contact" className="mobile-menu-link">Contact</Link>
                                <button onClick={logout} className="btn btn-secondary" style={{ width: '100%', marginTop: 8 }}>
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/about" className="mobile-menu-link">About</Link>
                                <Link to="/contact" className="mobile-menu-link">Contact</Link>
                                <div className="mobile-menu-divider" />
                                <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>Sign In</Link>
                                <Link to="/register" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>Get Started</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
