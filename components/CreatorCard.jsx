import Link from "next/link";
import { Users } from "lucide-react";

export default function CreatorCard({ creator }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition duration-300 hover:-translate-y-1 hover:border-amber-500/30 hover:bg-white/[0.05]">

      {/* Cover */}
      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-amber-900/50 via-orange-900/30 to-black">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.25),transparent_40%)]" />

      </div>

      {/* Content */}
      <div className="relative px-5 pb-5">

        {/* Avatar */}
        <div className="-mt-10 mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-[#0b0b0b] bg-gradient-to-br from-amber-400 to-orange-600 text-2xl font-bold text-black">
          {creator.name.charAt(0)}
        </div>

        <h3 className="text-lg font-semibold text-white">
          {creator.name}
        </h3>

        <p className="text-sm text-amber-400">
          @{creator.username}
        </p>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-400">
          {creator.bio}
        </p>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <Users size={16} />
          {creator.supporters} supporters
        </div>

        <Link
          href={`/${creator.username}`}
          className="mt-5 block rounded-xl bg-white/5 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-amber-500 hover:text-black"
        >
          View Creator
        </Link>

      </div>
    </div>
  );
}