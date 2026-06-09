import { apiClient } from './apiClient';

export const sanPhamService = {
    getSanPhamById: (id) => apiClient.get(`/api/san-pham/${id}`),
    updateSanPham: (id, data) => apiClient.put(`/api/san-pham/${id}`, data),
    deleteSanPham: (id) => apiClient.delete(`/api/san-pham/${id}`),
    getAllSanPham: () => apiClient.get('/api/san-pham'),
    createSanPham: (data) => apiClient.post('/api/san-pham', data),
    getSanPhamSummary: () => apiClient.get('/api/san-pham/summary'),
    
    // API Tìm kiếm/Lọc sản phẩm chuyên sâu (GET /api/san-pham/search)
    searchSanPham: (params) => apiClient.get('/api/san-pham/search', { params }),
     // Đếm số dòng sản phẩm theo kệ
    countByViTri: (maViTri) =>
        apiClient.get(`/api/san-pham/vi-tri/${maViTri}/count`)
};