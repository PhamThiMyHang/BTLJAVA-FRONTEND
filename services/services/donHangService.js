// services/donHangService.js
import { apiClient } from './apiClient';

export const donHangService = {
  // POST /api/don-hang - Tạo mới đơn hàng
  createDonHang: (data) => apiClient.post('/api/don-hang', data),

  // GET /api/don-hang - Lấy tất cả đơn hàng
  getAllDonHang: () => apiClient.get('/api/don-hang'),

  // GET /api/don-hang/{id} - Lấy chi tiết đơn hàng theo ID
  getDonHangById: (id) => apiClient.get(`/api/don-hang/${id}`),

  // PUT /api/don-hang/{id} - Cập nhật đơn hàng
  updateDonHang: (id, data) => apiClient.put(`/api/don-hang/${id}`, data),

  // DELETE /api/don-hang/{id} - Xóa đơn hàng
  deleteDonHang: (id) => apiClient.delete(`/api/don-hang/${id}`),

  // GET /api/don-hang/summary - Thống kê đơn hàng
  getDonHangSummary: () => apiClient.get('/api/don-hang/summary'),

  // GET /api/don-hang/search - Tìm kiếm đơn hàng
  searchDonHang: (params) => apiClient.get('/api/don-hang/search', { params }),

  // GET /api/don-hang/user/{maUser} - Lấy đơn hàng theo user (thêm mới)
  getDonHangByUser: (maUser) => apiClient.get(`/api/don-hang/user/${maUser}`),
};
