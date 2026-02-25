'use client';

import SideBar from '@/components/side-bar';
import { AuthLogic } from '@/utils/auth-logic/auth-logiс';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const Page = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const router = useRouter();
  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = await AuthLogic.isLoggedIn();
      if (!isLoggedIn) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);
  return (
    <div className="h-screen bg-gray-100 flex p-3">
      <SideBar />
      {children}
    </div>
  );
};
export default Page;
