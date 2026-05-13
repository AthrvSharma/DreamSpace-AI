import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';
import { authAPI } from '../api/client';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const addToast = useToastStore((s) => s.addToast);
    const user = useAuthStore((s) => s.user);

    const [loading, setLoading] = useState(false);
    const [verified, setVerified] = useState(false);
    const [resending, setResending] = useState(false);

    useEffect(() => {
        if (token) handleVerify(token);
    }, [token]);

    const handleVerify = async (t) => {
        setLoading(true);
        try {
            await authAPI.verifyEmail(t);
            setVerified(true);
            addToast('Email verified successfully!', 'success');
            // Update local user state
            if (user) useAuthStore.getState().setAuth({ ...user, isEmailVerified: true }, localStorage.getItem('dreamspace_token'));
        } catch (err) {
            addToast(err.message || 'Verification failed. The link may have expired.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            await authAPI.resendVerify();
            addToast('Verification email sent!', 'success');
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ maxWidth: 420 }}>
                {verified ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <CheckCircle size={56} style={{ color: 'var(--color-olive)', marginBottom: 16 }} />
                        <h2>Email Verified! 🎉</h2>
                        <p style={{ color: 'var(--color-charcoal)', fontSize: '0.9rem', marginBottom: 24 }}>
                            Your account is now fully verified. You have access to all features.
                        </p>
                        <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
                    </div>
                ) : (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                            <Mail size={48} style={{ color: 'var(--color-olive)', marginBottom: 12 }} />
                            <h2>Verify Your Email</h2>
                            <p className="auth-subtitle">
                                {loading
                                    ? 'Verifying...'
                                    : token
                                        ? 'Unable to verify. The link may have expired.'
                                        : 'Check your inbox for a verification link'}
                            </p>
                        </div>

                        {!loading && (
                            <>
                                <button
                                    className="btn btn-secondary btn-lg"
                                    onClick={handleResend}
                                    disabled={resending}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                >
                                    <RefreshCw size={16} className={resending ? 'spin' : ''} />
                                    {resending ? 'Sending...' : 'Resend Verification Email'}
                                </button>
                                <div className="auth-footer" style={{ marginTop: 16 }}>
                                    <Link to="/dashboard">Skip for now</Link>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
