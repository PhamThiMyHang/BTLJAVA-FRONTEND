import { apiClient } from './apiClient';

export const userService = {
    // --- USER CONTROLLER ---
    getAllUsers: () => apiClient.get('/api/users'),
    getUserById: (id) => apiClient.get(`/api/users/${id}`),
    createUser: (data) => apiClient.post('/api/users', data),
    updateUser: (id, data) => apiClient.put(`/api/users/${id}`, data),
    deleteUser: (id) => apiClient.delete(`/api/users/${id}`),
    getUserSummary: () => apiClient.get('/api/users/summary'),
    searchUsers: (params) => apiClient.get('/api/users/search', { params }),

    // --- ROLE CONTROLLER ---
    getAllRoles: (params) => apiClient.get('/api/roles', { params }),
    getRoleById: (id) => apiClient.get(`/api/roles/${id}`),
    getRoleByName: (roleName) => apiClient.get(`/api/roles/name/${roleName}`),
    createRole: (roleData) => apiClient.post('/api/roles', roleData),
    deleteRole: (id) => apiClient.delete(`/api/roles/${id}`),

    // --- LICH SU DANG NHAP CONTROLLER ---
    getAllLoginHistory: () => apiClient.get('/api/lich-su-dang-nhap'),
    getLoginHistoryById: (id) => apiClient.get(`/api/lich-su-dang-nhap/${id}`),
    createLoginHistory: (data) => apiClient.post('/api/lich-su-dang-nhap', data),
    searchLoginHistory: (params) => apiClient.get('/api/lich-su-dang-nhap/search', { params })
};