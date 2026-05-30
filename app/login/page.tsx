'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { loginUser } from '@/lib/auth';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
        // Hàm này bây giờ sẽ trả về object user đã được làm sạch và lưu sẵn vào localStorage
        const user = await loginUser(email, password); 
        
        if (user) {
          const redirects = {
            admin: '/admin',
            staff: '/staff',
            ktv: '/ktv',
            customer: '/customer',
          };
          
          // Chuyển hướng trực tiếp dựa vào trường user.role đã làm sạch
          const targetPath = redirects[user.role as keyof typeof redirects] || '/';
          console.log("Đang tiến hành chuyển hướng tới:", targetPath);
          router.push(targetPath);
        } else {
          setError(t('authPages.login.invalid'));
        }
      } catch (err: any) {
        setError(err.message || t('authPages.genericError'));
      } finally {
        setLoading(false);
      }
    };

  // Demo credentials
  const demoAccounts = [
    { email: 'admin@petshop.com', password: 'admin123', role: 'Admin' },
    { email: 'staff@petshop.com', password: 'staff123', role: 'Staff' },
    { email: 'ktv@petshop.com', password: 'ktv123', role: 'KTV' },
    { email: 'customer@example.com', password: 'customer123', role: 'Customer' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white border rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
              {t('authPages.login.title')}
            </h1>
            <p className="text-center text-gray-600 mb-6">
              {t('authPages.login.subtitle')}
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
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                  placeholder={t('authPages.login.emailPlaceholder')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('common.fields.password')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                  placeholder={t('authPages.login.passwordPlaceholder')}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2"
              >
                {loading ? t('authPages.login.loading') : t('authPages.login.title')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                {t('authPages.login.noAccount')}{' '}
                <Link href="/register" className="text-orange-600 hover:text-orange-700 font-semibold">
                  {t('authPages.login.registerNow')}
                </Link>
              </p>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3">{t('authPages.login.demoAccounts')}</h3>
            <div className="space-y-2 text-sm">
              {demoAccounts.map((account) => (
                <div key={account.email} className="bg-white p-2 rounded border border-blue-100">
                  <p className="text-blue-900">
                    <strong>{account.role}:</strong> {account.email} / {account.password}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
