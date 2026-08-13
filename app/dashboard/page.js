"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ChangeTierButton from "@/app/components/ChangeTierButton";
import CancelSubscriptionButton from "@/app/components/CancelSubscriptionButton";
import ChaiLoader from "@/components/ChaiLoader";

import {
  Coffee,
  Users,
  IndianRupee,
  ArrowRight,
  Loader2,
  CheckCircle2,
  CalendarDays,
  CreditCard,
  User,
  Edit3,
  Receipt,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "creator") {
      router.replace("/creator/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    let isMounted = true;

    async function fetchSubscriptions() {
      try {
        const response = await fetch("/api/subscriptions/mine");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load subscriptions."
          );
        }

        if (isMounted) {
          setSubscriptions(data.subscriptions || []);
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
      fetchSubscriptions();
    }

    return () => {
      isMounted = false;
    };
  }, [status, refreshTrigger]);

  function handleRefresh() {
    setLoading(true);
    setRefreshTrigger((prev) => prev + 1);
  }

  if (status === "loading") {
    return <ChaiLoader message="Loading your dashboard..." />;
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
          <Coffee
            size={40}
            className="text-amber-400"
          />

          <h1 className="mt-5 text-2xl font-bold">
            Login required
          </h1>

          <p className="mt-2 text-gray-500">
            Login to access your dashboard.
          </p>

          <Link
            href="/login"
            className="mt-6 rounded-xl bg-amber-500 px-6 py-3 font-semibold text-black transition hover:bg-amber-400"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  const monthlySupport = subscriptions.reduce(
    (total, subscription) =>
      total + (subscription.amount || 0),
    0
  );

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
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

          <div className="text-sm text-gray-400">
            {session.user.name}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-amber-400">
              Supporter Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Welcome back,{" "}
              {session.user.name} 👋
            </h1>

            <p className="mt-2 text-gray-500">
              Manage the creators you support.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {session.user.username && (
              <Link
                href={`/${session.user.username}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-white hover:border-amber-500/30 hover:bg-white/[0.08] transition"
              >
                <User size={14} className="text-amber-400" />
                View Profile
              </Link>
            )}

            <Link
              href="/creator/profile"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-white hover:border-amber-500/30 hover:bg-white/[0.08] transition"
            >
              <Edit3 size={14} />
              Edit Profile
            </Link>

            <Link
              href="/dashboard/history"
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-black hover:bg-amber-400 transition"
            >
              <Receipt size={14} />
              Receipts
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <StatCard
            icon={<Users size={20} />}
            title="Supporting"
            value={`${subscriptions.length} ${
              subscriptions.length === 1
                ? "Creator"
                : "Creators"
            }`}
          />

          <StatCard
            icon={<IndianRupee size={20} />}
            title="Monthly Support"
            value={`₹${monthlySupport}`}
          />
        </div>

        {/* Creators */}
        <div className="mt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">
                My Creators
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Creators you&apos;re currently supporting.
              </p>
            </div>

            <Link
              href="/"
              className="text-sm text-amber-400 transition hover:text-amber-300"
            >
              Discover creators →
            </Link>
          </div>

          {loading ? (
            <div className="mt-8 flex justify-center">
              <Loader2
                size={28}
                className="animate-spin text-amber-400"
              />
            </div>
          ) : subscriptions.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="mt-6 space-y-5">
              {subscriptions.map(
                (subscription) => (
                  <CreatorCard
                    key={subscription._id}
                    subscription={subscription}
                    onRefresh={handleRefresh}
                  />
                )
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function StatCard({
  icon,
  title,
  value,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
        {icon}
      </div>

      <p className="mt-5 text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-10 text-center">
      <Coffee
        size={35}
        className="mx-auto text-amber-400"
      />

      <h3 className="mt-4 font-semibold">
        You&apos;re not supporting anyone yet
      </h3>

      <p className="mt-2 text-sm text-gray-500">
        Find a creator and buy them a chai.
      </p>

      <Link
        href="/"
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400"
      >
        Discover Creators
        <ArrowRight size={17} />
      </Link>
    </div>
  );
}

function CreatorCard({
  subscription,
  onRefresh,
}) {
  const creator = subscription.creator;
  const tier = subscription.tier;

  const startedDate = subscription.startedAt
    ? new Date(
        subscription.startedAt
      ).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not available";

  const isPaid =
    subscription.paymentStatus === "paid" ||
    Boolean(subscription.paymentId) ||
    subscription.status === "active";
  const isFailed = subscription.paymentStatus === "failed";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        {/* Creator */}
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-500/10 text-xl font-bold text-amber-400">
            {creator?.image ? (
              <img
                src={creator.image}
                alt={
                  creator.name ||
                  "Creator"
                }
                className="h-full w-full object-cover"
              />
            ) : (
              creator?.name
                ?.charAt(0)
                .toUpperCase() || "C"
            )}
          </div>

          <div>
            <h3 className="font-bold text-white">
              {creator?.name ||
                "Unknown Creator"}
            </h3>

            <p className="text-sm text-gray-500">
              @
              {creator?.username ||
                "unknown"}
            </p>

            <div className="mt-3">
              <p className="text-sm text-gray-400">
                Current tier
              </p>

              <p className="font-semibold text-amber-400">
                {tier?.name || "Tier"}
              </p>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="lg:text-right">
          <p className="text-2xl font-bold text-white">
            ₹{subscription.amount || 0}
          </p>

          <p className="text-xs text-gray-600">
            per month
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="mt-6 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-3">
        {/* Payment */}
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              isPaid
                ? "bg-green-500/10 text-green-400"
                : isFailed
                ? "bg-red-500/10 text-red-400"
                : "bg-amber-500/10 text-amber-400"
            }`}
          >
            <CreditCard size={17} />
          </div>

          <div>
            <p className="text-xs text-gray-600">
              Payment
            </p>

            <p
              className={`text-sm font-medium capitalize ${
                isPaid
                  ? "text-green-400"
                  : isFailed
                  ? "text-red-400"
                  : "text-amber-400"
              }`}
            >
              {isPaid
                ? "Paid"
                : isFailed
                ? "Failed"
                : "Pending"}
            </p>
          </div>
        </div>

        {/* Subscription */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <CheckCircle2 size={17} />
          </div>

          <div>
            <p className="text-xs text-gray-600">
              Subscription
            </p>

            <p className="text-sm font-medium text-green-400">
              {subscription.status ===
              "active"
                ? "Active"
                : subscription.status}
            </p>
          </div>
        </div>

        {/* Started */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-gray-400">
            <CalendarDays size={17} />
          </div>

          <div>
            <p className="text-xs text-gray-600">
              Started
            </p>

            <p className="text-sm text-gray-300">
              {startedDate}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <ChangeTierButton
            creatorId={creator?._id}
            currentTierId={tier?._id}
          />

          <CancelSubscriptionButton
            subscriptionId={
              subscription._id
            }
            onCancelled={onRefresh}
          />
        </div>

        <Link
          href={`/${creator?.username}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-medium transition hover:border-amber-500/30 hover:bg-amber-500/5 hover:text-amber-400"
        >
          View Profile
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}