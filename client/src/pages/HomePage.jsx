import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

/* ── Intersection Observer hook for scroll animations ── */
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

/* ── Animated counter ── */
function Counter({ end, suffix = '', duration = 2000 }) {
    const [count, setCount] = useState(0);
    const [ref, inView] = useInView();
    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const step = end / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= end) { setCount(end); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [inView, end, duration]);
    return <span ref={ref}>{count}{suffix}</span>;
}

/* ── Animated Section wrapper ── */
function AnimSection({ children, className = '', animation = 'anim-fade-up', delay = '' }) {
    const [ref, inView] = useInView();
    return (
        <div ref={ref} className={`${className} ${inView ? `${animation} ${delay}` : ''}`} style={{ opacity: inView ? undefined : 0 }}>
            {children}
        </div>
    );
}

/* ── FAQ Accordion Item ── */
function FAQItem({ question, answer, index }) {
    const [open, setOpen] = useState(false);
    const [ref, inView] = useInView();
    return (
        <div ref={ref} className={`faq-item ${inView ? 'anim-fade-up' : ''} ${open ? 'open' : ''}`}
            style={{ opacity: inView ? undefined : 0, animationDelay: `${index * 0.08}s` }}>
            <button className="faq-question" onClick={() => setOpen(v => !v)}>
                <span>{question}</span>
                <span className="faq-chevron">{open ? '−' : '+'}</span>
            </button>
            {open && <div className="faq-answer"><p>{answer}</p></div>}
        </div>
    );
}

export default function HomePage() {
    const user = useAuthStore((s) => s.user);

    const styles = [
        { name: 'Modern Minimal', desc: 'Clean lines, neutral palette' },
        { name: 'Luxury Classic', desc: 'Rich textures, gold accents' },
        { name: 'Scandinavian', desc: 'Light woods, cozy textiles' },
        { name: 'Boho Chic', desc: 'Eclectic, layered warmth' },
        { name: 'Indian Contemporary', desc: 'Vibrant, cultural fusion' },
        { name: 'Japanese Zen', desc: 'Harmonious simplicity' },
    ];

    const testimonials = [
        { quote: 'RoomForge completely transformed how I visualize my living space. The AI suggestions were remarkably tasteful and the 3D studio made it so easy to experiment.', name: 'Priya Sharma', role: 'Interior Enthusiast', initials: 'PS' },
        { quote: 'As a professional designer, this tool has become indispensable. The speed at which I can iterate on concepts and present them to clients is extraordinary.', name: 'Arjun Mehta', role: 'Interior Designer', initials: 'AM' },
        { quote: 'I was skeptical about AI design tools, but the quality of redesigns genuinely surprised me. It understood the essence of each style perfectly.', name: 'Nina Patel', role: 'Homeowner', initials: 'NP' },
    ];

    return (
        <div>
            {/* ═══════ HERO ═══════ */}
            <section className="hero">
                <div className="container" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <div className="hero-content">
                        <p className="hero-overline anim-fade-up">— We create —</p>
                        <h1 className="anim-fade-up anim-delay-1">
                            Designing Spaces<br />
                            That <em>Reflect You.</em>
                        </h1>
                        <p className="anim-fade-up anim-delay-2">
                            Upload a room photo, receive AI-powered photorealistic redesigns
                            in six curated styles, then perfect every detail in our interactive
                            3D furniture studio.
                        </p>
                        <div className="hero-buttons anim-fade-up anim-delay-3">
                            {user ? (
                                <>
                                    <Link to="/upload" className="btn btn-primary btn-lg">Upload a Room</Link>
                                    <Link to="/studio" className="btn btn-secondary btn-lg">Open 3D Studio</Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
                                    <Link to="/login" className="btn btn-secondary btn-lg">View Portfolio</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="hero-image-wrapper anim-scale-in anim-delay-2">
                    <img src="/images/hero-bedroom.png" alt="Luxury interior design" />
                </div>
            </section>

            {/* ═══════ STATS ═══════ */}
            <section className="section-alt">
                <div className="container">
                    <div className="stats-row">
                        <div className="stat-item">
                            <div className="stat-number"><Counter end={20} suffix="+" /></div>
                            <div className="stat-label">Design Styles</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number"><Counter end={450} suffix="+" /></div>
                            <div className="stat-label">Rooms Redesigned</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number"><Counter end={99} suffix="%" /></div>
                            <div className="stat-label">Satisfaction Rate</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number"><Counter end={100} suffix="+" /></div>
                            <div className="stat-label">3D Furniture Items</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ MARQUEE ═══════ */}
            <div className="marquee-container">
                <div className="marquee-track">
                    {['AI Redesign', 'Living Room', '3D Studio', 'Bedroom', 'Auto Decorate', 'Kitchen', 'Interior Design', 'Dining Room', 'Export Ready',
                        'AI Redesign', 'Living Room', '3D Studio', 'Bedroom', 'Auto Decorate', 'Kitchen', 'Interior Design', 'Dining Room', 'Export Ready',
                    ].map((item, i) => (
                        <div key={i} className="marquee-item"><span className="dot" />{item}</div>
                    ))}
                </div>
            </div>

            {/* ═══════ FEATURES ═══════ */}
            <section className="section">
                <div className="container">
                    <AnimSection className="section-header" animation="anim-fade-up">
                        <span className="overline">Our Services</span>
                        <h2>Crafting Extraordinary<br />Interior Experiences</h2>
                        <div className="divider-line" />
                        <p>Three powerful tools that transform your vision into reality — from concept to completion.</p>
                    </AnimSection>

                    <div className="features-grid">
                        {[
                            { icon: '✦', title: 'AI Redesign', text: 'Upload any room photo and receive photorealistic transformations across six curated design aesthetics — Modern, Luxury, Boho, Scandinavian, Minimal, and Indian Contemporary.' },
                            { icon: '◈', title: '3D Decor Studio', text: 'Place, rotate, and style 16+ pieces of furniture in a beautiful 3D environment. Change materials, colors, and arrangements until every detail is perfect.' },
                            { icon: '❋', title: 'Auto Decorate', text: 'Let our AI suggest optimal furniture layouts based on room type and your preferred style. One click generates a professionally designed arrangement.' },
                        ].map((f, i) => (
                            <AnimSection key={i} className="feature-card" animation="anim-fade-up" delay={`anim-delay-${i + 1}`}>
                                <div className="feature-icon">{f.icon}</div>
                                <h4>{f.title}</h4>
                                <p>{f.text}</p>
                            </AnimSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ GALLERY ═══════ */}
            <section className="section section-alt">
                <div className="container">
                    <AnimSection className="section-header" animation="anim-fade-up">
                        <span className="overline">Portfolio</span>
                        <h2>Discover The Quality<br />Of Our Work</h2>
                        <div className="divider-line" />
                        <p>We believe every space tells a story. Our comprehensive services ensure your rooms reflect your personality while maximizing functionality.</p>
                    </AnimSection>

                    <div className="gallery-grid">
                        <AnimSection className="gallery-item wide" animation="anim-scale-in" delay="anim-delay-1">
                            <img src="/images/hero-bedroom.png" alt="Bedroom design" />
                            <div className="gallery-overlay">
                                <h4>Modern Bedroom Suite</h4>
                                <p>Warm minimalist design with natural materials</p>
                            </div>
                        </AnimSection>
                        <AnimSection className="gallery-item" animation="anim-scale-in" delay="anim-delay-2">
                            <img src="/images/hero-dining.png" alt="Dining room" />
                            <div className="gallery-overlay">
                                <h4>Dining Room</h4>
                                <p>Elegant earthy tones with brass accents</p>
                            </div>
                        </AnimSection>
                        <AnimSection className="gallery-item" animation="anim-scale-in" delay="anim-delay-3">
                            <img src="/images/hero-bedroom.png" alt="Living space" style={{ objectPosition: 'center 30%' }} />
                            <div className="gallery-overlay">
                                <h4>Living Space</h4>
                                <p>Cozy Scandinavian inspired interior</p>
                            </div>
                        </AnimSection>
                        <AnimSection className="gallery-item" animation="anim-scale-in" delay="anim-delay-4">
                            <img src="/images/hero-dining.png" alt="Kitchen" style={{ objectPosition: 'left center' }} />
                            <div className="gallery-overlay">
                                <h4>Open Kitchen</h4>
                                <p>Contemporary design with woven textures</p>
                            </div>
                        </AnimSection>
                        <AnimSection className="gallery-item wide" animation="anim-scale-in" delay="anim-delay-5">
                            <img src="/images/hero-dining.png" alt="Studio" style={{ objectPosition: 'center 60%' }} />
                            <div className="gallery-overlay">
                                <h4>Luxury Studio Apartment</h4>
                                <p>Full-space redesign with brass accents</p>
                            </div>
                        </AnimSection>
                    </div>
                </div>
            </section>

            {/* ═══════ STYLES ═══════ */}
            <section className="section">
                <div className="container">
                    <AnimSection className="section-header" animation="anim-fade-up">
                        <span className="overline">Curated Aesthetics</span>
                        <h2>Six Design Styles,<br />Infinite Possibilities</h2>
                        <div className="divider-line" />
                    </AnimSection>

                    <div className="features-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                        {styles.map((s, i) => (
                            <AnimSection key={i} className="feature-card" animation="anim-fade-up" delay={`anim-delay-${(i % 3) + 1}`}>
                                <h4>{s.name}</h4>
                                <p>{s.desc}</p>
                            </AnimSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ HOW IT WORKS ═══════ */}
            <section className="section section-alt">
                <div className="container">
                    <AnimSection className="section-header" animation="anim-fade-up">
                        <span className="overline">How It Works</span>
                        <h2>Three Simple Steps<br />To Your Dream Room</h2>
                        <div className="divider-line" />
                    </AnimSection>

                    <div className="how-it-works-grid">
                        {[
                            { step: '01', title: 'Upload Your Room', desc: 'Take a photo of any room in your home and upload it to RoomForge. We support bedrooms, living rooms, kitchens, dining rooms, bathrooms, and home offices.', icon: '📷' },
                            { step: '02', title: 'AI Redesign', desc: 'Choose from 6 curated design styles and let our Stable Diffusion XL AI generate photorealistic redesigns of your room in just seconds.', icon: '✨' },
                            { step: '03', title: '3D Studio', desc: 'Fine-tune every detail in our interactive 3D studio. Browse our categorized product catalog, place furniture, change materials, and create your perfect layout.', icon: '🎨' },
                        ].map((item, i) => (
                            <AnimSection key={i} className="how-step" animation="anim-fade-up" delay={`anim-delay-${i + 1}`}>
                                <div className="how-step-number">{item.step}</div>
                                <div className="how-step-icon">{item.icon}</div>
                                <h4>{item.title}</h4>
                                <p>{item.desc}</p>
                            </AnimSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ PRICING ═══════ */}
            <section className="section">
                <div className="container">
                    <AnimSection className="section-header" animation="anim-fade-up">
                        <span className="overline">Pricing</span>
                        <h2>Simple, Transparent<br />Plans</h2>
                        <div className="divider-line" />
                    </AnimSection>

                    <div className="pricing-grid">
                        <AnimSection className="pricing-card" animation="anim-fade-up" delay="anim-delay-1">
                            <div className="pricing-badge">Free</div>
                            <div className="pricing-price">₹0<span>/month</span></div>
                            <ul className="pricing-features">
                                <li>✓ 5 AI redesigns per day</li>
                                <li>✓ Full 3D Studio access</li>
                                <li>✓ 17+ furniture types</li>
                                <li>✓ Auto-decorate feature</li>
                                <li>✓ Export layout as JSON</li>
                                <li>✗ Priority AI processing</li>
                            </ul>
                            <Link to="/register" className="btn btn-secondary" style={{ width: '100%' }}>Get Started Free</Link>
                        </AnimSection>
                        <AnimSection className="pricing-card featured" animation="anim-fade-up" delay="anim-delay-2">
                            <div className="pricing-badge popular">Most Popular</div>
                            <div className="pricing-price">₹499<span>/month</span></div>
                            <ul className="pricing-features">
                                <li>✓ Unlimited AI redesigns</li>
                                <li>✓ Full 3D Studio access</li>
                                <li>✓ 17+ furniture types</li>
                                <li>✓ Auto-decorate feature</li>
                                <li>✓ Export layout as JSON</li>
                                <li>✓ Priority AI processing</li>
                                <li>✓ HD image exports</li>
                            </ul>
                            <Link to="/register" className="btn btn-olive" style={{ width: '100%' }}>Start Pro Trial</Link>
                        </AnimSection>
                    </div>
                </div>
            </section>

            {/* ═══════ TESTIMONIALS ═══════ */}
            <section className="section section-alt">
                <div className="container">
                    <AnimSection className="section-header" animation="anim-fade-up">
                        <span className="overline">Testimonials</span>
                        <h2>What Our Clients Say</h2>
                        <div className="divider-line" />
                    </AnimSection>

                    <div className="features-grid">
                        {testimonials.map((t, i) => (
                            <AnimSection key={i} className="testimonial-card" animation="anim-fade-up" delay={`anim-delay-${i + 1}`}>
                                <div className="testimonial-quote">"{t.quote}"</div>
                                <div className="testimonial-author">
                                    <div className="testimonial-avatar">{t.initials}</div>
                                    <div>
                                        <div className="testimonial-name">{t.name}</div>
                                        <div className="testimonial-role">{t.role}</div>
                                    </div>
                                </div>
                            </AnimSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ FAQ ═══════ */}
            <section className="section">
                <div className="container">
                    <AnimSection className="section-header" animation="anim-fade-up">
                        <span className="overline">FAQ</span>
                        <h2>Frequently Asked<br />Questions</h2>
                        <div className="divider-line" />
                    </AnimSection>

                    <div className="faq-list">
                        {[
                            { q: 'What is RoomForge AI?', a: 'RoomForge AI is an interior design platform that combines AI-powered room redesigns with a 3D furniture studio. Upload a photo of your room, get AI-generated redesigns in different styles, and fine-tune every detail in our interactive 3D environment.' },
                            { q: 'How does the AI redesign work?', a: 'We use Stable Diffusion XL, a state-of-the-art AI model, to generate photorealistic room transformations. Choose from 6 curated design styles — Modern, Luxury, Boho, Scandinavian, Minimal, and Indian Contemporary — and get results in seconds.' },
                            { q: 'Is the 3D Studio free to use?', a: 'Yes! The 3D Studio with our full product catalog of 17+ furniture types, material customization, room dimension controls, and auto-decorate features is completely free. AI redesigns have a daily credit limit on the free plan.' },
                            { q: 'Can I export my designs?', a: 'Yes, you can export your 3D layouts as JSON files and save multiple layouts per room. Layouts can be loaded and edited anytime from your dashboard.' },
                            { q: 'What room types are supported?', a: 'We support living rooms, bedrooms, dining rooms, kitchens, bathrooms, and home offices. Our AI is trained on a wide variety of interior spaces to provide the best results.' },
                        ].map((item, i) => (
                            <FAQItem key={i} question={item.q} answer={item.a} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ CTA ═══════ */}
            <section className="section section-alt">
                <div className="container">
                    <AnimSection animation="anim-fade-up">
                        <div className="cta-banner">
                            <h2>Ready to Transform<br />Your Space?</h2>
                            <p>Join thousands of homeowners and designers who trust RoomForge AI for their interior vision.</p>
                            <Link to={user ? '/upload' : '/register'} className="btn btn-olive btn-lg">
                                {user ? 'Upload Your Room' : 'Start Designing Free'}
                            </Link>
                        </div>
                    </AnimSection>
                </div>
            </section>

            {/* ═══════ FOOTER ═══════ */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-grid">
                        <div>
                            <div className="footer-brand">RoomForge AI</div>
                            <p style={{ maxWidth: '320px', fontSize: '0.9rem' }}>
                                AI-powered interior design platform combining photorealistic redesigns with an interactive 3D furniture studio.
                            </p>
                        </div>
                        <div>
                            <h5>Platform</h5>
                            <Link to="/upload">Upload Room</Link>
                            <Link to="/studio">3D Studio</Link>
                            <Link to="/dashboard">Dashboard</Link>
                        </div>
                        <div>
                            <h5>Company</h5>
                            <Link to="/about">About Us</Link>
                            <Link to="/contact">Contact</Link>
                            <a>Privacy Policy</a>
                            <a>Terms of Service</a>
                        </div>
                        <div>
                            <h5>Styles</h5>
                            <a>Modern Minimal</a>
                            <a>Luxury Classic</a>
                            <a>Scandinavian</a>
                            <a>Boho Chic</a>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <span>© 2026 RoomForge AI. All rights reserved.</span>
                        <span>Built by The Code Architects ❤️</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
