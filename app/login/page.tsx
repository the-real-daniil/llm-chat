"use client";
import Button from "@/components/ui/button";
import { Buffer } from "buffer";
import { useEffect, useState } from "react";

export default function AuthCallbackPage() {
  if (typeof window !== "undefined") window.Buffer = Buffer;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const base64ToBase64Url = (base64: string) => {
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };

  const generateCodeVerifier = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const binaryString = array.reduce(
      (acc, byte) => acc + String.fromCharCode(byte),
      ""
    );
    const base64 = btoa(binaryString);
    return base64ToBase64Url(base64);
  };

  const generateCodeChallenge = async (verifier: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hash));
    const binaryString = hashArray
      .map((byte) => String.fromCharCode(byte))
      .join("");
    const base64 = btoa(binaryString);
    return base64ToBase64Url(base64);
  };

  const handleLogin = async () => {
    console.log(localStorage.getItem("openrouter_api_key"));
    if (!localStorage.getItem("openrouter_api_key")) {
      try {
        setIsLoading(true);
        setError("");

        const verifier = generateCodeVerifier();

        const challenge = await generateCodeChallenge(verifier);

        localStorage.setItem("openrouter_code_verifier", verifier);

        const callbackUrl = encodeURIComponent("http://localhost:3000/login");
        const authUrl = `https://openrouter.ai/auth?callback_url=${callbackUrl}&code_challenge=${challenge}&code_challenge_method=S256`;

        window.location.href = authUrl;
      } catch (err: any) {
        setError("Ошибка при подготовке авторизации: " + err.message);
        setIsLoading(false);
      }
    } else window.location.href = "/";
  };

  const exchangeCodeForToken = async (code: string, verifier: string) => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("https://openrouter.ai/api/v1/auth/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
          code_verifier: verifier,
          code_challenge_method: "S256",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (!data.key) {
        throw new Error("API key not received in response");
      }

      localStorage.setItem("openrouter_api_key", data.key);

      localStorage.removeItem("openrouter_code_verifier");

      window.history.replaceState({}, document.title, window.location.pathname);

      setTimeout(() => {
        window.location.href = "/";
      }, 2000);

      return data.key;
    } catch (err: any) {
      setError(`Ошибка при получении API ключа: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (code) {
        let verifier = localStorage.getItem("openrouter_code_verifier");

        if (!verifier) {
          setError("Не найден code_verifier. Попробуйте войти снова.");
          return;
        }

        try {
          await exchangeCodeForToken(code, verifier);
        } catch (err) {
          console.error("Failed to exchange code:", err);
        }
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <Button
          label={"Login"}
          className="justify-center w-full h-[42px]"
          onClickButton={handleLogin}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
