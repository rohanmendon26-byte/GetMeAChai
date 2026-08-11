"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import {
  Coffee,
  IndianRupee,
  CreditCard,
  Users,
  ArrowLeft,
  Loader2,
  Receipt,
} from "lucide-react";

export default function CreatorPaymentsPage() {
  const { data: session, status } = useSession();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadPayments() {
      try {
        const response = await fetch("/api/creator/payments");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to load payment history."
          );
        }

        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Payment history error:", err);
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (status === "authenticated") {
      loadPayments();
    }

    return () => {
      isMounted = false;
    };
  }, [status]);

  // ============================================
  // LOADING
  // ============================================

  if (
    status === "loading" ||
    loading
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] text-white">
        <Loader2
          size={32}
          className="animate-spin text-amber-400"
        />
      </main>
    );
  }

  // ============================================
  // LOGIN REQUIRED
  // ============================================

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

          <p className="mt-2 text-gray-500">
            Login to view your payment history.
          </p>

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

  // ============================================
  // CREATOR ACCESS
  // ============================================

  if (session.user.role !== "creator") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Creator access only
          </h1>

          <p className="mt-3 text-gray-500">
            Payment history is only available
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

  // ============================================
  // ERROR
  // ============================================

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
              loadPayments();
            }}
            className="mt-6 rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const payments = data?.payments || [];
  const stats = data?.stats || {};

  return (
    <main className="min-h-screen bg-[#080808] text-white">

      {/* ========================================
          HEADER
      ======================================== */}

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

          <Link
            href="/creator/dashboard"
            className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>

        </div>
      </header>

      {/* ========================================
          CONTENT
      ======================================== */}

      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* Page heading */}

        <div>
          <p className="text-sm font-medium text-amber-400">
            Creator Finance
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Payment History
          </h1>

          <p className="mt-3 text-gray-500">
            View payments received from your
            supporters.
          </p>
        </div>

        {/* ======================================
            STATS
        ====================================== */}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">

          <StatCard
            icon={<IndianRupee size={20} />}
            title="Total Earnings"
            value={`₹${stats.totalEarnings || 0}`}
            description="Total successful payments"
          />

          <StatCard
            icon={<CreditCard size={20} />}
            title="Total Payments"
            value={stats.totalPayments || 0}
            description="Successful transactions"
          />

        </div>

        {/* ======================================
            PAYMENT HISTORY
        ====================================== */}

        <div className="mt-10">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-xl font-bold">
                Transactions
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your latest supporter payments.
              </p>
            </div>

            <Receipt
              size={20}
              className="text-gray-600"
            />

          </div>

          {payments.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-12 text-center">

              <CreditCard
                size={36}
                className="mx-auto text-amber-400"
              />

              <h3 className="mt-4 font-semibold">
                No payments yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Payments from your supporters
                will appear here.
              </p>

              <Link
                href="/creator/dashboard"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black"
              >
                Back to Dashboard
              </Link>

            </div>
          ) : (
            <div className="mt-6 space-y-3">

              {payments.map((payment) => (
                <PaymentRow
                  key={payment._id}
                  payment={payment}
                />
              ))}

            </div>
          )}

        </div>

      </section>
    </main>
  );
}

// ============================================
// STAT CARD
// ============================================

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

// ============================================
// PAYMENT ROW
// ============================================

function PaymentRow({ payment }) {
  const supporter = payment.supporter;
  const tier = payment.tier;

  const paymentDate = payment.createdAt
    ? new Date(
        payment.createdAt
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Unknown date";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-amber-500/20">

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        {/* Supporter */}

        <div className="flex items-center gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-500/10 font-semibold text-amber-400">

            {supporter?.image ? (
              <img
                src={supporter.image}
                alt={
                  supporter.name ||
                  "Supporter"
                }
                className="h-full w-full object-cover"
              />
            ) : (
              supporter?.name
                ?.charAt(0)
                .toUpperCase() || "?"
            )}

          </div>

          <div>

            <p className="font-semibold">
              {supporter?.name ||
                "Unknown Supporter"}
            </p>

            <p className="text-sm text-gray-500">
              {supporter?.username
                ? `@${supporter.username}`
                : "Unknown supporter"}
            </p>

          </div>

        </div>

        {/* Payment details */}

        <div className="flex flex-wrap items-center gap-6 sm:justify-end">

          <div>
            <p className="text-xs text-gray-600">
              Tier
            </p>

            <p className="mt-1 text-sm font-medium">
              {tier?.name || "Unknown Tier"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-600">
              Date
            </p>

            <p className="mt-1 text-sm">
              {paymentDate}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-600">
              Amount
            </p>

            <p className="mt-1 font-semibold text-amber-400">
              ₹{payment.amount || 0}
            </p>
          </div>

          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              Successful
            </span>
          </div>

        </div>

      </div>

      {/* Razorpay payment ID */}

      {payment.paymentId && (
        <div className="mt-4 border-t border-white/5 pt-4">

          <p className="text-xs text-gray-600">
            Razorpay Payment ID
          </p>

          <p className="mt-1 break-all font-mono text-xs text-gray-500">
            {payment.paymentId}
          </p>

        </div>
      )}

    </div>
  );
}