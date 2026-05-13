import { useState, useRef, useEffect, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Upload, Zap, Layers, Smartphone, Star, Check, Play, ChevronRight, Camera, Palette, Box, X } from 'lucide-react';
import useAuthStore from '../store/authStore';
import SimulatedDemo from '../components/SimulatedDemo';

function FadeIn({ children, delay = 0, direction = 'up', className = '' }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-40px' });
    const dirs = { up: { y: 30 }, down: { y: -30 }, left: { x: -30 }, right: { x: 30 } };
    return (
        <motion.div ref={ref}
            initial={{ ...dirs[direction], opacity: 0 }}
            animate={inView ? { y: 0, x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
            className={className}>{children}</motion.div>
    );
}

function AnimatedCounter({ target, suffix = '' }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    useEffect(() => {
        if (!inView) return;
        const dur = 2000, start = Date.now();
        const timer = setInterval(() => {
            const p = Math.min((Date.now() - start) / dur, 1);
            setCount(Math.floor(target * (1 - Math.pow(1 - p, 3))));
            if (p >= 1) clearInterval(timer);
        }, 16);
        return () => clearInterval(timer);
    }, [inView, target]);
    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// SVG Logo component for brand consistency
const GoogleLogo = () => (
    <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
);

export default function HomePage() {
    const { user } = useAuthStore();
    const [activeStyle, setActiveStyle] = useState(0);
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isVideoOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isVideoOpen]);

    const features = [
        { icon: <Camera size={24}/>, title: 'Upload Photo', desc: 'Take a photo of any room and upload it in seconds. Our AI analyzes the space instantly.', color: '#6B7F5E' },
        { icon: <Sparkles size={24}/>, title: 'AI Redesign', desc: 'Choose from 6 curated design styles. Get photorealistic renders of your transformed room.', color: '#C8A96E' },
        { icon: <Box size={24}/>, title: '3D Studio', desc: 'Drag and drop real furniture into a 3D replica of your room. Scale, rotate, and customize.', color: '#8B7FC7' },
        { icon: <Smartphone size={24}/>, title: 'AR Preview', desc: 'View your new design through your phone camera. See furniture in your actual space.', color: '#D4915D' },
    ];

    const styles = [
        { name: 'Modern', desc: 'Clean lines & contemporary elegance', img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&h=300&fit=crop' },
        { name: 'Minimal', desc: 'Less is more, serene spaces', img: 'https://images.unsplash.com/photo-1598928506311-c55ez637073c?w=400&h=300&fit=crop' },
        { name: 'Luxury', desc: 'Opulent textures & rich warmth', img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop' },
        { name: 'Boho', desc: 'Warm earth tones & layered textiles', img: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=400&h=300&fit=crop' },
        { name: 'Scandinavian', desc: 'Hygge coziness & natural light', img: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop' },
        { name: 'Indian', desc: 'Vibrant colors & cultural elegance', img: 'https://images.unsplash.com/photo-1582063289852-62e3ba2747f8?w=400&h=300&fit=crop' },
    ];

    const steps = [
        { num: '01', title: 'Upload your room', desc: 'Take a photo of any room. Our AI instantly maps the space, detecting walls, floors, and existing furniture.', icon: <Upload size={28} /> },
        { num: '02', title: 'Choose your style', desc: 'Pick from 6 designer-curated aesthetics. Modern, Minimal, Luxury, Boho, Scandinavian, or Indian Contemporary.', icon: <Palette size={28} /> },
        { num: '03', title: 'Get your design', desc: 'In seconds, receive a photorealistic render of your transformed room. Download, share, or open in 3D Studio.', icon: <Zap size={28} /> },
    ];

    const testimonials = [
        { name: 'Priya Mehta', role: 'Homeowner, Mumbai', quote: 'DreamSpace completely transformed how I think about my living room. The AI understood exactly what I wanted.', rating: 5, avatar: 'https://i.pravatar.cc/80?img=32' },
        { name: 'Arjun Kapoor', role: 'Interior Designer', quote: 'I use this with every client now. We can iterate on designs in minutes instead of days. Game changer.', rating: 5, avatar: 'https://i.pravatar.cc/80?img=12' },
        { name: 'Sneha Reddy', role: 'Real Estate Agent', quote: 'Staged homes sell 73% faster. DreamSpace lets me virtually stage empty properties in seconds.', rating: 5, avatar: 'https://i.pravatar.cc/80?img=25' },
    ];

    return (
        <div className="hp" style={{ overflow: 'hidden' }}>
            {/* ═══ VIDEO MODAL ═══ */}
            {createPortal(
                <AnimatePresence>
                    {isVideoOpen && (
                        <motion.div
                            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
                            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                            style={{ position: 'fixed', inset: 0, zIndex: 9999999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}
                            onClick={() => setIsVideoOpen(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                style={{ position: 'relative', width: '90%', maxWidth: '1000px', aspectRatio: '16/9', background: '#000', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}
                                onClick={e => e.stopPropagation()}
                            >
                                <button 
                                    onClick={() => setIsVideoOpen(false)}
                                    style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111827', cursor: 'pointer' }}
                                >
                                    <X size={20} color="#fff" />
                                </button>
                                
                                {/* Simulated Automated React Demo */}
                                {isVideoOpen && <SimulatedDemo />}
                                
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* ═══ HERO ═══ */}
            <section className="hp-hero" style={{ position: 'relative', paddingTop: '160px', paddingBottom: '120px' }}>
                {/* Background decorative elements */}
                <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(194, 167, 126, 0.08) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(107, 127, 94, 0.06) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />
                
                <div className="container hp-hero-grid" style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '60px', alignItems: 'center' }}>
                    <div className="hp-hero-content">
                        <FadeIn>
                            <div className="hp-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#fff', border: '1px solid var(--c-border)', borderRadius: 'var(--r-full)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--c-text-secondary)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginBottom: '32px' }}>
                                <Sparkles size={14} color="var(--c-gold)" /> 
                                <span style={{ background: 'linear-gradient(90deg, var(--c-gold), var(--c-sage))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DreamSpace Engine v4.0 is live</span>
                            </div>
                        </FadeIn>
                        <FadeIn delay={0.1}>
                            <h1 className="hp-title" style={{ fontSize: 'clamp(3rem, 6vw, 4.8rem)', lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '24px' }}>
                                Reimagine your<br />
                                <span style={{ fontStyle: 'italic', color: 'var(--c-sage)', paddingRight: '8px' }}>space</span>with AI.
                            </h1>
                        </FadeIn>
                        <FadeIn delay={0.2}>
                            <p className="hp-subtitle" style={{ fontSize: '1.15rem', lineHeight: 1.7, color: 'var(--c-text-secondary)', maxWidth: '520px', marginBottom: '40px' }}>
                                Instantly generate stunning, photorealistic interior designs from a single photo. Customize with premium 3D furniture and explore in Augmented Reality.
                            </p>
                        </FadeIn>
                        <FadeIn delay={0.3}>
                            <div className="hp-cta-row" style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '48px' }}>
                                <Link to={user ? "/upload" : "/register"} className="btn btn-sage hover-lift" style={{ padding: '16px 32px', fontSize: '1.05rem', borderRadius: 'var(--r-full)', display: 'inline-flex', gap: '10px', boxShadow: '0 8px 24px rgba(107, 127, 94, 0.25)' }}>
                                    Start Designing Free <ArrowRight size={20} />
                                </Link>
                                <button onClick={() => setIsVideoOpen(true)} className="btn btn-secondary hover-lift" style={{ padding: '16px 32px', fontSize: '1.05rem', borderRadius: 'var(--r-full)', display: 'inline-flex', gap: '10px', backgroundColor: '#fff', border: '1px solid var(--c-border)', cursor: 'pointer' }}>
                                    <Play size={20} fill="currentColor" /> Watch Demo
                                </button>
                            </div>
                            <div className="hp-trust-row" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div className="hp-avatars" style={{ display: 'flex' }}>
                                    {[15,16,17,18,19].map((i, idx) => <img key={i} src={`https://i.pravatar.cc/40?img=${i}`} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #FDFBF7', marginLeft: idx === 0 ? 0 : '-12px', zIndex: 10 - idx }} />)}
                                </div>
                                <div className="hp-trust-text" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <div className="hp-trust-stars" style={{ display: 'flex', gap: '2px' }}>
                                        {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#C8A96E" color="#C8A96E" />)}
                                    </div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--c-text-secondary)' }}>Loved by 12,000+ designers</span>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                    
                    <FadeIn delay={0.4} direction="left" className="hp-hero-visual">
                        <div className="hp-hero-img-wrap" style={{ position: 'relative', borderRadius: '32px', overflow: 'visible' }}>
                            {/* Decorative backing plate */}
                            <div style={{ position: 'absolute', inset: '-16px', border: '1px solid var(--c-border)', borderRadius: '40px', zIndex: 0 }} />
                            <div style={{ position: 'absolute', top: '40px', right: '-30px', bottom: '-20px', left: '40px', backgroundColor: 'var(--c-sage-glass)', borderRadius: '32px', zIndex: 0 }} />
                            
                            <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200&auto=format&fit=crop" alt="DreamSpace Studio" style={{ width: '100%', height: 'auto', borderRadius: '28px', position: 'relative', zIndex: 1, boxShadow: '0 24px 60px rgba(0,0,0,0.12)' }} />
                            
                            {/* Floating UI Card 1 */}
                            <motion.div 
                                animate={{ y: [0, -10, 0] }} 
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                style={{ position: 'absolute', top: '40px', left: '-40px', zIndex: 2, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', padding: '16px', borderRadius: '16px', boxShadow: '0 12px 30px rgba(0,0,0,0.08)', display: 'flex', gap: '12px', alignItems: 'center', border: '1px solid rgba(255,255,255,0.5)' }}
                            >
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--c-sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                    <Check size={20} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)', fontWeight: 600 }}>Style Analysis</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--c-text)', fontWeight: 700 }}>Modern Minimalist</div>
                                </div>
                            </motion.div>

                            {/* Floating UI Card 2 */}
                            <motion.div 
                                animate={{ y: [0, 10, 0] }} 
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                style={{ position: 'absolute', bottom: '60px', right: '-30px', zIndex: 2, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', padding: '12px 20px', borderRadius: '16px', boxShadow: '0 12px 30px rgba(0,0,0,0.08)', display: 'flex', gap: '8px', alignItems: 'center', border: '1px solid rgba(255,255,255,0.5)' }}
                            >
                                <Sparkles size={16} color="var(--c-gold)" />
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--c-text)' }}>Rendered in 4.2s</span>
                            </motion.div>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* ═══ LOGO BAR ═══ */}
            <section className="hp-logos">
                <div className="container">
                    <p className="hp-logos-label">Trusted by teams at</p>
                    <div className="hp-logos-row">
                        <span className="hp-logo-item"><GoogleLogo /> <span style={{fontSize: '1.2rem', fontWeight: 600, color: '#5F6368', letterSpacing: '-0.5px'}}>Google</span></span>
                        <span className="hp-logo-item" style={{fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, fontStyle: 'italic'}}>Airbnb</span>
                        <span className="hp-logo-item" style={{fontFamily: 'Helvetica, sans-serif', fontSize: '1.3rem', fontWeight: 800, color: '#E60023', letterSpacing: '-1px'}}>Pinterest</span>
                        <span className="hp-logo-item" style={{fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 700, color: '#4BA14E'}}>Houzz</span>
                        <span className="hp-logo-item" style={{fontFamily: 'Arial, sans-serif', fontSize: '1.4rem', fontWeight: 900, color: '#0058A3', letterSpacing: '-0.5px'}}>IKEA</span>
                        <span className="hp-logo-item" style={{fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 600, color: '#7E3882'}}>Wayfair</span>
                    </div>
                </div>
            </section>

            {/* ═══ BEFORE / AFTER ═══ */}
            <section className="hp-section">
                <div className="container">
                    <FadeIn className="hp-section-header">
                        <span className="overline">Transformation</span>
                        <h2>See the magic in action</h2>
                        <p>Upload any room photo and get a designer-quality transformation in seconds.</p>
                    </FadeIn>
                    <FadeIn delay={0.1}>
                        <div className="hp-ba-wrap hover-lift" style={{display: 'flex', gap: '16px', borderRadius: '24px', overflow: 'hidden'}}>
                            <div style={{flex: 1, position: 'relative'}}>
                                <img src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800&auto=format&fit=crop" alt="Before" style={{width: '100%', height: '400px', objectFit: 'cover', borderRadius: '16px'}} />
                                <span style={{position: 'absolute', top: 16, left: 16, background: 'rgba(0,0,0,0.5)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', backdropFilter: 'blur(4px)'}}>Before</span>
                            </div>
                            <div style={{flex: 1, position: 'relative'}}>
                                <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop" alt="After" style={{width: '100%', height: '400px', objectFit: 'cover', borderRadius: '16px'}} />
                                <span style={{position: 'absolute', top: 16, left: 16, background: 'var(--c-sage)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem'}}>After (AI Redesign)</span>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* ═══ HOW IT WORKS ═══ */}
            <section className="hp-section hp-section-alt">
                <div className="container">
                    <FadeIn className="hp-section-header">
                        <span className="overline">How It Works</span>
                        <h2>Three simple steps to your dream room</h2>
                    </FadeIn>
                    <div className="hp-steps">
                        {steps.map((s, i) => (
                            <FadeIn key={i} delay={i * 0.15} className="hp-step-card">
                                <div className="hp-step-num">{s.num}</div>
                                <div className="hp-step-icon">{s.icon}</div>
                                <h3>{s.title}</h3>
                                <p>{s.desc}</p>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ FEATURES ═══ */}
            <section className="hp-section">
                <div className="container">
                    <FadeIn className="hp-section-header">
                        <span className="overline">Features</span>
                        <h2>Everything you need for the <em>perfect room</em></h2>
                    </FadeIn>
                    <div className="hp-features-grid">
                        {features.map((f, i) => (
                            <FadeIn key={i} delay={i * 0.1} className="hp-feature-card hover-lift">
                                <div className="hp-feature-icon" style={{ background: `${f.color}12`, color: f.color }}>{f.icon}</div>
                                <h4>{f.title}</h4>
                                <p>{f.desc}</p>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ STYLE GALLERY ═══ */}
            <section className="hp-section hp-section-alt">
                <div className="container">
                    <FadeIn className="hp-section-header">
                        <span className="overline">Design Styles</span>
                        <h2>6 curated aesthetics to choose from</h2>
                    </FadeIn>
                    <div className="hp-gallery-wrap" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px'}}>
                        {styles.map((style, i) => (
                            <FadeIn key={i} delay={i * 0.1}>
                                <div className="hp-style-card hover-lift" style={{position: 'relative', borderRadius: '16px', overflow: 'hidden', height: '240px', cursor: 'pointer'}} onMouseEnter={() => setActiveStyle(i)} onMouseLeave={() => setActiveStyle(0)}>
                                    <img src={style.img} alt={style.name} style={{width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s', transform: activeStyle === i ? 'scale(1.05)' : 'scale(1)'}} />
                                    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)'}} />
                                    <div style={{position: 'absolute', bottom: 20, left: 20, right: 20}}>
                                        <h3 style={{color: 'white', margin: '0 0 4px', fontSize: '1.2rem', fontFamily: 'var(--font-display)'}}>{style.name}</h3>
                                        <p style={{color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.85rem'}}>{style.desc}</p>
                                    </div>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ STATS ═══ */}
            <section className="hp-stats">
                <div className="container">
                    <div className="hp-stats-grid">
                        <div className="hp-stat"><div className="hp-stat-num"><AnimatedCounter target={15000} suffix="+" /></div><div className="hp-stat-label">Rooms Redesigned</div></div>
                        <div className="hp-stat"><div className="hp-stat-num"><AnimatedCounter target={98} suffix="%" /></div><div className="hp-stat-label">Satisfaction Rate</div></div>
                        <div className="hp-stat"><div className="hp-stat-num"><AnimatedCounter target={6} /></div><div className="hp-stat-label">Design Styles</div></div>
                        <div className="hp-stat"><div className="hp-stat-num"><AnimatedCounter target={50} suffix="k+" /></div><div className="hp-stat-label">AI Renders Created</div></div>
                    </div>
                </div>
            </section>

            {/* ═══ TESTIMONIALS ═══ */}
            <section className="hp-section">
                <div className="container">
                    <FadeIn className="hp-section-header">
                        <span className="overline">Testimonials</span>
                        <h2>What our users say</h2>
                    </FadeIn>
                    <div className="hp-testimonials">
                        {testimonials.map((t, i) => (
                            <FadeIn key={i} delay={i * 0.12} className="hp-testimonial-card hover-lift">
                                <div className="hp-test-stars">
                                    {Array(t.rating).fill(0).map((_, j) => <Star key={j} size={14} fill="#C8A96E" color="#C8A96E" />)}
                                </div>
                                <p className="hp-test-quote">"{t.quote}"</p>
                                <div className="hp-test-author">
                                    <img src={t.avatar} alt={t.name} />
                                    <div>
                                        <div className="hp-test-name">{t.name}</div>
                                        <div className="hp-test-role">{t.role}</div>
                                    </div>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ FINAL CTA ═══ */}
            <section className="hp-cta-section">
                <div className="container">
                    <FadeIn className="hp-cta-box">
                        <h2>Ready to transform your space?</h2>
                        <p>Join 12,000+ homeowners, designers, and real estate agents creating beautiful rooms with AI.</p>
                        <div className="hp-cta-buttons">
                            <Link to={user ? "/upload" : "/register"} className="btn btn-sage btn-lg hover-lift">
                                Get Started Free <ArrowRight size={18} />
                            </Link>
                        </div>
                        <div className="hp-cta-note">
                            <Check size={14} /> No credit card required · 5 free redesigns daily
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer className="hp-footer">
                <div className="container">
                    <div className="hp-footer-grid">
                        <div className="hp-footer-brand">
                            <span className="brand-icon">✦</span>
                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.2rem' }}>DreamSpace AI</span>
                            <p>AI-powered interior design platform. Transform any room into your dream space.</p>
                        </div>
                        <div>
                            <h5>Product</h5>
                            <Link to="/upload">Upload Room</Link>
                            <Link to="/studio">3D Studio</Link>
                            <Link to="/ar">AR Preview</Link>
                            <Link to="/pricing">Pricing</Link>
                        </div>
                        <div>
                            <h5>Company</h5>
                            <Link to="/about">About</Link>
                            <Link to="/contact">Contact</Link>
                            <a href="#">Blog</a>
                            <a href="#">Careers</a>
                        </div>
                        <div>
                            <h5>Connect</h5>
                            <a href="#">Twitter</a>
                            <a href="#">Instagram</a>
                            <a href="#">LinkedIn</a>
                            <a href="#">YouTube</a>
                        </div>
                    </div>
                    <div className="hp-footer-bottom">
                        <span>© 2024 DreamSpace AI. All rights reserved.</span>
                        <div className="hp-footer-links">
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
