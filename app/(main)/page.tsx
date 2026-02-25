'use client';

import MainArea from '@/components/main-area';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="h-screen w-full bg-gray-100 flex ">
      <MainArea />
    </div>
  );
}
