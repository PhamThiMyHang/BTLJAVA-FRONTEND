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
import { useTranslation } from 'react-i18next';

export default function SettingsPage() {
  const { t } = useTranslation();
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
    alert(t('dashboard.settings.updateSuccess'));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert(t('dashboard.settings.passwordMismatch'));
      return;
    }

    if (passwordData.currentPassword !== currentUser.password) {
      alert(t('dashboard.settings.currentPasswordWrong'));
      return;
    }

    alert(t('dashboard.settings.passwordSuccess'));
    setChangePassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleLogout = () => {
    if (confirm(t('dashboard.settings.logoutConfirm'))) {
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
                <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.settings.title')}</h1>
                <p className="text-gray-600 mt-2">{t('dashboard.settings.subtitle')}</p>
              </div>
              <Link href="/customer">
                <Button variant="outline">{t('dashboard.back')}</Button>
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
                    {t('dashboard.settings.personalInfo')}
                  </button>
                  <button onClick={() => setChangePassword(!changePassword)} className="block w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
                    {t('dashboard.settings.changePassword')}
                  </button>
                  <button className="block w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50">
                    {t('dashboard.settings.privacy')}
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2">
              {!changePassword ? (
                <div className="bg-white border rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('dashboard.settings.personalInfo')}</h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('common.fields.fullName')}
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
                      <p className="text-xs text-gray-500 mt-1">{t('dashboard.settings.emailLocked')}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('common.fields.phone')}
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
                        {t('common.fields.address')}
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
                        {t('common.fields.role')}
                      </label>
                      <input
                        type="text"
                        disabled
                        value={t('dashboard.settings.customerRole')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                    </div>

                    <div className="border-t pt-6">
                      <Button
                        type="submit"
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                      >
                        {t('common.actions.save')}
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-white border rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Lock className="w-6 h-6 text-orange-600" />
                    {t('dashboard.settings.changePassword')}
                  </h2>

                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('dashboard.settings.currentPassword')}
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
                        {t('dashboard.settings.newPassword')}
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
                        {t('dashboard.settings.confirmNewPassword')}
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
                        {t('dashboard.settings.updatePassword')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setChangePassword(false)}
                      >
                        {t('common.actions.cancel')}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Logout Button */}
              <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-8">
                <h3 className="text-lg font-semibold text-red-900 mb-4">{t('common.auth.logout')}</h3>
                <p className="text-red-700 mb-6">
                  {t('dashboard.settings.logoutDescription')}
                </p>
                <Button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {t('common.auth.logout')}
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
