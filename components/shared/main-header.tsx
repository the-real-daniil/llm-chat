import NewChatButton from './new-chat-button';
interface MainHeaderProps{
  setVisible:(value:boolean)=>void;
}
const MainHeader = ({setVisible}:MainHeaderProps) => {
  return (
    <div className="flex justify-between items-center w-full h-16 border-b border-gray-300 ">
      <h3 className="ml-4 text-lg font-medium text-gray-600">Chats</h3>
      <div className="w-[110px] mr-4">
        <NewChatButton label="New chat" onClickCreateChat={setVisible} />
      </div>
    </div>
  );
};
export default MainHeader;