import ChatHistory from "./chat-history";
import Button from "../ui/button";
import ProfileBar from "./profile-bar";
import PlusIcon from "@/assets/icons/plus-icon";
interface SideBarProps {
  setVisibleEmptyState: (value: boolean) => void;
}
const SideBar = ({ setVisibleEmptyState }: SideBarProps) => {
  return (
    <div className=" w-[300px] h-full p-4 flex flex-col">
      <ProfileBar />
      <div className="flex-1 overflow-auto">
        <ChatHistory />
      </div>

      <Button
        label={"Start new chat"}
        icon={<PlusIcon />}
        onClickButton={() => setVisibleEmptyState(true)}
        className="h-10"
      />
    </div>
  );
};
export default SideBar;
