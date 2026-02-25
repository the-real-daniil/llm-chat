import { AuthLogic } from './auth-logiс';
import Button from '@/components/ui/button';

export const LogoutButton = () => {
  const handleLogout = async () => {
    await AuthLogic.logout();
  };

  return <Button label={'Exit'} onClickButton={handleLogout} />;
};
