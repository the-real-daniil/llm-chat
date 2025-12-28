'use client'
import PlusImg from '../ui/plus-img';
interface NewChatButtonProps {
  label: string;
  onClickCreateChat:(value:boolean)=>void;
}
const NewChatButton: React.FC<NewChatButtonProps> = ({ label, onClickCreateChat }) => {

  const onClickNewChatButton = () => {
    console.log('Нажал создать чат');
   onClickCreateChat(true);
  };
  return (
    <button
      onClick={onClickNewChatButton}
      className="flex items-center gap-2 bg-blue-500 rounded-xl w-full text-white hover:bg-blue-700 transition-colors justify-center h-10 border border-solid ">
      <PlusImg />
      {label}
    </button>
  );
};
export default NewChatButton;