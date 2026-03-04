'use client';

import SideBar from '@/components/side-bar';
import { useRequireAuth } from '@/hooks/queries/useAuthQuery';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLoading } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div>Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex p-3">
      <SideBar />
      {children}
    </div>
  );
}
