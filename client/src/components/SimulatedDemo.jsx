import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer2, Upload, Sparkles, Image as ImageIcon, Box, Smartphone, Play } from 'lucide-react';

export default function SimulatedDemo() {
    const [phase, setPhase] = useState(0); 
    // 0: Start, 1: Uploading, 2: Loading, 3: Slider, 4: Transition to 3D, 5: Drag 3D Furniture, 6: AR Preview, 7: Outro

    useEffect(() => {
        let isMounted = true;

        const runSequence = async () => {
            await new Promise(r => setTimeout(r, 1000));
            if (!isMounted) return;
            setPhase(1); // Upload dropzone hover
            
            await new Promise(r => setTimeout(r, 1500));
            if (!isMounted) return;
            setPhase(2); // Analyzing geometry
            
            await new Promise(r => setTimeout(r, 2000));
            if (!isMounted) return;
            setPhase(3); // Result Slider
            
            await new Promise(r => setTimeout(r, 3500));
            if (!isMounted) return;
            setPhase(4); // 3D Studio Enter
            
            await new Promise(r => setTimeout(r, 1000));
            if (!isMounted) return;
            setPhase(5); // 3D Drag Furniture
            
            await new Promise(r => setTimeout(r, 3000));
            if (!isMounted) return;
            setPhase(6); // AR Preview Mode
            
            await new Promise(r => setTimeout(r, 4000));
            if (!isMounted) return;
            setPhase(7); // Outro
        };

        runSequence();

        return () => { isMounted = false; };
    }, []);

    const cursorVariants = {
        0: { x: '80%', y: '80%', opacity: 0 },
        1: { x: '50%', y: '50%', opacity: 1, scale: 0.9, transition: { duration: 1.5, ease: 'easeInOut' } }, // click upload
        2: { x: '50%', y: '50%', opacity: 0 },
        3: { x: '100%', y: '10%', opacity: 1, transition: { duration: 0.5 } }, // move to 3D button
        4: { x: '100%', y: '10%', scale: 0.9, opacity: 1 }, // click 3D button
        5: { x: '30%', y: '50%', opacity: 1, transition: { duration: 1.5, ease: 'easeInOut' } }, // drag furniture
        6: { x: '50%', y: '90%', opacity: 0 }, // cursor hides for AR
        7: { opacity: 0 }
    };

    return (
        <div style={{ width: '100%', height: '100%', background: '#F8F9FA', position: 'relative', overflow: 'hidden', fontFamily: 'var(--font-sans)', borderRadius: '24px' }}>
            
            {/* Header simulation */}
            <div style={{ height: '60px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', padding: '0 24px', background: '#fff', zIndex: 10, position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', background: 'var(--c-sage)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles size={14} color="#fff" />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#111827' }}>DreamSpace Engine v4</div>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100% - 60px)', padding: '40px', position: 'relative' }}>
                <AnimatePresence mode="wait">
                    
                    {/* PHASE 0-2: Upload & Process */}
                    {phase < 3 && (
                        <motion.div 
                            key="upload"
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.5 }}
                            style={{ width: '100%', maxWidth: '600px', background: '#fff', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', padding: '40px', textAlign: 'center' }}
                        >
                            <h2 style={{ fontSize: '2rem', marginBottom: '8px', color: '#111827' }}>Redesign Your Room</h2>
                            <p style={{ color: '#6B7280', marginBottom: '32px' }}>Upload a photo and let AI do the magic.</p>
                            
                            <motion.div 
                                animate={{
                                    borderColor: phase >= 1 ? 'var(--c-sage)' : '#E5E7EB',
                                    backgroundColor: phase >= 1 ? 'rgba(107, 127, 94, 0.05)' : '#fff'
                                }}
                                style={{ border: '2px dashed #E5E7EB', borderRadius: '16px', height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', position: 'relative', overflow: 'hidden' }}
                            >
                                {phase >= 2 ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', padding: '0 40px' }}>
                                        <Sparkles size={32} color="var(--c-sage)" className="spinner" />
                                        <div style={{ fontWeight: 600, color: 'var(--c-sage)' }}>Analyzing Spatial Geometry...</div>
                                        <div style={{ width: '100%', height: '6px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                                            <motion.div 
                                                initial={{ width: '0%' }}
                                                animate={{ width: '100%' }}
                                                transition={{ duration: 1.8, ease: 'linear' }}
                                                style={{ height: '100%', background: 'var(--c-sage)' }}
                                            />
                                        </div>
                                    </motion.div>
                                ) : (
                                    <>
                                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Upload size={28} color="#9CA3AF" />
                                        </div>
                                        <div style={{ color: '#4B5563', fontWeight: 500 }}>Drop image here</div>
                                    </>
                                )}
                            </motion.div>
                        </motion.div>
                    )}

                    {/* PHASE 3: Result Slider */}
                    {phase === 3 && (
                        <motion.div 
                            key="result"
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.6, type: 'spring', damping: 25 }}
                            style={{ width: '100%', height: '100%', maxWidth: '900px', background: '#fff', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ padding: '24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ background: 'var(--c-sage-glass)', color: 'var(--c-sage)', padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>Luxury Style</div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <motion.div 
                                        animate={phase === 3 ? { scale: [1, 1.05, 1], backgroundColor: ['#6B7F5E', '#5A6B4F', '#6B7F5E'] } : {}}
                                        transition={{ delay: 2.5, duration: 0.5 }}
                                        style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--c-sage)', color: '#fff', fontSize: '0.9rem', fontWeight: 500, display: 'flex', gap: '8px', alignItems: 'center' }}
                                    >
                                        <Box size={16}/> Open 3D Studio
                                    </motion.div>
                                </div>
                            </div>
                            <div style={{ flex: 1, position: 'relative', background: '#111827' }}>
                                <div style={{ position: 'absolute', inset: 0 }}>
                                    <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000&h=600&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="After" />
                                </div>
                                <motion.div 
                                    initial={{ width: '100%' }}
                                    animate={{ width: '35%' }}
                                    transition={{ delay: 0.5, duration: 1.5, ease: 'easeInOut' }}
                                    style={{ position: 'absolute', top: 0, left: 0, bottom: 0, overflow: 'hidden', borderRight: '4px solid #fff' }}
                                >
                                    <img src="https://images.unsplash.com/photo-1598928506311-c55ez637073c?w=1000&h=600&fit=crop" style={{ width: '900px', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)' }} alt="Before" />
                                    <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>Original</div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}

                    {/* PHASE 4 & 5: 3D Studio */}
                    {(phase === 4 || phase === 5) && (
                        <motion.div 
                            key="3dstudio"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6 }}
                            style={{ width: '100%', height: '100%', background: '#E5E7EB', borderRadius: '24px', overflow: 'hidden', display: 'flex', position: 'relative' }}
                        >
                            {/* 3D Grid Background Simulation */}
                            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(#D1D5DB 1px, transparent 1px), linear-gradient(90deg, #D1D5DB 1px, transparent 1px)', backgroundSize: '40px 40px', transform: 'perspective(500px) rotateX(60deg) scale(2) translateY(-100px)', opacity: 0.5 }} />
                            
                            {/* Furniture Sidebar */}
                            <div style={{ width: '250px', background: '#fff', height: '100%', borderRight: '1px solid #D1D5DB', padding: '20px', zIndex: 2 }}>
                                <h4 style={{ marginBottom: '16px', color: '#111827' }}>Assets</h4>
                                <div style={{ background: '#F3F4F6', height: '80px', borderRadius: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>Sofa</div>
                                <div style={{ background: '#F3F4F6', height: '80px', borderRadius: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>Table</div>
                            </div>

                            {/* Dragging Furniture Action */}
                            <motion.div 
                                initial={{ x: -150, y: 0, scale: 0.5, opacity: 0 }}
                                animate={phase === 5 ? { x: 100, y: 100, scale: 1.5, opacity: 1 } : {}}
                                transition={{ duration: 1.5, ease: 'easeInOut' }}
                                style={{ position: 'absolute', top: '20%', left: '30%', zIndex: 10, filter: 'drop-shadow(0 20px 20px rgba(0,0,0,0.3))' }}
                            >
                                {/* Fake 3D Sofa Image */}
                                <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=150&fit=crop" style={{ borderRadius: '12px' }} alt="Sofa" />
                            </motion.div>
                        </motion.div>
                    )}

                    {/* PHASE 6: AR Preview */}
                    {phase === 6 && (
                        <motion.div 
                            key="ar"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ position: 'absolute', inset: 0, background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000&h=600&fit=crop" style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} alt="Background" />
                            
                            {/* Simulated Phone Frame */}
                            <motion.div 
                                initial={{ y: 200, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                style={{ width: '320px', height: '600px', background: '#000', borderRadius: '40px', border: '8px solid #374151', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
                            >
                                <div style={{ position: 'absolute', top: '16px', background: '#fff', color: '#000', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Smartphone size={14}/> AR Mode Active
                                </div>
                                {/* AR Tracking Grid Simulation */}
                                <motion.div 
                                    animate={{ rotateX: [60, 65, 60], y: [0, 10, 0] }}
                                    transition={{ repeat: Infinity, duration: 4 }}
                                    style={{ width: '200px', height: '200px', border: '2px dashed var(--c-sage)', borderRadius: '50%', transform: 'perspective(400px) rotateX(60deg)', position: 'absolute', bottom: '20%' }}
                                />
                                <motion.img 
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 1, type: 'spring', damping: 15 }}
                                    src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=200&fit=crop" 
                                    style={{ width: '150px', height: '150px', borderRadius: '16px', position: 'absolute', bottom: '25%', filter: 'drop-shadow(0 30px 20px rgba(0,0,0,0.5))' }} 
                                />
                            </motion.div>
                        </motion.div>
                    )}

                    {/* PHASE 7: OUTRO */}
                    {phase === 7 && (
                        <motion.div 
                            key="outro"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ position: 'absolute', inset: 0, background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}
                        >
                            <motion.div 
                                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                                style={{ width: '80px', height: '80px', background: 'var(--c-sage)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}
                            >
                                <Sparkles size={40} color="#fff" />
                            </motion.div>
                            <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} style={{ fontSize: '3rem', fontFamily: 'var(--font-display)', color: '#111827', marginBottom: '16px' }}>DreamSpace Engine v4</motion.h1>
                            <motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} style={{ padding: '16px 32px', background: 'var(--c-sage)', color: '#fff', borderRadius: 'var(--r-full)', fontSize: '1.1rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                                Start Designing Free
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Fake Cursor */}
            <motion.div 
                variants={cursorVariants}
                animate={phase.toString()}
                style={{ position: 'absolute', zIndex: 9999, pointerEvents: 'none', top: 0, left: 0 }}
            >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))', transform: 'rotate(-20deg)', fill: '#fff' }}>
                    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                </svg>
                {(phase === 1 || phase === 4) && (
                    <motion.div 
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        style={{ position: 'absolute', top: '2px', left: '2px', width: '20px', height: '20px', borderRadius: '50%', border: '3px solid var(--c-sage)' }}
                    />
                )}
            </motion.div>
        </div>
    );
}
