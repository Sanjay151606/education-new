import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unauthorized redirection
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid, unless already on login/register
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.patch('/api/auth/me', data),
};

// Tasks API
export const tasksApi = {
  getAll: () => api.get('/api/tasks'),
  getById: (id) => api.get(`/api/tasks/${id}`),
  create: (data) => api.post('/api/tasks', data),
  update: (id, data) => api.patch(`/api/tasks/${id}`, data),
  delete: (id) => api.delete(`/api/tasks/${id}`),
  breakdown: (id) => api.post(`/api/tasks/${id}/breakdown`),
  addSubtask: (taskId, data) => api.post(`/api/tasks/${taskId}/subtasks`, data),
  updateSubtask: (subtaskId, data) => api.patch(`/api/tasks/subtasks/${subtaskId}`, data),
  deleteSubtask: (subtaskId) => api.delete(`/api/tasks/subtasks/${subtaskId}`),
};

// Study Materials API
export const studyMaterialsApi = {
  getAll: () => api.get('/api/study-materials'),
  getById: (id) => api.get(`/api/study-materials/${id}`),
  simplify: (data) => api.post('/api/study-materials/simplify', data),
  delete: (id) => api.delete(`/api/study-materials/${id}`),
  reviewFlashcard: (cardId, data) => api.patch(`/api/study-materials/flashcards/${cardId}/review`, data),
};

// Focus Sessions API (Task 1)
export const focusSessionsApi = {
  create: (data) => api.post('/api/focus-sessions', data),
  update: (id, data) => api.patch(`/api/focus-sessions/${id}`, data),
  getAll: (limit = 20) => api.get(`/api/focus-sessions?limit=${limit}`),
  getById: (id) => api.get(`/api/focus-sessions/${id}`),
};

// AI Recommendations & Feedback API
export const aiApi = {
  getFocusFeedback: (sessionId) => api.get(`/api/ai/focus-session/${sessionId}/feedback`),
  getRecommendations: () => api.get('/api/ai/recommendations'),
};

// Progress API
export const progressApi = {
  getSummary: (days = 7) => api.get(`/api/progress/summary?days=${days}`),
  getLogs: (limit = 14) => api.get(`/api/progress/logs?limit=${limit}`),
};

// Assessment API (4-Section Assessment Module)
export const assessmentApi = {
  start: () => api.post('/api/assessment/start'),
  getSection: (sessionId, section) => api.get(`/api/assessment/${sessionId}/section/${section}`),
  respond: (sessionId, data) => api.post(`/api/assessment/${sessionId}/respond`, data),
  uploadAudio: (sessionId, formData) =>
    api.post(`/api/assessment/${sessionId}/upload-audio`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  recordTabSwitch: (sessionId, data = { warning_message: 'Tab switch detected' }) =>
    api.post(`/api/assessment/${sessionId}/tab-switch`, data),
  complete: (sessionId) => api.post(`/api/assessment/${sessionId}/complete`),
  getResults: (sessionId) => api.get(`/api/assessment/${sessionId}/results`),
  getHistory: () => api.get('/api/assessment/history'),
};

export default api;


