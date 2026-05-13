import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useAuthStore from './store/authStore';
import Navbar from './components/Navbar';
import ToastContainer from './components/ToastContainer';
import GlobalLoader from './components/GlobalLoader';
import CustomCursor from './components/CustomCursor';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import RoomPage from './pages/RoomPage';
import StudioPage from './pages/StudioPage';
import AdminPage from './pages/AdminPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ARPage from './pages/ARPage';
import PricingPage from './pages/PricingPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';

function ProtectedRoute({ children, adminOnly = false }) {
    const { user, loading } = useAuthStore();
    if (loading) return null; // Let the global loader handle this visually
    if (!user) return <Navigate to="/login" />;
    if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
    return children;
}

// Advanced Page Transition Wrapper
const PageTransition = ({ children }) => {
    const location = useLocation();
    
    // Don't animate AR and Studio routes to prevent 3D canvas recreation lag
    if (location.pathname.startsWith('/ar') || location.pathname.startsWith('/studio')) {
        return children;
    }

    return (
        <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -15, filter: 'blur(8px)' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
};

const AnimatedRoutes = () => {
    const location = useLocation();
    
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* Public */}
                <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
                <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
                <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
                <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
                <Route path="/reset-password" element={<PageTransition><ResetPasswordPage /></PageTransition>} />
                <Route path="/verify-email" element={<PageTransition><VerifyEmailPage /></PageTransition>} />
                <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
                <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />

                {/* Protected */}
                <Route path="/dashboard" element={<ProtectedRoute><PageTransition><DashboardPage /></PageTransition></ProtectedRoute>} />
                <Route path="/upload" element={<ProtectedRoute><PageTransition><UploadPage /></PageTransition></ProtectedRoute>} />
                <Route path="/room/:id" element={<ProtectedRoute><PageTransition><RoomPage /></PageTransition></ProtectedRoute>} />
                <Route path="/studio" element={<ProtectedRoute><StudioPage /></ProtectedRoute>} />
                <Route path="/studio/:roomId" element={<ProtectedRoute><StudioPage /></ProtectedRoute>} />
                <Route path="/pricing" element={<ProtectedRoute><PageTransition><PricingPage /></PageTransition></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><PageTransition><NotificationsPage /></PageTransition></ProtectedRoute>}/>
                <Route path="/settings" element={<ProtectedRoute><PageTransition><SettingsPage /></PageTransition></ProtectedRoute>} />
                <Route path="/ar" element={<ProtectedRoute><ARPage /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute adminOnly><PageTransition><AdminPage /></PageTransition></ProtectedRoute>} />
            </Routes>
        </AnimatePresence>
    );
};

export default function App() {
    const checkAuth = useAuthStore((s) => s.checkAuth);
    useEffect(() => { checkAuth(); }, []);

    return (
        <BrowserRouter>
            <CustomCursor />
            <GlobalLoader />
            <Navbar />
            <AnimatedRoutes />
            <ToastContainer />
        </BrowserRouter>
    );
}
