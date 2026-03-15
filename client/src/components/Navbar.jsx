import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuthStore();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    const isActive = (path) => location.pathname === path ? 'active' : '';

    // Hide full navbar on studio page (compact mode)
    if (location.pathname.startsWith('/studio')) {
        return (
            <nav className="navbar scrolled">
                <div className="container">
                    <Link to="/" className="navbar-brand">
                        <span className="brand-icon">✦</span>
                        RoomForge
                    </Link>
                    <div className="navbar-links">
                        <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
                        <Link to="/upload" className={isActive('/upload')}>Upload</Link>
                        <Link to="/studio" className={isActive('/studio')}>3D Studio</Link>
                        {user && <span className="navbar-credits">✦ {user.credits} credits</span>}
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <>
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="container">
                    <Link to="/" className="navbar-brand">
                        <span className="brand-icon">✦</span>
                        RoomForge
                    </Link>

                    {/* Desktop Nav */}
                    <div className="navbar-links navbar-desktop">
                        {user ? (
                            <>
                                <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
                                <Link to="/upload" className={isActive('/upload')}>Upload</Link>
                                <Link to="/studio" className={isActive('/studio')}>3D Studio</Link>
                                <Link to="/about" className={isActive('/about')}>About</Link>
                                <Link to="/contact" className={isActive('/contact')}>Contact</Link>
                                {user.role === 'admin' && <Link to="/admin" className={isActive('/admin')}>Admin</Link>}
                                <span className="navbar-credits">✦ {user.credits}</span>
                                <button onClick={logout} className="btn btn-ghost btn-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.82rem' }}>Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/about" className={isActive('/about')}>About</Link>
                                <Link to="/contact" className={isActive('/contact')}>Contact</Link>
                                <Link to="/login" className={isActive('/login')}>Sign In</Link>
                                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
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
                                <Link to="/dashboard" className="mobile-menu-link">Dashboard</Link>
                                <Link to="/upload" className="mobile-menu-link">Upload Room</Link>
                                <Link to="/studio" className="mobile-menu-link">3D Studio</Link>
                                <Link to="/about" className="mobile-menu-link">About</Link>
                                <Link to="/contact" className="mobile-menu-link">Contact</Link>
                                {user.role === 'admin' && <Link to="/admin" className="mobile-menu-link">Admin</Link>}
                                <div className="mobile-menu-divider" />
                                <div className="mobile-menu-credits">✦ {user.credits} credits remaining</div>
                                <button onClick={logout} className="btn btn-secondary" style={{ width: '100%', marginTop: 8 }}>Logout</button>
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
