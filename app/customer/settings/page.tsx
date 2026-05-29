'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { getCurrentUser, logoutUser } from '@/lib/auth';
import { User } from '@/lib/mock-data';
import Link from 'next/link';
import { LogOut, Lock } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [changePassword, setChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'customer') {
      router.push('/login');
      return;
    }

    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address || '',
    });
    setLoading(false);
  }, [router]);

  if (loading || !currentUser) {
    return <div>Loading...</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Cập nhật thông tin thành công!');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu mới không khớp!');
      return;
    }

    if (passwordData.currentPassword !== currentUser.password) {
      alert('Mật khẩu hiện tại không đúng!');
      return;
    }

    alert('Đổi mật khẩu thành công!');
    setChangePassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleLogout = () => {
    if (confirm('Bạn chắc chắn muốn đăng xuất?')) {
      logoutUser();
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Cài đặt</h1>
                <p className="text-gray-600 mt-2">Quản lý tài khoản và bảo mật</p>
              </div>
              <Link href="/customer">
                <Button variant="outline">Quay lại Dashboard</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white border rounded-lg p-6 sticky top-20">
                <h3 className="font-semibold text-gray-900 mb-4">Menu</h3>
                <div className="space-y-2">
                  <button className="block w-full text-left px-4 py-2 rounded-lg bg-orange-600 text-white">
                    Thông tin cá nhân
                  </button>
                  <button onClick={() => setChangePassword(!changePassword)} className="block w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
                    Đổi mật khẩu
                  </button>
                  <button className="block w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
                    Quyền riêng tư
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2">
              {!changePassword ? (
                <div className="bg-white border rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin cá nhân</h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                      />
                      <p className="text-xs text-gray-500 mt-1">Không thể thay đổi email</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vai trò
                      </label>
                      <input
                        type="text"
                        disabled
                        value="Khách hàng"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                    </div>

                    <div className="border-t pt-6">
                      <Button
                        type="submit"
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                      >
                        Lưu thay đổi
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-white border rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Lock className="w-6 h-6 text-orange-600" />
                    Đổi mật khẩu
                  </h2>

                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu hiện tại
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mật khẩu mới
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Xác nhận mật khẩu mới
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                      />
                    </div>

                    <div className="border-t pt-6 flex gap-2">
                      <Button
                        type="submit"
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                      >
                        Cập nhật mật khẩu
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setChangePassword(false)}
                      >
                        Hủy
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Logout Button */}
              <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-8">
                <h3 className="text-lg font-semibold text-red-900 mb-4">Đăng xuất</h3>
                <p className="text-red-700 mb-6">
                  Bạn sẽ được đăng xuất khỏi tài khoản của mình.
                </p>
                <Button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
