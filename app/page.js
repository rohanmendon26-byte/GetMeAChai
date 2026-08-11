import {
  ArrowRight,
  Check,
  Coffee,
  Heart,
  Sparkles,
  Users,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import CreatorCard from "@/components/CreatorCard";
import SectionHeading from "@/components/SectionHeading";

const creators = [
  {
    name: "Rohan Mendon",
    username: "rohan",
    bio: "Developer building cool products, AI experiments and open-source projects.",
    supporters: 154,
  },
  {
    name: "Ananya Sharma",
    username: "ananya",
    bio: "Digital artist creating illustrations, characters and creative experiments.",
    supporters: 320,
  },
  {
    name: "Arjun Rao",
    username: "arjun",
    bio: "Writer, developer and storyteller sharing ideas with the community.",
    supporters: 218,
  },
];

const steps = [
  {
    icon: Users,
    title: "Discover creators",
    description:
      "Find creators whose work you enjoy and explore what they're building.",
  },
  {
    icon: Coffee,
    title: "Buy them a chai",
    description:
      "Choose a support tier and contribute directly to the creator.",
  },
  {
    icon: Heart,
    title: "Support their journey",
    description:
      "Get closer to creators and unlock exclusive content and benefits.",
  },
];

const creatorBenefits = [
  "Build your own creator community",
  "Create multiple support tiers",
  "Share exclusive content",
  "Track your earnings and supporters",
];

const supporterBenefits = [
  "Support creators you genuinely love",
  "Unlock exclusive content",
  "Choose a support tier that fits you",
  "Keep track of your contributions",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080808] text-white">

      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden pt-32">

        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[120px]" />
          <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-orange-600/10 blur-[100px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-24 text-center lg:py-32">

          <div className="mx-auto mb-7 flex w-fit items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-2 text-sm text-amber-300">
            <Sparkles size={16} />
            Built for creators
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Support the creators
            <span className="block text-amber-400">
              you love. ☕
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-gray-400">
            GetMeAChai gives creators a simple way to build a community,
            share exclusive content and turn your support into something
            meaningful.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">

            <Button href="/register">
              Start Creating
              <ArrowRight className="ml-2" size={17} />
            </Button>

            <Button href="/explore" variant="secondary">
              Explore Creators
            </Button>

          </div>

          <div className="mx-auto mt-16 max-w-4xl">

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-2 shadow-2xl shadow-black">

              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-8 sm:p-12">

                <div className="grid gap-6 sm:grid-cols-3">

                  <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
                    <Coffee className="mx-auto text-amber-400" size={28} />
                    <p className="mt-4 text-2xl font-bold">
                      10K+
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Chais shared
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
                    <Users className="mx-auto text-amber-400" size={28} />
                    <p className="mt-4 text-2xl font-bold">
                      2.5K+
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Supporters
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
                    <Heart className="mx-auto text-amber-400" size={28} />
                    <p className="mt-4 text-2xl font-bold">
                      500+
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Creators
                    </p>
                  </div>

                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-white/10 py-24">

        <div className="mx-auto max-w-7xl px-6">

          <SectionHeading
            eyebrow="Simple process"
            title="How GetMeAChai works"
            description="Supporting a creator should be as simple as buying them a chai."
          />

          <div className="mt-16 grid gap-6 md:grid-cols-3">

            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.title}
                  className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-8"
                >

                  <span className="absolute right-6 top-6 text-sm text-gray-700">
                    0{index + 1}
                  </span>

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                    <Icon size={23} />
                  </div>

                  <h3 className="mt-6 text-xl font-semibold">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    {step.description}
                  </p>

                </div>
              );
            })}

          </div>

        </div>
      </section>

      {/* FEATURED CREATORS */}
      <section className="py-24">

        <div className="mx-auto max-w-7xl px-6">

          <SectionHeading
            eyebrow="Community"
            title="Meet the creators"
            description="Discover people creating things worth supporting."
          />

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {creators.map((creator) => (
              <CreatorCard
                key={creator.username}
                creator={creator}
              />
            ))}

          </div>

          <div className="mt-10 text-center">
            <Button href="/explore" variant="secondary">
              Explore all creators
              <ArrowRight className="ml-2" size={17} />
            </Button>
          </div>

        </div>

      </section>

      {/* BENEFITS */}
      <section className="border-y border-white/10 bg-white/[0.02] py-24">

        <div className="mx-auto max-w-7xl px-6">

          <div className="grid gap-16 lg:grid-cols-2">

            {/* Creators */}
            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">
                For creators
              </p>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Turn your audience into a community.
              </h2>

              <p className="mt-5 leading-7 text-gray-400">
                Give your supporters a simple way to contribute while
                building a deeper relationship with your community.
              </p>

              <div className="mt-8 space-y-4">

                {creatorBenefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-3 text-gray-300"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
                      <Check size={14} />
                    </span>

                    {benefit}
                  </div>
                ))}

              </div>

              <div className="mt-8">
                <Button href="/register">
                  Start creating
                </Button>
              </div>

            </div>

            {/* Supporters */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-amber-500/10 to-transparent p-8 sm:p-10">

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">
                For supporters
              </p>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Your support matters.
              </h2>

              <p className="mt-5 leading-7 text-gray-400">
                A small contribution can help creators continue doing
                what they love.
              </p>

              <div className="mt-8 space-y-4">

                {supporterBenefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-3 text-gray-300"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
                      <Check size={14} />
                    </span>

                    {benefit}
                  </div>
                ))}

              </div>

              <div className="mt-8">
                <Button href="/explore">
                  Find creators
                </Button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-28">

        <div className="absolute inset-0 -z-10 bg-amber-500/[0.04]" />

        <div className="mx-auto max-w-3xl px-6 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-black">
            <Coffee size={28} />
          </div>

          <h2 className="mt-7 text-4xl font-bold sm:text-5xl">
            Sometimes, a chai is all it takes.
          </h2>

          <p className="mt-5 text-gray-400">
            Support someone whose work makes your day a little better.
          </p>

          <div className="mt-8">
            <Button href="/explore">
              Explore creators
              <ArrowRight className="ml-2" size={17} />
            </Button>
          </div>

        </div>

      </section>

      <Footer />

    </main>
  );
}