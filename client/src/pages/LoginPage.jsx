import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';
import { authAPI } from '../api/client';
import { signInWithGoogle } from '../config/firebase';
import { Mail, Eye, EyeOff, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const setAuth = useAuthStore((s) => s.setAuth);
    const addToast = useToastStore((s) => s.addToast);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await authAPI.login({ email, password });
            setAuth(data.user, data.token);
            addToast(`Welcome back, ${data.user.name.split(' ')[0]}! ✨`);
            navigate('/dashboard');
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            // Call Firebase synchronously first to prevent popup blockers
            const { token } = await signInWithGoogle();
            
            // Set loading only AFTER the popup returns successfully
            setLoading(true); 
            
            const data = await authAPI.googleLogin(token);
            setAuth(data.user, data.token);
            addToast('Signed in with Google! ✨');
            navigate('/dashboard');
        } catch (err) {
            // Ignore if user just closed the popup
            if (err.code !== 'auth/popup-closed-by-user') {
                addToast(err.message || 'Google Sign-In failed', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page dot-grid">
            <div className="auth-card glass-bg glass-blur anim-fade-up">
                <div className="auth-header">
                    <span className="overline">Welcome Back</span>
                    <h2>Sign In</h2>
                    <p>Continue your design journey with DreamSpace AI.</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label><Mail size={14} /> Email Address</label>
                        <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <label style={{ marginBottom: 0 }}><Lock size={14} /> Password</label>
                            <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--c-sage-light)', fontWeight: 600 }}>Forgot?</Link>
                        </div>
                        <div className="input-with-icon">
                            <input
                                className="input"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button type="button" className="icon-btn" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button className="btn btn-sage btn-lg btn-block" type="submit" disabled={loading}>
                        {loading ? <div className="spinner" /> : <><ArrowRight size={18} /> Sign In</>}
                    </button>
                </form>

                <div className="auth-divider"><span>OR</span></div>

                <button className="btn btn-secondary btn-lg btn-block google-signin-btn" onClick={handleGoogleLogin} disabled={loading}>
                    <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                    Continue with Google
                </button>

                <p className="auth-footer">
                    Don't have an account? <Link to="/register">Create Account</Link>
                </p>
            </div>
        </div>
    );
}
