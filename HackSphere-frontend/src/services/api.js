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

export const getHackathonsRequest = (params) => api.get('/hackathons', { params });

export const getHackathonByIdRequest = (id) => api.get(`/hackathons/${id}`);

// TODO: no Registration model/controller/route exists on the backend yet.
// This is a placeholder so the UI has a single, real integration point.
// Once a real endpoint exists (e.g. POST /hackathons/:id/register or
// POST /registrations), replace the body below with the actual api.post call
// and remove this simulated rejection.
export const registerForHackathonRequest = () => Promise.reject(new Error('Registration is not available yet. Please check back soon.'));

export default api;