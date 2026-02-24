'use client';
import Button from '@/components/ui/button';
import { AuthLogiс } from '@/utils/auth-logic/auth-logiс';
import { useEffect, useState } from 'react';

export default function AuthCallbackPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleAuth = async () => {
      setIsLoading(true);
      try {
        await AuthLogiс.handleAuthCallback();
      } catch (err) {
        setError(`Ошибка при авторизации: ${err}`);
      } finally {
        setIsLoading(false);
      }
    };
    if (isClient) {
      handleAuth();
    }
  }, [isClient]);
  if (!isClient) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <Button
            label="Загрузка..."
            className="justify-center w-full h-[42px]"
            disabled
            onClickButton={() => {}}
          />
        </div>
      </div>
    );
  }
  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      await AuthLogiс.initiateAuthFlow();
    } catch (err) {
      setError('Ошибка при подготовке авторизации: ' + (err as Error).message);
      setIsLoading(false);
    }
  };
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <Button
          label={AuthLogiс.isLoggedIn() ? 'Перейти в чат' : 'Войти'}
          className="justify-center w-full h-[42px]"
          onClickButton={handleLogin}
          disabled={isLoading}
        />
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
      </div>
    </div>
  );
}
