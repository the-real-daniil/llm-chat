"use client";

import MainArea from "@/components/main-area";
import SideBar from "@/components/side-bar";
import { useState } from "react";

export default function Home() {
  const [isNewChat, setIsNewChat] = useState(true);
  return (
    <>
      <SideBar setVisibleEmptyState={setIsNewChat} />
      <MainArea
        visibleEmptyState={isNewChat}
        setVisibleEmptyState={setIsNewChat}
      />
    </>
  );
}
