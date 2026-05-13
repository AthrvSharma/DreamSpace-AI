import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useToastStore from '../store/toastStore';
import { authAPI } from '../api/client';
import { Lock, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const addToast = useToastStore((s) => s.addToast);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (!token) {
            addToast('Invalid or missing reset token', 'error');
            navigate('/login');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 8) return addToast('Password must be at least 8 characters', 'error');
        if (password !== confirmPassword) return addToast('Passwords do not match', 'error');

        setLoading(true);
        try {
            await authAPI.resetPassword(token, password);
            setDone(true);
            addToast('Password reset successfully!');
        } catch (err) {
            addToast(err.message || 'Reset failed. The link may have expired.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ maxWidth: 420 }}>
                {done ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <CheckCircle size={48} style={{ color: 'var(--color-olive)', marginBottom: 16 }} />
                        <h2>Password Reset!</h2>
                        <p style={{ color: 'var(--color-charcoal)', fontSize: '0.9rem', marginBottom: 24 }}>
                            Your password has been changed successfully.
                        </p>
                        <Link to="/login" className="btn btn-primary">Sign In</Link>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <Lock size={24} style={{ color: 'var(--color-olive)' }} />
                            <h2 style={{ margin: 0 }}>Set New Password</h2>
                        </div>
                        <p className="auth-subtitle">Choose a strong password for your account</p>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label>New Password</label>
                                <input className="input" type="password" placeholder="Minimum 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                            </div>
                            <div>
                                <label>Confirm Password</label>
                                <input className="input" type="password" placeholder="Repeat new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                            </div>
                            {password && confirmPassword && password !== confirmPassword && (
                                <p style={{ color: '#C45B4A', fontSize: '0.82rem', marginTop: 4 }}>Passwords don't match</p>
                            )}
                            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
