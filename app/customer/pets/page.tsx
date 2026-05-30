'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';
import { getPetsByOwner, addPet } from '@/lib/storage';
import { User } from '@/lib/mock-data';
import Link from 'next/link';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PetsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const petTypes = [
    { value: 'dog', label: `🐶 ${t('petsPage.guides.0.name')}` },
    { value: 'cat', label: `🐱 ${t('petsPage.guides.1.name')}` },
    { value: 'bird', label: `🦜 ${t('petsPage.guides.2.name')}` },
    { value: 'rabbit', label: `🐰 ${t('petsPage.guides.3.name')}` },
    { value: 'hamster', label: '🐹 Hamster' },
  ];
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'dog',
    breed: '',
    age: '',
    weight: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'customer') {
      router.push('/login');
      return;
    }

    setCurrentUser(user);
    setPets(getPetsByOwner(user.id));
    setLoading(false);
  }, [router]);

  if (loading || !currentUser) {
    return <div>{t('common.loading.default')}</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.breed || !formData.age || !formData.weight) {
      alert(t('dashboard.customerPets.required'));
      return;
    }

    const newPet = addPet({
      name: formData.name,
      type: formData.type,
      breed: formData.breed,
      age: parseInt(formData.age),
      weight: parseFloat(formData.weight),
      ownerId: currentUser.id,
      description: formData.description,
    });

    setPets([...pets, newPet]);
    setFormData({
      name: '',
      type: 'dog',
      breed: '',
      age: '',
      weight: '',
      description: '',
    });
    setShowForm(false);
    alert(t('dashboard.customerPets.addSuccess'));
  };

  const getEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      dog: '🐶',
      cat: '🐱',
      bird: '🦜',
      rabbit: '🐰',
      hamster: '🐹',
    };
    return emojis[type] || '🐾';
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
                <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.customerPets.title')}</h1>
                <p className="text-gray-600 mt-2">{t('dashboard.customerPets.subtitle')}</p>
              </div>
              <Link href="/customer">
                <Button variant="outline">{t('dashboard.back')}</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Add Pet Form */}
          {showForm && (
            <div className="bg-gray-50 border rounded-lg p-6 mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t('dashboard.customerPets.addNew')}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('dashboard.customerPets.name')}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                      placeholder={t('dashboard.customerPets.namePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('dashboard.customerPets.type')}
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
                      value={formData.breed}
                      onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
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
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
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
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                      placeholder={t('dashboard.customerPets.weightPlaceholder')}
                      step="0.1"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('dashboard.customerPets.description')}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                    placeholder={t('dashboard.customerPets.descriptionPlaceholder')}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {t('dashboard.customerPets.save')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowForm(false)}
                  >
                    {t('common.actions.cancel')}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Pets List */}
          {pets.length > 0 ? (
            <>
              <div className="mb-6">
                <Button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {showForm ? t('dashboard.customerPets.hideForm') : t('dashboard.customer.addPet')}
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {pets.map((pet) => (
                  <div key={pet.id} className="bg-white border rounded-lg p-6">
                    <div className="text-center mb-4">
                      <div className="text-6xl mb-2">{getEmoji(pet.type)}</div>
                      <h3 className="text-2xl font-bold text-gray-900">{pet.name}</h3>
                    </div>

                    <div className="space-y-2 mb-6 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">{t('dashboard.customerPets.type')}</span>
                        <span className="font-semibold text-gray-900">
                          {petTypes.find(t => t.value === pet.type)?.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">{t('dashboard.customer.breed')}</span>
                        <span className="font-semibold text-gray-900">{pet.breed}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">{t('dashboard.customer.age')}</span>
                        <span className="font-semibold text-gray-900">{t('dashboard.customer.ageValue', { age: pet.age })}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">{t('dashboard.customerPets.weight')}</span>
                        <span className="font-semibold text-gray-900">{pet.weight} kg</span>
                      </div>
                      {pet.description && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-gray-600 text-xs">{pet.description}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 text-sm">
                        <Edit2 className="w-4 h-4 mr-2" />
                        {t('dashboard.customerPets.edit')}
                      </Button>
                      <Button variant="outline" className="flex-1 text-red-600 border-red-200 text-sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('dashboard.customerPets.delete')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
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
