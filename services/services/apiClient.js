

import axios from 'axios';

export const apiClient = axios.create({
    baseURL: 'http://localhost:8080', // URL gốc của Spring Boot
    withCredentials: true,            // Khớp với allowCredentials(true) ở WebConfig Backend
    headers: {
        'Content-Type': 'application/json'
    }
});

// 🛠️ INTERCEPTOR: Tự động xử lý dữ liệu tập trung trước khi trả về Frontend
apiClient.interceptors.response.use(
    (response) => {
        // Nếu Spring Boot trả về cấu trúc phân trang Page<T> của Spring Data JPA
        if (response.data && response.data.content && Array.isArray(response.data.content)) {
            // Ép phần .data của Axios thành mảng thuần túy từ .content
            response.data = response.data.content;
        }
        // Nếu Spring Boot trả về class Result/Response custom dạng { code, message, data: [...] }
        else if (response.data && response.data.data && Array.isArray(response.data.data)) {
            response.data = response.data.data;
        }
        
        return response;
    },
    (error) => {
        // Xử lý lỗi hệ thống chung (nếu cần)
        return Promise.reject(error);
    }
);

// Hỗ trợ cả kiểu import cũ (không ngoặc nhọn) cho các file khác trong dự án
export default apiClient;