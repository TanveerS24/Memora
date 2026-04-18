import axios from 'axios';
import { useStore } from '../store/useStore';

const API_BASE_URL = 'http://localhost:8000/api';
const AUTH_BASE_URL = 'http://localhost:8001';
const PARTNER_BASE_URL = 'http://localhost:8002';
const CHAT_BASE_URL = 'http://localhost:8003';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const authApi = axios.create({
  baseURL: AUTH_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const partnerApi = axios.create({
  baseURL: PARTNER_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const chatApi = axios.create({
  baseURL: CHAT_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const authAPI = {
  register: (data) => authApi.post('/register', data),
  login: (data) => authApi.post('/login', data),
  getMe: () => authApi.get('/me'),
  logout: () => authApi.post('/logout'),
};

export const partnerAPI = {
  search: (searchTerm) => partnerApi.post('/search', { search_term: searchTerm }),
  sendRequest: (receiverId) => partnerApi.post('/request', { receiver_id: receiverId }),
  getPendingRequests: () => partnerApi.get('/requests/pending'),
  acceptRequest: (requestId, anniversaryDate) => partnerApi.post(`/accept/${requestId}`, { anniversary_date: anniversaryDate }),
  rejectRequest: (requestId) => partnerApi.post(`/reject/${requestId}`),
  getPartnerInfo: () => partnerApi.get('/info'),
};

export const chatAPI = {
  getHistory: (limit = 50, offset = 0) => chatApi.get('/history', { params: { limit, offset } }),
  sendMessage: (content) => chatApi.post('/send', { content }),
};

export const memoryAPI = {
  ingest: (data) => api.post('/memory/ingest', data),
  confirm: (memoryId) => api.post('/memory/confirm', { memory_id: memoryId }),
  getTimeline: () => api.get('/memory/timeline'),
  getActiveMemories: () => api.get('/memory/active'),
  getArchivedMemories: () => api.get('/memory/archived'),
  createTimeCapsule: (memoryId, unlockDate) => api.post('/memory/timecapsule', { memory_id: memoryId, unlock_date: unlockDate }),
  getTimeCapsule: (capsuleId) => api.get(`/memory/timecapsule/${capsuleId}`),
  getTimeCapsules: () => api.get('/memory/timecapsules'),
};

export const ragAPI = {
  query: (query, coupleId, mode = 'qa', includeArchived = false) => 
    api.post('/rag/query', { query, couple_id: coupleId, mode, include_archived: includeArchived }),
  loveLetter: (query, coupleId) => api.post('/rag/loveletter', { query, couple_id: coupleId }),
  caption: (query, coupleId) => api.post('/rag/caption', { query, couple_id: coupleId }),
  summary: (query, coupleId) => api.post('/rag/summary', { query, couple_id: coupleId }),
};

export const insightAPI = {
  getTrends: (days = 30) => api.get('/insights/trends', { params: { days } }),
  getEmotions: () => api.get('/insights/emotions'),
  getActivity: (months = 12) => api.get('/insights/activity', { params: { months } }),
  getDashboard: () => api.get('/insights/dashboard'),
};

export const schedulerAPI = {
  getLoveFeed: () => api.get('/scheduler/lovefeed'),
  createReminder: (data) => api.post('/scheduler/reminders', data),
  getReminders: () => api.get('/scheduler/reminders'),
  setAnniversary: (anniversaryDate) => api.post('/scheduler/anniversary', null, { params: { anniversary_date: anniversaryDate } }),
};

export default api;
