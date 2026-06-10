'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect /customer/pets/add -> /customer/pets (form is inline on that page)
export default function AddPetRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/customer/pets');
  }, [router]);
  return null;
}
