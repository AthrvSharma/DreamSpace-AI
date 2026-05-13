import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useToastStore from '../store/toastStore';
import { roomsAPI } from '../api/client';
import { Upload, Image as ImageIcon, ArrowRight, ArrowLeft, RefreshCw, Layers, Sparkles } from 'lucide-react';

export default function UploadPage() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [name, setName] = useState('');
    const [roomType, setRoomType] = useState('living_room');
    const [uploading, setUploading] = useState(false);
    const [dragover, setDragover] = useState(false);
    const inputRef = useRef();
    const addToast = useToastStore((s) => s.addToast);
    const navigate = useNavigate();

    const handleFile = (f) => {
        if (!f || !f.type.startsWith('image/')) { addToast('Please select a valid image file', 'error'); return; }
        setFile(f);
        setPreview(URL.createObjectURL(f));
        if (!name) setName(f.name.split('.')[0].replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) { addToast('Please select an image first', 'error'); return; }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('title', name || 'Untitled Room');
            formData.append('roomType', roomType);
            const data = await roomsAPI.create(formData);
            addToast('Room uploaded successfully! ✨');
            navigate(`/room/${data.room.id}`);
        } catch (err) { addToast(err.message, 'error'); }
        finally { setUploading(false); }
    };

    return (
        <div className="upload-page page-padding dot-grid" style={{ minHeight: '100vh', position: 'relative' }}>
            {/* Background glow */}
            <div style={{ position: 'absolute', top: '10%', right: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(107, 127, 94, 0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />
            
            <div className="container-small" style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
                <Link to="/dashboard" className="btn-back anim-fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--c-text-muted)', marginBottom: '32px', fontWeight: 600, transition: 'color 0.2s' }}>
                    <ArrowLeft size={16} /> Back to Projects
                </Link>

                <div className="hp-section-header anim-fade-up anim-delay-1" style={{ marginBottom: '48px', textAlign: 'left' }}>
                    <span className="overline" style={{ color: 'var(--c-sage)', fontWeight: 700, letterSpacing: '1px', fontSize: '0.8rem' }}>New Creation</span>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', margin: '8px 0 16px', letterSpacing: '-0.02em', color: 'var(--c-text)' }}>Reimagine Your Space</h2>
                    <p style={{ fontSize: '1.1rem', color: 'var(--c-text-secondary)', maxWidth: '500px', lineHeight: 1.6 }}>Start by uploading a clear photo of your room. For best results, use a wide-angle shot with natural lighting.</p>
                </div>

                <form onSubmit={handleSubmit} className="upload-form">
                    <motion.div
                        className="upload-dropzone"
                        animate={{
                            borderColor: dragover ? 'var(--c-sage)' : 'var(--c-border-light)',
                            backgroundColor: dragover ? 'var(--c-sage-glass)' : 'rgba(255,255,255,0.7)',
                            scale: dragover ? 1.02 : 1
                        }}
                        transition={{ type: 'spring', damping: 20 }}
                        style={{
                            borderStyle: 'dashed',
                            borderWidth: '2px',
                            borderRadius: '32px',
                            minHeight: '360px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            position: 'relative',
                            boxShadow: dragover ? '0 20px 40px rgba(107,127,94,0.1)' : '0 10px 30px rgba(0,0,0,0.02)',
                            backdropFilter: 'blur(12px)'
                        }}
                        onClick={() => !uploading && inputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); !uploading && setDragover(true); }}
                        onDragLeave={() => setDragover(false)}
                        onDrop={(e) => { e.preventDefault(); setDragover(false); !uploading && handleFile(e.dataTransfer.files[0]); }}
                    >
                        <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => handleFile(e.target.files[0])} />
                        
                        <AnimatePresence mode="wait">
                            {preview ? (
                                <motion.div 
                                    key="preview"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="preview-container" 
                                    style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
                                >
                                    <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 40%)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '32px' }}>
                                        <button type="button" className="btn hover-lift" style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: 'var(--c-text)', padding: '12px 24px', borderRadius: 'var(--r-full)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }} onClick={(e) => { e.stopPropagation(); setPreview(null); setFile(null); }}>
                                            <RefreshCw size={16} /> Choose different photo
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="empty"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="dropzone-content" 
                                    style={{ textAlign: 'center', pointerEvents: 'none' }}
                                >
                                    <motion.div 
                                        animate={dragover ? { y: -10 } : { y: 0 }}
                                        style={{ width: '80px', height: '80px', margin: '0 auto 24px', backgroundColor: 'var(--c-sage-glass)', color: 'var(--c-sage)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <ImageIcon size={40} strokeWidth={1.5} />
                                    </motion.div>
                                    <h3 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>Drop your room photo</h3>
                                    <p style={{ color: 'var(--c-text-muted)', fontSize: '1rem', lineHeight: 1.5 }}>
                                        Drag and drop your high-quality image here,<br />or <span style={{ color: 'var(--c-sage)', fontWeight: 600 }}>click to browse</span>.
                                    </p>
                                    <div style={{ marginTop: '24px', display: 'inline-block', padding: '6px 16px', background: 'var(--c-darker)', borderRadius: 'var(--r-full)', fontSize: '0.8rem', color: 'var(--c-text-secondary)', fontWeight: 500, border: '1px solid var(--c-border-light)' }}>
                                        JPG, PNG or WEBP up to 10MB
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    <AnimatePresence>
                        {file && !uploading && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 40 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="upload-metadata-grid"
                                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', overflow: 'hidden' }}
                            >
                                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--c-text)', display: 'flex', alignItems: 'center', gap: '8px' }}><Layers size={16} color="var(--c-sage)" /> Project Name</label>
                                    <input className="input" placeholder="E.g. Cozy Bedroom" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: '16px', borderRadius: '16px', border: '1px solid var(--c-border)', background: '#fff', fontSize: '1rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = 'var(--c-sage)'} onBlur={e => e.target.style.borderColor = 'var(--c-border)'} />
                                </div>
                                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--c-text)', display: 'flex', alignItems: 'center', gap: '8px' }}><Sparkles size={16} color="var(--c-gold)" /> Room Type</label>
                                    <select className="input" value={roomType} onChange={(e) => setRoomType(e.target.value)} style={{ padding: '16px', borderRadius: '16px', border: '1px solid var(--c-border)', background: '#fff', fontSize: '1rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)', outline: 'none', cursor: 'pointer', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = 'var(--c-sage)'} onBlur={e => e.target.style.borderColor = 'var(--c-border)'}>
                                        <option value="living_room">Living Room</option>
                                        <option value="bedroom">Bedroom</option>
                                        <option value="dining_room">Dining Room</option>
                                        <option value="kitchen">Kitchen</option>
                                        <option value="bathroom">Bathroom</option>
                                        <option value="office">Home Office</option>
                                    </select>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="upload-actions anim-fade-up anim-delay-4" style={{ marginTop: '40px' }}>
                        <button className="btn hover-lift" type="submit" disabled={uploading || !file} style={{ width: '100%', padding: '20px', borderRadius: 'var(--r-full)', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: (!file || uploading) ? 'var(--c-border-light)' : 'var(--c-sage)', color: (!file || uploading) ? 'var(--c-text-muted)' : '#fff', cursor: (!file || uploading) ? 'not-allowed' : 'pointer', transition: 'all 0.3s', boxShadow: (!file || uploading) ? 'none' : '0 12px 30px rgba(107, 127, 94, 0.3)' }}>
                            {uploading ? (
                                <><RefreshCw size={22} className="spinner" /> Analyzing Spatial Geometry...</>
                            ) : (
                                <><ArrowRight size={22} /> Initialize AI Engine</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
