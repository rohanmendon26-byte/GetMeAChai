"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Coffee,
  Globe,
  Lock,
  Loader2,
  Save,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id;

  const [form, setForm] = useState({
    title: "",
    content: "",
    image: "",
    visibility: "public",
    tier: "",
  });

  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!postId) return;

      try {
        setError("");

        const [postRes, tiersRes] = await Promise.all([
          fetch(`/api/posts/${postId}`, { cache: "no-store" }),
          fetch("/api/creator/tiers", { cache: "no-store" }),
        ]);

        if (!postRes.ok) {
          const errData = await postRes.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to load post.");
        }

        const postData = await postRes.json();
        const tiersData = tiersRes.ok ? await tiersRes.json() : { tiers: [] };

        if (isMounted) {
          const post = postData.post;
          setForm({
            title: post.title || "",
            content: post.content || "",
            image: post.image || "",
            visibility: post.visibility || "public",
            tier: post.tier?._id || (typeof post.tier === "string" ? post.tier : ""),
          });
          setTiers(tiersData.tiers || []);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Load post error:", err);
          setError(err.message || "Failed to load post details.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [postId]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Please enter a title.");
      return;
    }

    if (!form.content.trim()) {
      setError("Please write some content.");
      return;
    }

    if (form.visibility === "supporters" && !form.tier) {
      setError("Please select a supporter tier.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          image: form.image,
          visibility: form.visibility,
          tier: form.visibility === "supporters" ? form.tier : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update post.");
      }

      setSuccess("Post updated successfully!");

      setTimeout(() => {
        router.push("/creator/posts");
      }, 800);
    } catch (err) {
      console.error("Update post error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post? This action cannot be undone."
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete post.");
      }

      router.push("/creator/posts");
    } catch (err) {
      console.error("Delete post error:", err);
      setError(err.message || "Failed to delete post.");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] text-white">
        <Loader2 size={32} className="animate-spin text-amber-400" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <Link
            href="/creator/posts"
            className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to Posts
          </Link>

          <Link href="/" className="flex items-center gap-2 font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-black">
              <Coffee size={16} />
            </div>
            GetMe<span className="text-amber-400">AChai</span>
          </Link>
        </div>
      </header>

      {/* Main Form */}
      <section className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-amber-400">Creator Content</p>
            <h1 className="mt-2 text-3xl font-bold">Edit Post</h1>
            <p className="mt-2 text-gray-500">
              Update your post content, visibility, or image.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 px-4 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
          >
            {deleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete Post
              </>
            )}
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Title & Content */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                maxLength={150}
                placeholder="Post title..."
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-gray-700 focus:border-amber-500/50"
              />
              <p className="mt-2 text-right text-xs text-gray-600">
                {form.title.length}/150
              </p>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Content
              </label>
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                maxLength={10000}
                rows={10}
                placeholder="Write something for your supporters..."
                className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 leading-7 text-white outline-none transition placeholder:text-gray-700 focus:border-amber-500/50"
              />
              <p className="mt-2 text-right text-xs text-gray-600">
                {form.content.length}/10000
              </p>
            </div>
          </section>

          {/* Image */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <ImageIcon size={18} />
              </div>
              <div>
                <h2 className="font-semibold">Post Image</h2>
                <p className="text-sm text-gray-500">
                  Optional image URL to feature with this post.
                </p>
              </div>
            </div>

            <input
              type="url"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="mt-5 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-700 focus:border-amber-500/50"
            />

            {form.image && (
              <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                <img
                  src={form.image}
                  alt="Preview"
                  className="max-h-60 w-full object-cover"
                />
              </div>
            )}
          </section>

          {/* Visibility */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="font-semibold">Who can see this?</h2>
            <p className="mt-1 text-sm text-gray-500">
              Choose who can access this post.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, visibility: "public", tier: "" }))
                }
                className={`rounded-xl border p-5 text-left transition ${
                  form.visibility === "public"
                    ? "border-amber-500/50 bg-amber-500/10"
                    : "border-white/10 bg-black/20 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      form.visibility === "public"
                        ? "bg-amber-500 text-black"
                        : "bg-white/5 text-gray-400"
                    }`}
                  >
                    <Globe size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Public</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Everyone can see this
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, visibility: "supporters" }))
                }
                className={`rounded-xl border p-5 text-left transition ${
                  form.visibility === "supporters"
                    ? "border-amber-500/50 bg-amber-500/10"
                    : "border-white/10 bg-black/20 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      form.visibility === "supporters"
                        ? "bg-amber-500 text-black"
                        : "bg-white/5 text-gray-400"
                    }`}
                  >
                    <Lock size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Supporters only</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Exclusive content
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Tier Select */}
            {form.visibility === "supporters" && (
              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Required Support Tier
                </label>

                {tiers.length === 0 ? (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-400">
                    You don&apos;t have any active tiers. Create a tier first.
                  </div>
                ) : (
                  <select
                    name="tier"
                    value={form.tier}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50"
                  >
                    <option value="" className="bg-[#111]">
                      Select a tier
                    </option>
                    {tiers.map((tier) => (
                      <option key={tier._id} value={tier._id} className="bg-[#111]">
                        {tier.name} — ₹{tier.price}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </section>

          {/* Form Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/creator/posts"
              className="rounded-xl border border-white/10 px-6 py-3 text-center text-sm font-medium text-gray-300 transition hover:bg-white/5"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={
                saving ||
                (form.visibility === "supporters" && !form.tier)
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
