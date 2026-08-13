"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export default function JoinTierButton({
  tierId,
  tierName,
  currentTierId,
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isCurrentTier =
    currentTierId &&
    currentTierId.toString() === tierId.toString();

  async function handleJoin() {
    try {
      setLoading(true);
      setMessage("");
      setError("");

      const hasExistingSubscription =
        Boolean(currentTierId);

      const response = await fetch(
        "/api/subscriptions",
        {
          method: hasExistingSubscription
            ? "PATCH"
            : "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            tierId,
          }),
        }
      );

      /*
       * Read the response safely.
       *
       * Some server errors may return an empty response,
       * so calling response.json() directly can throw:
       *
       * Unexpected end of JSON input
       */

      const responseText = await response.text();

      let data = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error(
            "Invalid JSON response:",
            responseText
          );

          throw new Error(
            "The server returned an invalid response."
          );
        }
      }

      // =====================================================
      // NOT LOGGED IN
      // =====================================================

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      // =====================================================
      // API ERROR
      // =====================================================

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update your subscription."
        );
      }

      // =====================================================
      // SUCCESS
      // =====================================================

      const successMsg =
        data.message || `You are now supporting ${tierName}!`;
      setMessage(successMsg);
      toast.success(successMsg);

      /*
       * Refresh the server component so:
       *
       * - current tier updates
       * - post access updates
       * - buttons update
       */

      router.refresh();

      /*
       * Give the server component a moment to refresh
       * before removing the success message.
       */

      setTimeout(() => {
        window.location.reload();
      }, 500);

    } catch (error) {
      console.error(
        "Subscription error:",
        error
      );

      const errorMsg =
        error?.message || "Something went wrong. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5">

      {/* =====================================================
          BUTTON
      ===================================================== */}

      <button
        type="button"
        onClick={handleJoin}
        disabled={loading || isCurrentTier}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
      >

        {loading ? (
          <>
            <Loader2
              size={18}
              className="animate-spin"
            />

            Updating...
          </>

        ) : isCurrentTier ? (

          "Current Tier"

        ) : currentTierId ? (

          `Change to ${tierName}`

        ) : (

          "Join This Tier"

        )}

      </button>

      {/* =====================================================
          SUCCESS MESSAGE
      ===================================================== */}

      {message && (
        <p className="mt-3 text-center text-sm text-green-400">
          {message}
        </p>
      )}

      {/* =====================================================
          ERROR MESSAGE
      ===================================================== */}

      {error && (
        <p className="mt-3 text-center text-sm text-red-400">
          {error}
        </p>
      )}

    </div>
  );
}