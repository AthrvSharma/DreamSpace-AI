const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

async function request(url, options = {}) {
    const token = localStorage.getItem('dreamspace_token');
    const headers = { ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : {};
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}

// ── Auth ──
export const authAPI = {
    register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    googleLogin: (token) => request('/auth/google', { method: 'POST', body: JSON.stringify({ token }) }),
    me: () => request('/auth/me'),
    verifyEmail: (token) => request('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) }),
    resendVerify: () => request('/auth/resend-verify', { method: 'POST', body: JSON.stringify({}) }),
    forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    resetPassword: (token, password) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
    changePassword: (currentPassword, newPassword) => request('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),
};

// ── Rooms ──
export const roomsAPI = {
    create: (formData) => request('/rooms', { method: 'POST', body: formData, headers: {} }),
    list: () => request('/rooms'),
    get: (id) => request(`/rooms/${id}`),
    delete: (id) => request(`/rooms/${id}`, { method: 'DELETE' }),
};

// ── Redesigns ──
export const redesignAPI = {
    create: (roomId, style, customPrompt = '') => request(`/rooms/${roomId}/redesign`, { method: 'POST', body: JSON.stringify({ style, customPrompt }) }),
    list: (roomId) => request(`/rooms/${roomId}/redesigns`),
};

// ── Layouts ──
export const layoutsAPI = {
    save: (roomId, data) => request(`/layouts/${roomId}/layouts`, { method: 'POST', body: JSON.stringify(data) }),
    list: (roomId) => request(`/layouts/${roomId}/layouts`),
    get: (id) => request(`/layouts/detail/${id}`),
    autoDecorate: (roomId, style) => request(`/layouts/${roomId}/auto-decorate`, { method: 'POST', body: JSON.stringify({ style }) }),
};

// ── Assets ──
export const assetsAPI = {
    list: (type) => request(`/assets${type ? `?type=${type}` : ''}`),
};

// ── Poly.pizza 3D Models ──
export const polyAPI = {
    search: (query, limit = 20) => request(`/poly/search?q=${encodeURIComponent(query)}&limit=${limit}`),
};

// ── Gemini AI ──
export const geminiAPI = {
    chat: (history, message, context) => request('/gemini/chat', { method: 'POST', body: JSON.stringify({ history, message, context }) }),
    generateImage: (prompt, negativePrompt, roomId, style) => request('/gemini/generate-image', { method: 'POST', body: JSON.stringify({ prompt, negativePrompt, roomId, style }) }),
    chatHistory: (roomId) => request(`/gemini/chat/history${roomId ? `?roomId=${roomId}` : ''}`),
    clearChatHistory: () => request('/gemini/chat/history', { method: 'DELETE' }),
};

// ── Payment ──
export const paymentAPI = {
    createOrder: (packageId) => request('/payment/create-order', { method: 'POST', body: JSON.stringify({ packageId }) }),
    verify: (data) => request('/payment/verify', { method: 'POST', body: JSON.stringify(data) }),
    getHistory: () => request('/payment/history'),
    getPackages: () => request('/payment/packages'),
};

// ── Export ──
export const exportAPI = {
    generateProposal: (roomId) => request(`/export/proposal/${roomId}`),
    downloadUrl: (filename) => `${API_BASE}/export/download/${filename}`,
};

// ── Notifications ──
export const notificationAPI = {
    list: () => request('/notifications'),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'POST', body: JSON.stringify({}) }),
    markAllRead: () => request('/notifications/read-all', { method: 'POST', body: JSON.stringify({}) }),
    delete: (id) => request(`/notifications/${id}`, { method: 'DELETE' }),
};

// ── General ──
export const generalAPI = {
    getHealth: () => request('/health'),
    contact: (body) => request('/contact', { method: 'POST', body: JSON.stringify(body) }),
};

// ── Admin ──
// ── Contact
export const contactAPI = {
    submit: (body) => request('/contact', { method: 'POST', body: JSON.stringify(body) }),
};

export const adminAPI = {
    users: () => request('/admin/users'),
    stats: () => request('/admin/stats'),
    orders: () => request('/admin/orders'),
    adjustCredits: (userId, amount, reason) => request(`/admin/users/${userId}/credits`, { method: 'POST', body: JSON.stringify({ amount, reason }) }),
    setPlan: (userId, plan) => request(`/admin/users/${userId}/plan`, { method: 'POST', body: JSON.stringify({ plan }) }),
    userDetail: (userId) => request(`/admin/users/${userId}`),
};
