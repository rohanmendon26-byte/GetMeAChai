"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ChaiLoader from "@/components/ChaiLoader";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Coffee,
  Plus,
  Lock,
  Globe,
  Loader2,
  FileText,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

export default function CreatorPostsPage() {
  const [posts, setPosts] = useState([]);
  const [tiers, setTiers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingTiers, setLoadingTiers] = useState(true);

  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    visibility: "public",
    tier: "",
    image: "",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [postsRes, tiersRes] = await Promise.all([
          fetch("/api/posts", { cache: "no-store" }),
          fetch("/api/creator/tiers", { cache: "no-store" }),
        ]);

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          if (isMounted) {
            setPosts(postsData.posts || []);
          }
        } else {
          const errData = await postsRes.json().catch(() => ({}));
          if (isMounted) {
            setError(errData.message || "Failed to load posts.");
          }
        }

        if (tiersRes.ok) {
          const tiersData = await tiersRes.json();
          if (isMounted) {
            setTiers(tiersData.tiers || []);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Load posts data error:", err);
          setError(err.message || "Failed to load posts.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setLoadingTiers(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // =========================================================
  // START EDITING
  // =========================================================

  function startEditing(post) {
    setEditingId(post._id);


    setEditForm({
      title: post.title || "",
      content: post.content || "",
      visibility:
        post.visibility || "public",
      tier: post.tier?._id || "",
      image: post.image || "",
    });

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });


  }

  // =========================================================
  // CANCEL EDITING
  // =========================================================

  function cancelEditing() {
    setEditingId(null);


    setEditForm({
      title: "",
      content: "",
      visibility: "public",
      tier: "",
      image: "",
    });

    setError("");


  }

  // =========================================================
  // UPDATE POST
  // =========================================================

  async function updatePost(event) {
    event.preventDefault();


    if (!editingId) {
      setError(
        "No post selected for editing."
      );
      return;
    }

    if (!editForm.title.trim()) {
      setError("Post title is required.");
      return;
    }

    if (!editForm.content.trim()) {
      setError("Post content is required.");
      return;
    }

    if (
      editForm.visibility ===
      "supporters" &&
      !editForm.tier
    ) {
      setError(
        "Please select a supporter tier."
      );
      return;
    }

    try {
      setSavingEdit(true);
      setError("");

      const response = await fetch(
        "/api/posts",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            postId: editingId,
            title: editForm.title,
            content: editForm.content,
            visibility:
              editForm.visibility,
            tier:
              editForm.visibility ===
                "supporters"
                ? editForm.tier
                : null,
            image: editForm.image,
          }),
        }
      );

      const text = await response.text();

      let data = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {
        throw new Error(
          "Server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to update post."
        );
      }

      setPosts((previous) =>
        previous.map((post) =>
          post._id === editingId
            ? data.post
            : post
        )
      );

      toast.success("Post updated successfully!");
      cancelEditing();
    } catch (error) {
      console.error(
        "Update post error:",
        error
      );

      const errMsg = error?.message || "Failed to update post.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setSavingEdit(false);
    }
  }

  // =========================================================
  // DELETE POST
  // =========================================================

  async function deletePost(postId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(postId);
      setError("");

      const response = await fetch(
        "/api/posts",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            postId,
          }),
        }
      );

      const text = await response.text();

      let data = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {
        throw new Error(
          "Server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to delete post."
        );
      }

      setPosts((previous) =>
        previous.filter(
          (post) =>
            post._id !== postId
        )
      );

      toast.success("Post deleted successfully.");

      if (editingId === postId) {
        cancelEditing();
      }
    } catch (error) {
      console.error(
        "Delete post error:",
        error
      );

      const errMsg = error?.message || "Failed to delete post.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setDeletingId(null);
    }
  }

  return (<main className="min-h-screen bg-[#080808] text-white">


    {/* Header */}
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">

        <Link
          href="/creator/dashboard"
          className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Dashboard
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2 font-bold"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-black">
            <Coffee size={16} />
          </div>

          GetMe
          <span className="text-amber-400">
            AChai
          </span>
        </Link>

      </div>
    </header>

    {/* Main Content */}
    <section className="mx-auto max-w-5xl px-6 py-10">

      {/* Heading */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

        <div>
          <p className="text-sm font-medium text-amber-400">
            Creator Content
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Your Posts
          </h1>

          <p className="mt-3 text-gray-500">
            Share updates and exclusive
            content with your supporters.
          </p>
        </div>

        <Link
          href="/creator/posts/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400"
        >
          <Plus size={18} />
          Create Post
        </Link>

      </div>

      {/* Error */}
      {error && (
        <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Edit Form */}
      {editingId && (
        <div className="mt-8 rounded-2xl border border-amber-500/20 bg-white/[0.03] p-6">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-amber-400">
                Editing
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Edit your post
              </h2>
            </div>

            <button
              type="button"
              onClick={cancelEditing}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-white/5 hover:text-white"
            >
              <X size={18} />
            </button>

          </div>

          <form
            onSubmit={updatePost}
            className="mt-6 space-y-5"
          >

            {/* Title */}
            <div>
              <label className="text-sm font-medium text-gray-300">
                Title
              </label>

              <input
                type="text"
                value={editForm.title}
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    title:
                      event.target.value,
                  })
                }
                maxLength={150}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50"
              />
            </div>

            {/* Content */}
            <div>
              <label className="text-sm font-medium text-gray-300">
                Content
              </label>

              <textarea
                rows={8}
                value={editForm.content}
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    content:
                      event.target.value,
                  })
                }
                maxLength={10000}
                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-7 text-white outline-none focus:border-amber-500/50"
              />
            </div>

            {/* Visibility */}
            <div>
              <label className="text-sm font-medium text-gray-300">
                Visibility
              </label>

              <select
                value={
                  editForm.visibility
                }
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    visibility:
                      event.target.value,
                    tier:
                      event.target
                        .value ===
                        "public"
                        ? ""
                        : editForm.tier,
                  })
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50"
              >
                <option
                  value="public"
                  className="bg-[#111]"
                >
                  Public
                </option>

                <option
                  value="supporters"
                  className="bg-[#111]"
                >
                  Supporters Only
                </option>
              </select>
            </div>

            {/* Tier */}
            {editForm.visibility ===
              "supporters" && (
                <div>

                  <label className="text-sm font-medium text-gray-300">
                    Required Support Tier
                  </label>

                  {loadingTiers ? (
                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-500">
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                      Loading tiers...
                    </div>
                  ) : tiers.length ===
                    0 ? (
                    <div className="mt-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-400">
                      You don&apos;t have any
                      active tiers.
                    </div>
                  ) : (
                    <select
                      value={
                        editForm.tier
                      }
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          tier: event
                            .target
                            .value,
                        })
                      }
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50"
                    >
                      <option
                        value=""
                        className="bg-[#111]"
                      >
                        Select a tier
                      </option>

                      {tiers.map(
                        (tier) => (
                          <option
                            key={tier._id}
                            value={tier._id}
                            className="bg-[#111]"
                          >
                            {tier.name} —
                            ₹
                            {tier.price}
                          </option>
                        )
                      )}
                    </select>
                  )}

                </div>
              )}

            {/* Image */}
            <div>

              <label className="text-sm font-medium text-gray-300">
                Image URL
              </label>

              <input
                type="url"
                value={
                  editForm.image
                }
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    image:
                      event.target.value,
                  })
                }
                placeholder="https://..."
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50"
              />

            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">

              <button
                type="submit"
                disabled={
                  savingEdit ||
                  (editForm.visibility ===
                    "supporters" &&
                    !editForm.tier)
                }
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingEdit ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>

              <button
                type="button"
                onClick={cancelEditing}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
              >
                Cancel
              </button>

            </div>

          </form>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <ChaiLoader fullScreen={false} message="Loading your posts..." />
      ) : posts.length === 0 ? (

        /* Empty State */
        <div className="mt-10 rounded-2xl border border-dashed border-white/10 p-12 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
            <FileText
              size={28}
              className="text-amber-400"
            />
          </div>

          <h2 className="mt-5 text-xl font-bold">
            No posts yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            Create your first post and
            start sharing content with
            your supporters.
          </p>

          <Link
            href="/creator/posts/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400"
          >
            <Plus size={18} />
            Create Your First Post
          </Link>

        </div>

      ) : (

        /* Posts */
        <div className="mt-10 space-y-5">

          {posts.map((post) => (

            <article
              key={post._id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
            >

              {/* Image */}
              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-64 w-full object-cover"
                />
              )}

              <div className="p-6">

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-3">

                  {post.visibility ===
                    "supporters" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
                      <Lock size={13} />
                      Supporters Only
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                      <Globe size={13} />
                      Public
                    </span>
                  )}

                  {post.tier &&
                    post.tier.name && (
                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-400">
                        {post.tier.name}
                      </span>
                    )}

                  <span className="text-xs text-gray-600">
                    {post.createdAt
                      ? new Date(
                        post.createdAt
                      ).toLocaleDateString()
                      : "Unknown date"}
                  </span>

                </div>

                {/* Title */}
                <h2 className="mt-4 text-xl font-bold">
                  {post.title}
                </h2>

                {/* Content */}
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-400">
                  {post.content}
                </p>

                {/* Actions */}
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/creator/posts/${post._id}/edit`}
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-400 transition hover:bg-amber-500 hover:text-black"
                  >
                    <Pencil size={15} />
                    Edit Post
                  </Link>

                  <button
                    type="button"
                    onClick={() => startEditing(post)}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-400 transition hover:border-white/20 hover:text-white"
                  >
                    Quick Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deletePost(
                        post._id
                      )
                    }
                    disabled={
                      deletingId ===
                      post._id
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 px-4 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId ===
                      post._id ? (
                      <>
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2
                          size={15}
                        />
                        Delete
                      </>
                    )}
                  </button>

                </div>

              </div>

            </article>

          ))}

        </div>

      )}

    </section>

  </main>


  );
}
