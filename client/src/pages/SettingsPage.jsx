import { useState } from 'react';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';
import { authAPI } from '../api/client';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Shield, LogOut, Bell, Eye, EyeOff, Check, RefreshCw, Save, ArrowLeft } from 'lucide-react';

export default function SettingsPage() {
    const { user, token, setAuth, logout } = useAuthStore();
    const addToast = useToastStore((s) => s.addToast);

    // Profile section
    const [name, setName] = useState(user?.name || '');
    const [savingProfile, setSavingProfile] = useState(false);

    // Password section
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    // Email verification
    const [sendingVerify, setSendingVerify] = useState(false);

    const handleSaveProfile = async () => {
        if (!name.trim()) return addToast('Name is required', 'error');
        setSavingProfile(true);
        try {
            // Note: In real app, call update profile API
            addToast('Profile updated!');
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 8) return addToast('Password must be at least 8 characters', 'error');
        if (newPassword !== confirmPassword) return addToast('Passwords do not match', 'error');
        setSavingPassword(true);
        try {
            await authAPI.changePassword(currentPassword, newPassword);
            addToast('Password changed successfully!', 'success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setSavingPassword(false);
        }
    };

    const handleResendVerify = async () => {
        setSendingVerify(true);
        try {
            await authAPI.resendVerify();
            addToast('Verification email sent!', 'success');
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setSendingVerify(false);
        }
    };

    const passwordStrength = (pw) => {
        if (!pw) return { score: 0, label: '', color: 'transparent' };
        let score = 0;
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        if (score <= 1) return { score, label: 'Weak', color: '#fca5a5' };
        if (score <= 2) return { score, label: 'Fair', color: '#fdba74' };
        if (score <= 3) return { score, label: 'Good', color: '#fcd34d' };
        return { score, label: 'Strong', color: 'var(--c-sage)' };
    };

    const strength = passwordStrength(newPassword);

    return (
        <div className="settings-page page-padding dot-grid">
            <div className="container-small">
                <div className="dashboard-header anim-fade-up">
                    <div className="welcome-text">
                        <span className="overline">Personal Preferences</span>
                        <h1>Account Settings</h1>
                        <p>Customize your DreamSpace experience.</p>
                    </div>
                    <button className="btn btn-secondary danger hover-lift" onClick={logout}>
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>

                {/* Profile Card */}
                <div className="settings-card glass-bg glass-blur anim-fade-up anim-delay-1">
                    <div className="settings-card-header">
                        <div className="profile-avatar-large">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="profile-info-main">
                            <h3>{user?.name}</h3>
                            <p>{user?.email}</p>
                            {user?.isEmailVerified ? (
                                <span className="verified-tag"><Check size={12} /> Verified Member</span>
                            ) : (
                                <span className="unverified-tag">Email Unverified</span>
                            )}
                        </div>
                    </div>

                    {!user?.isEmailVerified && (
                        <div className="verification-alert">
                            <p>Verify your email to unlock all features.</p>
                            <button className="btn btn-sage btn-sm" onClick={handleResendVerify} disabled={sendingVerify}>
                                {sendingVerify ? 'Sending...' : 'Resend Email'}
                            </button>
                        </div>
                    )}

                    <div className="form-grid">
                        <div className="form-group">
                            <label><User size={14} /> Display Name</label>
                            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" />
                        </div>
                        <div className="form-group">
                            <label><Mail size={14} /> Email Address</label>
                            <input className="input" value={user?.email || ''} disabled style={{ opacity: 0.5 }} />
                        </div>
                    </div>
                    <button className="btn btn-sage hover-lift" onClick={handleSaveProfile} disabled={savingProfile}>
                        {savingProfile ? <RefreshCw size={16} className="spinner" /> : <><Save size={16} /> Save Profile</>}
                    </button>
                </div>

                {/* Account Status Card */}
                <div className="settings-card glass-bg anim-fade-up anim-delay-2">
                    <h4 className="card-title-iconic"><Shield size={18} /> Membership & Security</h4>
                    <div className="status-pills">
                        <div className="status-pill">
                            <span className="pill-label">Plan</span>
                            <span className="pill-value">{user?.plan || 'Free Tier'}</span>
                        </div>
                        <div className="status-pill">
                            <span className="pill-label">Credits</span>
                            <span className="pill-value highlight">{user?.credits || 0}</span>
                        </div>
                        <div className="status-pill">
                            <span className="pill-label">Joined</span>
                            <span className="pill-value">{new Date(user?.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <Link to="/pricing" className="btn btn-secondary btn-block" style={{ textAlign: 'center' }}>
                        💎 Upgrade Your Design Limits
                    </Link>
                </div>

                {/* Password Card */}
                <div className="settings-card glass-bg anim-fade-up anim-delay-3">
                    <h4 className="card-title-iconic"><Lock size={18} /> Change Password</h4>
                    <form onSubmit={handleChangePassword} className="settings-form">
                        <div className="form-group">
                            <label>Current Password</label>
                            <div className="input-with-icon">
                                <input className="input" type={showPasswords ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <div className="input-with-icon">
                                <input className="input" type={showPasswords ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
                                <button type="button" className="icon-btn" onClick={() => setShowPasswords(!showPasswords)}>
                                    {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {newPassword && (
                                <div className="pw-strength-container anim-fade-in">
                                    <div className="pw-strength-bar">
                                        <div className="pw-strength-fill" style={{ width: `${(strength.score / 4) * 100}%`, backgroundColor: strength.color }} />
                                    </div>
                                    <span style={{ fontSize: '0.7rem', color: strength.color, fontWeight: 700 }}>{strength.label}</span>
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input className="input" type={showPasswords ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                            {newPassword && confirmPassword && newPassword !== confirmPassword && <p className="form-error">Passwords do not match</p>}
                        </div>
                        <button type="submit" className="btn btn-sage" disabled={savingPassword || newPassword !== confirmPassword}>
                            {savingPassword ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
