// services/lichHenService.js

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
    searchLichHen: async (params) => {
        const res = await apiClient.get('/api/lich-hen/search', { params });

        let items = res.data;

        if (items && !Array.isArray(items) && items.content) {
            items = items.content;
        }

        if (!Array.isArray(items)) {
            items = [];
        }

        return {
            ...res,
            data: items,
        };
    },

    // Cập nhật trạng thái lịch hẹn
    updateTrangThai: async (maLich, trangThaiMoi) => {
        const res = await apiClient.get(`/api/lich-hen/${maLich}`);

        let current = res.data;

        if (current && current.data && !Array.isArray(current.data)) {
            current = current.data;
        }

        if (!current || !current.maKH) {
            throw new Error('Không lấy được thông tin lịch hẹn');
        }

        const payload = {
            maKH: current.maKH,
            maPet: current.maPet || '',
            maNV: current.maNV || '',
            maDV: current.maDV,
            thoiGian: current.thoiGian,
            trangThai: trangThaiMoi,
        };

        return apiClient.put(`/api/lich-hen/${maLich}`, payload);
    },

    // Hủy lịch hẹn
    cancelLichHen: async (maLich) => {
        const res = await apiClient.get(`/api/lich-hen/${maLich}`);

        let current = res.data;

        if (current && current.data && !Array.isArray(current.data)) {
            current = current.data;
        }

        if (!current || !current.maKH) {
            throw new Error('Không lấy được thông tin lịch hẹn');
        }

        const payload = {
            maKH: current.maKH,
            maPet: current.maPet || '',
            maNV: current.maNV || '',
            maDV: current.maDV,
            thoiGian: current.thoiGian,
            trangThai: 'DA_HUY',
        };

        return apiClient.put(`/api/lich-hen/${maLich}`, payload);
    },

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
        apiClient.get(`/api/lich-hen/doanh-thu-nhan-vien/${maNV}`)
};

export default lichHenService;