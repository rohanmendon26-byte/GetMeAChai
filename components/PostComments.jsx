"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { MessageSquare, Send, Loader2 } from "lucide-react";

export default function PostComments({ postId, initialCount = 0 }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    if (open && comments.length === 0) {
      async function loadComments() {
        setLoading(true);
        try {
          const res = await fetch(`/api/posts/${postId}/comments`);
          const data = await res.json();
          if (data.success && isMounted) {
            setComments(data.comments || []);
          }
        } catch (err) {
          console.error("Load comments err:", err);
        } finally {
          if (isMounted) setLoading(false);
        }
      }
      loadComments();
    }

    return () => {
      isMounted = false;
    };
  }, [open, postId, comments.length]);

  async function handleAddComment(e) {
    e.preventDefault();
    if (!text.trim() || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to post comment");
      }

      setComments((prev) => [...prev, data.comment]);
      setText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-4 border-t border-white/5 pt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-amber-400 transition"
      >
        <MessageSquare size={14} />
        {open
          ? "Hide comments"
          : `Comments (${comments.length > 0 ? comments.length : initialCount})`}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {loading ? (
            <div className="flex items-center gap-2 py-2 text-xs text-gray-500">
              <Loader2 size={13} className="animate-spin" />
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-gray-500 py-1">
              No comments yet. Be the first to leave a thought!
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white">
                      {comment.author.name}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {session ? (
            <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder:text-gray-600 outline-none focus:border-amber-500/50"
              />
              <button
                type="submit"
                disabled={submitting || !text.trim()}
                className="flex items-center justify-center rounded-xl bg-amber-500 px-3 py-2 text-xs font-semibold text-black transition hover:bg-amber-400 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Send size={13} />
                )}
              </button>
            </form>
          ) : (
            <p className="text-xs text-gray-500 pt-1">
              <Link href="/login" className="text-amber-400 hover:underline">
                Log in
              </Link>{" "}
              to leave a comment.
            </p>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      )}
    </div>
  );
}
