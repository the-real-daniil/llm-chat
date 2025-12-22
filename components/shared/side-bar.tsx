import ChatHistory from './chat-history';
import NewChatButton from './new-chat-button';
import ProfileBar from './profile-bar';

const SideBar = () => {
  return (
    <div className=" w-[300px] h-full p-4 flex flex-col">
      <ProfileBar />
      <div className="flex-1 overflow-auto">
        <ChatHistory />
      </div>

      <NewChatButton label="Start new chat" />
    </div>
  );
};
export default SideBar;