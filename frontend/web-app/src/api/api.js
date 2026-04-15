import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const partnerAPI = {
  search: (searchTerm) => api.post('/partner/search', { search_term: searchTerm }),
  sendRequest: (receiverId) => api.post('/partner/request', { receiver_id: receiverId }),
  getPendingRequests: () => api.get('/partner/requests/pending'),
  acceptRequest: (requestId, anniversaryDate) => api.post(`/partner/accept/${requestId}`, { anniversary_date: anniversaryDate }),
  rejectRequest: (requestId) => api.post(`/partner/reject/${requestId}`),
  getPartnerInfo: () => api.get('/partner/info'),
};

export const chatAPI = {
  getHistory: (limit = 50, offset = 0) => api.get('/chat/history', { params: { limit, offset } }),
  sendMessage: (content) => api.post('/chat/send', { content }),
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
