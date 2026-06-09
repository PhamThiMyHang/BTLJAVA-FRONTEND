// services/lichHenService.js

import { apiClient } from './apiClient';

/**
 * Trạng thái lịch hẹn — dùng đúng enum backend (TrangThai.java):
 *   PENDING     → Vừa đặt, chờ thanh toán
 *   CONFIRMED   → Đã thanh toán, chờ xác nhận / đã xác nhận
 *   IN_PROGRESS → Đang thực hiện dịch vụ
 *   DONE        → Hoàn thành
 *   CANCEL      → Đã hủy
 */

export const lichHenService = {
    getAllLichHen: () => apiClient.get('/api/lich-hen'),

    getLichHenById: (id) => apiClient.get(`/api/lich-hen/${id}`),

    // POST /api/lich-hen - Tạo lịch hẹn mới
    // Backend sẽ ném lỗi nếu nhân viên trùng giờ (±60 phút)
    createLichHen: (data) => apiClient.post('/api/lich-hen', data),

    // PUT /api/lich-hen/{id} - Cập nhật lịch hẹn
    updateLichHen: (id, data) => apiClient.put(`/api/lich-hen/${id}`, data),

    deleteLichHen: (id) => apiClient.delete(`/api/lich-hen/${id}`),

    // GET /api/lich-hen/search
    searchLichHen: async (params) => {
        const res = await apiClient.get('/api/lich-hen/search', { params });
        let items = res.data;

        if (Array.isArray(items)) {
            return { ...res, data: items };
        }
        if (items && items.data && items.data.content && Array.isArray(items.data.content)) {
            return { ...res, data: items.data.content };
        }
        if (items && items.content && Array.isArray(items.content)) {
            return { ...res, data: items.content };
        }
        if (items && items.data && Array.isArray(items.data)) {
            return { ...res, data: items.data };
        }
        if (items && typeof items === 'object' && items.content && Array.isArray(items.content)) {
            return { ...res, data: items.content };
        }

        return { ...res, data: [] };
    },

    /**
     * Cập nhật trạng thái lịch hẹn (dùng cho CONFIRMED, IN_PROGRESS, DONE).
     * KHÔNG dùng để hủy — dùng cancelLichHen() thay thế.
     * @param {string} trangThaiMoi - 'CONFIRMED' | 'IN_PROGRESS' | 'DONE'
     */
    updateTrangThai: async (maLich, trangThaiMoi) => {
        const res = await apiClient.get(`/api/lich-hen/${maLich}`);
        let current = res.data;
        if (current && current.data && !Array.isArray(current.data) && current.data.maKH) {
            current = current.data;
        }
        if (!current || !current.maKH) {
            throw new Error('Không lấy được thông tin lịch hẹn (maLich=' + maLich + ')');
        }
        const payload = {
            maKH:      current.maKH,
            maPet:     current.maPet  || '',
            maNV:      current.maNV   || '',
            maDV:      current.maDV,
            thoiGian:  current.thoiGian,
            trangThai: trangThaiMoi,
        };
        return apiClient.put(`/api/lich-hen/${maLich}`, payload);
    },

    /**
     * Hủy/xóa lịch hẹn.
     * Dùng DELETE thay vì PUT+trangThai=CANCEL để tránh conflict check nhân viên.
     * Backend kiểm tra trùng giờ ±60 phút ngay cả khi chỉ đổi trạng thái → throw exception.
     * DELETE xóa thẳng record, không qua conflict check.
     */
    cancelLichHen: async (maLich) => {
        return apiClient.delete(`/api/lich-hen/${maLich}`);
    },
};

export default lichHenService;