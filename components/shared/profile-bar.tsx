
import ClearImg from '../ui/clear-img';
import SetingImg from '../ui/setings-img';

const ProfileBar = () => {
  const name ='Mauro Sicard';
  return (
    <div className="flex justify-between mb-5">
      <div className="flex items-center">
        <img src="profile-photo.jpg" alt="photo" className="size-10 rounded-full mr-2" />
        <span className='text-gray-600'>{name}</span>
      </div>
      <div className="flex items-center gap-1">
        <SetingImg />
        <ClearImg />
      </div>
    </div>
  );
};
export default ProfileBar;