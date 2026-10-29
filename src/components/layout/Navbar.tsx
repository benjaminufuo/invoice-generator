"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

interface NavbarProps {
  onMenuToggle?: () => void;
  userEmail?: string;
  userName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onMenuToggle,
  userEmail,
  userName,
}) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Sign out failed", err);
      window.location.href = "/login";
    }
  };

  const displayName = userName || (userEmail ? userEmail.split("@")[0] : "Account");
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-zinc-200/80 no-print transition-all">
      <div className="px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onMenuToggle}
            className="md:hidden flex items-center justify-center w-10 h-10 -ml-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Toggle navigation menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-7.5 h-7.5 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-bold text-xs shadow-2xs group-hover:bg-zinc-800 transition-colors">
              IG
            </div>
            <span className="text-base font-bold text-zinc-900 tracking-tight">
              Invoice<span className="text-indigo-600">Gen</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {userEmail && (
            <div className="flex items-center gap-2.5 pl-2">
              <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center justify-center text-xs font-semibold select-none">
                {initials}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-medium text-zinc-900 leading-tight">
                  {displayName}
                </span>
                <span className="text-[11px] text-zinc-400 leading-tight truncate max-w-[150px]">
                  {userEmail}
                </span>
              </div>
            </div>
          )}

          <div className="h-4 w-px bg-zinc-200 hidden sm:block" />

          <button
            onClick={handleLogout}
            className="h-8 px-2.5 sm:px-3 text-xs font-medium text-zinc-600 hover:text-red-600 rounded-md hover:bg-red-50/80 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
