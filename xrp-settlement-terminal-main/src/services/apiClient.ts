
import axios from 'axios';

const API_URL = '/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const auth = {
    register: (data: any) => api.post('/auth/register', data),
    login: (data: any) => api.post('/auth/login', data),
    logout: () => localStorage.removeItem('auth_token'),

    // Quick hackathon auto-login
    loginAsDemo: async () => {
        if (localStorage.getItem('auth_token')) return; // Already logged in

        try {
            console.log(`Attempting to login demo user: demo@cryp.to`);
            // Use the magic backdoor credentials
            const res = await api.post('/auth/login', {
                email: 'demo@cryp.to',
                password: 'demo123'
            });

            if (res.data.token) {
                localStorage.setItem('auth_token', res.data.token);
                window.location.reload();
            }
        } catch (e) {
            console.error("Auto-login failed", e);
        }
    }
};

export const positions = {
    list: () => api.get('/positions'),
    create: (data: any) => api.post('/positions', data),
    close: (id: string) => api.patch(`/positions/${id}/close`),
};

export const transactions = {
    list: () => api.get('/transactions'),
    create: (data: any) => api.post('/transactions', data),
    statement: (month: string) => api.get(`/transactions/statements/${month}`),
};
