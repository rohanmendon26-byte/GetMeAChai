"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { Coffee, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [oauthLoading, setOauthLoading] = useState("");

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "supporter",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      const successMsg = data.message || "Account created successfully!";
      setSuccess(successMsg);
      toast.success(successMsg);

      setForm({
        name: "",
        username: "",
        email: "",
        password: "",
        role: "supporter",
      });
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuthSignUp(provider) {
    try {
      setOauthLoading(provider);
      setError("");
      await signIn(provider, { callbackUrl: "/" });
    } catch (err) {
      console.error(`${provider} OAuth error:`, err);
      const errMsg = `Failed to authenticate with ${provider}.`;
      setError(errMsg);
      toast.error(errMsg);
      setOauthLoading("");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080808] px-6 py-12 text-white">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="mx-auto flex w-fit items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-black">
            <Coffee size={21} />
          </span>

          <span className="text-xl font-bold">
            GetMe<span className="text-amber-400">AChai</span>
          </span>
        </Link>

        {/* Heading */}
        <div className="mt-10 text-center">
          <h1 className="text-3xl font-bold">Create your account</h1>

          <p className="mt-3 text-sm text-gray-500">
            Join GetMeAChai and start supporting creators.
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          {/* Social OAuth Buttons */}
          <div className="space-y-3">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleOAuthSignUp("google")}
              disabled={Boolean(oauthLoading) || loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08] hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {oauthLoading === "google" ? (
                <Loader2 size={18} className="animate-spin text-amber-400" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                  />
                </svg>
              )}
              Sign up with Google
            </button>

            {/* GitHub */}
            <button
              type="button"
              onClick={() => handleOAuthSignUp("github")}
              disabled={Boolean(oauthLoading) || loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08] hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {oauthLoading === "github" ? (
                <Loader2 size={18} className="animate-spin text-amber-400" />
              ) : (
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              )}
              Sign up with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-white/10" />
            <span className="absolute bg-[#0f0f0f] px-3 text-xs uppercase tracking-wider text-gray-500">
              Or with email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Full name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                required
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none transition placeholder:text-gray-700 focus:border-amber-500/50"
              />
            </div>

            {/* Username */}
            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Username
              </label>

              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="rohan"
                required
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none transition placeholder:text-gray-700 focus:border-amber-500/50"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm text-gray-300">Email</label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none transition placeholder:text-gray-700 focus:border-amber-500/50"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 pr-12 text-sm outline-none transition placeholder:text-gray-700 focus:border-amber-500/50"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Account type */}
            <div>
              <label className="mb-2 block text-sm text-gray-300">
                I want to
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setForm((previous) => ({
                      ...previous,
                      role: "supporter",
                    }))
                  }
                  className={`rounded-xl border px-4 py-3 text-sm transition ${
                    form.role === "supporter"
                      ? "border-amber-500 bg-amber-500/10 text-amber-400 font-semibold"
                      : "border-white/10 bg-black/30 text-gray-400"
                  }`}
                >
                  Support creators
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setForm((previous) => ({
                      ...previous,
                      role: "creator",
                    }))
                  }
                  className={`rounded-xl border px-4 py-3 text-sm transition ${
                    form.role === "creator"
                      ? "border-amber-500 bg-amber-500/10 text-amber-400 font-semibold"
                      : "border-white/10 bg-black/30 text-gray-400"
                  }`}
                >
                  Become a creator
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || Boolean(oauthLoading)}
              className="flex w-full items-center justify-center rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-amber-400 hover:text-amber-300"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-gray-600">
          By creating an account, you agree to our terms and privacy policy.
        </p>
      </div>
    </main>
  );
}