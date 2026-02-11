'use client';
import PlusIcon from '@/assets/icons/plus-icon';
import Button from '../ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const MainHeader = () => {
  const router = useRouter();
  const handleNewChat = () => {
    router.push('/');
  };

  return (
    <div className="flex justify-between items-center w-full h-16 border-b border-gray-300">
      <h3 className="ml-4 text-lg font-medium text-gray-600">Chats</h3>
      <div className="w-[110px] mr-4">
        <Link href="/">
          <Button
            label="New Chat"
            onClickButton={handleNewChat}
            icon={<PlusIcon />}
            className="h-10 w-full"
          />
        </Link>
      </div>
    </div>
  );
};
export default MainHeader;
