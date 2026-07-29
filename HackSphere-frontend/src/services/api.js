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

export const getOrganizerMetricsRequest = () =>
  api.get('/hackathons/organizer/metrics');

export const createHackathonRequest = (payload) => api.post('/hackathons', payload);

export const updateHackathonRequest = (id, payload) => api.put(`/hackathons/${id}`, payload);

export const updateHackathonStatusRequest = (id, status) => api.patch(`/hackathons/${id}/status`, { status });

export const deleteHackathonRequest = (id) => api.delete(`/hackathons/${id}`);

export const registerForHackathonRequest = ({ hackathonId, teamName, memberEmails, paymentProof }) =>
  api.post('/registrations', { hackathonId, teamName, memberEmails, paymentProof });

export const getRegistrationsRequest = () => api.get('/registrations');

// Organizer Phase 2A API Endpoints
export const getOrganizerRegistrationsRequest = (hackathonId) =>
  api.get(`/registrations/organizer/${hackathonId}`);

export const approveRegistrationRequest = (id) =>
  api.patch(`/registrations/${id}/approve`);

export const rejectRegistrationRequest = (id) =>
  api.patch(`/registrations/${id}/reject`);

// Team API endpoints
export const createTeamRequest = (payload) => api.post('/teams', payload);

export const joinTeamRequest = (payload) => api.post('/teams/join', payload);

export const getTeamByIdRequest = (id) => api.get(`/teams/${id}`);

export const leaveTeamRequest = (id) => api.post(`/teams/${id}/leave`);

export const transferLeaderRequest = ({ id, newLeaderId }) => api.patch(`/teams/${id}/transfer-leader`, { newLeaderId });

export const lockTeamRequest = (id) => api.patch(`/teams/${id}/lock`);

export const deleteTeamRequest = (id) => api.delete(`/teams/${id}`);

// Phase 3B Submission API Endpoints
export const createOrUpdateSubmissionRequest = (payload) => api.post('/submissions', payload);

export const getParticipantSubmissionRequest = (hackathonId) => api.get(`/submissions/mine/${hackathonId}`);

export const getSubmissionByIdRequest = (id) => api.get(`/submissions/${id}`);

// Phase 4 Judge & Review API Endpoints
export const getAvailableJudgesRequest = () => api.get('/judges');

export const getAssignedJudgesRequest = (hackathonId) => api.get(`/judges/hackathon/${hackathonId}`);

export const assignJudgeRequest = (hackathonId, payload) =>
  api.post(`/judges/hackathon/${hackathonId}`, typeof payload === 'string' ? { judgeId: payload } : payload);

export const removeJudgeRequest = (hackathonId, judgeId) => api.delete(`/judges/hackathon/${hackathonId}/${judgeId}`);

export const createOrUpdateReviewRequest = (payload) => api.post('/reviews', payload);

export const getAssignedSubmissionsForJudgeRequest = () => api.get('/reviews/assigned');

export const getReviewBySubmissionRequest = (submissionId) => api.get(`/reviews/submission/${submissionId}`);

// Phase 5 Leaderboard API Endpoints
export const getLeaderboardRequest = (hackathonId) => api.get(`/hackathons/${hackathonId}/leaderboard`);

export const getWinnersRequest = (hackathonId) => api.get(`/hackathons/${hackathonId}/winners`);

// Phase 6 Admin Console API Endpoints
export const getAdminDashboardMetricsRequest = () => api.get('/admin/dashboard');

export const getAdminAuditLogsRequest = () => api.get('/admin/audit-logs');

export const getAdminUsersRequest = (params) => api.get('/admin/users', { params });

export const toggleUserBlockStatusRequest = (userId) => api.patch(`/admin/users/${userId}/block`);

export const updateUserRoleRequest = (userId, role) => api.patch(`/admin/users/${userId}/role`, { role });

export const getAdminHackathonsRequest = () => api.get('/admin/hackathons');

export const adminOverrideHackathonStatusRequest = (hackathonId, status) => api.patch(`/admin/hackathons/${hackathonId}/status`, { status });

export const adminDeleteHackathonRequest = (hackathonId) => api.delete(`/admin/hackathons/${hackathonId}`);

// Real-Time Announcements & Discussions
export const getAnnouncementsRequest = (hackathonId) => api.get(`/announcements/${hackathonId}`);

export const createAnnouncementRequest = (payload) => api.post('/announcements', payload);

export const getDiscussionsRequest = (hackathonId) => api.get(`/discussions/${hackathonId}`);

export const createDiscussionRequest = (payload) => api.post('/discussions', payload);

export const replyDiscussionRequest = (id, payload) => api.post(`/discussions/${id}/reply`, payload);

// Public Organizer Profiles
export const getOrganizerProfileRequest = (organizerId) => api.get(`/users/organizer/${organizerId}`);

// Team Chat
export const getTeamMessagesRequest = (teamId) => api.get(`/teams/${teamId}/messages`);

export const sendTeamMessageRequest = (teamId, payload) => api.post(`/teams/${teamId}/messages`, payload);

export const uploadImageRequest = (formData) =>
  api.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export default api;