"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelSubscriptionButton({
  subscriptionId,
  onCancelled,
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this subscription?"
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/subscriptions/cancel",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subscriptionId,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to cancel subscription."
        );
        return;
      }

      alert(
        data.message ||
          "Subscription cancelled successfully."
      );

      // Update dashboard immediately
      if (onCancelled) {
        await onCancelled();
      }

      // Also refresh server components
      router.refresh();
    } catch (error) {
      console.error(
        "Cancel subscription error:",
        error
      );

      alert(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-xl border border-red-500/20 px-5 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading
        ? "Cancelling..."
        : "Cancel Support"}
    </button>
  );
}