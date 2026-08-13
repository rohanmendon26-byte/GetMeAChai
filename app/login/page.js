"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Coffee,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { useState, Suspense } from "react";
import { toast } from "react-toastify";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [showPassword, setShowPassword] = useState(false);
  const [oauthLoading, setOauthLoading] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  function getErrorMessage(code) {
    if (!code) return "";
    switch (code) {
      case "Configuration":
        return "OAuth provider is not configured. Please check your client ID & secret in .env.local.";
      case "AccessDenied":
        return "Access was denied or cancelled.";
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCallbackError":
        return "Sign-in with provider failed. Verify that 'http://localhost:3000/api/auth/callback/google' (or github) is added to your OAuth redirect URIs.";
      case "OAuthAccountNotLinked":
        return "An account with this email already exists using a different sign-in method.";
      case "CredentialsSignin":
        return "Invalid email or password.";
      default:
        return "Authentication failed. Please check your details and try again.";
    }
  }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(getErrorMessage(urlError));

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
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (!result || result.error) {
        const errText = "Invalid email or password.";
        setError(errText);
        toast.error(errText);
        return;
      }

      toast.success("Welcome back!");
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err);
      const errText = "Something went wrong. Please try again.";
      setError(errText);
      toast.error(errText);
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuthSignIn(provider) {
    try {
      setOauthLoading(provider);
      setError("");
      await signIn(provider, { callbackUrl: "/" });
    } catch (err) {
      console.error(`${provider} signIn error:`, err);
      const errText = `Failed to sign in with ${provider}.`;
      setError(errText);
      toast.error(errText);
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
          <h1 className="text-3xl font-bold">Welcome back</h1>

          <p className="mt-3 text-sm text-gray-500">
            Sign in to continue to GetMeAChai.
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          {/* Social OAuth Buttons */}
          <div className="space-y-3">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleOAuthSignIn("google")}
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
              Continue with Google
            </button>

            {/* GitHub */}
            <button
              type="button"
              onClick={() => handleOAuthSignIn("github")}
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
              Continue with GitHub
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
            {/* Email or Username */}
            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Email or Username
              </label>

              <input
                type="text"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com or your username"
                required
                autoComplete="username"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none transition placeholder:text-gray-700 focus:border-amber-500/50"
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm text-gray-300">Password</label>

                <Link
                  href="/forgot-password"
                  className="text-xs text-amber-400 hover:text-amber-300"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  required
                  autoComplete="current-password"
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

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
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
                  Signing in...
                </>
              ) : (
                "Sign in with Email"
              )}
            </button>
          </form>

          {/* Register */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-amber-400 hover:text-amber-300"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#080808] text-white">
          <Loader2 size={28} className="animate-spin text-amber-400" />
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}