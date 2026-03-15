const API_BASE = '/api';

async function request(url, options = {}) {
    const token = localStorage.getItem('roomforge_token');
    const headers = { ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}

// Auth
export const authAPI = {
    register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    me: () => request('/auth/me'),
};

// Rooms
export const roomsAPI = {
    create: (formData) => request('/rooms', { method: 'POST', body: formData, headers: {} }),
    list: () => request('/rooms'),
    get: (id) => request(`/rooms/${id}`),
    delete: (id) => request(`/rooms/${id}`, { method: 'DELETE' }),
};

// Redesigns
export const redesignAPI = {
    create: (roomId, style, customPrompt = '') => request(`/rooms/${roomId}/redesign`, { method: 'POST', body: JSON.stringify({ style, customPrompt }) }),
    list: (roomId) => request(`/rooms/${roomId}/redesigns`),
};

// Layouts
export const layoutsAPI = {
    save: (roomId, data) => request(`/layouts/${roomId}/layouts`, { method: 'POST', body: JSON.stringify(data) }),
    list: (roomId) => request(`/layouts/${roomId}/layouts`),
    get: (id) => request(`/layouts/detail/${id}`),
    autoDecorate: (roomId, style) => request(`/layouts/${roomId}/auto-decorate`, { method: 'POST', body: JSON.stringify({ style }) }),
};

// Assets
export const assetsAPI = {
    list: (type) => request(`/assets${type ? `?type=${type}` : ''}`),
};

// Poly.pizza 3D Models
export const polyAPI = {
    search: (query, limit = 20) => request(`/poly/search?q=${encodeURIComponent(query)}&limit=${limit}`),
};

// Admin
export const adminAPI = {
    users: () => request('/admin/users'),
    stats: () => request('/admin/stats'),
};
