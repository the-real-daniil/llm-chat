"use client";
import DialogBox from "@/components/dialog-box";
import { useChat } from "@/hooks/useChat";
import { useEffect } from "react";

export default function ChatPage() {
  useEffect(() => {}, []);
  return (
    <div className="flex-1 bg-white border border-solid border-gray-300 rounded-2xl shadow-sm overflow-hidden min-h-0">
      <DialogBox />
    </div>
  );
}
