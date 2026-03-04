'use client';

import { useAuth } from '@/hooks/useAuth';
import ClearIcon from '../../assets/icons/clear-icon';
import SettingsIcon from '../../assets/icons/settings-icon';
import Button from '../ui/button';

const ProfileBar = () => {
  const { user, logout } = useAuth();
  const name = 'Mauro Sicard';

  return (
    <div className="flex justify-between items-center mb-5">
      <div className="flex items-center">
        <img src="/profile-photo.jpg" alt="photo" className="size-10 rounded-full mr-2" />
        <span className="text-gray-600">{name}</span>
      </div>
      <div className="flex items-center gap-1">
        <SettingsIcon />
        <ClearIcon />
      </div>
      <Button
        className="text-sm text-red-500 hover:text-red-700"
        label={'Выйти'}
        onClickButton={() => logout()}
      />
    </div>
  );
};

export default ProfileBar;
