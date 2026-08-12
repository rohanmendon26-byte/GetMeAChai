"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import ChaiLoader from "@/components/ChaiLoader";

import {
  Coffee,
  Users,
  IndianRupee,
  Layers,
  ArrowRight,
  Plus,
  Loader2,
  ExternalLink,
  CreditCard,
  FileText,
} from "lucide-react";

export default function CreatorDashboardPage() {
  const { data: session, status } =
    useSession();

  const [data, setData] = useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const response = await fetch("/api/creator/stats");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to load dashboard."
          );
        }

        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          console.error(err);
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (status === "authenticated") {
      loadDashboard();
    }

    return () => {
      isMounted = false;
    };
  }, [status]);

  if (
    status === "loading" ||
    loading
  ) {
    return <ChaiLoader message="Brewing your dashboard stats..." />;
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-white">
        <div className="text-center">

          <Coffee
            size={40}
            className="mx-auto text-amber-400"
          />

          <h1 className="mt-5 text-2xl font-bold">
            Login required
          </h1>

          <Link
            href="/login"
            className="mt-6 inline-block rounded-xl bg-amber-500 px-6 py-3 font-semibold text-black"
          >
            Login
          </Link>

        </div>
      </main>
    );
  }

  if (session.user.role !== "creator") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-white">
        <div className="text-center">

          <h1 className="text-2xl font-bold">
            Creator access only
          </h1>

          <p className="mt-3 text-gray-500">
            This dashboard is only available
            to creators.
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-block text-amber-400"
          >
            Go to supporter dashboard →
          </Link>

        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-white">
        <div className="text-center">

          <h1 className="text-xl font-bold">
            Something went wrong
          </h1>

          <p className="mt-3 text-red-400">
            {error}
          </p>

          <button
            onClick={() => {
              setLoading(true);
              setError("");
              loadDashboard();
            }}
            className="mt-6 rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black"
          >
            Try Again
          </button>

        </div>
      </main>
    );
  }

  const creator = data.creator;
  const stats = data.stats;
  const supporters =
    data.recentSupporters || [];

  return (
    <main className="min-h-screen bg-[#080808] text-white">

      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-black">
              <Coffee size={18} />
            </div>

            <span>
              GetMe
              <span className="text-amber-400">
                AChai
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-4">

            <Link
              href={`/${creator.username}`}
              target="_blank"
              className="hidden items-center gap-2 text-sm text-gray-400 hover:text-white sm:flex"
            >
              View Profile
              <ExternalLink size={15} />
            </Link>

            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-amber-500/10 font-semibold text-amber-400">

              {creator.image ? (
                <img
                  src={creator.image}
                  alt={creator.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                creator.name
                  ?.charAt(0)
                  .toUpperCase()
              )}

            </div>

          </div>

        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* Welcome */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

          <div>

            <p className="text-sm font-medium text-amber-400">
              Creator Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Welcome, {creator.name} 👋
            </h1>

            <p className="mt-3 text-gray-500">
              Manage your supporters and
              grow your community.
            </p>

          </div>

          <Link
            href="/creator/tiers"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400"
          >
            <Plus size={18} />
            Manage Tiers
          </Link>

        </div>

        {/* Stats */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={<IndianRupee size={20} />}
            title="Monthly Support"
            value={`₹${stats.monthlySupport}`}
            description="Current monthly support"
          />

          <StatCard
            icon={<Users size={20} />}
            title="Supporters"
            value={stats.supporters}
            description="Active supporters"
          />

          <StatCard
            icon={<Layers size={20} />}
            title="Support Tiers"
            value={stats.tiers}
            description="Active and inactive tiers"
          />

          <StatCard
            icon={<CreditCard size={20} />}
            title="Total Earnings"
            value={`₹${stats.totalEarnings || 0}`}
            description={`${stats.totalPayments || 0} successful payments`}
          />

        </div>

        {/* Main content */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">

          {/* Supporters */}
          <div>

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold">
                  Recent Supporters
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  People currently supporting you.
                </p>
              </div>

              <Users
                size={20}
                className="text-gray-600"
              />

            </div>

            {supporters.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-10 text-center">

                <Coffee
                  size={34}
                  className="mx-auto text-amber-400"
                />

                <h3 className="mt-4 font-semibold">
                  No supporters yet
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Share your profile to get
                  your first supporter.
                </p>

                <Link
                  href={`/${creator.username}`}
                  target="_blank"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black"
                >
                  View Profile
                  <ArrowRight size={17} />
                </Link>

              </div>
            ) : (
              <div className="mt-6 space-y-3">

                {supporters.map(
                  (subscription) => (
                    <SupporterRow
                      key={subscription._id}
                      subscription={
                        subscription
                      }
                    />
                  )
                )}

              </div>
            )}

          </div>

          {/* Quick actions */}
          <div>

            <h2 className="text-xl font-bold">
              Quick Actions
            </h2>

            <div className="mt-6 space-y-3">

              <ActionCard
                href="/creator/posts"
                icon={<FileText size={19} />}
                title="Manage Posts"
                description="Create and publish updates for supporters"
              />

              <ActionCard
                href="/creator/tiers"
                icon={<Layers size={19} />}
                title="Manage Tiers"
                description="Create and edit support tiers"
              />

              <ActionCard
                href="/creator/payments"
                icon={<CreditCard size={19} />}
                title="Payment History"
                description="View your supporter payments"
              />

              <ActionCard
                href={`/${creator.username}`}
                icon={<ExternalLink size={19} />}
                title="View Profile"
                description="See your public creator page"
              />

              <ActionCard
                href="/creator/profile"
                icon={<Users size={19} />}
                title="Edit Profile"
                description="Update your creator information"
              />

            </div>

          </div>

        </div>

      </section>
    </main>
  );
}

function StatCard({
  icon,
  title,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
        {icon}
      </div>

      <p className="mt-5 text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-600">
        {description}
      </p>

    </div>
  );
}

function SupporterRow({
  subscription,
}) {
  const supporter =
    subscription.supporter;

  const tier = subscription.tier;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">

      <div className="flex items-center justify-between gap-4">

        <div className="flex items-center gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-500/10 font-semibold text-amber-400">

            {supporter?.image ? (
              <img
                src={supporter.image}
                alt={supporter.name}
                className="h-full w-full object-cover"
              />
            ) : (
              supporter?.name
                ?.charAt(0)
                .toUpperCase()
            )}

          </div>

          <div>

            <p className="font-semibold">
              {supporter?.name}
            </p>

            <p className="text-sm text-gray-500">
              @{supporter?.username}
            </p>

          </div>

        </div>

        <div className="text-right">

          <p className="font-semibold text-amber-400">
            ₹{subscription.amount}
          </p>

          <p className="text-xs text-gray-600">
            {tier?.name}
          </p>

        </div>

      </div>

    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  description,
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-amber-500/30"
    >

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
        {icon}
      </div>

      <div className="flex-1">

        <p className="font-semibold">
          {title}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          {description}
        </p>

      </div>

      <ArrowRight
        size={17}
        className="text-gray-600 transition group-hover:translate-x-1 group-hover:text-amber-400"
      />

    </Link>
  );
}