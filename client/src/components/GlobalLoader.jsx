import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalLoader() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Minimum loading time for aesthetic purposes (shows the beautiful loader)
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.05 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: '#FDFBF7', // var(--c-dark)
                        zIndex: 9999,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                        <div style={{ fontSize: '3rem', color: '#C2A77E', marginBottom: '24px', animation: 'pulse 2s infinite ease-in-out' }}>✦</div>
                        <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2rem', fontWeight: 600, letterSpacing: '1px', margin: 0 }}>DreamSpace</h1>
                        <p style={{ fontFamily: '"DM Sans", sans-serif', color: '#9B9489', letterSpacing: '3px', fontSize: '0.8rem', marginTop: '8px', textTransform: 'uppercase' }}>Studio Engine</p>
                    </motion.div>
                    
                    <div style={{ position: 'absolute', bottom: '40px', width: '200px', height: '2px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                        <motion.div 
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 2.2, ease: "easeInOut" }}
                            style={{ height: '100%', background: '#6B7F5E' }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
