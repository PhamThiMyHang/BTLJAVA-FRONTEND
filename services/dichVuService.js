// app/services/dichVuService.js
import { apiClient } from './apiClient';

export const dichVuService = {
  getAllDichVu: async () => {
    const response = await apiClient.get('/api/v1/dich-vu');
    return response.data;        // apiClient đã xử lý .data và .content
  },

  getDichVuById: async (maDV) => {
    const response = await apiClient.get(`/api/v1/dich-vu/${maDV}`);
    return response.data;
  },

    // POST /api/v1/dich-vu - Tạo mới dịch vụ
    createDichVu: (data) => apiClient.post('/api/v1/dich-vu', data),

    // GET /api/v1/dich-vu/{id} - Lấy chi tiết dịch vụ theo ID
    getDichVuById: (id) => apiClient.get(`/api/v1/dich-vu/${id}`),

    // DELETE /api/v1/dich-vu/{id} - Xóa dịch vụ
    deleteDichVu: (id) => apiClient.delete(`/api/v1/dich-vu/${id}`),

    // GET /api/v1/dich-vu/summary - Lấy dữ liệu tổng quan/thống kê dịch vụ
    getDichVuSummary: () => apiClient.get('/api/v1/dich-vu/summary'),

    // GET /api/v1/dich-vu/search - Tìm kiếm hoặc lọc dịch vụ nâng cao
    searchDichVu: (params) => apiClient.get('/api/v1/dich-vu/search', { params }),

    // GET /api/v1/dich-vu/next-code - Lấy mã dịch vụ gợi ý tiếp theo tự động
    getNextCode: () => apiClient.get('/api/v1/dich-vu/next-code'),

    // GET /api/v1/dich-vu/gia-range - Lấy khoảng giá cao nhất / thấp nhất của dịch vụ
    getGiaRange: () => apiClient.get('/api/v1/dich-vu/gia-range'),

    // GET /api/v1/dich-vu/exists-name - Kiểm tra tên dịch vụ đã tồn tại hay chưa
    checkExistsName: (params) => apiClient.get('/api/v1/dich-vu/exists-name', { params })
};