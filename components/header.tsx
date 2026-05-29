'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getCurrentUser, logoutUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Menu, X, ShoppingCart, LogOut } from 'lucide-react';
import { gioHangService } from '@/services/gioHangService';

interface UserDTO {
  userID: number;
  username: string;
  gmail: string;
  role: string;
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserDTO | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Hàm gọi API lấy số lượng giỏ hàng thật từ database
  const fetchCartCount = async (user: UserDTO | null) => {
    if (user && user.userID) {
      try {
        const response = await gioHangService.getByMaUser(String(user.userID));
        const cartItems = response.data || [];
        setCartCount(cartItems.length); // Đếm số lượng từ API thật
      } catch (error) {
        console.error("Lỗi lấy giỏ hàng từ API:", error);
        setCartCount(0);
      }
    } else {
      setCartCount(0);
    }
  };

  useEffect(() => {
    setMounted(true);
    const user = getCurrentUser() as UserDTO | null;
    setCurrentUser(user);
    
    fetchCartCount(user);

    // Lắng nghe sự kiện từ hệ thống (storage + sự kiện tự định nghĩa khi thêm giỏ)
    const handleCartUpdate = () => {
      const updatedUser = getCurrentUser() as UserDTO | null;
      setCurrentUser(updatedUser);
      fetchCartCount(updatedUser);
    };

    window.addEventListener('storage', handleCartUpdate);
    window.addEventListener('cartUpdate', handleCartUpdate); // Đồng bộ khi click Thêm giỏ hàng

    return () => {
      window.removeEventListener('storage', handleCartUpdate);
      window.removeEventListener('cartUpdate', handleCartUpdate);
    };
  }, []);

  // Tự động gọi lại API khi currentUser thay đổi trạng thái
  useEffect(() => {
    if (mounted) {
      fetchCartCount(currentUser);
    }
  }, [currentUser, mounted]);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setCartCount(0);
    setIsOpen(false);
  };

  const getDashboardLink = () => {
    if (!currentUser) return null;
    switch (currentUser.role.toLowerCase()) {
      case 'admin': return '/admin';
      case 'staff': return '/staff';
      case 'ktv': return '/ktv';
      default: return null;
    }
  };

  const dashboardLink = getDashboardLink();

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-orange-600">
            PetShop
          </Link>

          {/* Desktop Navigation (Đã thêm lại Về chúng tôi) */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/products" className="text-gray-700 hover:text-orange-600 transition">Sản phẩm</Link>
            <Link href="/services" className="text-gray-700 hover:text-orange-600 transition">Dịch vụ</Link>
            <Link href="/pets" className="text-gray-700 hover:text-orange-600 transition">Thú cưng</Link>
            <Link href="/about" className="text-gray-700 hover:text-orange-600 transition">Về chúng tôi</Link>
          </div>

          {/* Right Side - Giỏ hàng & User */}
          <div className="flex items-center gap-4">
            {mounted ? (
              <>
                {/* Giỏ hàng lấy dữ liệu từ API */}
                <Link href="/cart" className="relative">
                  <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-orange-600 transition" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Kiểm tra User */}
                {currentUser ? (
                  <div className="flex items-center gap-2 md:gap-4">
                    <span className="text-sm font-medium text-gray-700">{currentUser.username}</span>
                    {dashboardLink && (
                      <Link href={dashboardLink}>
                        <Button size="sm" variant="outline">Dashboard</Button>
                      </Link>
                    )}
                    <button onClick={handleLogout} className="text-gray-700 hover:text-red-600 transition" title="Đăng xuất">
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link href="/login"><Button variant="outline" size="sm">Đăng nhập</Button></Link>
                    <Link href="/register"><Button size="sm" className="bg-orange-600 hover:bg-orange-700">Đăng ký</Button></Link>
                  </div>
                )}

                {/* Mobile Menu Button */}
                <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
                  {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </>
            ) : (
              // Trong lúc chờ đợi Client load xong, hiển thị khung giữ chỗ để tránh lệch HTML
              <div className="w-20 h-8 bg-gray-100 animate-pulse rounded" />
            )}
          </div>
        </div>

        {/* Mobile Navigation (Đã thêm lại Về chúng tôi) */}
        {mounted && isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col gap-3">
              <Link href="/products" className="text-gray-700 hover:text-orange-600 py-2">Sản phẩm</Link>
              <Link href="/services" className="text-gray-700 hover:text-orange-600 py-2">Dịch vụ</Link>
              <Link href="/pets" className="text-gray-700 hover:text-orange-600 py-2">Thú cưng</Link>
              <Link href="/about" className="text-gray-700 hover:text-orange-600 py-2">Về chúng tôi</Link>
              
              {currentUser ? (
                <div className="border-t pt-3">
                  <p className="text-sm font-semibold mb-2">{currentUser.username}</p>
                  {dashboardLink && <Link href={dashboardLink} className="text-orange-600 text-sm mb-2 block">Dashboard</Link>}
                  <button onClick={handleLogout} className="text-left text-red-600 text-sm font-semibold mt-2">Đăng xuất</button>
                </div>
              ) : (
                <div className="border-t pt-3 flex flex-col gap-2">
                  <Link href="/login"><Button variant="outline" className="w-full">Đăng nhập</Button></Link>
                  <Link href="/register"><Button className="w-full bg-orange-600">Đăng ký</Button></Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}