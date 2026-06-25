import api from './client';

export const getWallet = () => api.get('/buyer/wallet');
export const topUpWallet = (data) => api.post('/buyer/wallet/topup', data);
export const getTransactions = () => api.get('/buyer/wallet/transactions');
export const getAddresses = () => api.get('/buyer/addresses');
export const createAddress = (data) => api.post('/buyer/addresses', data);
export const updateAddress = (id, data) => api.put(`/buyer/addresses/${id}`, data);
export const deleteAddress = (id) => api.delete(`/buyer/addresses/${id}`);
export const getCart = () => api.get('/buyer/cart');
export const addToCart = (data) => api.post('/buyer/cart/items', data);
export const updateCartItem = (id, data) => api.put(`/buyer/cart/items/${id}`, data);
export const deleteCartItem = (id) => api.delete(`/buyer/cart/items/${id}`);
export const checkoutPreview = (data) => api.post('/buyer/checkout/preview', data);
export const checkout = (data) => api.post('/buyer/checkout', data);
export const getBuyerOrders = () => api.get('/buyer/orders');
export const getBuyerOrder = (id) => api.get(`/buyer/orders/${id}`);
export const getBuyerReport = (params) => api.get('/buyer/report', { params });
