"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { loadRazorpayScript } from "@/lib/loadRazorpay";

export default function JoinTierButton({
  tierId,
  tierName,
  tierOrder,
  currentTierId,
  currentTierOrder,
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const isCurrentTier =
    currentTierId && currentTierId.toString() === tierId.toString();

  const isUpgrade =
    currentTierId &&
    currentTierOrder !== null &&
    currentTierOrder !== undefined &&
    tierOrder > currentTierOrder;

  const isDowngrade =
    currentTierId &&
    currentTierOrder !== null &&
    currentTierOrder !== undefined &&
    tierOrder < currentTierOrder;

  async function handleJoin() {
    if (loading || isCurrentTier) return;

    if (!session) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setLoading(true);

    try {
      // 1. Ensure Razorpay checkout script is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error(
          "Razorpay SDK failed to load. Please check your internet connection."
        );
      }

      // 2. Determine whether it's a new subscription or changing an existing one
      const isChangingTier = Boolean(currentTierId);
      const orderEndpoint = isChangingTier
        ? "/api/payments/change-tier"
        : "/api/payments/create-order";

      const verifyEndpoint = isChangingTier
        ? "/api/payments/change-tier/verify"
        : "/api/payments/verify";

      // 3. Create order on backend
      const response = await fetch(orderEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tierId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to initiate payment.");
      }

      const { order, tier, creator, keyId } = data;

      // 4. Open Razorpay Checkout Modal
      const options = {
        key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "GetMeAChai",
        description: `Support ${creator.name || "Creator"} - ${tier.name}`,
        order_id: order.id,
        handler: async function (razorpayResponse) {
          try {
            setLoading(true);

            // 5. Verify signature on backend
            const verifyRes = await fetch(verifyEndpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
                tierId,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              throw new Error(
                verifyData.message || "Payment verification failed."
              );
            }

            alert(
              verifyData.message ||
                `Success! You are now supporting ${creator.name || "Creator"} on the ${tier.name} tier.`
            );

            router.refresh();
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr);
            alert(
              verifyErr.message ||
                "Payment verification failed. Please contact support."
            );
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        },
        theme: {
          color: "#f59e0b",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        alert(
          response.error?.description ||
            "Payment failed. Please try again or use another payment method."
        );
        setLoading(false);
      });

      razorpayInstance.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert(error?.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleJoin}
      disabled={loading || isCurrentTier}
      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Processing...
        </>
      ) : isCurrentTier ? (
        "Current Tier"
      ) : isUpgrade ? (
        `Upgrade to ${tierName}`
      ) : isDowngrade ? (
        `Downgrade to ${tierName}`
      ) : (
        `Join ${tierName}`
      )}
    </button>
  );
}
