'use client'
import MainArea from '@/components/shared/main-area';
import SideBar from '@/components/shared/side-bar';
import { useState } from 'react';

export default function Home() {
  const [isNewChat, setIsNewChat]=useState(true);
  return (
    <div className="h-screen bg-gray-100 flex p-3">
      <SideBar createNewChat={setIsNewChat} />
      <MainArea visibleEmptyState={isNewChat} setVisibleEmptyState={setIsNewChat} />
    </div>
  );
}