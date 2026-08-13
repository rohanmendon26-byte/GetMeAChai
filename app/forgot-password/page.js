"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { Coffee, Mail, Lock, ArrowLeft, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !newPassword) {
      const err = "Please enter both your email and a new password.";
      setError(err);
      toast.error(err);
      return;
    }

    if (newPassword.length < 8) {
      const err = "Password must be at least 8 characters long.";
      setError(err);
      toast.error(err);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password.");
      }

      const msg = data.message || "Password updated successfully!";
      setSuccessMessage(msg);
      toast.success(msg);
      setSubmitted(true);
    } catch (err) {
      const errMsg = err.message || "An unexpected error occurred. Please try again.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080808] px-6 py-20 text-white flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-bold text-white mb-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-black">
              <Coffee size={22} />
            </span>
            <span>
              GetMe<span className="text-amber-400">AChai</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Set / Reset Password</h1>
          <p className="mt-2 text-sm text-gray-400">
            Enter your account email and create a new password.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-400 border border-green-500/20">
                <CheckCircle2 size={24} />
              </div>
              <h2 className="text-lg font-bold">Password Updated</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                {successMessage || "Your password has been successfully updated. You can now log in."}
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 w-full rounded-2xl bg-amber-500 py-3.5 text-sm font-semibold text-black hover:bg-amber-400 transition"
                >
                  <ArrowLeft size={16} />
                  Proceed to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2.5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Account Email
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="creator@example.com"
                    required
                    className="w-full rounded-2xl border border-white/10 bg-black/40 py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  New Password (min 8 characters)
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    minLength={8}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-amber-500/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-amber-500 py-3.5 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Updating password...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-amber-400 transition"
                >
                  <ArrowLeft size={14} />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
