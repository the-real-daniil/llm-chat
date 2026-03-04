import { useQuery, useQueryClient } from '@tanstack/react-query';

import { authKeys } from './keys';
import { useRouter } from 'next/navigation';
import { AuthLogic } from '@/utils/auth-logic/auth-logiс';
import { useEffect } from 'react';

export const useUserQuery = () => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => AuthLogic.getMe(),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
};

export const useAuth = () => {
  const { data: user, isLoading, error } = useUserQuery();
  const queryClient = useQueryClient();
  const router = useRouter();

  const isLoggedIn = !!user;

  const logout = async () => {
    await AuthLogic.logout();
    queryClient.clear();
    router.push('/login');
  };

  const login = () => {
    AuthLogic.initiateAuthFlow();
  };

  return {
    user,
    isLoggedIn,
    isLoading,
    error,
    logout,
    login,
  };
};

export const useRequireAuth = (redirectTo: string = '/login') => {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push(redirectTo);
    }
  }, [isLoggedIn, isLoading, router, redirectTo]);

  return { isLoggedIn, isLoading };
};

export const useRedirectIfAuthenticated = (redirectTo: string = '/') => {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.push(redirectTo);
    }
  }, [isLoggedIn, isLoading, router, redirectTo]);
};
