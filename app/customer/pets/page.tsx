'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/lib/mock-data';
import Link from 'next/link';
import { Plus, Edit2, Trash2, LayoutDashboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { petService } from '@/services/petService';

interface Pet {
  maPet?: string;
  id?: string | number;
  tenPet?: string;
  name?: string;
  giong?: string;
  breed?: string;
  tuoi?: number;
  age?: number;
  canNang?: number;
  weight?: number;
  tinhTrang?: string;
  type?: string;
  description?: string;
  maKH?: number;
}

export default function PetsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const petTypes = [
    { value: 'Chó', label: `🐶 ${t('petsPage.guides.0.name')}` },
    { value: 'Mèo', label: `🐱 ${t('petsPage.guides.1.name')}` },
    { value: 'Chim', label: `🦜 ${t('petsPage.guides.2.name')}` },
    { value: 'Thỏ', label: `🐰 ${t('petsPage.guides.3.name')}` },
    { value: 'Hamster', label: '🐹 Hamster' },
  ];

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editPet, setEditPet] = useState<Pet | null>(null);
  const [formData, setFormData] = useState({
    tenPet: '',
    giong: '',
    tuoi: '',
    canNang: '',
    tinhTrang: 'Chó',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPets = useCallback(async (user: User) => {
    try {
      setLoading(true);
      setError(null);
      const res = await petService.searchPets({ maKH: (user as any).maKH || user.id });
      const data = res.data;
      // Handle Page<T>, array, or {content:[]}
      if (Array.isArray(data)) {
        setPets(data);
      } else if (data?.content) {
        setPets(data.content);
      } else {
        setPets([]);
      }
    } catch (err: any) {
      console.error('Lỗi tải danh sách thú cưng:', err);
      setError('Không thể tải danh sách thú cưng. Vui lòng thử lại.');
      setPets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'customer') {
      router.push('/login');
      return;
    }
    setCurrentUser(user);
    fetchPets(user);
  }, [router, fetchPets]);

  const resetForm = () => {
    setFormData({ tenPet: '', giong: '', tuoi: '', canNang: '', tinhTrang: 'Chó' });
    setEditPet(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tenPet || !formData.giong || !formData.tuoi || !formData.canNang) {
      alert(t('dashboard.customerPets.required'));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        tenPet: formData.tenPet,
        giong: formData.giong,
        tuoi: parseInt(formData.tuoi),
        canNang: parseFloat(formData.canNang),
        tinhTrang: formData.tinhTrang,
        maKH: (currentUser as any)?.maKH || currentUser?.id,
      };

      if (editPet) {
        await petService.updatePet(editPet.maPet || String(editPet.id), payload);
        alert('Cập nhật thú cưng thành công!');
      } else {
        await petService.createPet(payload);
        alert(t('dashboard.customerPets.addSuccess'));
      }

      resetForm();
      if (currentUser) fetchPets(currentUser);
    } catch (err: any) {
      console.error('Lỗi lưu thú cưng:', err);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (pet: Pet) => {
    setEditPet(pet);
    setFormData({
      tenPet: pet.tenPet || pet.name || '',
      giong: pet.giong || pet.breed || '',
      tuoi: String(pet.tuoi ?? pet.age ?? ''),
      canNang: String(pet.canNang ?? pet.weight ?? ''),
      tinhTrang: pet.tinhTrang || pet.type || 'Chó',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (pet: Pet) => {
    if (!confirm(`Xóa thú cưng "${pet.tenPet || pet.name}"?`)) return;
    try {
      await petService.deletePet(pet.maPet || String(pet.id));
      if (currentUser) fetchPets(currentUser);
    } catch (err) {
      console.error('Lỗi xóa thú cưng:', err);
      alert('Không thể xóa. Vui lòng thử lại.');
    }
  };

  const getEmoji = (type?: string) => {
    const t2 = (type || '').toLowerCase();
    if (t2.includes('chó') || t2 === 'dog') return '🐶';
    if (t2.includes('mèo') || t2 === 'cat') return '🐱';
    if (t2.includes('chim') || t2 === 'bird') return '🦜';
    if (t2.includes('thỏ') || t2 === 'rabbit') return '🐰';
    if (t2.includes('hamster')) return '🐹';
    return '🐾';
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">{t('common.loading.default')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.customerPets.title')}</h1>
                <p className="text-gray-600 mt-2">{t('dashboard.customerPets.subtitle')}</p>
              </div>
              <div className="flex gap-3">
                <Link href="/customer">
                  <Button variant="outline" className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
              {error}
            </div>
          )}

          {/* Add / Edit Pet Form */}
          {showForm && (
            <div className="bg-gray-50 border rounded-lg p-6 mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {editPet ? 'Cập nhật thú cưng' : t('dashboard.customerPets.addNew')}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('dashboard.customerPets.name')}
                    </label>
                    <input
                      type="text"
                      value={formData.tenPet}
                      onChange={(e) => setFormData({ ...formData, tenPet: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                      placeholder={t('dashboard.customerPets.namePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('dashboard.customerPets.type')}
                    </label>
                    <select
                      value={formData.tinhTrang}
                      onChange={(e) => setFormData({ ...formData, tinhTrang: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                    >
                      {petTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('dashboard.customerPets.breed')}
                    </label>
                    <input
                      type="text"
                      value={formData.giong}
                      onChange={(e) => setFormData({ ...formData, giong: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                      placeholder={t('dashboard.customerPets.breedPlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('dashboard.customerPets.age')}
                    </label>
                    <input
                      type="number"
                      value={formData.tuoi}
                      onChange={(e) => setFormData({ ...formData, tuoi: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                      placeholder={t('dashboard.customerPets.agePlaceholder')}
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('dashboard.customerPets.weight')}
                    </label>
                    <input
                      type="number"
                      value={formData.canNang}
                      onChange={(e) => setFormData({ ...formData, canNang: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                      placeholder={t('dashboard.customerPets.weightPlaceholder')}
                      step="0.1"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {saving ? 'Đang lưu...' : (editPet ? 'Cập nhật' : t('dashboard.customerPets.save'))}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={resetForm}
                  >
                    {t('common.actions.cancel')}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Add button + list */}
          {!showForm && (
            <div className="mb-6">
              <Button
                onClick={() => { setEditPet(null); setShowForm(true); }}
                className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('dashboard.customer.addPet')}
              </Button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-16 text-gray-500">{t('common.loading.default')}</div>
          ) : pets.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {pets.map((pet, idx) => (
                <div key={pet.maPet || pet.id || idx} className="bg-white border rounded-lg p-6 hover:shadow-md transition">
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-2">{getEmoji(pet.tinhTrang || pet.type)}</div>
                    <h3 className="text-2xl font-bold text-gray-900">{pet.tenPet || pet.name}</h3>
                  </div>

                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{t('dashboard.customerPets.type')}</span>
                      <span className="font-semibold text-gray-900">{pet.tinhTrang || pet.type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{t('dashboard.customer.breed')}</span>
                      <span className="font-semibold text-gray-900">{pet.giong || pet.breed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{t('dashboard.customer.age')}</span>
                      <span className="font-semibold text-gray-900">
                        {t('dashboard.customer.ageValue', { age: pet.tuoi ?? pet.age })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">{t('dashboard.customerPets.weight')}</span>
                      <span className="font-semibold text-gray-900">{pet.canNang ?? pet.weight} kg</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 text-sm"
                      onClick={() => handleEdit(pet)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      {t('dashboard.customerPets.edit')}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-red-600 border-red-200 text-sm"
                      onClick={() => handleDelete(pet)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('dashboard.customerPets.delete')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-6xl mb-4">🐾</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('dashboard.customerPets.emptyTitle')}</h2>
              <p className="text-gray-600 mb-6">{t('dashboard.customerPets.emptyDescription')}</p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                {t('dashboard.customer.addPet')}
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
