"use client";

import MainArea from "@/components/main-area";
import SideBar from "@/components/side-bar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const apiKey = localStorage.getItem("openrouter_api_key");

    if (!apiKey) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex h-screen p-3">
      <SideBar />

      <MainArea />
    </div>
  );
}
