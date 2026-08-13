"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import ChaiLoader from "@/components/ChaiLoader";
import GoalProgressBar from "@/components/GoalProgressBar";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Target,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Loader2,
  Trophy,
  Coffee,
  Users,
} from "lucide-react";

export default function CreatorGoalsPage() {
  const { data: session, status } = useSession();

  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState({
    activeSupporters: 0,
    monthlySupport: 0,
    totalEarnings: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "amount",
    targetAmount: "5000",
    isActive: true,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadGoals() {
      try {
        const response = await fetch("/api/creator/goals");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load goals.");
        }

        if (isMounted) {
          setGoals(data.goals || []);
          if (data.stats) {
            setStats(data.stats);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Load goals error:", err);
          toast.error(err.message || "Failed to load goals.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (status === "authenticated") {
      loadGoals();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [status]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleTypeChange(newType) {
    setForm((prev) => ({
      ...prev,
      type: newType,
      targetAmount: newType === "supporters" ? "25" : "5000",
    }));
  }

  function startEdit(goal) {
    setEditingId(goal._id);
    setForm({
      title: goal.title || "",
      description: goal.description || "",
      type: goal.type || "amount",
      targetAmount: String(goal.targetAmount || 1000),
      isActive: Boolean(goal.isActive),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      type: "amount",
      targetAmount: "5000",
      isActive: true,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Please enter a goal title.");
      return;
    }

    const numericTarget = Number(form.targetAmount);
    if (!Number.isFinite(numericTarget) || numericTarget < 1) {
      toast.error("Please enter a valid target goal number.");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        // Update Goal
        const response = await fetch("/api/creator/goals", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            goalId: editingId,
            title: form.title,
            description: form.description,
            type: form.type,
            targetAmount: numericTarget,
            isActive: form.isActive,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to update goal.");
        }

        setGoals((prev) =>
          prev.map((g) => {
            if (g._id === editingId) {
              const current =
                form.type === "supporters"
                  ? stats.activeSupporters
                  : stats.monthlySupport;
              return {
                ...g,
                ...data.goal,
                currentProgress: current,
                percentage: Math.min(
                  100,
                  Math.round((current / numericTarget) * 100)
                ),
                isReached: current >= numericTarget,
              };
            }
            // if updated goal became active, mark others inactive
            return form.isActive ? { ...g, isActive: false } : g;
          })
        );

        toast.success("Goal updated successfully!");
        cancelEdit();
      } else {
        // Create Goal
        const response = await fetch("/api/creator/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            type: form.type,
            targetAmount: numericTarget,
            isActive: form.isActive,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to create goal.");
        }

        const current =
          form.type === "supporters"
            ? stats.activeSupporters
            : stats.monthlySupport;

        const newGoal = {
          ...data.goal,
          currentProgress: current,
          percentage: Math.min(
            100,
            Math.round((current / numericTarget) * 100)
          ),
          isReached: current >= numericTarget,
        };

        setGoals((prev) => [
          newGoal,
          ...(form.isActive ? prev.map((g) => ({ ...g, isActive: false })) : prev),
        ]);

        toast.success("Goal published successfully!");
        setForm({
          title: "",
          description: "",
          type: "amount",
          targetAmount: "5000",
          isActive: true,
        });
      }
    } catch (err) {
      console.error("Save goal error:", err);
      toast.error(err.message || "Failed to save goal.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(goal) {
    setTogglingId(goal._id);
    const newStatus = !goal.isActive;

    try {
      const response = await fetch("/api/creator/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId: goal._id,
          isActive: newStatus,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to change goal status.");
      }

      setGoals((prev) =>
        prev.map((g) => {
          if (g._id === goal._id) {
            return { ...g, isActive: newStatus };
          }
          return newStatus ? { ...g, isActive: false } : g;
        })
      );

      toast.success(
        newStatus ? "Goal activated on profile." : "Goal deactivated."
      );
    } catch (err) {
      console.error("Toggle goal status error:", err);
      toast.error(err.message || "Failed to change goal status.");
    } finally {
      setTogglingId(null);
    }
  }

  async function deleteGoal(goalId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this goal? This cannot be undone."
    );
    if (!confirmed) return;

    setDeletingId(goalId);

    try {
      const response = await fetch("/api/creator/goals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete goal.");
      }

      setGoals((prev) => prev.filter((g) => g._id !== goalId));
      if (editingId === goalId) {
        cancelEdit();
      }

      toast.success("Goal deleted successfully.");
    } catch (err) {
      console.error("Delete goal error:", err);
      toast.error(err.message || "Failed to delete goal.");
    } finally {
      setDeletingId(null);
    }
  }

  if (status === "loading" || loading) {
    return <ChaiLoader message="Loading your creator goals..." />;
  }

  if (!session || session.user.role !== "creator") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-white">
        <div className="text-center">
          <Coffee size={40} className="mx-auto text-amber-400" />
          <h1 className="mt-5 text-2xl font-bold">Creator Access Required</h1>
          <p className="mt-3 text-gray-500">
            Please log in with a creator account to manage goals.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-xl bg-amber-500 px-6 py-3 font-semibold text-black hover:bg-amber-400 transition"
          >
            Log In
          </Link>
        </div>
      </main>
    );
  }

  // Simulated live progress for the form preview
  const previewCurrent =
    form.type === "supporters" ? stats.activeSupporters : stats.monthlySupport;
  const previewTarget = Number(form.targetAmount) || 1;
  const previewPercentage = Math.min(
    100,
    Math.round((previewCurrent / previewTarget) * 100)
  );

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/creator/dashboard"
            className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <Link href="/" className="flex items-center gap-2 font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-black">
              <Coffee size={16} />
            </div>
            GetMe<span className="text-amber-400">AChai</span>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Target size={15} />
              <span>Milestone Tracking</span>
            </div>
            <h1 className="mt-2 text-3xl font-bold">Creator Goals</h1>
            <p className="mt-1 text-sm text-gray-400">
              Set funding and subscriber goals to engage and rally your community.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/${session.user.username || session.user.name}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-semibold text-white hover:border-amber-500/30 transition"
            >
              <Sparkles size={14} className="text-amber-400" />
              Preview Profile
            </Link>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          {/* Left Column: Form & Live Preview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white flex items-center justify-between">
                <span>{editingId ? "Edit Goal" : "Create a New Goal"}</span>
                {editingId && (
                  <button
                    onClick={cancelEdit}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                )}
              </h2>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                {/* Goal Title */}
                <div>
                  <label className="block text-xs font-medium text-gray-300">
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. 4K Camera for Video Tutorials"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Goal Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-2">
                    Goal Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleTypeChange("amount")}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold transition ${
                        form.type === "amount"
                          ? "border-amber-500 bg-amber-500/15 text-amber-400"
                          : "border-white/10 bg-white/[0.02] text-gray-400 hover:text-white"
                      }`}
                    >
                      <Coffee size={15} />
                      Monthly Support (₹)
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTypeChange("supporters")}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold transition ${
                        form.type === "supporters"
                          ? "border-amber-500 bg-amber-500/15 text-amber-400"
                          : "border-white/10 bg-white/[0.02] text-gray-400 hover:text-white"
                      }`}
                    >
                      <Users size={15} />
                      Supporter Count
                    </button>
                  </div>
                </div>

                {/* Target Amount */}
                <div>
                  <label className="block text-xs font-medium text-gray-300">
                    Target {form.type === "supporters" ? "Supporters" : "Amount (₹)"} *
                  </label>
                  <input
                    type="number"
                    name="targetAmount"
                    min="1"
                    value={form.targetAmount}
                    onChange={handleChange}
                    placeholder={form.type === "supporters" ? "e.g. 50" : "e.g. 10000"}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-300">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Tell your supporters why this milestone matters and what it helps you create..."
                    className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-white/10 bg-white/5 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="isActive" className="text-xs text-gray-300 font-medium">
                    Display this goal actively on public profile
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 text-sm font-bold text-black transition hover:bg-amber-400 disabled:opacity-50 shadow-lg shadow-amber-500/10"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : editingId ? (
                    "Update Goal"
                  ) : (
                    "Publish Goal"
                  )}
                </button>
              </form>
            </div>

            {/* Live Preview Box */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Live Profile Widget Preview
                </span>
                <span className="text-[11px] text-amber-400/80">Real-time update</span>
              </div>

              <GoalProgressBar
                goal={{
                  title: form.title || "Your Goal Title Here",
                  description: form.description || "Goal description will appear here on your public page.",
                  type: form.type,
                  targetAmount: previewTarget,
                  currentProgress: previewCurrent,
                  percentage: previewPercentage,
                }}
                isPreview={true}
              />
            </div>
          </div>

          {/* Right Column: Existing Goals List */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Target size={18} className="text-amber-400" />
                <span>Your Goals & Milestones</span>
                <span className="ml-2 text-xs font-medium text-gray-500">
                  ({goals.length})
                </span>
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Manage your current active goal and previous milestones.
              </p>
            </div>

            {goals.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-12 text-center">
                <Target size={36} className="mx-auto text-gray-600 mb-3" />
                <h3 className="text-base font-bold text-white">No goals created yet</h3>
                <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
                  Create your first goal using the form on the left to show supporters what you are working towards!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => {
                  const isCurrentActive = goal.isActive;
                  const isReached = goal.isReached;

                  return (
                    <div
                      key={goal._id}
                      className={`relative overflow-hidden rounded-2xl border p-6 transition ${
                        isCurrentActive
                          ? "border-amber-500/40 bg-amber-500/[0.04] shadow-lg shadow-amber-500/5"
                          : "border-white/10 bg-white/[0.02]"
                      }`}
                    >
                      {/* Top status bar */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {isCurrentActive ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                              Active on Profile
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-medium text-gray-400">
                              Inactive
                            </span>
                          )}

                          {isReached && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 border border-green-500/20 px-2.5 py-1 text-xs font-semibold text-green-400">
                              <Trophy size={12} /> Achieved
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleStatus(goal)}
                            disabled={togglingId === goal._id}
                            title={isCurrentActive ? "Deactivate" : "Make Active"}
                            className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-white px-2.5 py-1 rounded-lg border border-white/5 bg-white/[0.03] transition"
                          >
                            {togglingId === goal._id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : isCurrentActive ? (
                              <>
                                <ToggleRight size={16} className="text-amber-400" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft size={16} className="text-gray-500" />
                                <span>Activate</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => startEdit(goal)}
                            title="Edit Goal"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            onClick={() => deleteGoal(goal._id)}
                            disabled={deletingId === goal._id}
                            title="Delete Goal"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition"
                          >
                            {deletingId === goal._id ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="mt-4">
                        <h3 className="text-base font-bold text-white">
                          {goal.title}
                        </h3>
                        {goal.description && (
                          <p className="mt-1 text-xs text-gray-400 leading-relaxed">
                            {goal.description}
                          </p>
                        )}
                      </div>

                      {/* Progress Bar in list card */}
                      <div className="mt-4">
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isReached
                                ? "bg-gradient-to-r from-green-500 to-emerald-400"
                                : "bg-gradient-to-r from-amber-500 to-amber-300"
                            }`}
                            style={{
                              width: `${Math.max(goal.percentage || 0, 3)}%`,
                            }}
                          />
                        </div>

                        <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                          <span>
                            {goal.type === "supporters" ? (
                              <>
                                {goal.currentProgress} / {goal.targetAmount} supporters
                              </>
                            ) : (
                              <>
                                ₹{(goal.currentProgress || 0).toLocaleString()} / ₹{(goal.targetAmount || 0).toLocaleString()}
                              </>
                            )}
                          </span>
                          <span className="font-bold text-amber-400">
                            {goal.percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
