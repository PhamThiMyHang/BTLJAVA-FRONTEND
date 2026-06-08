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
    // QUAN TRỌNG: Backend LichHenRequest yêu cầu maKH, maNV, maDV, thoiGian bắt buộc
    // Nên luôn fetch lịch hẹn gốc trước, rồi merge với fields cần cập nhật
    updateLichHen: (id, data) => apiClient.put(`/api/lich-hen/${id}`, data),

    // DELETE /api/lich-hen/{id} - Xóa lịch hẹn
    deleteLichHen: (id) => apiClient.delete(`/api/lich-hen/${id}`),

    // GET /api/lich-hen/search - Tìm kiếm lịch hẹn
    // Backend trả về Page<LichHenDTO> bọc trong {status, message, data: Page}
    // apiClient interceptor đã bắt .content → trả ra array trực tiếp
    // Nhưng backend BaseController bọc thêm {status, message, data: Page}
    // nên interceptor sẽ thấy data.data = Page → unwrap thành Page object (không phải array)
    // → cần xử lý thêm tại đây
    searchLichHen: async (params) => {
        const res = await apiClient.get('/api/lich-hen/search', { params });
        let items = res.data;
        // Sau khi interceptor chạy: nếu vẫn là Page object có .content
        if (items && !Array.isArray(items) && items.content) {
            items = items.content;
        }
        // Nếu là object đơn lẻ không phải array (edge case)
        if (!Array.isArray(items)) items = [];
        return { ...res, data: items };
    },

    // Hủy lịch hẹn: fetch lịch gốc rồi gửi lại toàn bộ fields với trangThai = DA_HUY
    cancelLichHen: async (maLich) => {
        // Lấy thông tin lịch hẹn hiện tại
        const res = await apiClient.get(`/api/lich-hen/${maLich}`);
        let current = res.data;
        // Unwrap nếu cần (interceptor đã xử lý nhưng object đơn lẻ không bị unwrap)
        if (current && current.data && !Array.isArray(current.data)) {
            current = current.data;
        }
        if (!current || !current.maKH) {
            throw new Error('Không lấy được thông tin lịch hẹn');
        }
        // Build payload đầy đủ với trangThai = DA_HUY
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
};

export default lichHenService;
