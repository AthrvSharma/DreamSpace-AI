import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Rocket, Crown, CreditCard } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';
import { paymentAPI } from '../api/client';
import PaymentStatusOverlay from '../components/PaymentStatusOverlay';

const PACKAGES = [
    {
        id: 'starter',
        name: 'Starter Bundle',
        price: '199',
        credits: '20',
        icon: <Zap size={24} color="#C2A77E" />,
        features: ['20 High-Res Generative Credits', 'Basic AI Models', 'Community Support', 'Credits never expire'],
        popular: false
    },
    {
        id: 'pro',
        name: 'Creator Pack',
        price: '499',
        credits: '60',
        icon: <Rocket size={24} color="#6B7F5E" />,
        features: ['60 Ultra-HD Generative Credits', 'Priority AI Processing', 'Access to premium 3D assets', 'Email Support'],
        popular: true
    },
    {
        id: 'business',
        name: 'Studio Bundle',
        price: '999',
        credits: '150',
        icon: <Crown size={24} color="#8B7FC7" />,
        features: ['150 Commercial Credits', 'Custom AI Prompting', 'Dedicated Account Manager', 'API Access'],
        popular: false
    }
];

export default function PricingPage() {
    const [loading, setLoading] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null); // 'success' or 'error'
    const { user, setAuth } = useAuthStore();
    const addToast = useToastStore((s) => s.addToast);
    const navigate = useNavigate();

    useEffect(() => {
        // Load Razorpay Script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => document.body.removeChild(script);
    }, []);

    const handlePurchase = async (packageId) => {
        if (!user) {
            addToast('Please login to purchase credits', 'error');
            navigate('/login');
            return;
        }

        try {
            setLoading(packageId);
            const { order, key_id } = await paymentAPI.createOrder(packageId);

            const options = {
                key: key_id,
                amount: order.amount,
                currency: order.currency,
                name: 'DreamSpace AI',
                description: `Purchase of ${packageId} credit package`,
                order_id: order.id,
                handler: async (response) => {
                    try {
                        const verification = await paymentAPI.verify({
                            ...response,
                            packageId
                        });
                        if (verification.success) {
                            setPaymentStatus('success');
                            // Update local store credits
                            setAuth({ ...user, credits: verification.credits }, localStorage.getItem('dreamspace_token'));
                        }
                    } catch (err) {
                        setPaymentStatus('error');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email
                },
                theme: {
                    color: '#6B7F5E'
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                setPaymentStatus('error');
            });
            rzp.open();
        } catch (err) {
            addToast('Failed to initialize payment', 'error');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="pricing-page" style={{ paddingTop: '100px', paddingBottom: '100px', backgroundColor: 'var(--c-dark)' }}>
            <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 16px', borderRadius: 'var(--r-full)', background: 'var(--c-sage-glass)', color: 'var(--c-sage)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '20px' }}>
                        Credit Top-up
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', fontWeight: 700, lineHeight: 1.15, color: 'var(--c-text)', marginBottom: '16px' }}>Power up your <em style={{ fontStyle: 'italic', color: 'var(--c-sage)' }}>creativity</em></h1>
                    <p style={{ fontSize: '1.05rem', color: 'var(--c-text-secondary)', lineHeight: 1.65, maxWidth: '600px', margin: '0 auto 32px' }}>
                        Purchase credits as you need them. No subscriptions. Use your credits to generate ultra-realistic AI redesigns, chat with the AI designer, and auto-furnish rooms.
                    </p>
                    
                    {user && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#fff', border: '1px solid var(--c-border)', borderRadius: 'var(--r-full)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                            <CreditCard size={18} color="var(--c-sage)" />
                            <span style={{ fontSize: '0.9rem', color: 'var(--c-text)' }}>Your balance: <strong style={{ color: 'var(--c-sage)', fontSize: '1rem' }}>{user.credits}</strong> credits</span>
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    {PACKAGES.map((pkg) => (
                        <div 
                            key={pkg.id} 
                            style={{ 
                                position: 'relative', 
                                padding: '40px 32px', 
                                backgroundColor: pkg.popular ? '#fff' : 'var(--c-darker)', 
                                border: `1px solid ${pkg.popular ? 'var(--c-sage)' : 'var(--c-border)'}`, 
                                borderRadius: '24px', 
                                transition: 'all 0.3s ease',
                                boxShadow: pkg.popular ? '0 20px 40px rgba(107,127,94,0.08)' : 'none',
                                transform: pkg.popular ? 'scale(1.02)' : 'scale(1)'
                            }}
                            className="hover-lift"
                        >
                            {pkg.popular && (
                                <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', padding: '6px 16px', backgroundColor: 'var(--c-sage)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', borderRadius: 'var(--r-full)', textTransform: 'uppercase' }}>
                                    Most Popular
                                </div>
                            )}
                            
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--c-dark)', borderRadius: '14px', marginBottom: '16px', border: '1px solid var(--c-border)' }}>
                                    {pkg.icon}
                                </div>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: '4px' }}>{pkg.name}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--c-text-muted)' }}>One-time top-up</p>
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--c-text)', letterSpacing: '-0.02em' }}>₹{pkg.price}</span>
                                </div>
                                <div style={{ marginTop: '8px', padding: '6px 12px', backgroundColor: 'var(--c-sage-glass)', color: 'var(--c-sage-dark)', fontSize: '0.85rem', fontWeight: 700, borderRadius: '8px', display: 'inline-block' }}>
                                    {pkg.credits} Credits included
                                </div>
                            </div>

                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {pkg.features.map((feat, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '0.9rem', color: 'var(--c-text-secondary)', lineHeight: 1.5 }}>
                                        <div style={{ marginTop: '2px', color: 'var(--c-sage)' }}><Check size={16} /></div>
                                        {feat}
                                    </li>
                                ))}
                            </ul>

                            <button 
                                onClick={() => handlePurchase(pkg.id)}
                                disabled={loading === pkg.id}
                                style={{
                                    width: '100%', padding: '16px', borderRadius: 'var(--r-full)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                    border: pkg.popular ? 'none' : '1px solid var(--c-border)',
                                    backgroundColor: pkg.popular ? 'var(--c-sage)' : '#fff',
                                    color: pkg.popular ? '#fff' : 'var(--c-text)',
                                    boxShadow: pkg.popular ? '0 8px 24px rgba(107,127,94,0.25)' : '0 2px 8px rgba(0,0,0,0.02)',
                                    opacity: loading === pkg.id ? 0.7 : 1
                                }}
                            >
                                {loading === pkg.id ? 'Processing...' : `Buy ${pkg.credits} Credits`}
                            </button>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '60px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--c-text-muted)' }}>
                    <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ width: '8px', height: '8px', backgroundColor: '#34A853', borderRadius: '50%' }}></span>
                        Safe and secure payment powered by Razorpay
                    </p>
                    <p>Have questions? <a href="/contact" style={{ color: 'var(--c-sage)', fontWeight: 600 }}>Contact support</a></p>
                </div>
            </div>
            <PaymentStatusOverlay status={paymentStatus} onClose={() => setPaymentStatus(null)} />
        </div>
    );
}
