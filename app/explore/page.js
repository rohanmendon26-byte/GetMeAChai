"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ChaiLoader from "@/components/ChaiLoader";
import {
  Search,
  Coffee,
  Heart,
  Layers,
  ArrowRight,
  Loader2,
  Sparkles,
  User,
  CheckCircle2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ExplorePage() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    "All",
    "Developers",
    "Designers",
    "Writers",
    "Musicians",
    "Podcasters",
    "Educators",
  ];

  useEffect(() => {
    let isMounted = true;

    async function fetchInitialCreators() {
      try {
        const response = await fetch("/api/explore");
        const data = await response.json();

        if (data.success && isMounted) {
          setCreators(data.creators || []);
        }
      } catch (error) {
        console.error("Explore fetch error:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchInitialCreators();

    return () => {
      isMounted = false;
    };
  }, []);

  async function searchCreators(query = "") {
    try {
      setLoading(true);
      const url = query.trim()
        ? `/api/explore?q=${encodeURIComponent(query.trim())}`
        : "/api/explore";

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setCreators(data.creators || []);
      }
    } catch (error) {
      console.error("Explore fetch error:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    searchCreators(searchQuery);
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Navbar />

      <main className="pt-24 pb-20">
        {/* Hero & Search Header */}
        <section className="mx-auto max-w-7xl px-6 py-12 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-400">
            <Sparkles size={14} />
            Discover Inspiring Creators
          </div>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Support creators building{" "}
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
              what you love
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-400 sm:text-lg">
            Find independent developers, artists, educators, and makers. Buy
            them a chai and unlock exclusive behind-the-scenes content.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2 shadow-2xl backdrop-blur-md focus-within:border-amber-500/50"
          >
            <div className="flex flex-1 items-center gap-3 px-3">
              <Search size={20} className="text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search creators by name, handle, or topic..."
                className="w-full bg-transparent py-2 text-sm text-white placeholder-gray-600 outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-400"
            >
              Search
            </button>
          </form>

          {/* Category Chips */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setActiveCategory(category);
                  if (category === "All") {
                    searchCreators("");
                  } else {
                    searchCreators(category);
                  }
                }}
                className={`rounded-xl px-4 py-2 text-xs font-medium transition ${
                  activeCategory === category
                    ? "bg-amber-500 text-black font-semibold shadow-lg shadow-amber-500/20"
                    : "border border-white/10 bg-white/[0.02] text-gray-400 hover:border-white/20 hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Creator Results Grid */}
        <section className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold">
              {searchQuery ? `Results for "${searchQuery}"` : "Featured Creators"}
            </h2>
            <span className="text-xs text-gray-500">
              {creators.length} {creators.length === 1 ? "creator" : "creators"} found
            </span>
          </div>

          {loading ? (
            <ChaiLoader fullScreen={false} message="Discovering amazing creators..." />
          ) : creators.length === 0 ? (
            <div className="mt-12 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-16 text-center">
              <Coffee size={40} className="mx-auto text-amber-400" />
              <h3 className="mt-4 text-xl font-bold">No creators found</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                We couldn&apos;t find any creators matching your search. Try another
                keyword or clear your filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                  searchCreators("");
                }}
                className="mt-6 inline-flex rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-400"
              >
                Show All Creators
              </button>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {creators.map((creator) => (
                <div
                  key={creator.id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] transition duration-300 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/5"
                >
                  {/* Banner */}
                  <div className="relative h-28 w-full bg-gradient-to-r from-amber-900/30 via-zinc-900 to-black">
                    {creator.coverImage && (
                      <img
                        src={creator.coverImage}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  {/* Avatar & Body */}
                  <div className="relative flex flex-1 flex-col p-6 pt-0">
                    <div className="-mt-10 flex items-end justify-between">
                      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-[#080808] bg-zinc-800 font-bold text-amber-400 shadow-xl">
                        {creator.image ? (
                          <img
                            src={creator.image}
                            alt={creator.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">
                            {creator.name?.charAt(0)?.toUpperCase() || "C"}
                          </span>
                        )}
                      </div>

                      {creator.supportersCount > 0 && (
                        <div className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
                          <Heart size={13} className="fill-amber-400" />
                          {creator.supportersCount} {creator.supportersCount === 1 ? "supporter" : "supporters"}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="mt-4 flex-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition">
                        {creator.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        @{creator.username}
                      </p>

                      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-400">
                        {creator.bio || "Creative mind sharing passion, tutorials, and behind-the-scenes updates."}
                      </p>
                    </div>

                    {/* Stats & CTA */}
                    <div className="mt-6 border-t border-white/5 pt-4">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Layers size={14} className="text-amber-400" />
                          {creator.tierCount > 0
                            ? `${creator.tierCount} Tiers available`
                            : "Direct Chai support"}
                        </span>
                        {creator.minPrice > 0 && (
                          <span className="font-medium text-white">
                            From ₹{creator.minPrice}/mo
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/${creator.username}`}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500/10 py-2.5 text-sm font-semibold text-amber-400 transition group-hover:bg-amber-500 group-hover:text-black"
                      >
                        <Coffee size={16} />
                        Support Creator
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
