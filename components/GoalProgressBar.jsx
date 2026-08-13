"use client";

import { Target, Sparkles, Trophy, Users, Coffee, ArrowUpRight } from "lucide-react";

export default function GoalProgressBar({ goal, isPreview = false }) {
  if (!goal) return null;

  const {
    title = "Support Goal",
    description = "",
    type = "amount",
    targetAmount = 1000,
    currentProgress = 0,
    percentage: passedPercentage,
  } = goal;

  const current = Number(currentProgress) || 0;
  const target = Number(targetAmount) || 1;

  const percentage =
    passedPercentage !== undefined
      ? Math.min(100, Math.max(0, passedPercentage))
      : Math.min(100, Math.max(0, Math.round((current / target) * 100)));

  const isCompleted = current >= target;
  const remaining = Math.max(0, target - current);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.08] via-[#121212] to-[#0c0c0c] p-6 shadow-2xl transition-all duration-300 hover:border-amber-500/40">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-orange-500/10 blur-3xl" />

      {/* Top Tag & Status */}
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-400">
          {isCompleted ? (
            <>
              <Trophy size={13} className="text-amber-300 animate-bounce" />
              <span>Goal Reached!</span>
            </>
          ) : (
            <>
              <Target size={13} className="text-amber-400" />
              <span>{type === "supporters" ? "Supporter Goal" : "Funding Goal"}</span>
            </>
          )}
        </div>

        <span className="text-xs font-bold text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1">
          {percentage}%
        </span>
      </div>

      {/* Title & Description */}
      <div className="mt-4">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          {title}
        </h3>
        {description && (
          <p className="mt-1.5 text-xs sm:text-sm text-gray-400 leading-relaxed line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-5">
        <div className="h-3.5 w-full overflow-hidden rounded-full bg-white/[0.07] p-0.5 border border-white/10 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
              isCompleted
                ? "bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 shadow-[0_0_18px_rgba(251,191,36,0.7)]"
                : "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.5)]"
            }`}
            style={{ width: `${Math.max(percentage, 3)}%` }}
          >
            {/* Shimmer light effect */}
            <div className="absolute inset-0 bg-white/20 opacity-30 animate-pulse rounded-full" />
          </div>
        </div>

        {/* Amount & Progress Details */}
        <div className="mt-3 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 font-semibold text-white">
            {type === "supporters" ? (
              <>
                <Users size={14} className="text-amber-400" />
                <span>
                  {current} <span className="text-gray-500">/ {target} supporters</span>
                </span>
              </>
            ) : (
              <>
                <Coffee size={14} className="text-amber-400" />
                <span>
                  ₹{current.toLocaleString()}{" "}
                  <span className="text-gray-500">/ ₹{target.toLocaleString()}</span>
                </span>
              </>
            )}
          </div>

          <div className="text-right text-xs text-gray-400 font-medium">
            {isCompleted ? (
              <span className="text-green-400 font-semibold flex items-center gap-1">
                <Sparkles size={12} /> Target unlocked!
              </span>
            ) : (
              <span>
                {type === "supporters"
                  ? `${remaining} more needed`
                  : `₹${remaining.toLocaleString()} to go`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
