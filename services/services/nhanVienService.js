import { apiClient } from './apiClient';

export const nhanVienService = {
    // --- NHAN VIEN CONTROLLER ---
    getAllNhanVien: () => apiClient.get('/api/nhan-vien'),
    getNhanVienById: (id) => apiClient.get(`/api/nhan-vien/${id}`),
    createNhanVien: (data) => apiClient.post('/api/nhan-vien', data),
    updateNhanVien: (id, data) => apiClient.put(`/api/nhan-vien/${id}`, data),
    deleteNhanVien: (id) => apiClient.delete(`/api/nhan-vien/${id}`),
    getNhanVienSummary: () => apiClient.get('/api/nhan-vien/summary'),
    searchNhanVien: (params) => apiClient.get('/api/nhan-vien/search', { params }),

    // --- HO SO NHAN VIEN CONTROLLER ---
    getAllHoSo: () => apiClient.get('/api/ho-so-nhan-vien'),
    getHoSoById: (id) => apiClient.get(`/api/ho-so-nhan-vien/${id}`),
    getHoSoByMaNV: (maNV) => apiClient.get(`/api/ho-so-nhan-vien/nhan-vien/${maNV}`),
    createHoSo: (data) => apiClient.post('/api/ho-so-nhan-vien', data),
    updateHoSo: (id, data) => apiClient.put(`/api/ho-so-nhan-vien/${id}`, data),
    deleteHoSo: (id) => apiClient.delete(`/api/ho-so-nhan-vien/${id}`),

    // --- LICH TRUC CONTROLLER ---
    getAllLichTruc: () => apiClient.get('/api/lich-truc'),
    getLichTrucById: (id) => apiClient.get(`/api/lich-truc/${id}`),
    createLichTruc: (data) => apiClient.post('/api/lich-truc', data),
    updateLichTruc: (id, data) => apiClient.put(`/api/lich-truc/${id}`, data),
    deleteLichTruc: (id) => apiClient.delete(`/api/lich-truc/${id}`),
    searchLichTruc: (params) => apiClient.get('/api/lich-truc/search', { params }),

    // --- KPI THUONG PHAT CONTROLLER ---
    getKPIById: (id) => apiClient.get(`/api/kpi-thuong-phat/${id}`),
    createKPI: (data) => apiClient.post('/api/kpi-thuong-phat', data),
    updateKPI: (id, data) => apiClient.put(`/api/kpi-thuong-phat/${id}`, data),
    deleteKPI: (id) => apiClient.delete(`/api/kpi-thuong-phat/${id}`),
    getKPISummary: (thang) => apiClient.get('/api/kpi-thuong-phat/summary', { params: { thang } }),

    // --- CHAM CONG CONTROLLER ---
    getAllChamCong: () => apiClient.get('/api/cham-cong'),
    getChamCongById: (id) => apiClient.get(`/api/cham-cong/${id}`),
    createChamCong: (data) => apiClient.post('/api/cham-cong', data),
    updateChamCong: (id, data) => apiClient.put(`/api/cham-cong/${id}`, data),
    deleteChamCong: (id) => apiClient.delete(`/api/cham-cong/${id}`),
    getChamCongSummary: (params) => apiClient.get('/api/cham-cong/summary', { params })
};