import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useToastStore from '../store/toastStore';
import { roomsAPI } from '../api/client';

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
        if (!f || !f.type.startsWith('image/')) { addToast('Please select an image', 'error'); return; }
        setFile(f);
        setPreview(URL.createObjectURL(f));
        if (!name) setName(f.name.split('.')[0].replace(/[-_]/g, ' '));
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
            addToast('Room uploaded successfully!');
            navigate(`/room/${data.room.id}`);
        } catch (err) { addToast(err.message, 'error'); }
        finally { setUploading(false); }
    };

    return (
        <div className="upload-page">
            <div className="container-sm">
                <div className="section-header anim-fade-up">
                    <span className="overline">New Project</span>
                    <h2>Upload Your Room</h2>
                    <div className="divider-line" />
                    <p>Share a photo of your room and let our AI transform it into your dream space.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Drop Zone */}
                    <div
                        className={`upload-zone anim-fade-up anim-delay-1 ${dragover ? 'dragover' : ''}`}
                        onClick={() => inputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
                        onDragLeave={() => setDragover(false)}
                        onDrop={(e) => { e.preventDefault(); setDragover(false); handleFile(e.dataTransfer.files[0]); }}
                    >
                        <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => handleFile(e.target.files[0])} />
                        {preview ? (
                            <div className="upload-preview">
                                <img src={preview} alt="Preview" style={{ width: '100%', borderRadius: 'var(--radius-lg)' }} />
                            </div>
                        ) : (
                            <>
                                <div className="upload-icon">📷</div>
                                <h3>Drop your room photo here</h3>
                                <p>or click to browse · JPG, PNG up to 10MB</p>
                            </>
                        )}
                    </div>

                    {/* Form Fields */}
                    <div className="anim-fade-up anim-delay-2" style={{ marginTop: 'var(--space-xl)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                        <div>
                            <label>Room Name</label>
                            <input className="input" placeholder="E.g. Master Bedroom" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div>
                            <label>Room Type</label>
                            <select className="input" value={roomType} onChange={(e) => setRoomType(e.target.value)}>
                                <option value="living_room">Living Room</option>
                                <option value="bedroom">Bedroom</option>
                                <option value="dining_room">Dining Room</option>
                                <option value="kitchen">Kitchen</option>
                                <option value="bathroom">Bathroom</option>
                                <option value="office">Home Office</option>
                            </select>
                        </div>
                    </div>

                    <div className="anim-fade-up anim-delay-3" style={{ marginTop: 'var(--space-xl)', textAlign: 'center' }}>
                        <button className="btn btn-olive btn-lg" type="submit" disabled={uploading || !file}>
                            {uploading ? 'Uploading...' : '✦ Upload & Begin'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
