// app/services/lichHenService.js

import { apiClient } from './apiClient';

export const lichHenService = {
    // GET /api/lich-hen - Lấy tất cả lịch hẹn
    getAllLichHen: () => apiClient.get('/api/lich-hen'),

    // GET /api/lich-hen/{id} - Lấy chi tiết lịch hẹn theo ID
    getLichHenById: (id) => apiClient.get(`/api/lich-hen/${id}`),

    // POST /api/lich-hen - Tạo lịch hẹn mới
    createLichHen: (data) => apiClient.post('/api/lich-hen', data),

    // PUT /api/lich-hen/{id} - Cập nhật lịch hẹn
    updateLichHen: (id, data) => apiClient.put(`/api/lich-hen/${id}`, data),

    // DELETE /api/lich-hen/{id} - Xóa lịch hẹn
    deleteLichHen: (id) => apiClient.delete(`/api/lich-hen/${id}`),

    // GET /api/lich-hen/search - Tìm kiếm lịch hẹn
    searchLichHen: (params) =>
        apiClient.get('/api/lich-hen/search', { params }),


    // =========================
    // THỐNG KÊ DOANH THU
    // =========================

    // Tổng doanh thu toàn cửa hàng
    getTongDoanhThu: () =>
        apiClient.get('/api/lich-hen/tong-doanh-thu'),

    // Doanh thu tất cả nhân viên
    getDoanhThuNhanVien: () =>
        apiClient.get('/api/lich-hen/doanh-thu-nhan-vien'),

    // Doanh thu 1 nhân viên theo mã nhân viên
    getDoanhThuNhanVienByMaNV: (maNV) =>
        apiClient.get(`/api/lich-hen/doanh-thu-nhan-vien/${maNV}`),


    // =========================
    // THỐNG KÊ LỊCH HẸN
    // =========================

    // Tổng số lịch hẹn, số pending, confirmed,...
    getSummary: () =>
        apiClient.get('/api/lich-hen/summary'),

};

export default lichHenService;