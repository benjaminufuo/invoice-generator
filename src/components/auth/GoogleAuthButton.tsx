"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth/client";

interface GoogleAuthButtonProps {
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onError,
  className = "",
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (isLoading || disabled) return;
    setIsLoading(true);

    try {
      const response = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });

      if (response && response.error) {
        setIsLoading(false);
        onError?.(
          response.error.message ||
            "Unable to sign in with Google. Please verify that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are configured in your server environment."
        );
      }
    } catch (err: unknown) {
      console.error("Google OAuth error:", err);
      setIsLoading(false);
      onError?.(
        "Could not initiate Google sign-in. If running locally, ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in .env.local."
      );
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={disabled || isLoading}
      className={`relative w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-medium text-sm rounded-lg border border-gray-300 shadow-2xs hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      aria-label="Continue with Google"
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 text-gray-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4 shrink-0"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            fill="#EA4335"
          />
        </svg>
      )}
      <span>{isLoading ? "Connecting to Google..." : "Continue with Google"}</span>
    </button>
  );
};
