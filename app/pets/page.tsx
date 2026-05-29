"use client";


import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState, useEffect } from "react";




export default function PetsPage() {
  const petGuides = [
    {
      emoji: '🐶',
      name: 'Chó',
      description: 'Những người bạn trung thành và vui vẻ',
      tips: [
        'Cần tập thể dục thường xuyên',
        'Ăn thực phẩm giàu dinh dưỡng',
        'Tắm và chải lông định kỳ',
        'Kiểm tra sức khỏe thường xuyên',
      ],
    },
    {
      emoji: '🐱',
      name: 'Mèo',
      description: 'Những bạn độc lập và ngoài thành phố',
      tips: [
        'Cần không gian để chơi ngoài',
        'Vệ sinh thùng cát thường xuyên',
        'Chăm sóc lông nhiều lần một tuần',
        'Đảm bảo an toàn trong nhà',
      ],
    },
    {
      emoji: '🦜',
      name: 'Chim',
      description: 'Những bạn thông minh và tươi vui',
      tips: [
        'Cần lồng rộng để bay',
        'Ăn hạt và rau quả tươi',
        'Yêu thích tiếp xúc xã hội',
        'Cần tiếng ồn để kích thích',
      ],
    },
    {
      emoji: '🐰',
      name: 'Thỏ',
      description: 'Những bạn dễ mến và nhẹ nhàng',
      tips: [
        'Cần chuồng rộng rãi',
        'Ăn cỏ và rau xanh',
        'Cần thời gian để chơi ngoài',
        'Vệ sinh chuồng hàng ngày',
      ],
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
              Hướng dẫn chăm sóc thú cưng
            </h1>
            <p className="text-gray-600 text-lg">
              Những lời khuyên hữu ích để chăm sóc thú cưng của bạn
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
                  
                  <h3 className="font-semibold text-gray-900 mb-3">Mẹo chăm sóc:</h3>
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
                      Xem dịch vụ chăm sóc
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
              Những điều cần biết về sức khỏe thú cưng
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Tiêm chủng định kỳ',
                  description: 'Giúp bảo vệ thú cưng khỏi các bệnh truyền nhiễm nguy hiểm',
                  icon: '💉',
                },
                {
                  title: 'Kiểm tra sức khỏe thường xuyên',
                  description: 'Phát hiện sớm các vấn đề sức khỏe có thể xảy ra',
                  icon: '🏥',
                },
                {
                  title: 'Dinh dưỡng cân bằng',
                  description: 'Cung cấp tất cả các dưỡng chất cần thiết cho thú cưng',
                  icon: '🥗',
                },
                {
                  title: 'Tập thể dục thường xuyên',
                  description: 'Giúp thú cưng duy trì cân nặng và sức khỏe tốt',
                  icon: '🏃',
                },
                {
                  title: 'Vệ sinh cá nhân',
                  description: 'Tắm, chải lông, cắt móng định kỳ',
                  icon: '🛁',
                },
                {
                  title: 'Tình yêu thương',
                  description: 'Dành thời gian để chơi và kết nối với thú cưng',
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
              Hãy để chúng tôi giúp bạn chăm sóc thú cưng
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Dịch vụ chăm sóc chuyên nghiệp từ những chuyên gia
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/services">
                <Button className="bg-orange-600 hover:bg-orange-700 px-8">
                  Khám phá dịch vụ
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50 px-8">
                  Mua sản phẩm
                </Button>
              </Link>
            </div>
          </div>
        </section>

      <section className="bg-gradient-to-b from-white to-orange-50 py-16 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Khoảnh khắc đáng yêu của thú cưng
            </h2>

            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Những người bạn nhỏ luôn mang lại niềm vui và năng lượng tích cực mỗi ngày
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
