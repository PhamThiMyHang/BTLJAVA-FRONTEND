import { apiClient } from './apiClient';

export const viTriSanPhamService = {

    // Lấy tất cả kệ
    getAllViTri: () =>
        apiClient.get('/api/vitri'),

    // Lấy 1 kệ
    getViTriById: (id) =>
        apiClient.get(`/api/vitri/${id}`),

    // Thêm kệ
    createViTri: (data) =>
        apiClient.post('/api/vitri', data),

    // Sửa kệ
    updateViTri: (id, data) =>
        apiClient.put(`/api/vitri/${id}`, data),

    // Xóa kệ
    deleteViTri: (id) =>
        apiClient.delete(`/api/vitri/${id}`)
};