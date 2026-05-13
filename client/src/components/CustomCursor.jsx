import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const updateMousePosition = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseOver = (e) => {
            if (e.target.tagName.toLowerCase() === 'button' || 
                e.target.tagName.toLowerCase() === 'a' || 
                e.target.closest('button') || 
                e.target.closest('a') ||
                e.target.classList.contains('hover-lift')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', updateMousePosition);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    // Only show custom cursor on desktop
    if (typeof window !== 'undefined' && window.innerWidth < 768) return null;

    return (
        <>
            <motion.div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '8px',
                    height: '8px',
                    backgroundColor: 'var(--c-sage)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    zIndex: 999999,
                    mixBlendMode: 'difference'
                }}
                animate={{
                    x: mousePosition.x - 4,
                    y: mousePosition.y - 4,
                    scale: isHovering ? 0 : 1,
                    opacity: isHovering ? 0 : 1
                }}
                transition={{ type: 'tween', ease: 'backOut', duration: 0.1 }}
            />
            <motion.div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '40px',
                    height: '40px',
                    border: '1px solid var(--c-sage)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    zIndex: 999998,
                    mixBlendMode: 'difference'
                }}
                animate={{
                    x: mousePosition.x - 20,
                    y: mousePosition.y - 20,
                    scale: isHovering ? 1.5 : 1,
                    backgroundColor: isHovering ? 'rgba(107, 127, 94, 0.1)' : 'transparent',
                }}
                transition={{ type: 'tween', ease: 'easeOut', duration: 0.15 }}
            />
        </>
    );
}
