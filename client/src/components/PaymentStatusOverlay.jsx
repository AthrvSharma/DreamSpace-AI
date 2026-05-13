import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useEffect } from 'react';

export default function PaymentStatusOverlay({ status, onClose }) {
    useEffect(() => {
        if (status) {
            const timer = setTimeout(() => {
                onClose();
            }, 3500); // Auto close after 3.5 seconds
            return () => clearTimeout(timer);
        }
    }, [status, onClose]);

    if (!status) return null;

    const isSuccess = status === 'success';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
                exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                transition={{ duration: 0.5 }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(253, 251, 247, 0.85)', // var(--c-dark)
                }}
            >
                <motion.div
                    initial={{ scale: 0.8, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 10, opacity: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                    style={{
                        background: '#fff',
                        padding: '48px 64px',
                        borderRadius: '32px',
                        boxShadow: '0 24px 60px rgba(0,0,0,0.08)',
                        border: '1px solid rgba(0,0,0,0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        maxWidth: '400px',
                    }}
                >
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: isSuccess ? 'var(--c-sage)' : '#C45B4A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '24px',
                            boxShadow: isSuccess ? '0 12px 30px rgba(107,127,94,0.3)' : '0 12px 30px rgba(196,91,74,0.3)',
                        }}
                    >
                        {isSuccess ? <Check size={40} color="#fff" strokeWidth={3} /> : <X size={40} color="#fff" strokeWidth={3} />}
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '8px', color: 'var(--c-text)' }}
                    >
                        {isSuccess ? 'Payment Successful' : 'Payment Failed'}
                    </motion.h2>
                    
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        style={{ color: 'var(--c-text-secondary)', fontSize: '1.05rem', lineHeight: 1.5 }}
                    >
                        {isSuccess ? 'Your credits have been securely added to your account. Time to design!' : 'We could not process your transaction. Please try again or contact support.'}
                    </motion.p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
