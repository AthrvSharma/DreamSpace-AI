import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import useToastStore from '../store/toastStore';
import { roomsAPI, redesignAPI } from '../api/client';
import { Send, Wand2, Sparkles, ArrowLeft, Image, Layers, Clock, ChevronDown } from 'lucide-react';

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
    'Add a reading nook with bookshelves',
    'Change to marble countertops',
    'Add accent wall with wallpaper',
    'Make it kid-friendly and colorful',
];

export default function RoomPage() {
    const { id: roomId } = useParams();
    const addToast = useToastStore((s) => s.addToast);
    const qc = useQueryClient();
    const [selectedStyle, setSelectedStyle] = useState('modern');
    const [customPrompt, setCustomPrompt] = useState('');
    const [generating, setGenerating] = useState(false);
    const [compareIdx, setCompareIdx] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    const { data: roomData, isLoading: roomLoading } = useQuery({ queryKey: ['room', roomId], queryFn: () => roomsAPI.get(roomId) });
    const { data: redesignData } = useQuery({ queryKey: ['redesigns', roomId], queryFn: () => redesignAPI.list(roomId) });

    const room = roomData?.room;
    const redesigns = redesignData?.redesigns || [];

    // Auto-scroll to bottom when new redesigns arrive
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [redesigns.length, generating]);

    const handleGenerate = async (promptOverride = '') => {
        const prompt = promptOverride || customPrompt;
        setGenerating(true);
        try {
            await redesignAPI.create(roomId, selectedStyle, prompt);
            addToast(`AI redesign generated!`);
            qc.invalidateQueries({ queryKey: ['redesigns', roomId] });
            setCustomPrompt('');
        } catch (err) { addToast(err.message, 'error'); }
        finally { setGenerating(false); }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleGenerate();
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setCustomPrompt(suggestion);
        setShowSuggestions(false);
        // Auto-generate with the suggestion
        setTimeout(() => handleGenerate(suggestion), 100);
    };

    if (roomLoading) return (
        <div className="room-page"><div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: 160 }}><div className="spinner" /></div></div>
    );
    if (!room) return (
        <div className="room-page"><div className="container"><div className="empty-state"><h3>Room not found</h3></div></div></div>
    );

    const originalSrc = room.originalImageUrl;

    return (
        <div className="room-chat-layout">
            {/* ── Left: Chat Panel ── */}
            <div className="chat-panel">
                {/* Chat Header */}
                <div className="chat-header">
                    <Link to="/dashboard" className="chat-back-btn">
                        <ArrowLeft size={18} />
                    </Link>
                    <div className="chat-header-info">
                        <h3>{room.name || 'Untitled Room'}</h3>
                        <span className="chat-room-type">{room.roomType?.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="chat-header-actions">
                        <Link to={`/studio/${room.id}`} className="btn btn-ghost btn-sm">
                            <Layers size={14} /> 3D Studio
                        </Link>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="chat-messages">
                    {/* Original Image as first message */}
                    <div className="chat-message system-message">
                        <div className="message-avatar system">
                            <Image size={16} />
                        </div>
                        <div className="message-content">
                            <div className="message-label">Original Room Photo</div>
                            <div className="message-image-wrap">
                                <img src={originalSrc} alt="Original room" className="message-image" />
                            </div>
                            <div className="message-meta">
                                Uploaded · {room.roomType?.replace(/_/g, ' ')} · Ready for AI redesign
                            </div>
                        </div>
                    </div>

                    {/* Redesign Results */}
                    {redesigns.slice().reverse().map((r, i) => (
                        <div key={r.id} className="chat-message-group">
                            {/* User prompt message */}
                            <div className="chat-message user-message">
                                <div className="message-content">
                                    <div className="message-bubble user">
                                        <Wand2 size={14} />
                                        <span>
                                            {r.prompt?.length > 100
                                                ? r.prompt.substring(0, 100) + '...'
                                                : r.prompt || `${r.style} style redesign`}
                                        </span>
                                    </div>
                                    <div className="message-meta right">
                                        {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>

                            {/* AI response */}
                            <div className="chat-message ai-message">
                                <div className="message-avatar ai">
                                    <Sparkles size={16} />
                                </div>
                                <div className="message-content">
                                    <div className="message-label">
                                        AI Redesign — {r.style}
                                        <span className="message-badge">{r.style}</span>
                                    </div>
                                    <div
                                        className={`message-image-wrap clickable ${compareIdx === i ? 'comparing' : ''}`}
                                        onClick={() => setCompareIdx(compareIdx === i ? null : i)}
                                    >
                                        <img src={r.imageUrl} alt={`${r.style} redesign`} className="message-image" />
                                        <div className="message-image-overlay">
                                            Click to {compareIdx === i ? 'close' : 'compare'}
                                        </div>
                                    </div>
                                    <div className="message-meta">
                                        <Clock size={12} />
                                        {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {r.method && <span className="method-tag">{r.method.replace(/_/g, ' ')}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Generating indicator */}
                    {generating && (
                        <div className="chat-message ai-message">
                            <div className="message-avatar ai thinking">
                                <Sparkles size={16} />
                            </div>
                            <div className="message-content">
                                <div className="thinking-indicator">
                                    <div className="thinking-dots">
                                        <span /><span /><span />
                                    </div>
                                    <span>AI is redesigning your room...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>

                {/* Prompt Suggestions */}
                {showSuggestions && (
                    <div className="prompt-suggestions">
                        <div className="suggestions-header">
                            <span>✨ Prompt Ideas</span>
                            <button onClick={() => setShowSuggestions(false)}>✕</button>
                        </div>
                        <div className="suggestions-grid">
                            {PROMPT_SUGGESTIONS.map((s, i) => (
                                <button key={i} className="suggestion-chip" onClick={() => handleSuggestionClick(s)}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Style Pills + Input Bar */}
                <div className="chat-input-area">
                    {/* Style selector */}
                    <div className="style-pills">
                        {STYLES.map((s) => (
                            <button
                                key={s.id}
                                className={`style-pill ${selectedStyle === s.id ? 'active' : ''}`}
                                onClick={() => setSelectedStyle(s.id)}
                                style={{ '--pill-color': s.color }}
                            >
                                <span className="pill-emoji">{s.emoji}</span>
                                <span className="pill-name">{s.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="chat-input-row">
                        <button
                            className="suggestions-toggle"
                            onClick={() => setShowSuggestions(v => !v)}
                            title="Prompt suggestions"
                        >
                            <Sparkles size={18} />
                        </button>
                        <input
                            ref={inputRef}
                            className="chat-input"
                            placeholder="Describe what you want... (e.g., add blue sofa, wooden floor)"
                            value={customPrompt}
                            onChange={e => setCustomPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={generating}
                        />
                        <button
                            className="chat-send-btn"
                            onClick={() => handleGenerate()}
                            disabled={generating}
                        >
                            {generating ? (
                                <div className="spinner" style={{ width: 20, height: 20 }} />
                            ) : (
                                <Send size={18} />
                            )}
                        </button>
                    </div>
                    <div className="chat-input-hint">
                        Press Enter to generate · Style: <strong>{STYLES.find(s => s.id === selectedStyle)?.name}</strong>
                        {customPrompt ? ' + custom prompt' : ''}
                    </div>
                </div>
            </div>

            {/* ── Right: Compare Panel ── */}
            <div className="compare-panel">
                {compareIdx !== null && redesigns[redesigns.length - 1 - compareIdx] ? (
                    <>
                        <div className="compare-header">
                            <h4>Compare with Original</h4>
                            <button className="btn btn-ghost btn-sm" onClick={() => setCompareIdx(null)}>Close</button>
                        </div>
                        <div className="compare-slider-wrap">
                            <ReactCompareSlider
                                itemOne={<ReactCompareSliderImage src={originalSrc} alt="Original" />}
                                itemTwo={<ReactCompareSliderImage src={redesigns[redesigns.length - 1 - compareIdx]?.imageUrl} alt="Redesigned" />}
                                style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-lg)' }}
                            />
                        </div>
                        <div className="compare-labels">
                            <span>← Original</span>
                            <span>{redesigns[redesigns.length - 1 - compareIdx]?.style} Redesign →</span>
                        </div>
                    </>
                ) : (
                    <div className="compare-empty">
                        <div className="compare-empty-img">
                            <img src={originalSrc} alt="Original room" />
                        </div>
                        <h4>Your Room</h4>
                        <p>Click any AI redesign to compare it with the original side-by-side.</p>
                        <div className="compare-empty-tips">
                            <div className="tip-item">
                                <Wand2 size={16} />
                                <span>Select a style and type a prompt</span>
                            </div>
                            <div className="tip-item">
                                <Sparkles size={16} />
                                <span>Try prompt suggestions for inspiration</span>
                            </div>
                            <div className="tip-item">
                                <Layers size={16} />
                                <span>Open in 3D Studio for detailed editing</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
