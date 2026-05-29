import { apiClient } from './apiClient';

export const petService = {
    // --- PET CONTROLLER ---
    getAllPets: () => apiClient.get('/api/pets'),
    createPet: (data) => apiClient.post('/api/pets', data),
    updatePet: (maPet, data) => apiClient.put(`/api/pets/${maPet}`, data),
    deletePet: (maPet) => apiClient.delete(`/api/pets/${maPet}`),
    getPetSummary: () => apiClient.get('/api/pets/summary'),
    searchPets: (params) => apiClient.get('/api/pets/search', { params }),

    // --- PET IMAGE CONTROLLER ---
    getPetImageById: (id) => apiClient.get(`/api/pet-images/${id}`),
    createPetImage: (data) => apiClient.post('/api/pet-images', data),
    updatePetImage: (id, data) => apiClient.put(`/api/pet-images/${id}`, data),
    deletePetImage: (id) => apiClient.delete(`/api/pet-images/${id}`),
    getPetImageSummary: (params) => apiClient.get('/api/pet-images/summary', { params }),

    // --- LICH SU SUC KHOE CONTROLLER ---
    searchLichSuSucKhoe: (params) => apiClient.get('/api/lich-su-suc-khoe/search', { params }),
    createLichSuSucKhoe: (data) => apiClient.post('/api/lich-su-suc-khoe', data),
    deleteLichSuSucKhoe: (id) => apiClient.delete(`/api/lich-su-suc-khoe/${id}`),

    // --- CHUONG CONTROLLER ---
    getAllChuong: () => apiClient.get('/api/chuong'),
    getChuongById: (id) => apiClient.get(`/api/chuong/${id}`),
    createChuong: (data) => apiClient.post('/api/chuong', data),
    updateChuong: (id, data) => apiClient.put(`/api/chuong/${id}`, data),
    deleteChuong: (id) => apiClient.delete(`/api/chuong/${id}`),
    getChuongSummary: () => apiClient.get('/api/chuong/summary'),

    // --- LOAI CHUONG CONTROLLER ---
    getAllLoaiChuong: () => apiClient.get('/api/loai-chuong'),
    getLoaiChuongById: (id) => apiClient.get(`/api/loai-chuong/${id}`),
    createLoaiChuong: (data) => apiClient.post('/api/loai-chuong', data),
    updateLoaiChuong: (id, data) => apiClient.put(`/api/loai-chuong/${id}`, data),
    deleteLoaiChuong: (id) => apiClient.delete(`/api/loai-chuong/${id}`),
    getLoaiChuongSummary: () => apiClient.get('/api/loai-chuong/summary')
};