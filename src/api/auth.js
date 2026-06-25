import api from './client';

export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);
export const getProfile = () => api.get('/auth/profile');
export const logoutUser = () => api.post('/auth/logout');
export const setActiveRole = (role) => api.post('/auth/active-role', { activeRole: role });
