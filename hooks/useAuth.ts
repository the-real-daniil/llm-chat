import { AuthLogic } from '@/utils/auth-logic/auth-logiс';
import { useUserQuery } from './queries/useAuthQuery';
import { useQueryClient } from '@tanstack/react-query';

import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const { data: user, isLoading } = useUserQuery();
  const queryClient = useQueryClient();
  const router = useRouter();

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
    isLoggedIn: !!user,
    isLoading,
    logout,
    login,
  };
};
