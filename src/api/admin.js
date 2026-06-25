import api from './client';

export const getAdminDashboard = () => api.get('/admin/dashboard');
export const getVouchers = () => api.get('/admin/vouchers');
export const createVoucher = (data) => api.post('/admin/vouchers', data);
export const updateVoucher = (id, data) => api.put(`/admin/vouchers/${id}`, data);
export const deleteVoucher = (id) => api.delete(`/admin/vouchers/${id}`);
export const getVoucher = (id) => api.get(`/admin/vouchers/${id}`);
export const getPromos = () => api.get('/admin/promos');
export const createPromo = (data) => api.post('/admin/promos', data);
export const updatePromo = (id, data) => api.put(`/admin/promos/${id}`, data);
export const deletePromo = (id) => api.delete(`/admin/promos/${id}`);
export const getPromo = (id) => api.get(`/admin/promos/${id}`);
export const simulateNextDay = () => api.post('/admin/simulate-next-day');
export const processOverdue = () => api.post('/admin/process-overdue');
export const getProducts = () => api.get('/admin/products');
export const toggleDealProduct = (id) => api.put(`/admin/products/${id}/deal`);
