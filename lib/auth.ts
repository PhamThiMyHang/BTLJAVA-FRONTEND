import { User, mockUsers } from './mock-data';
// Import chuẩn cấu hình apiClient từ dự án của bạn
import { apiClient } from '@/services/apiClient';
const STORAGE_KEY = 'petshop_user';
const USERS_KEY = 'petshop_users';

// Initialize users in localStorage if not exists
export function initializeUsers() {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem(USERS_KEY);
  if (!stored) {
    localStorage.setItem(USERS_KEY, JSON.stringify(mockUsers));
  }
}

// Get all users
export function getAllUsers(): User[] {
  if (typeof window === 'undefined') return mockUsers;
  
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : mockUsers;
}

// Get current logged-in user
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}

// Set current user (login)
export function setCurrentUser(user: User) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}


export async function loginUser(gmailInput: string, passwordInput: string) {
  try {
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gmail: gmailInput, password: passwordInput }),
    });

    const result = await response.json();

    // Nếu backend phản hồi lỗi (401, 403...)
    if (!response.ok) {
      throw new Error(result.message || 'Đăng nhập thất bại!');
    }

    const userDTO = result.data; // Đây là UserDTO từ Spring Boot trả ra

    // Lấy role đầu tiên trong Set<String> roles của UserDTO
    let primaryRole = 'customer';
    if (userDTO.roles && userDTO.roles.length > 0) {
      primaryRole = Array.from(userDTO.roles)[0] as string; 
    }

    // 1. Tạo object user chuẩn hóa và làm sạch chuỗi role để khớp tuyệt đối
    const loggedInUser = {
      id: String(userDTO.userID), // Đồng bộ kiểu chuỗi của mock-data cũ nếu hệ thống yêu cầu
      email: userDTO.gmail,       // Ánh xạ gmail về trường email cho các component cũ đọc
      userID: userDTO.userID,
      username: userDTO.username,
      gmail: userDTO.gmail,
      role: primaryRole.replace(/\r/g, '').toLowerCase().trim(), // Ép về chữ thường (admin, staff, ktv...)
      createdAt: new Date().toISOString()
    };

    // 2. LƯU TRẠNG THÁI ĐĂNG NHẬP: Ghi nhận thông tin user vào LocalStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
    }

    // 3. Trả dữ liệu về cho LoginPage xử lý tiếp bước router.push
    return loggedInUser;
    
  } catch (error: any) {
    throw new Error(error.message || 'Lỗi kết nối máy chủ!');
  }
}

// Register new user
export async function registerUser(userData: any) {
  try {
    const response = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: userData.username,
        gmail: userData.email,
        password: userData.password,
        soDienThoai: userData.phone,
        diaChi: userData.address,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Đăng ký thất bại!');
    }

    return result.data; // Trả về thông tin UserDTO vừa tạo
  } catch (error: any) {
    throw new Error(error.message || 'Lỗi kết nối máy chủ!');
  }
}

// Logout user
export function logoutUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

// Check user role
export function hasRole(requiredRole: string | string[]): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.includes(user.role);
}