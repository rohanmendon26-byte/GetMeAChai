"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  Coffee,
  LogOut,
  LayoutDashboard,
  User as UserIcon,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import NotificationDropdown from "./NotificationDropdown";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const isCreator = session?.user?.role === "creator";
  const dashboardLink = isCreator ? "/creator/dashboard" : "/dashboard";
  const profileLink = session?.user?.username
    ? `/${session.user.username}`
    : "/profile";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-white"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-black">
            <Coffee size={20} />
          </span>
          <span>
            GetMe<span className="text-amber-400">AChai</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm text-gray-300 transition hover:text-white"
          >
            Home
          </Link>
          <Link
            href="/explore"
            className="text-sm text-gray-300 transition hover:text-white"
          >
            Explore
          </Link>
          <Link
            href="/about"
            className="text-sm text-gray-300 transition hover:text-white"
          >
            About
          </Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          {status === "authenticated" && session ? (
            <>
              <NotificationDropdown />

              <Link
                href={dashboardLink}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm font-medium text-white transition hover:border-amber-500/30 hover:bg-white/[0.08]"
              >
                <LayoutDashboard size={16} className="text-amber-400" />
                Dashboard
              </Link>

              <Link
                href={profileLink}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2 text-xs font-semibold text-gray-200 transition hover:text-amber-400 hover:border-amber-500/30"
                title="View your public profile"
              >
                <UserIcon size={14} className="text-amber-400" />
                <span>
                  {session.user.username
                    ? `@${session.user.username}`
                    : "Profile"}
                </span>
                {session.user.role === "creator" ? (
                  <span className="ml-1 rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-bold text-amber-400">
                    Creator
                  </span>
                ) : (
                  <span className="ml-1 rounded-full bg-blue-500/20 px-1.5 py-0.2 text-[10px] font-bold text-blue-400">
                    Supporter
                  </span>
                )}
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs text-gray-400 transition hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                title="Log out"
              >
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-400"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-gray-300 md:hidden"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-black px-6 py-5 md:hidden">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="text-gray-300 hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/explore"
              onClick={() => setMenuOpen(false)}
              className="text-gray-300 hover:text-white"
            >
              Explore
            </Link>
            <Link
              href="/about"
              onClick={() => setMenuOpen(false)}
              className="text-gray-300 hover:text-white"
            >
              About
            </Link>

            <div className="mt-2 border-t border-white/10 pt-4">
              {status === "authenticated" && session ? (
                <div className="space-y-3">
                  <Link
                    href={profileLink}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white justify-center"
                  >
                    <UserIcon size={16} className="text-amber-400" />
                    My Profile ({session.user.username ? `@${session.user.username}` : "Profile"})
                  </Link>

                  <Link
                    href={dashboardLink}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-3 font-semibold text-black justify-center"
                  >
                    <LayoutDashboard size={18} />
                    Go to Dashboard
                  </Link>

                  <Link
                    href="/creator/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm text-gray-300 justify-center hover:bg-white/[0.06]"
                  >
                    Edit Profile Settings
                  </Link>

                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm text-gray-300 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block py-2 text-gray-300 text-center"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="mt-2 block rounded-xl bg-amber-500 px-4 py-3 text-center font-semibold text-black"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}