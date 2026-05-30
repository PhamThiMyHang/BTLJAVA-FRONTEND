'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">PetShop</h3>
            <p className="text-sm">
              {t('footer.description')}
            </p>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('common.nav.products')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products?category=Thức ăn" className="hover:text-orange-600">
                  {t('footer.products.food')}
                </Link>
              </li>
              <li>
                <Link href="/products?category=Đồ chơi" className="hover:text-orange-600">
                  {t('footer.products.toys')}
                </Link>
              </li>
              <li>
                <Link href="/products?category=Chuồng" className="hover:text-orange-600">
                  {t('footer.products.cage')}
                </Link>
              </li>
              <li>
                <Link href="/products?category=Vệ sinh" className="hover:text-orange-600">
                  {t('footer.products.hygiene')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('common.nav.services')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/services#grooming" className="hover:text-orange-600">
                  Grooming
                </Link>
              </li>
              <li>
                <Link href="/services#spa" className="hover:text-orange-600">
                  Spa
                </Link>
              </li>
              <li>
                <Link href="/services#hotel" className="hover:text-orange-600">
                  {t('footer.services.hotel')}
                </Link>
              </li>
              <li>
                <Link href="/services#healthcare" className="hover:text-orange-600">
                  {t('footer.services.healthcare')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.contact.title')}</h4>
            <ul className="space-y-2 text-sm">
              <li>{t('footer.contact.address')}</li>
              <li>{t('footer.contact.phone')} <a href="tel:0901234567" className="hover:text-orange-600">0901234567</a></li>
              <li>Email: <a href="mailto:info@petshop.com" className="hover:text-orange-600">info@petshop.com</a></li>
              <li>{t('footer.contact.hours')}</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>{t('footer.copyright')}</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-orange-600">
              {t('footer.privacy')}
            </Link>
            <Link href="/terms" className="hover:text-orange-600">
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
