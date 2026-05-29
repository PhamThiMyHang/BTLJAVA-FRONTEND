import { apiClient } from './apiClient';

export const gioHangService = {
  
  // 1. Tìm kiếm giỏ hàng
  search: async (params) => {
    return await apiClient.get('/api/v1/gio-hang/search', { params });
  },

  // 2. Thêm mới hoặc cập nhật sản phẩm vào giỏ hàng
  save: async (request) => {
    return await apiClient.post('/api/v1/gio-hang', request);
  },

  // 3. Lấy chi tiết một item trong giỏ hàng
  getDetail: async (maGioHang, maSP) => {
    return await apiClient.get('/api/v1/gio-hang/detail', { 
      params: { maGioHang, maSP } 
    });
  },

  // 4. Lấy toàn bộ giỏ hàng của một User
  getByMaUser: async (maUser) => {
    return await apiClient.get(`/api/v1/gio-hang/user/${maUser}`);
  },

  // 5. Tính tổng tiền
  getTongTien: async (maGioHang) => {
    return await apiClient.get(`/api/v1/gio-hang/${maGioHang}/tong-tien`);
  },

  // 6. Xóa sản phẩm khỏi giỏ hàng
  deleteItem: async (maGioHang, maSP) => {
    return await apiClient.delete('/api/v1/gio-hang/detail', { 
      params: { maGioHang, maSP } 
    });
  },

  // 7. Thống kê Dashboard
  getSummary: async () => {
    return await apiClient.get('/api/v1/gio-hang/summary');
  }
};