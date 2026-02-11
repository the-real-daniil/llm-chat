'use client';

import MainArea from '@/components/main-area';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const apiKey = localStorage.getItem('openrouter_api_key');

    if (!apiKey) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="h-screen w-full bg-gray-100 flex ">
      <MainArea />
    </div>
  );
}
