import MainEmptyState from './main-empty-state';
import MainHeader from './main-header';

const MainArea = () => {
  return (
    <div className="flex-1 bg-white border border-solid border-gray-300 rounded-2xl shadow-sm">
      <MainHeader />
      <MainEmptyState />
    </div>
  );
};
export default MainArea;
