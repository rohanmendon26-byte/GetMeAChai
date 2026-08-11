"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  Coffee,
  Heart,
  LogOut,
  Search,
  Wallet,
} from "lucide-react";

export default function SupporterDashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808]">
        <Coffee className="animate-pulse text-amber-400" size={30} />
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">

      <header className="border-b border-white/10">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-black">
              <Coffee size={19} />
            </span>

            GetMe<span className="text-amber-400">AChai</span>
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
          >
            <LogOut size={16} />
            Logout
          </button>

        </div>

      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">

        <p className="text-sm font-medium text-amber-400">
          Supporter Dashboard
        </p>

        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          Welcome back, {session.user.name} 👋
        </h1>

        <p className="mt-3 text-gray-500">
          Keep supporting the creators you love.
        </p>

        {/* Stats */}
        <div className="mt-10 grid gap-5 sm:grid-cols-3">

          <Stat
            icon={Heart}
            title="Supported creators"
            value="0"
          />

          <Stat
            icon={Wallet}
            title="Total contributed"
            value="₹0"
          />

          <Stat
            icon={Coffee}
            title="Active subscriptions"
            value="0"
          />

        </div>

        {/* Empty state */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
            <Search size={25} />
          </div>

          <h2 className="mt-6 text-xl font-semibold">
            You haven&apos;t supported anyone yet
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
            Discover amazing creators and buy them a chai to support
            their work.
          </p>

          <Link
            href="/explore"
            className="mt-7 inline-flex rounded-xl bg-amber-500 px-6 py-3 font-semibold text-black hover:bg-amber-400"
          >
            Explore creators
          </Link>

        </div>

      </section>

    </main>
  );
}

function Stat({ icon: Icon, title, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

      <Icon
        size={20}
        className="text-amber-400"
      />

      <p className="mt-4 text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>

    </div>
  );
}