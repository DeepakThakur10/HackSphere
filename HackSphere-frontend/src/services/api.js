import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hacksphere_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const loginRequest = (payload) => api.post('/auth/login', payload);

export const signupRequest = (payload) => api.post('/auth/signup', payload);

export const getProfileRequest = () => api.get('/auth/profile');

export const updateProfileRequest = (payload) => api.put('/auth/profile', payload);

export const getHackathonsRequest = (params) => api.get('/hackathons', { params });

export const getHackathonByIdRequest = (id) => api.get(`/hackathons/${id}`);

export const getOrganizerHackathonsRequest = (params = {}) =>
  api.get('/hackathons/mine', { params });

export const createHackathonRequest = (payload) => api.post('/hackathons', payload);

export const registerForHackathonRequest = ({ hackathonId, teamName }) => api.post('/registrations', { hackathonId, teamName });

export const getRegistrationsRequest = () => api.get('/registrations');

export const uploadImageRequest = (formData) => api.post('/upload/image', formData);

export default api;