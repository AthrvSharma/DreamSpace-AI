import { Link } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';

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

export default function AboutPage() {
    const team = [
        { name: 'The Code Architects', role: 'Development Team', initials: 'CA', desc: 'A passionate team of developers building the future of interior design with AI and 3D technology.' },
    ];

    const techStack = [
        { name: 'React + Three.js', desc: 'Interactive 3D studio with real-time rendering', icon: '⚛️' },
        { name: 'Stable Diffusion XL', desc: 'AI-powered photorealistic room redesigns', icon: '🤖' },
        { name: 'Node.js + Express', desc: 'Robust backend API with authentication', icon: '🚀' },
        { name: 'SQLite + Sequelize', desc: 'Reliable data storage with ORM', icon: '🗄️' },
    ];

    const milestones = [
        { year: '2024', title: 'Concept Born', desc: 'The idea of combining AI redesigns with a 3D furniture studio was conceived.' },
        { year: '2025', title: 'Development Begins', desc: 'Built the core platform with room upload, AI redesign, and 3D studio features.' },
        { year: '2026', title: 'Launch', desc: 'Released with 6 design styles, categorized product catalog, and auto-decorate AI.' },
    ];

    return (
        <div className="about-page">
            {/* Hero */}
            <section className="section" style={{ paddingTop: 140 }}>
                <div className="container">
                    <AnimSection className="section-header">
                        <span className="overline">About Us</span>
                        <h1>Designing the Future<br />of <em style={{ fontStyle: 'italic', color: 'var(--color-olive)' }}>Interior Design</em></h1>
                        <div className="divider-line" />
                        <p>We believe everyone deserves a beautiful living space. RoomForge AI combines cutting-edge artificial intelligence with an intuitive 3D studio to make professional interior design accessible to all.</p>
                    </AnimSection>
                </div>
            </section>

            {/* Mission */}
            <section className="section section-alt">
                <div className="container">
                    <div className="about-mission-grid">
                        <AnimSection animation="anim-fade-up">
                            <span className="overline" style={{ textAlign: 'left' }}>Our Mission</span>
                            <h2>Empowering Creativity Through Technology</h2>
                            <p style={{ fontSize: '1.05rem', lineHeight: 1.8, marginTop: 'var(--space-lg)' }}>
                                RoomForge AI was born from a simple observation: visualizing interior design changes is hard. Our platform bridges the gap between imagination and reality by combining AI-generated photorealistic redesigns with an interactive 3D furniture studio.
                            </p>
                            <p style={{ fontSize: '1.05rem', lineHeight: 1.8, marginTop: 'var(--space-md)' }}>
                                Whether you're a homeowner looking to refresh your space, or a professional designer presenting concepts to clients, RoomForge gives you the tools to bring your vision to life — instantly.
                            </p>
                        </AnimSection>
                        <AnimSection animation="anim-fade-up" delay="anim-delay-2">
                            <div className="about-stats-card">
                                <div className="about-stat">
                                    <span className="about-stat-number">6</span>
                                    <span className="about-stat-label">Design Styles</span>
                                </div>
                                <div className="about-stat">
                                    <span className="about-stat-number">17+</span>
                                    <span className="about-stat-label">Furniture Types</span>
                                </div>
                                <div className="about-stat">
                                    <span className="about-stat-number">AI</span>
                                    <span className="about-stat-label">Powered by SDXL</span>
                                </div>
                                <div className="about-stat">
                                    <span className="about-stat-number">3D</span>
                                    <span className="about-stat-label">Interactive Studio</span>
                                </div>
                            </div>
                        </AnimSection>
                    </div>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="section">
                <div className="container">
                    <AnimSection className="section-header">
                        <span className="overline">Technology</span>
                        <h2>Built With The Best</h2>
                        <div className="divider-line" />
                    </AnimSection>
                    <div className="features-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                        {techStack.map((t, i) => (
                            <AnimSection key={i} className="feature-card" animation="anim-fade-up" delay={`anim-delay-${i + 1}`}>
                                <div className="feature-icon">{t.icon}</div>
                                <h4>{t.name}</h4>
                                <p>{t.desc}</p>
                            </AnimSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="section section-alt">
                <div className="container">
                    <AnimSection className="section-header">
                        <span className="overline">Our Journey</span>
                        <h2>Milestones</h2>
                        <div className="divider-line" />
                    </AnimSection>
                    <div className="about-timeline">
                        {milestones.map((m, i) => (
                            <AnimSection key={i} className="timeline-item" animation="anim-fade-up" delay={`anim-delay-${i + 1}`}>
                                <div className="timeline-year">{m.year}</div>
                                <div className="timeline-content">
                                    <h4>{m.title}</h4>
                                    <p>{m.desc}</p>
                                </div>
                            </AnimSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section">
                <div className="container">
                    <AnimSection>
                        <div className="cta-banner">
                            <h2>Ready to Get Started?</h2>
                            <p>Join us and transform your space with AI-powered design.</p>
                            <Link to="/register" className="btn btn-olive btn-lg">Start Designing Free</Link>
                        </div>
                    </AnimSection>
                </div>
            </section>
        </div>
    );
}
