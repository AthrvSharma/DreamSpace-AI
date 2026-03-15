import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';
import { roomsAPI, adminAPI } from '../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function DashboardPage() {
    const user = useAuthStore((s) => s.user);
    const addToast = useToastStore((s) => s.addToast);
    const navigate = useNavigate();
    const qc = useQueryClient();

    const { data, isLoading } = useQuery({ queryKey: ['rooms'], queryFn: roomsAPI.list });
    const deleteMutation = useMutation({
        mutationFn: roomsAPI.delete,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['rooms'] }); addToast('Room deleted'); },
    });

    const rooms = data?.rooms || [];

    return (
        <div className="dashboard">
            <div className="container">
                {/* Header */}
                <div className="dashboard-header anim-fade-up">
                    <div>
                        <h1>My Rooms</h1>
                        <p>Welcome back, {user?.name}. You have {user?.credits || 0} credits remaining today.</p>
                    </div>
                    <Link to="/upload" className="btn btn-primary">
                        + New Room
                    </Link>
                </div>

                {/* Stats */}
                <div className="stats-grid anim-fade-up anim-delay-1">
                    <div className="stat-card">
                        <div className="stat-number">{rooms.length}</div>
                        <div className="stat-label">Rooms</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{rooms.reduce((a, r) => a + (r.Redesigns?.length || r.redesignCount || 0), 0)}</div>
                        <div className="stat-label">Redesigns</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{rooms.reduce((a, r) => a + (r.Layouts?.length || r.layoutCount || 0), 0)}</div>
                        <div className="stat-label">Layouts</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number" style={{ color: 'var(--color-gold)' }}>{user?.credits || 0}</div>
                        <div className="stat-label">Credits Left</div>
                    </div>
                </div>

                {/* Rooms Grid */}
                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>
                ) : rooms.length === 0 ? (
                    <div className="empty-state anim-fade-up anim-delay-2">
                        <div className="empty-icon">🏠</div>
                        <h3>No rooms yet</h3>
                        <p>Upload your first room image to start designing with AI</p>
                        <Link to="/upload" className="btn btn-olive">+ Upload Room</Link>
                    </div>
                ) : (
                    <div className="rooms-grid">
                        {rooms.map((room, i) => (
                            <div key={room.id} className="room-card anim-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
                                <div style={{ overflow: 'hidden' }}>
                                    <img className="room-card-image" src={room.originalImageUrl} alt={room.title} onError={(e) => { e.target.style.background = 'var(--color-beige)'; e.target.style.height = '200px'; }} />
                                </div>
                                <div className="room-card-body">
                                    <h4>{room.title || 'Untitled Room'}</h4>
                                    <p style={{ fontSize: '0.82rem', margin: '4px 0 0' }}>
                                        <span className="badge badge-olive">{room.roomType || 'Room'}</span>
                                    </p>
                                    <div className="room-card-actions">
                                        <Link to={`/room/${room.id}`} className="btn btn-primary btn-sm">View</Link>
                                        <Link to={`/studio/${room.id}`} className="btn btn-secondary btn-sm">3D Studio</Link>
                                        <button className="btn btn-ghost btn-sm" onClick={() => deleteMutation.mutate(room.id)} style={{ color: '#C45B4A' }}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
