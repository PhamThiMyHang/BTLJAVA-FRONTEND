import { apiClient } from './apiClient';

export const khachHangService = {
    getAllKhachHang: () => apiClient.get('/api/khach-hang'),
    getKhachHangById: (id) => apiClient.get(`/api/khach-hang/${id}`),
    createKhachHang: (data) => apiClient.post('/api/khach-hang', data),
    updateKhachHang: (id, data) => apiClient.put(`/api/khach-hang/${id}`, data),
    deleteKhachHang: (id) => apiClient.delete(`/api/khach-hang/${id}`),
    getKhachHangSummary: () => apiClient.get('/api/khach-hang/summary')
};