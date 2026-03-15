import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';
import Navbar from './components/Navbar';
import ToastContainer from './components/ToastContainer';
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

function ProtectedRoute({ children, adminOnly = false }) {
    const { user, loading } = useAuthStore();
    if (loading) return <div className="flex-center" style={{ height: '80vh' }}><div className="spinner" /></div>;
    if (!user) return <Navigate to="/login" />;
    if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
    return children;
}

export default function App() {
    const checkAuth = useAuthStore((s) => s.checkAuth);
    useEffect(() => { checkAuth(); }, []);

    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
                <Route path="/room/:id" element={<ProtectedRoute><RoomPage /></ProtectedRoute>} />
                <Route path="/studio" element={<ProtectedRoute><StudioPage /></ProtectedRoute>} />
                <Route path="/studio/:roomId" element={<ProtectedRoute><StudioPage /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
            </Routes>
            <ToastContainer />
        </BrowserRouter>
    );
}
