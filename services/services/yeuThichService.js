import { apiClient } from './apiClient';

const BASE_URL = '/api/v1/yeu-thich';

export const yeuThichService = {
  // Tìm kiếm danh sách (hỗ trợ search params)
  search: (params) => apiClient.get(`${BASE_URL}/search`, { params }),

  // Kiểm tra sản phẩm đã được yêu thích chưa
  exists: (maUser, maSP) => 
    apiClient.get(`${BASE_URL}/exists`, { params: { maUser, maSP } }),

  // Thêm vào danh sách yêu thích
  add: (data) => apiClient.post(`${BASE_URL}`, data),

  // Xóa sản phẩm khỏi danh sách yêu thích (Sử dụng params cho @RequestParam)
  delete: (maUser, maSP) => 
    apiClient.delete(`${BASE_URL}/detail`, { params: { maUser, maSP } }),

  // Lấy danh sách yêu thích của User
  getByUser: (maUser) => apiClient.get(`${BASE_URL}/user/${maUser}`),

  // Lấy danh sách người đã thích sản phẩm
  getLikedUsers: (maSP) => apiClient.get(`${BASE_URL}/product/${maSP}/users`),

  // Lấy số lượng lượt thích của sản phẩm
  count: (maSP) => apiClient.get(`${BASE_URL}/count/${maSP}`)
};

