import MainArea from '@/components/shared/main-area';
import SideBar from '@/components/shared/side-bar';

export default function Home() {
  return (
    <div className="h-screen bg-gray-100 flex p-3">
      <SideBar />
      <MainArea />
    </div>
  );
}