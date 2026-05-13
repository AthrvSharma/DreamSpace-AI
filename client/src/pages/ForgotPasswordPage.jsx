import { useState } from 'react';
import { Link } from 'react-router-dom';
import useToastStore from '../store/toastStore';
import { authAPI } from '../api/client';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const addToast = useToastStore((s) => s.addToast);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return addToast('Please enter your email', 'error');
        setLoading(true);
        try {
            await authAPI.forgotPassword(email);
            setSent(true);
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ maxWidth: 420 }}>
                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--color-charcoal)', marginBottom: 24, textDecoration: 'none' }}>
                    <ArrowLeft size={16} /> Back to login
                </Link>

                {sent ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <CheckCircle size={48} style={{ color: 'var(--color-olive)', marginBottom: 16 }} />
                        <h2 style={{ marginBottom: 8 }}>Check Your Email</h2>
                        <p style={{ color: 'var(--color-charcoal)', fontSize: '0.9rem' }}>
                            If an account exists with <strong>{email}</strong>, you'll receive a password reset link shortly.
                        </p>
                        <div style={{ marginTop: 24 }}>
                            <Link to="/login" className="btn btn-primary">Back to Sign In</Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <Mail size={24} style={{ color: 'var(--color-olive)' }} />
                            <h2 style={{ margin: 0 }}>Forgot Password?</h2>
                        </div>
                        <p className="auth-subtitle">Enter your email and we'll send you a reset link</p>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label>Email Address</label>
                                <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
