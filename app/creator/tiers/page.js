"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Coffee,
  Plus,
  Pencil,
} from "lucide-react";

export default function CreatorTiersPage() {
  const { data: session, status } = useSession();

  const [tiers, setTiers] = useState([]);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    benefits: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadTiers() {
      try {
        const response = await fetch("/api/creator/tiers");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load tiers.");
        }

        if (isMounted) {
          setTiers(data.tiers || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (status === "authenticated") {
      loadTiers();
    }

    return () => {
      isMounted = false;
    };
  }, [status]);

  async function createTier(event) {
    event.preventDefault();

    setCreating(true);
    setMessage("");
    setError("");

    const benefits = form.benefits
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      const response = await fetch(
        "/api/creator/tiers",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            description: form.description,
            price: Number(form.price),
            benefits,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create tier."
        );
      }

      setTiers((previous) => [
        ...previous,
        data.tier,
      ]);

      setForm({
        name: "",
        description: "",
        price: "",
        benefits: "",
      });

      setMessage("Tier created successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function updateTier(event) {
    event.preventDefault();

    setSavingEdit(true);
    setMessage("");
    setError("");

    const benefits = form.benefits
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      const response = await fetch(
        "/api/creator/tiers",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tierId: editingId,
            name: form.name,
            description: form.description,
            price: Number(form.price),
            benefits,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update tier."
        );
      }

      setTiers((previous) =>
        previous.map((tier) =>
          tier._id === editingId
            ? data.tier
            : tier
        )
      );

      setEditingId(null);

      setForm({
        name: "",
        description: "",
        price: "",
        benefits: "",
      });

      setMessage(
        "Tier updated successfully."
      );
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSavingEdit(false);
    }
  }

  async function deleteTier(tierId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this tier?"
    );

    if (!confirmed) return;

    setDeletingId(tierId);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/creator/tiers",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tierId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete tier."
        );
      }

      setTiers((previous) =>
        previous.filter(
          (tier) => tier._id !== tierId
        )
      );

      if (editingId === tierId) {
        setEditingId(null);

        setForm({
          name: "",
          description: "",
          price: "",
          benefits: "",
        });
      }

      setMessage("Tier deleted successfully.");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleTierStatus(tier) {
    setUpdatingStatusId(tier._id);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/creator/tiers",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tierId: tier._id,
            isActive: !tier.isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to update tier status."
        );
      }

      setTiers((previous) =>
        previous.map((item) =>
          item._id === tier._id
            ? data.tier
            : item
        )
      );

      setMessage(
        data.tier.isActive
          ? "Tier activated successfully."
          : "Tier deactivated successfully."
      );
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setUpdatingStatusId(null);
    }
  }

  if (status === "loading" || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] text-white">
        <Coffee
          size={30}
          className="animate-pulse text-amber-400"
        />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] text-white">
        <Link
          href="/login"
          className="rounded-xl bg-amber-500 px-6 py-3 font-semibold text-black"
        >
          Login
        </Link>
      </main>
    );
  }

  if (session.user.role !== "creator") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Creator access only
          </h1>

          <Link
            href="/dashboard"
            className="mt-4 inline-block text-amber-400"
          >
            Back to dashboard →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">

      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <Link
            href="/creator/dashboard"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
          >
            <ArrowLeft size={17} />
            Dashboard
          </Link>

          <div className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-black">
              <Coffee size={16} />
            </div>

            <span className="font-bold">
              GetMe<span className="text-amber-400">AChai</span>
            </span>
          </div>

        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">

        <div>
          <p className="text-sm font-medium text-amber-400">
            Monetization
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Support tiers
          </h1>

          <p className="mt-3 text-gray-500">
            Give your supporters different ways to support you.
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-[380px_1fr]">

          {/* Create tier */}
          <div className="h-fit rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Plus size={20} />
              </div>

              <div>
                <h2 className="font-semibold">
                  {editingId
                    ? "Edit tier"
                    : "Create a tier"}
                </h2>

                <p className="text-sm text-gray-500">
                  {editingId
                    ? "Update your support option."
                    : "Add a new support option."}
                </p>
              </div>

            </div>

            <form
              onSubmit={
                editingId
                  ? updateTier
                  : createTier
              }
              className="mt-6 space-y-5"
            >

              <Input
                label="Tier name"
                placeholder="Chai Supporter"
                value={form.name}
                onChange={(value) =>
                  setForm({
                    ...form,
                    name: value,
                  })
                }
              />

              <Input
                label="Monthly price (₹)"
                type="number"
                min="1"
                placeholder="100"
                value={form.price}
                onChange={(value) =>
                  setForm({
                    ...form,
                    price: value,
                  })
                }
              />

              <div>
                <label className="text-sm font-medium text-gray-300">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description:
                        event.target.value,
                    })
                  }
                  placeholder="What does this tier offer?"
                  className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300">
                  Benefits
                </label>

                <textarea
                  rows={5}
                  value={form.benefits}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      benefits:
                        event.target.value,
                    })
                  }
                  placeholder={
                    "Behind-the-scenes content\nMonthly updates\nEarly access"
                  }
                  className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-amber-500/50"
                />

                <p className="mt-2 text-xs text-gray-600">
                  Put each benefit on a new line.
                </p>
              </div>

              <button
                type="submit"
                disabled={
                  creating || savingEdit || deletingId
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:opacity-50"
              >
                {editingId ? (
                  <>
                    <Pencil size={18} />

                    {savingEdit
                      ? "Saving..."
                      : "Save Changes"}
                  </>
                ) : (
                  <>
                    <Plus size={18} />

                    {creating
                      ? "Creating..."
                      : "Create Tier"}
                  </>
                )}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);

                    setForm({
                      name: "",
                      description: "",
                      price: "",
                      benefits: "",
                    });

                    setMessage("");
                    setError("");
                  }}
                  className="w-full rounded-xl border border-white/10 px-5 py-3 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
                >
                  Cancel Editing
                </button>
              )}

            </form>

          </div>

          {/* Existing tiers */}
          <div>

            <h2 className="text-xl font-bold">
              Your tiers
            </h2>

            {tiers.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-10 text-center">

                <Coffee
                  size={32}
                  className="mx-auto text-amber-400"
                />

                <h3 className="mt-4 font-semibold">
                  No tiers yet
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Create your first support tier.
                </p>

              </div>
            ) : (
              <div className="mt-5 space-y-4">

                {tiers.map((tier) => (
                  <div
                    key={tier._id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
                  >

                    <div className="flex items-start justify-between gap-5">

                      <div>
                        <h3 className="text-lg font-bold">
                          {tier.name}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {tier.description}
                        </p>

                        <div className="mt-2">
                          {tier.isActive ? (
                            <span className="text-xs text-green-400">
                              ● Active
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">
                              ● Inactive
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-amber-400">
                            ₹{tier.price}
                          </p>

                          <p className="text-xs text-gray-600">
                            per month
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(tier._id);

                              setForm({
                                name: tier.name || "",
                                description: tier.description || "",
                                price: tier.price || "",
                                benefits:
                                  tier.benefits?.join("\n") || "",
                              });

                              setMessage("");
                              setError("");
                            }}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-gray-400 transition hover:border-amber-500/30 hover:text-amber-400"
                          >
                            <Pencil size={15} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteTier(tier._id)}
                            disabled={deletingId === tier._id}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                          >
                            {deletingId === tier._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleTierStatus(tier)}
                            disabled={updatingStatusId === tier._id}
                            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition disabled:opacity-50 ${tier.isActive
                              ? "border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10"
                              : "border-green-500/20 text-green-400 hover:bg-green-500/10"
                              }`}
                          >
                            {updatingStatusId === tier._id
                              ? "Updating..."
                              : tier.isActive
                                ? "Deactivate"
                                : "Activate"}
                          </button>
                        </div>
                      </div>

                    </div>

                    {tier.benefits?.length > 0 && (
                      <div className="mt-5 space-y-2">

                        {tier.benefits.map(
                          (benefit, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm text-gray-400"
                            >
                              <span className="text-amber-400">
                                ✓
                              </span>

                              {benefit}
                            </div>
                          )
                        )}

                      </div>
                    )}

                  </div>
                ))}

              </div>
            )}

          </div>

        </div>

      </section>

    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-300">
        {label}
      </label>

      <input
        type={type}
        min={min}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-amber-500/50"
      />
    </div>
  );
}