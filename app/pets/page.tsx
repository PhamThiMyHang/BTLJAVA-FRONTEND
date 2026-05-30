"use client";


import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';




export default function PetsPage() {
  const { t } = useTranslation();
  const guideTexts = t('petsPage.guides', { returnObjects: true }) as Array<{
    name: string;
    description: string;
    tips: string[];
  }>;
  const healthTipTexts = t('petsPage.healthTips', { returnObjects: true }) as Array<{
    title: string;
    description: string;
  }>;
  const petGuides = [
    {
      emoji: '🐶',
      name: guideTexts[0].name,
      description: guideTexts[0].description,
      tips: guideTexts[0].tips,
    },
    {
      emoji: '🐱',
      name: guideTexts[1].name,
      description: guideTexts[1].description,
      tips: guideTexts[1].tips,
    },
    {
      emoji: '🦜',
      name: guideTexts[2].name,
      description: guideTexts[2].description,
      tips: guideTexts[2].tips,
    },
    {
      emoji: '🐰',
      name: guideTexts[3].name,
      description: guideTexts[3].description,
      tips: guideTexts[3].tips,
    },
    
  ];
  const images = [
    "/pet-banner.png",
    "/pet-banner.png",
    "/pet-banner.png",
    "/pet-banner.png",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000); // đổi ảnh mỗi 3 giây

    return () => clearInterval(interval);
  }, []);


  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-r from-orange-50 to-orange-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('petsPage.title')}
            </h1>
            <p className="text-gray-600 text-lg">
              {t('petsPage.description')}
            </p>
          </div>
        </section>

        {/* Pet Guides */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              {petGuides.map((guide, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-8 border">
                  <div className="text-6xl mb-4">{guide.emoji}</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{guide.name}</h2>
                  <p className="text-gray-600 mb-6">{guide.description}</p>
                  
                  <h3 className="font-semibold text-gray-900 mb-3">{t('petsPage.tipsTitle')}</h3>
                  <ul className="space-y-2 mb-6">
                    {guide.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-2">
                        <span className="text-orange-600 font-bold mt-1">•</span>
                        <span className="text-gray-600">{tip}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/services">
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                      {t('petsPage.viewCareServices')}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Health Tips */}
        <section className="bg-orange-50 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              {t('petsPage.healthTitle')}
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: healthTipTexts[0].title,
                  description: healthTipTexts[0].description,
                  icon: '💉',
                },
                {
                  title: healthTipTexts[1].title,
                  description: healthTipTexts[1].description,
                  icon: '🏥',
                },
                {
                  title: healthTipTexts[2].title,
                  description: healthTipTexts[2].description,
                  icon: '🥗',
                },
                {
                  title: healthTipTexts[3].title,
                  description: healthTipTexts[3].description,
                  icon: '🏃',
                },
                {
                  title: healthTipTexts[4].title,
                  description: healthTipTexts[4].description,
                  icon: '🛁',
                },
                {
                  title: healthTipTexts[5].title,
                  description: healthTipTexts[5].description,
                  icon: '❤️',
                },
              ].map((tip, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="text-4xl mb-4">{tip.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{tip.title}</h3>
                  <p className="text-gray-600">{tip.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('petsPage.ctaTitle')}
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              {t('petsPage.ctaDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/services">
                <Button className="bg-orange-600 hover:bg-orange-700 px-8">
                  {t('petsPage.exploreServices')}
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50 px-8">
                  {t('petsPage.buyProducts')}
                </Button>
              </Link>
            </div>
          </div>
        </section>

      <section className="bg-gradient-to-b from-white to-orange-50 py-16 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('petsPage.galleryTitle')}
            </h2>

            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {t('petsPage.galleryDescription')}
            </p>
          </div>
          {/* Pet Gallery Slider */}
          <section className="relative w-full h-[500px] overflow-hidden rounded-2xl">
            <img
              src={images[currentIndex]}
              alt={`Slide ${currentIndex}`}
              className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
            />

            {/* Nút điều hướng */}
            <div className="absolute inset-0 flex items-center justify-between px-6">
              <button
                onClick={() =>
                  setCurrentIndex((prev) =>
                    prev === 0 ? images.length - 1 : prev - 1
                  )
                }
                className="bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition"
              >
                ‹
              </button>
              <button
                onClick={() =>
                  setCurrentIndex((prev) => (prev + 1) % images.length)
                }
                className="bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition"
              >
                ›
              </button>
            </div>

            {/* Chỉ báo slide */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <span
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-3 h-3 rounded-full cursor-pointer ${
                    i === currentIndex
                      ? "bg-orange-600 opacity-100"
                      : "bg-orange-400 opacity-70"
                  }`}
                ></span>
              ))}
            </div>
          </section>


        </div>
      </section>
      </main>

      <Footer />
    </div>
  );
}
