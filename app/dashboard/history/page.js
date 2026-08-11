"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Coffee,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Clock,
  Receipt,
  Loader2,
} from "lucide-react";

export default function SubscriptionHistoryPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      try {
        const response = await fetch("/api/subscriptions/history");
        const data = await response.json();

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load history."
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

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="flex min-h-screen items-center justify-center">
          <Loader2
            size={30}
            className="animate-spin text-amber-400"
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Dashboard
          </Link>

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
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        {/* Heading */}
        <div>
          <p className="text-sm font-medium text-amber-400">
            Payments
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Subscription History
          </h1>

          <p className="mt-3 text-gray-500">
            View your current and previous
            creator subscriptions.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Empty */}
        {!error &&
          subscriptions.length === 0 && (
            <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-10 text-center">
              <Receipt
                size={35}
                className="mx-auto text-amber-400"
              />

              <h2 className="mt-4 font-semibold">
                No subscription history
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Your creator subscriptions
                will appear here.
              </p>

              <Link
                href="/"
                className="mt-5 inline-flex items-center rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400"
              >
                Discover Creators
              </Link>
            </div>
          )}

        {/* History */}
        {subscriptions.length > 0 && (
          <div className="mt-8 space-y-4">
            {subscriptions.map(
              (subscription) => (
                <HistoryCard
                  key={subscription._id}
                  subscription={subscription}
                />
              )
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function HistoryCard({ subscription }) {
  const creator =
    subscription.creator;

  const tier = subscription.tier;

  const isActive =
    subscription.status === "active";

  const isCancelled =
    subscription.status === "cancelled";

  const isPending =
    subscription.status === "pending";

  const formattedDate =
    subscription.createdAt
      ? new Date(
          subscription.createdAt
        ).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  const formattedCancelledDate =
    subscription.cancelledAt
      ? new Date(
          subscription.cancelledAt
        ).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Creator */}
        <div className="flex items-center gap-4">
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
            <h2 className="font-bold">
              {creator?.name ||
                "Unknown Creator"}
            </h2>

            <p className="text-sm text-gray-500">
              @{creator?.username ||
                "unknown"}
            </p>

            <p className="mt-2 text-sm text-gray-400">
              {tier?.name || "Tier"}
            </p>
          </div>
        </div>

        {/* Amount */}
        <div className="sm:text-right">
          <div className="flex items-center gap-1 text-lg font-bold text-amber-400 sm:justify-end">
            <IndianRupee size={17} />

            {subscription.amount || 0}
          </div>

          <p className="text-xs text-gray-600">
            monthly
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="mt-5 grid gap-3 border-t border-white/10 pt-5 text-sm sm:grid-cols-3">
        <div>
          <p className="text-xs text-gray-600">
            Started
          </p>

          <p className="mt-1 text-gray-400">
            {formattedDate}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-600">
            Payment ID
          </p>

          <p className="mt-1 truncate text-gray-400">
            {subscription.paymentId ||
              "Not available"}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-600">
            Status
          </p>

          <div className="mt-1">
            {isActive && (
              <span className="inline-flex items-center gap-1.5 text-green-400">
                <CheckCircle2
                  size={15}
                />
                Active
              </span>
            )}

            {isCancelled && (
              <span className="inline-flex items-center gap-1.5 text-red-400">
                <XCircle
                  size={15}
                />
                Cancelled
              </span>
            )}

            {isPending && (
              <span className="inline-flex items-center gap-1.5 text-yellow-400">
                <Clock size={15} />
                Pending
              </span>
            )}

            {!isActive &&
              !isCancelled &&
              !isPending && (
                <span className="text-gray-400">
                  {subscription.status}
                </span>
              )}
          </div>
        </div>
      </div>

      {/* Cancellation */}
      {isCancelled &&
        formattedCancelledDate && (
          <div className="mt-4 rounded-xl border border-red-500/10 bg-red-500/5 px-4 py-3 text-xs text-red-400">
            Cancelled on{" "}
            {formattedCancelledDate}
          </div>
        )}
    </div>
  );
}