import Link from "next/link";
import { Coffee, MailCheck, ArrowRight, ShieldCheck } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-[#080808] px-6 py-20 text-white flex items-center justify-center">
      <div className="w-full max-w-md text-center">
        {/* Brand */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-2xl font-bold text-white mb-6"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-black">
            <Coffee size={22} />
          </span>
          <span>
            GetMe<span className="text-amber-400">AChai</span>
          </span>
        </Link>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <MailCheck size={32} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Verify Your Email</h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              We&apos;ve sent a verification link to your registered email address. Please click the link to activate all creator and supporter features.
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-left flex items-start gap-3">
            <ShieldCheck size={18} className="text-green-400 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400 leading-relaxed">
              Didn&apos;t receive an email? Check your spam folder or ensure your email address was entered correctly during registration.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full rounded-2xl bg-amber-500 py-3.5 text-sm font-semibold text-black hover:bg-amber-400 transition"
            >
              Proceed to Login
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/"
              className="text-xs text-gray-500 hover:text-gray-300 transition py-1"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
