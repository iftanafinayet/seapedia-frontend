import api from './client';

export const getMyStore = () => api.get('/seller/store');
export const createStore = (data) => api.post('/seller/store', data);
export const updateStore = (data) => api.put('/seller/store', data);
export const getSellerProducts = () => api.get('/seller/products');
export const createProduct = (data) => api.post('/seller/products', data);
export const updateProduct = (id, data) => api.put(`/seller/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/seller/products/${id}`);
export const getSellerOrders = () => api.get('/seller/orders');
export const getSellerOrder = (id) => api.get(`/seller/orders/${id}`);
export const processOrder = (id) => api.put(`/seller/orders/${id}/process`);
export const getSellerReport = (params) => api.get('/seller/report', { params });
