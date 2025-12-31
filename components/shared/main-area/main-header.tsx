import PlusIcon from "@/assets/icons/plus-icon";
import Button from "../../ui/button";
interface MainHeaderProps {
  setVisibleEmptyState: (value: boolean) => void;
}
const MainHeader = ({ setVisibleEmptyState }: MainHeaderProps) => {
  return (
    <div className="flex justify-between items-center w-full h-16 border-b border-gray-300 ">
      <h3 className="ml-4 text-lg font-medium text-gray-600">Chats</h3>
      <div className="w-[110px] mr-4">
        <Button
          label={"New Chat"}
          onClickButton={() => setVisibleEmptyState(true)}
          icon={<PlusIcon />}
          className="h-10 w-full"
        />
      </div>
    </div>
  );
};
export default MainHeader;
