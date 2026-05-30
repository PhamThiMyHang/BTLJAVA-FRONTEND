'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { registerUser } from '@/lib/auth';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 1. Validation cơ bản ở Frontend
    if (formData.password !== formData.confirmPassword) {
      setError(t('authPages.register.passwordMismatch'));
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError(t('authPages.register.passwordMin'));
      setLoading(false);
      return;
    }

    try {
      // 2. Gọi API tới Backend
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.name,
          gmail: formData.email,
          password: formData.password,
          soDienThoai: formData.phone,
          diaChi: formData.address,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Lấy thông báo lỗi từ Backend trả về (ví dụ: "Email đã tồn tại!")
        throw new Error(result.message || t('authPages.register.registerFailed'));
      }

      // 3. Nếu thành công
      alert(t('authPages.register.registerSuccess'));
      router.push('/login'); 

    } catch (err: any) {
      setError(err.message || t('authPages.genericError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white border rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
              {t('authPages.register.title')}
            </h1>
            <p className="text-center text-gray-600 mb-6">
              {t('authPages.register.subtitle')}
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 flex items-gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-600 text-sm ml-2">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('authPages.register.nameLabel')}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                  placeholder={t('authPages.register.namePlaceholder')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('authPages.register.emailLabel')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                  placeholder={t('authPages.register.emailPlaceholder')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('authPages.register.phoneLabel')}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                  placeholder={t('authPages.register.phonePlaceholder')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('authPages.register.addressLabel')}
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                  placeholder={t('authPages.register.addressPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('authPages.register.passwordLabel')}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                  placeholder={t('authPages.register.passwordPlaceholder')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('authPages.register.confirmPasswordLabel')}
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                  placeholder={t('authPages.register.confirmPasswordPlaceholder')}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2"
              >
                {loading ? t('authPages.register.loading') : t('authPages.register.title')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                {t('authPages.register.hasAccount')}{' '}
                <Link href="/login" className="text-orange-600 hover:text-orange-700 font-semibold">
                  {t('common.auth.login')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
