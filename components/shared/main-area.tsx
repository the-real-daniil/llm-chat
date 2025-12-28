"use client";
import { useState } from "react";
import DialogBox from "./dialog-box2";
import MainEmptyState from "./main-empty-state";
import MainHeader from "./main-header";
interface MainAreaProps {
  visibleEmptyState: boolean;
  setVisibleEmptyState: (value: boolean) => void;
}
const MainArea = ({
  visibleEmptyState,
  setVisibleEmptyState,
}: MainAreaProps) => {
  const [initialMessage, setInitialMessage] = useState("");
  return (
    <div className="flex-1 bg-white border border-solid border-gray-300 rounded-2xl shadow-sm">
      <MainHeader setVisible={setVisibleEmptyState} />

      {visibleEmptyState ? (
        <MainEmptyState
          setVisible={setVisibleEmptyState}
          setInitialMessage={setInitialMessage}
        />
      ) : (
        <DialogBox initialMessage={initialMessage} />
      )}
    </div>
  );
};
export default MainArea;
