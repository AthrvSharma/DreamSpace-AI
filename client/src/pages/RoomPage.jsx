import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import useToastStore from '../store/toastStore';
import useAuthStore from '../store/authStore';
import { roomsAPI, redesignAPI, geminiAPI, exportAPI } from '../api/client';
import { Send, Wand2, Sparkles, ArrowLeft, Image, Layers, Clock, ChevronDown, Download, FileText, Trash2, Maximize2, Share2, X } from 'lucide-react';

const STYLES = [
    { id: 'modern', name: 'Modern', emoji: '🏢', color: '#6B7F5E' },
    { id: 'minimal', name: 'Minimal', emoji: '⬜', color: '#9CA3AF' },
    { id: 'luxury', name: 'Luxury', emoji: '✨', color: '#C8A96E' },
    { id: 'boho', name: 'Boho', emoji: '🌿', color: '#D4915D' },
    { id: 'scandinavian', name: 'Scandi', emoji: '🕯️', color: '#B8B0A2' },
    { id: 'indian_contemporary', name: 'Indian', emoji: '🪔', color: '#C8734D' },
];

const PROMPT_SUGGESTIONS = [
    'Add a blue velvet sofa',
    'Make the room brighter with more natural light',
    'Add wooden flooring and warm tones',
    'Place indoor plants and greenery',
    'Add pendant lights and modern fixtures',
    'Make it cozy with warm textiles',
    'Add accent wall with wallpaper',
    'Make it kid-friendly and colorful',
];

export default function RoomPage() {
    const { id: roomId } = useParams();
    const addToast = useToastStore((s) => s.addToast);
    const { user } = useAuthStore();
    const qc = useQueryClient();
    const [selectedStyle, setSelectedStyle] = useState('modern');
    const [customPrompt, setCustomPrompt] = useState('');
    const [generating, setGenerating] = useState(false);
    const [chatting, setChatting] = useState(false);
    const [compareIdx, setCompareIdx] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    const { data: roomData, isLoading: roomLoading } = useQuery({ queryKey: ['room', roomId], queryFn: () => roomsAPI.get(roomId) });
    const { data: redesignData } = useQuery({ queryKey: ['redesigns', roomId], queryFn: () => redesignAPI.list(roomId) });

    const room = roomData?.room;
    const redesigns = redesignData?.redesigns || [];
    const originalSrc = room?.originalImageUrl || '';

    const handleExportPDF = async () => {
        try {
            addToast('Generating PDF proposal...', 'info');
            const data = await exportAPI.generateProposal(roomId);
            // Handle relative URL from backend
            const fullUrl = data.url.startsWith('http') ? data.url : `/api${data.url}`;
            window.open(fullUrl, '_blank');
            addToast('PDF proposal generated!', 'success');
        } catch (err) {
            addToast('Failed to generate PDF', 'error');
        }
    };

    const handleDownloadImage = (url, filename) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'dreamspace-redesign.jpg';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Auto-scroll to bottom
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [redesigns.length, chatHistory.length, generating, chatting]);

    const handleChat = async () => {
        if (!customPrompt.trim()) return;
        const msgText = customPrompt.trim();
        setCustomPrompt('');
        
        const newHistory = [...chatHistory, { id: Date.now().toString(), type: 'chat', role: 'user', text: msgText, createdAt: new Date().toISOString() }];
        setChatHistory(newHistory);
        setChatting(true);
        
        try {
            const context = `Room name: ${room.name}, type: ${room.roomType}`;
            const historyForApi = newHistory.filter(m => m.type === 'chat').slice(0, -1).map(m => ({
                role: m.role === 'ai' ? 'assistant' : m.role,
                text: m.text
            }));
            const response = await geminiAPI.chat(historyForApi, msgText, context);
            
            setChatHistory(prev => [...prev, {
                id: Date.now().toString(),
                type: 'chat',
                role: 'ai',
                text: response.reply,
                createdAt: new Date().toISOString()
            }]);

            // Update user credits in local store
            if (response.creditsRemaining !== undefined && user) {
                useAuthStore.getState().setAuth({ ...user, credits: response.creditsRemaining }, localStorage.getItem('dreamspace_token'));
            }
        } catch (err) {
            addToast('Chat failed: ' + (err.message || 'Unknown error'), 'error');
            // Remove the failed user message
            setChatHistory(prev => prev.slice(0, -1));
        } finally {
            setChatting(false);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await redesignAPI.create(roomId, selectedStyle, customPrompt);
            qc.invalidateQueries(['redesigns', roomId]);
            addToast('Redesign generated successfully! ✨');
            setCustomPrompt('');
            
            // Update user credits in local store
            if (res.creditsRemaining !== undefined && user) {
                useAuthStore.getState().setAuth({ ...user, credits: res.creditsRemaining }, localStorage.getItem('dreamspace_token'));
            }
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setGenerating(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleChat();
        }
    };

    const handleSuggestionClick = (s) => {
        setCustomPrompt(s);
        setShowSuggestions(false);
        if (inputRef.current) inputRef.current.focus();
    };

    // Interleave chat messages and redesigns by date
    const timeline = useMemo(() => {
        const items = [
            ...chatHistory.map(m => ({ ...m, sortDate: new Date(m.createdAt) })),
            ...redesigns.map(r => ({ ...r, type: 'redesign', sortDate: new Date(r.createdAt) }))
        ];
        return items.sort((a, b) => a.sortDate - b.sortDate);
    }, [chatHistory, redesigns]);

    if (roomLoading) return <div className="page-loading"><div className="spinner" /></div>;
    if (!room) return <div className="page-error">Room not found</div>;

    return (
        <div className="room-page-layout">
            {/* ── Left: Main Chat Area ── */}
            <div className="chat-area glass-blur">
                {/* Header */}
                <div className="chat-top-nav">
                    <Link to="/dashboard" className="btn-icon"><ArrowLeft size={18} /></Link>
                    <div className="chat-title-wrap">
                        <h3>{room.title || 'Untitled Project'}</h3>
                        <div className="chat-subtitle">
                            <span className="badge-mini">{room.roomType?.replace('_', ' ')}</span>
                            <span className="dot" />
                            <span>{redesigns.length} Versions</span>
                        </div>
                    </div>
                    <div className="chat-header-actions">
                        <button className="btn btn-secondary btn-sm" onClick={handleExportPDF}>
                            <FileText size={14} /> Proposal
                        </button>
                        <Link to={`/studio/${room.id}`} className="btn btn-sage btn-sm">
                            <Layers size={14} /> Studio
                        </Link>
                    </div>
                </div>

                {/* Messages Timeline */}
                <div className="chat-scroll-view">
                    {/* Original Photo Message */}
                    <div className="timeline-message system">
                        <div className="msg-avatar"><Image size={16} /></div>
                        <div className="msg-content">
                            <div className="msg-label">Original Vision</div>
                            <div className="msg-image-card">
                                <img src={originalSrc} alt="Original" />
                                <div className="msg-image-actions">
                                    <button onClick={() => handleDownloadImage(originalSrc, 'original.jpg')}><Download size={16} /></button>
                                </div>
                            </div>
                            <div className="msg-time">{new Date(room.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                    </div>

                    {timeline.map((item, idx) => (
                        <div key={item.id || idx} className={`timeline-message ${item.role || 'ai'}`}>
                            <div className="msg-avatar">
                                {item.role === 'user' ? <UserIcon size={16} /> : <Sparkles size={16} />}
                            </div>
                            <div className="msg-content">
                                <div className="msg-label">{item.role === 'user' ? 'You' : 'DreamSpace AI'}</div>
                                {item.type === 'chat' ? (
                                    <div className={`msg-bubble ${item.role}`}>
                                        {item.text}
                                    </div>
                                ) : (
                                    <div className="msg-redesign-card glass-bg">
                                        <div className="redesign-img-wrap">
                                            <img src={item.imageUrl} alt={item.style} />
                                            <div className="redesign-overlay">
                                                <button className="btn-icon-white" onClick={() => setCompareIdx(item.id)}><Maximize2 size={18} /></button>
                                                <button className="btn-icon-white" onClick={() => handleDownloadImage(item.imageUrl)}><Download size={18} /></button>
                                            </div>
                                        </div>
                                        <div className="redesign-details">
                                            <span className="style-tag" style={{ background: STYLES.find(s => s.id === item.style)?.color }}>{item.style}</span>
                                            {item.prompt && <p className="redesign-prompt">"{item.prompt}"</p>}
                                        </div>
                                    </div>
                                )}
                                <div className="msg-time">{item.sortDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                        </div>
                    ))}

                    {generating && (
                        <div className="timeline-message ai thinking">
                            <div className="msg-avatar"><Sparkles size={16} /></div>
                            <div className="msg-content">
                                <div className="thinking-box">
                                    <div className="typing-dots"><span/><span/><span/></div>
                                    <span>Reimagining your space...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Controls */}
                <div className="chat-controls-wrap">
                    <div className="style-selector-row">
                        {STYLES.map(s => (
                            <button key={s.id} className={`style-chip ${selectedStyle === s.id ? 'active' : ''}`} onClick={() => setSelectedStyle(s.id)}>
                                {s.emoji} {s.name}
                            </button>
                        ))}
                    </div>

                    <div className="chat-input-container glass-bg">
                        <button className="tool-btn" onClick={() => setShowSuggestions(!showSuggestions)} title="AI Suggestions">
                            <Sparkles size={18} />
                        </button>
                        <textarea
                            ref={inputRef}
                            className="chat-textarea"
                            placeholder="Describe changes or ask for advice..."
                            value={customPrompt}
                            onChange={e => setCustomPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                        />
                        <div className="input-actions">
                            <button className="btn-send-chat" onClick={handleChat} disabled={!customPrompt.trim() || chatting} title="Chat">
                                <Send size={18} />
                            </button>
                            <button className="btn-generate-main" onClick={handleGenerate} disabled={generating} title="Generate Design">
                                {generating ? <div className="spinner-mini" /> : <><Wand2 size={16} /><span>Redesign</span></>}
                            </button>
                        </div>
                    </div>

                    {showSuggestions && (
                        <div className="suggestions-popover glass-bg anim-fade-up">
                            <div className="popover-header">
                                <span>✨ Quick Ideas</span>
                                <button onClick={() => setShowSuggestions(false)}><X size={14}/></button>
                            </div>
                            <div className="suggestions-grid">
                                {PROMPT_SUGGESTIONS.map((s, i) => (
                                    <button key={i} className="suggestion-item" onClick={() => handleSuggestionClick(s)}>{s}</button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Right: Preview / Compare Panel ── */}
            <div className="preview-panel">
                {compareIdx ? (
                    (() => {
                        const r = redesigns.find(rd => rd.id === compareIdx);
                        return (
                            <div className="compare-view-container anim-fade-in">
                                <div className="compare-view-header">
                                    <h4>Before & After</h4>
                                    <button className="btn-close-preview" onClick={() => setCompareIdx(null)}><X size={20}/></button>
                                </div>
                                <div className="slider-wrapper">
                                    <ReactCompareSlider
                                        itemOne={<ReactCompareSliderImage src={originalSrc} alt="Before" />}
                                        itemTwo={<ReactCompareSliderImage src={r.imageUrl} alt="After" />}
                                        style={{ width: '100%', height: '100%', borderRadius: 16 }}
                                    />
                                </div>
                                <div className="compare-info glass-bg">
                                    <div className="info-group">
                                        <span className="label">Style</span>
                                        <span className="val">{r.style}</span>
                                    </div>
                                    <div className="info-actions">
                                        <button className="btn btn-secondary btn-sm" onClick={() => handleDownloadImage(r.imageUrl)}>Download Result</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })()
                ) : (
                    <div className="empty-preview">
                        <div className="empty-preview-content">
                            <div className="icon-circle"><Maximize2 size={32} /></div>
                            <h3>Compare Designs</h3>
                            <p>Select any redesign from the chat to see a high-resolution side-by-side comparison with your original photo.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function UserIcon({ size }) {
    return (
        <div style={{ width: size, height: size, background: 'var(--c-sage)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.6rem', fontWeight: 700 }}>
            U
        </div>
    );
}
