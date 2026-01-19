import DialogBox from "@/components/dialog-box";
import MainHeader from "@/components/main-area/main-header";

export default function ChatPage() {
  return (
    <div className="flex-1 bg-white border border-solid border-gray-300 rounded-2xl shadow-sm">
      <MainHeader />

      <DialogBox />
    </div>
  );
}
