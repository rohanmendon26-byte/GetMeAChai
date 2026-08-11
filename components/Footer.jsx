import Link from "next/link";
import { Coffee } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black">

      <div className="mx-auto max-w-7xl px-6 py-12">

        <div className="grid gap-10 md:grid-cols-4">

          <div className="md:col-span-2">

            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-white"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-black">
                <Coffee size={20} />
              </span>

              GetMe<span className="text-amber-400">AChai</span>
            </Link>

            <p className="mt-4 max-w-md text-sm leading-6 text-gray-500">
              Support the creators you love. A simple chai can go a long way.
            </p>

          </div>

          <div>
            <h3 className="font-semibold text-white">
              Platform
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-gray-500">
              <Link href="/explore" className="hover:text-white">
                Explore
              </Link>

              <Link href="/register" className="hover:text-white">
                Start Creating
              </Link>

              <Link href="/about" className="hover:text-white">
                About
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white">
              Account
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-gray-500">
              <Link href="/login" className="hover:text-white">
                Login
              </Link>

              <Link href="/register" className="hover:text-white">
                Register
              </Link>
            </div>
          </div>

        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-sm text-gray-600">
          © {new Date().getFullYear()} GetMeAChai. Built for creators.
        </div>

      </div>

    </footer>
  );
}