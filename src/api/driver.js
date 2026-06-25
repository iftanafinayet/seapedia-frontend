import api from './client';

export const getAvailableJobs = () => api.get('/driver/jobs');
export const getJobDetail = (id) => api.get(`/driver/jobs/${id}`);
export const takeJob = (id) => api.post(`/driver/jobs/${id}/take`);
export const completeJob = (id) => api.post(`/driver/jobs/${id}/complete`);
export const getDriverEarnings = () => api.get('/driver/earnings');
export const getDriverMyJobs = () => api.get('/driver/my-jobs');
