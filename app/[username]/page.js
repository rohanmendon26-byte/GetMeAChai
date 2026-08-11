import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Tier from "@/models/Tier";
import Post from "@/models/Post";
import Subscription from "@/models/Subscription";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

import JoinTierButton from "@/app/components/JoinTierButton";
import PostComments from "@/components/PostComments";

import {
  Globe,
  Coffee,
  Lock,
  Link as LinkIcon,
  Heart,
  Calendar,
  Sparkles,
  Edit3,
  LayoutDashboard,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default async function UserProfilePage({ params }) {
  const { username } = await params;

  await connectDB();

  const session = await getServerSession(authOptions);

  // =====================================================
  // FIND USER (CREATOR OR SUPPORTER)
  // =====================================================

  const user = await User.findOne({
    username: username.toLowerCase(),
  }).lean();

  if (!user) {
    return (
      <main className="min-h-screen bg-[#080808] px-6 py-20 text-white flex items-center justify-center">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4">
            <Coffee size={30} />
          </div>
          <h1 className="text-2xl font-bold">User Not Found</h1>
          <p className="mt-2 text-sm text-gray-400">
            No profile exists with the username <span className="text-white font-medium">@{username}</span>.
          </p>
          <div className="mt-6">
            <Link
              href="/explore"
              className="inline-flex rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 transition"
            >
              Explore Creators
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const isOwner = session?.user?.id === user._id.toString();

  // =====================================================
  // SUPPORTER PROFILE VIEW
  // =====================================================
  if (user.role === "supporter") {
    const activeSubscriptions = await Subscription.find({
      supporter: user._id,
      status: "active",
    })
      .populate("creator", "name username image bio")
      .populate("tier", "name price")
      .lean();

    const totalMonthlyContribution = activeSubscriptions.reduce(
      (sum, sub) => sum + Number(sub.tier?.price || sub.amount || 0),
      0
    );

    return (
      <main className="min-h-screen bg-[#080808] text-white">
        {/* Cover */}
        <div className="h-56 bg-gradient-to-br from-amber-500/30 via-orange-500/10 to-transparent sm:h-72">
          {user.coverImage && (
            <img
              src={user.coverImage}
              alt={`${user.name}'s cover`}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="mx-auto max-w-5xl px-6 pb-20">
          {/* Header */}
          <div className="relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex items-end gap-5">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-[#080808] bg-amber-500 text-4xl font-bold text-black shadow-xl">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user.name?.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            {/* Quick Owner Actions */}
            {isOwner && (
              <div className="flex items-center gap-3">
                <Link
                  href="/creator/profile"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/[0.08] hover:border-amber-500/30 transition"
                >
                  <Edit3 size={14} />
                  Edit Profile
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-semibold text-black hover:bg-amber-400 transition"
                >
                  <LayoutDashboard size={14} />
                  Dashboard
                </Link>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="mt-6">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400">
                <Coffee size={13} />
                Community Supporter
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-500">@{user.username}</p>

            {user.bio ? (
              <p className="mt-4 max-w-2xl leading-relaxed text-gray-300 text-sm">
                {user.bio}
              </p>
            ) : (
              <p className="mt-4 max-w-2xl leading-relaxed text-gray-500 text-sm italic">
                Proud supporter of creators on GetMeAChai.
              </p>
            )}

            {/* Social Links */}
            <div className="mt-5 flex flex-wrap gap-2.5">
              {user.socialLinks?.github && (
                <SocialLink href={user.socialLinks.github} label="GitHub" />
              )}
              {user.socialLinks?.instagram && (
                <SocialLink href={user.socialLinks.instagram} label="Instagram" />
              )}
              {user.socialLinks?.twitter && (
                <SocialLink href={user.socialLinks.twitter} label="Twitter" />
              )}
              {user.socialLinks?.linkedin && (
                <SocialLink href={user.socialLinks.linkedin} label="LinkedIn" />
              )}
              {user.socialLinks?.website && (
                <SocialLink href={user.socialLinks.website} label="Website" />
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-10 grid gap-4 grid-cols-2 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Heart size={15} className="text-amber-400" />
                Creators Backed
              </div>
              <p className="mt-2 text-2xl font-bold">{activeSubscriptions.length}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Coffee size={15} className="text-amber-400" />
                Monthly Support
              </div>
              <p className="mt-2 text-2xl font-bold">₹{totalMonthlyContribution}</p>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Calendar size={15} className="text-amber-400" />
                Member Since
              </div>
              <p className="mt-2 text-2xl font-bold">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : "2026"}
              </p>
            </div>
          </div>

          {/* Supported Creators Showcase */}
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" />
              Creators Supported by {user.name}
            </h2>

            {activeSubscriptions.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center">
                <Coffee size={36} className="mx-auto text-gray-600 mb-3" />
                <h3 className="font-semibold text-lg">No active subscriptions yet</h3>
                <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
                  {isOwner
                    ? "You haven't subscribed to any creators yet. Explore creators to get started!"
                    : `${user.name} hasn't subscribed to any creators yet.`}
                </p>
                {isOwner && (
                  <div className="mt-6">
                    <Link
                      href="/explore"
                      className="inline-flex rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-amber-400 transition"
                    >
                      Discover Creators
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {activeSubscriptions.map((sub) => {
                  const creator = sub.creator;
                  if (!creator) return null;

                  return (
                    <div
                      key={sub._id.toString()}
                      className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-amber-500/30 transition flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-amber-500 text-xl font-bold text-black">
                          {creator.image ? (
                            <img
                              src={creator.image}
                              alt={creator.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            creator.name?.charAt(0).toUpperCase()
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white text-base truncate">
                            {creator.name}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">
                            @{creator.username}
                          </p>
                          {sub.tier && (
                            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/20">
                              <Coffee size={11} />
                              {sub.tier.name} (₹{sub.tier.price}/mo)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                        <Link
                          href={`/${creator.username}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
                        >
                          Visit Creator Page
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // CREATOR PROFILE VIEW
  // =====================================================

  const creator = user;

  const tiers = await Tier.find({
    creator: creator._id,
    isActive: true,
  })
    .sort({
      order: 1,
      createdAt: 1,
    })
    .lean();

  let subscription = null;

  if (session?.user?.id) {
    subscription = await Subscription.findOne({
      supporter: session.user.id,
      creator: creator._id,
      status: "active",
    }).lean();
  }

  let supporterTier = null;

  if (subscription?.tier) {
    supporterTier = tiers.find(
      (tier) => tier._id.toString() === subscription.tier.toString()
    );
  }

  const posts = await Post.find({
    creator: creator._id,
  })
    .populate("tier", "name price order")
    .sort({
      createdAt: -1,
    })
    .lean();

  const safePosts = posts.map((post) => {
    if (post.visibility === "public") {
      return {
        ...post,
        content: post.content,
        image: post.image || "",
        canViewPost: true,
      };
    }

    if (!subscription) {
      return {
        ...post,
        content: null,
        image: "",
        canViewPost: false,
      };
    }

    if (!post.tier) {
      return {
        ...post,
        content: post.content,
        image: post.image || "",
        canViewPost: true,
      };
    }

    if (!supporterTier) {
      return {
        ...post,
        content: null,
        image: "",
        canViewPost: false,
      };
    }

    const supporterOrder = Number(supporterTier.order ?? 0);
    const requiredOrder = Number(post.tier.order ?? 0);
    const canViewPost = supporterOrder >= requiredOrder;

    return {
      ...post,
      content: canViewPost ? post.content : null,
      image: canViewPost ? post.image || "" : "",
      canViewPost,
    };
  });

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      {/* Cover */}
      <div className="h-56 bg-gradient-to-br from-amber-500/30 via-orange-500/10 to-transparent sm:h-72">
        {creator.coverImage && (
          <img
            src={creator.coverImage}
            alt={`${creator.name}'s cover`}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="mx-auto max-w-5xl px-6">
        {/* Profile Header */}
        <div className="relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex items-end gap-5">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-[#080808] bg-amber-500 text-4xl font-bold text-black shadow-xl">
              {creator.image ? (
                <img
                  src={creator.image}
                  alt={creator.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                creator.name?.charAt(0).toUpperCase()
              )}
            </div>
          </div>

          {isOwner && (
            <div className="flex items-center gap-3">
              <Link
                href="/creator/profile"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/[0.08] hover:border-amber-500/30 transition"
              >
                <Edit3 size={14} />
                Edit Profile
              </Link>
              <Link
                href="/creator/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-semibold text-black hover:bg-amber-400 transition"
              >
                <LayoutDashboard size={14} />
                Creator Studio
              </Link>
            </div>
          )}
        </div>

        {/* Profile Information */}
        <div className="mt-6">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold">{creator.name}</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400">
              <ShieldCheck size={13} />
              Verified Creator
            </span>
          </div>

          <p className="mt-1 text-gray-500">@{creator.username}</p>

          {creator.bio && (
            <p className="mt-5 max-w-2xl leading-7 text-gray-300">
              {creator.bio}
            </p>
          )}

          {/* Social Links */}
          <div className="mt-5 flex flex-wrap gap-3">
            {creator.socialLinks?.github && (
              <SocialLink
                href={creator.socialLinks.github}
                label="GitHub"
              />
            )}
            {creator.socialLinks?.instagram && (
              <SocialLink
                href={creator.socialLinks.instagram}
                label="Instagram"
              />
            )}
            {creator.socialLinks?.twitter && (
              <SocialLink
                href={creator.socialLinks.twitter}
                label="Twitter"
              />
            )}
            {creator.socialLinks?.linkedin && (
              <SocialLink
                href={creator.socialLinks.linkedin}
                label="LinkedIn"
              />
            )}
            {creator.socialLinks?.website && (
              <SocialLink
                href={creator.socialLinks.website}
                label="Website"
              />
            )}
          </div>
        </div>

        {/* Main Content */}
        <section className="mt-14 grid gap-12 pb-24 lg:grid-cols-3">
          {/* Posts Feed */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold">Posts</h2>
              <span className="text-sm text-gray-500">
                {posts.length} {posts.length === 1 ? "post" : "posts"}
              </span>
            </div>

            {posts.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
                <Coffee size={32} className="mx-auto text-gray-600 mb-2" />
                <p className="text-gray-500">No posts published yet.</p>
              </div>
            ) : (
              <div className="mt-8 space-y-6">
                {safePosts.map((post) => {
                  return (
                    <article
                      key={post._id.toString()}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                    >
                      {post.image && post.canViewPost && (
                        <div className="h-64 w-full overflow-hidden">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex items-center gap-3">
                          {post.visibility === "supporters" ? (
                            post.canViewPost ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                                Unlocked
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
                                <Lock size={13} />
                                Supporters Only
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                              <Globe size={13} />
                              Public
                            </span>
                          )}

                          {post.tier && (
                            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-400">
                              {post.tier.name}
                            </span>
                          )}

                          <span className="text-xs text-gray-600">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="mt-4 text-xl font-bold">
                          {post.title}
                        </h3>

                        {!post.canViewPost ? (
                          <div className="mt-4 rounded-xl border border-amber-500/10 bg-amber-500/5 p-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                                <Lock size={18} className="text-amber-400" />
                              </div>

                              <div>
                                <p className="font-medium">
                                  Exclusive content
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                  {post.tier
                                    ? `Join the ${post.tier.name} tier to unlock this post.`
                                    : "Join a support tier to unlock this post."}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-400">
                            {post.content}
                          </p>
                        )}

                        {post.canViewPost && (
                          <PostComments postId={post._id.toString()} />
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Support Tiers Column */}
          <div>
            <div className="sticky top-6">
              <h2 className="text-xl font-bold">
                Support {creator.name}
              </h2>

              {supporterTier && (
                <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Active Membership
                  </p>
                  <p className="mt-1 text-lg font-bold">
                    {supporterTier.name} Tier
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    ₹{supporterTier.price} / month
                  </p>
                </div>
              )}

              {tiers.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
                  <p className="text-gray-500">
                    No active support tiers yet.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {tiers.map((tier) => {
                    const currentTierOrder = supporterTier
                      ? Number(supporterTier.order ?? 0)
                      : null;

                    const tierOrder = Number(tier.order ?? 0);

                    return (
                      <div
                        key={tier._id.toString()}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-amber-500/30"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-bold">
                              {tier.name}
                            </h3>
                            {tier.description && (
                              <p className="mt-1 text-sm text-gray-500">
                                {tier.description}
                              </p>
                            )}
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-xl font-bold text-amber-400">
                              ₹{tier.price}
                            </p>
                            <p className="text-xs text-gray-600">
                              / month
                            </p>
                          </div>
                        </div>

                        {tier.benefits?.length > 0 && (
                          <div className="mt-5 space-y-2 border-t border-white/10 pt-5">
                            {tier.benefits.map((benefit, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-2 text-sm text-gray-400"
                              >
                                <span className="mt-0.5 text-amber-400">
                                  ✓
                                </span>
                                <span>{benefit}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <JoinTierButton
                          tierId={tier._id.toString()}
                          tierName={tier.name}
                          tierOrder={tierOrder}
                          currentTierId={subscription?.tier?.toString()}
                          currentTierOrder={currentTierOrder}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SocialLink({ href, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-400 transition hover:border-amber-500/30 hover:text-amber-400"
    >
      <LinkIcon size={14} />
      {label}
    </a>
  );
}
