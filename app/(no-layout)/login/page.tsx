'use client';

import Button from '@/components/ui/button';
import { useAuth, useRedirectIfAuthenticated } from '@/hooks/queries/useAuthQuery';
import { useState } from 'react';

export default function LoginPage() {
  const [error, setError] = useState('');
  const { login, isLoading: authLoading } = useAuth();

  useRedirectIfAuthenticated();

  const handleLogin = () => {
    try {
      login();
    } catch (err) {
      setError('Ошибка при подготовке авторизации: ' + (err as Error).message);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <Button
          label="Войти через OpenRouter"
          className="justify-center w-full h-[42px]"
          onClickButton={handleLogin}
          disabled={authLoading}
        />
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
      </div>
    </div>
  );
}
