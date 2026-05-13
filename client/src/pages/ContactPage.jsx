import { useState, useRef, useEffect } from 'react';
import useToastStore from '../store/toastStore';
import { contactAPI } from '../api/client';

function useInView(options = {}) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setInView(true); obs.unobserve(el); } }, { threshold: 0.15, ...options });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return [ref, inView];
}

function AnimSection({ children, className = '', animation = 'anim-fade-up', delay = '' }) {
    const [ref, inView] = useInView();
    return (
        <div ref={ref} className={`${className} ${inView ? `${animation} ${delay}` : ''}`} style={{ opacity: inView ? undefined : 0 }}>
            {children}
        </div>
    );
}

export default function ContactPage() {
    const addToast = useToastStore((s) => s.addToast);
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) {
            addToast('Please fill in all required fields', 'error');
            return;
        }
        if (form.message.length < 10) {
            addToast('Message must be at least 10 characters', 'error');
            return;
        }
        setSending(true);
        try {
            await contactAPI.submit(form);
            addToast('Message sent successfully!', 'success');
            setSent(true);
            setForm({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            addToast(err.message || 'Failed to send message', 'error');
        } finally {
            setSending(false);
        }
    };

    const contactInfo = [
        { icon: '📧', label: 'Email', value: 'hello@dreamspaceai.com', desc: 'Send us a message anytime' },
        { icon: '📍', label: 'Location', value: 'India', desc: 'Built with ❤️ in India' },
        { icon: '⏰', label: 'Response Time', value: '< 24 hours', desc: 'We respond quickly' },
    ];

    return (
        <div className="contact-page">
            <section className="section" style={{ paddingTop: 140 }}>
                <div className="container">
                    <AnimSection className="section-header">
                        <span className="overline">Contact Us</span>
                        <h1>Get in Touch</h1>
                        <div className="divider-line" />
                        <p>Have a question, feedback, or need help? We'd love to hear from you.</p>
                    </AnimSection>
                </div>
            </section>

            <section className="section section-alt" style={{ paddingTop: 0 }}>
                <div className="container">
                    <div className="contact-grid">
                        {sent ? (
                            <AnimSection className="contact-form-card" animation="anim-fade-up">
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
                                    <h2>Message Sent!</h2>
                                    <p style={{ opacity: 0.7, marginBottom: 24 }}>Thanks for reaching out. We'll get back to you within 24 hours.</p>
                                    <button className="btn btn-secondary" onClick={() => setSent(false)}>Send Another Message</button>
                                </div>
                            </AnimSection>
                        ) : (
                            <AnimSection className="contact-form-card" animation="anim-fade-up">
                                <h3>Send a Message</h3>
                                <form onSubmit={handleSubmit}>
                                    <div className="contact-field-grid">
                                        <div>
                                            <label>Name *</label>
                                            <input className="input" placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                                        </div>
                                        <div>
                                            <label>Email *</label>
                                            <input className="input" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: 'var(--space-md)' }}>
                                        <label>Subject</label>
                                        <input className="input" placeholder="What's this about?" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
                                    </div>
                                    <div style={{ marginTop: 'var(--space-md)' }}>
                                        <label>Message *</label>
                                        <textarea className="input" rows={5} placeholder="Tell us what's on your mind..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required minLength={10} />
                                        <div style={{ fontSize: '0.72rem', opacity: 0.5, marginTop: 4, textAlign: 'right' }}>
                                            {form.message.length}/5000
                                        </div>
                                    </div>
                                    <div style={{ marginTop: 'var(--space-xl)' }}>
                                        <button className="btn btn-olive btn-lg" type="submit" disabled={sending} style={{ width: '100%' }}>
                                            {sending ? 'Sending...' : '✦ Send Message'}
                                        </button>
                                    </div>
                                </form>
                            </AnimSection>
                        )}

                        <AnimSection animation="anim-fade-up" delay="anim-delay-2">
                            <div className="contact-info-cards">
                                {contactInfo.map((info, i) => (
                                    <div key={i} className="contact-info-item">
                                        <span className="contact-info-icon">{info.icon}</span>
                                        <div>
                                            <h4>{info.label}</h4>
                                            <p style={{ fontWeight: 500, color: 'var(--color-charcoal)', margin: '2px 0' }}>{info.value}</p>
                                            <p style={{ fontSize: '0.82rem' }}>{info.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="contact-faq-mini">
                                <h4>Common Questions</h4>
                                <div className="faq-mini-item">
                                    <strong>Is DreamSpace AI free?</strong>
                                    <p>Yes! The free plan includes 5 credits per day for AI redesigns.</p>
                                </div>
                                <div className="faq-mini-item">
                                    <strong>How does the 3D Studio work?</strong>
                                    <p>Upload a room photo, then place and customize furniture in our interactive 3D environment.</p>
                                </div>
                                <div className="faq-mini-item">
                                    <strong>What AI model do you use?</strong>
                                    <p>We use Stable Diffusion XL for high-quality, photorealistic room redesigns.</p>
                                </div>
                            </div>
                        </AnimSection>
                    </div>
                </div>
            </section>
        </div>
    );
}
