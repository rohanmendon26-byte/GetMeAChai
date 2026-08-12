"use client";

import { Coffee } from "lucide-react";

export default function ChaiLoader({
  message = "Brewing your chai...",
  fullScreen = true,
  size = "md",
}) {
  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-20 w-20",
  };

  const iconSizes = {
    sm: 22,
    md: 30,
    lg: 38,
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Animated Chai Cup Container */}
      <div className="relative flex items-center justify-center">
        {/* Glowing Background Pulse */}
        <div
          className={`absolute rounded-full bg-amber-500/20 blur-xl animate-ping ${sizeClasses[size] || sizeClasses.md}`}
        />

        {/* Outer Ring */}
        <div
          className={`relative flex items-center justify-center rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-black/40 backdrop-blur-xl shadow-[0_0_25px_rgba(245,158,11,0.15)] animate-pulse ${
            sizeClasses[size] || sizeClasses.md
          }`}
        >
          {/* Chai Cup Icon */}
          <Coffee
            size={iconSizes[size] || iconSizes.md}
            className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-bounce duration-1000"
          />
        </div>
      </div>

      {/* Loading Label */}
      {message && (
        <div className="flex items-center gap-2 text-sm font-medium text-amber-200/80 animate-pulse">
          <span>{message}</span>
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping duration-700" />
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping duration-1000" />
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping duration-1300" />
          </span>
        </div>
      )}
    </div>
  );

  if (!fullScreen) {
    return <div className="py-8 flex justify-center">{content}</div>;
  }

  return (
    <main className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-[#080808]/90 backdrop-blur-md text-white">
      {content}
    </main>
  );
}
