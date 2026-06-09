// services/dichVuService.js
import { apiClient } from './apiClient';

export const dichVuService = {
  // GET /api/v1/dich-vu - Lấy toàn bộ dịch vụ
  getAllDichVu: async () => {
    const response = await apiClient.get('/api/v1/dich-vu');
    return response.data;
  },

  // GET /api/v1/dich-vu/{id} - Lấy chi tiết dịch vụ theo ID
  getDichVuById: async (id) => {
    const response = await apiClient.get(`/api/v1/dich-vu/${id}`);
    return response.data;
  },

  // POST /api/v1/dich-vu - Tạo mới hoặc cập nhật dịch vụ
  createDichVu: (data) => apiClient.post('/api/v1/dich-vu', data),

  // DELETE /api/v1/dich-vu/{id} - Xóa dịch vụ
  deleteDichVu: (id) => apiClient.delete(`/api/v1/dich-vu/${id}`),

  // GET /api/v1/dich-vu/summary - Lấy dữ liệu tổng quan/thống kê
  getDichVuSummary: () => apiClient.get('/api/v1/dich-vu/summary'),

  // GET /api/v1/dich-vu/search - Tìm kiếm / lọc dịch vụ nâng cao
  // params: { keyword, tenDV, giaMin, giaMax, page, size, sortBy, direction }
  searchDichVu: (params) => apiClient.get('/api/v1/dich-vu/search', { params }),

  // GET /api/v1/dich-vu/next-code - Lấy mã dịch vụ gợi ý tiếp theo
  getNextCode: () => apiClient.get('/api/v1/dich-vu/next-code'),

  // GET /api/v1/dich-vu/gia-range?min=...&max=... - Lọc theo khoảng giá
  getByGiaRange: (min = 0, max = 999999999) =>
    apiClient.get('/api/v1/dich-vu/gia-range', { params: { min, max } }),

  // GET /api/v1/dich-vu/exists-name - Kiểm tra tên dịch vụ đã tồn tại chưa
  checkExistsName: (tenDV) =>
    apiClient.get('/api/v1/dich-vu/exists-name', { params: { tenDV } }),
};
