"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Coffee,
  Heart,
  ShieldCheck,
  Zap,
  Sparkles,
  ChevronDown,
  ArrowRight,
  IndianRupee,
  Layers,
  Lock,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: "What is GetMeAChai?",
      answer:
        "GetMeAChai is a modern creator platform designed specifically for Indian creators and their supporters. It enables creators to receive direct support, offer monthly subscription tiers, and publish exclusive supporter-only content with seamless Razorpay integration.",
    },
    {
      question: "How do creators get paid?",
      answer:
        "Payments are processed securely through Razorpay directly into the creator's configured account. Supporters can pay via UPI, cards, net banking, or wallets in Indian Rupees (₹).",
    },
    {
      question: "What are Supporter Tiers?",
      answer:
        "Creators can set up custom monthly tiers (e.g. Chai Lover ₹99/mo, Super Fan ₹499/mo) offering exclusive perks, early access, and members-only posts.",
    },
    {
      question: "Can I post exclusive content for my supporters?",
      answer:
        "Yes! Our Creator Posts feature allows you to gate posts so only supporters of a specific tier can unlock and read your exclusive updates, tutorials, and behind-the-scenes content.",
    },
    {
      question: "Is there any setup fee?",
      answer:
        "No, creating an account and setting up your creator page is 100% free. You can get started in less than 2 minutes.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Navbar />

      <main className="pt-24 pb-20">
        {/* Hero Section */}
        <section className="mx-auto max-w-5xl px-6 py-16 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-400">
            <Coffee size={14} />
            Our Mission & Vision
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
            Empowering creators, one{" "}
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
              chai at a time.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 leading-relaxed">
            GetMeAChai was built to bridge the gap between creative passion and
            financial freedom. We provide Indian creators with the simplest, most
            rewarding way to fund their dreams.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-7 py-3.5 font-semibold text-black transition hover:bg-amber-400"
            >
              Start Your Page Free
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/explore"
              className="rounded-xl border border-white/10 px-7 py-3.5 font-medium text-gray-300 transition hover:bg-white/5 hover:text-white"
            >
              Explore Creators
            </Link>
          </div>
        </section>

        {/* Core Pillars */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Why GetMeAChai
            </p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              Everything you need to grow your community
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 transition hover:border-amber-500/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                <IndianRupee size={24} />
              </div>
              <h3 className="mt-6 text-xl font-bold">UPI & Local Payments</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Built natively for India. Accept payments seamlessly via Google
                Pay, PhonePe, Paytm, UPI, Debit/Credit Cards, and Net Banking.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 transition hover:border-amber-500/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                <Layers size={24} />
              </div>
              <h3 className="mt-6 text-xl font-bold">Monthly Memberships</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Turn casual fans into monthly recurring supporters. Set custom
                membership tiers with unique pricing and tailored perks.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 transition hover:border-amber-500/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                <Lock size={24} />
              </div>
              <h3 className="mt-6 text-xl font-bold">Exclusive Gated Posts</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Reward your loyal supporters with member-only posts, direct
                downloads, behind-the-scenes stories, and private updates.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mx-auto max-w-4xl px-6 py-16">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Got Questions?
            </p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-10 space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-6 text-left font-semibold text-white"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={18}
                      className={`text-gray-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-amber-400" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-white/5 px-6 pb-6 pt-3 text-sm leading-relaxed text-gray-400">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent p-10 text-center sm:p-16">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Ready to turn your passion into income?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-gray-400 sm:text-base">
              Join hundreds of creators already building authentic connections
              and earning sustainable support on GetMeAChai.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-8 py-3.5 font-bold text-black transition hover:bg-amber-400"
            >
              Get Started Now
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
