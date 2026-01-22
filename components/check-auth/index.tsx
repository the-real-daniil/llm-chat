"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckAuth({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Проверяем API ключ в localStorage
    const apiKey = localStorage.getItem("openrouter_api_key");

    if (!apiKey) {
      // Если ключа нет, перенаправляем на страницу логина
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // Показываем загрузку, пока проверяем аутентификацию
  if (isAuthenticated === null) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-600">Загрузка...</div>
      </div>
    );
  }

  // Если авторизованы, показываем детей
  else return <>{children}</>;
}
