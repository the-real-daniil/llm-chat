'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLogic } from '@/utils/auth-logic/auth-logiс';
import Button from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = await AuthLogic.isLoggedIn();
      if (isLoggedIn) {
        router.push('/');
      }
    };

    checkAuth();
  }, [router]);

  const handleLogin = () => {
    AuthLogic.initiateAuthFlow();
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Button label={'Войти'} onClickButton={handleLogin} />
    </div>
  );
}
