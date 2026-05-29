import { apiClient } from './apiClient';

export const donHangService = {
    // GET /api/don-hang/{id} - Lấy chi tiết đơn hàng theo ID
    getDonHangById: (id) => apiClient.get(`/api/don-hang/${id}`),

    // PUT /api/don-hang/{id} - Cập nhật thông tin đơn hàng
    updateDonHang: (id, data) => apiClient.put(`/api/don-hang/${id}`, data),

    // DELETE /api/don-hang/{id} - Xóa đơn hàng
    deleteDonHang: (id) => apiClient.delete(`/api/don-hang/${id}`),

    // GET /api/don-hang - Lấy tất cả danh sách đơn hàng
    getAllDonHang: () => apiClient.get('/api/don-hang'),

    // POST /api/don-hang - Tạo mới đơn hàng
    createDonHang: (data) => apiClient.post('/api/don-hang', data),

    // GET /api/don-hang/summary - Lấy dữ liệu tổng quan/thống kê đơn hàng
    getDonHangSummary: () => apiClient.get('/api/don-hang/summary'),

    // GET /api/don-hang/search - Tìm kiếm hoặc lọc đơn hàng nâng cao
    searchDonHang: (params) => apiClient.get('/api/don-hang/search', { params })
};