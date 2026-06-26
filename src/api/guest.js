import api from './client';

export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const getReviews = () => api.get('/reviews');
export const createReview = (data) => api.post('/reviews', data);
export const getTopRatedProducts = () => api.get('/products/top-rated');
export const getProductReviews = (id) => api.get(`/products/${id}/reviews`);
export const createProductReview = (id, data) => api.post(`/products/${id}/reviews`, data);
export const getStore = (id) => api.get(`/stores/${id}`);
export const getDealsOfTheDay = () => api.get('/deals');
export const getSiteConfig = () => api.get('/site-config');
export const getActiveDiscounts = () => api.get('/active-discounts');
