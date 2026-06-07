'use client'; // Vì component này sử dụng useState

import { useState } from 'react';

export const ServiceImage = ({ service }: { service: any }) => {
  const [hasError, setHasError] = useState(false);

  // Nếu không có URL hoặc ảnh bị lỗi, hiển thị Emoji
  if (!service.urlImg || hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center text-8xl bg-orange-50">
        {service.category === 'Grooming' ? '✂️' : 
         service.category === 'Spa' ? '🛁' : 
         service.category === 'Hotel' ? '🏨' : 
         service.category === 'Healthcare' ? '💊' : 
         service.category === 'Training' ? '🎓' : '🐾'}
      </div>
    );
  }

  // Nếu có ảnh và load thành công
  return (
    <img 
      src={service.urlImg} 
      alt={service.tenDV} 
      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
      onError={() => setHasError(true)} // Khi ảnh lỗi, set state về true
    />
  );
};