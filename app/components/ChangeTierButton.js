"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { loadRazorpayScript } from "@/lib/loadRazorpay";

export default function ChangeTierButton({
  creatorId,
  currentTierId,
}) {
  const { data: session } = useSession();
  const [tiers, setTiers] = useState([]);
  const [selectedTier, setSelectedTier] = useState("");
  const [loadingTiers, setLoadingTiers] = useState(true);
  const [changing, setChanging] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadTiers() {
      if (!creatorId) return;

      try {
        const response = await fetch(
          `/api/subscriptions/tiers?creatorId=${creatorId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load tiers.");
        }

        if (isMounted) {
          setTiers(data.tiers || []);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Load creator tiers error:", err);
          setError(err?.message || "Failed to load tiers.");
        }
      } finally {
        if (isMounted) {
          setLoadingTiers(false);
        }
      }
    }

    loadTiers();

    return () => {
      isMounted = false;
    };
  }, [creatorId]);

  async function handleChangeTier() {
    if (!selectedTier) {
      setError("Please select a tier.");
      toast.error("Please select a tier.");
      return;
    }

    if (
      currentTierId &&
      selectedTier.toString() === currentTierId.toString()
    ) {
      setError("You are already on this tier.");
      toast.info("You are already on this tier.");
      return;
    }

    try {
      setChanging(true);
      setError("");
      setMessage("");

      // 1. Ensure Razorpay SDK is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error(
          "Razorpay SDK failed to load. Please check your internet connection."
        );
      }

      // 2. Create change-tier order on server
      const response = await fetch("/api/payments/change-tier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tierId: selectedTier,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to initiate tier change.");
      }

      const { order, tier, creator, keyId } = data;

      // 3. Configure Razorpay modal options
      const options = {
        key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "GetMeAChai",
        description: `Change Tier to ${tier.name} for ${creator.name || "Creator"}`,
        order_id: order.id,
        handler: async function (razorpayResponse) {
          try {
            setChanging(true);
            setMessage("Verifying payment...");

            // 4. Verify signature on server
            const verifyRes = await fetch("/api/payments/change-tier/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
                tierId: selectedTier,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              throw new Error(
                verifyData.message || "Payment verification failed."
              );
            }

            const successMsg =
              verifyData.message || `Successfully changed tier to ${tier.name}!`;
            setMessage(successMsg);
            toast.success(successMsg);

            // Refresh page to update dashboard
            setTimeout(() => {
              window.location.reload();
            }, 1200);
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr);
            const errText =
              verifyErr.message ||
              "Payment verification failed. Please contact support.";
            setError(errText);
            toast.error(errText);
          } finally {
            setChanging(false);
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
            setChanging(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        const errMsg =
          response.error?.description ||
          "Payment could not be processed. Please try again.";
        setError(errMsg);
        toast.error(errMsg);
        setChanging(false);
      });

      razorpayInstance.open();
    } catch (error) {
      console.error("Change tier error:", error);
      const errMsg = error?.message || "Failed to change tier.";
      setError(errMsg);
      toast.error(errMsg);
      setChanging(false);
    }
  }

  return (
    <div className="mt-4">
      {loadingTiers ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 size={15} className="animate-spin" />
          Loading tiers...
        </div>
      ) : tiers.length === 0 ? (
        <p className="text-sm text-gray-500">No active tiers available.</p>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={selectedTier}
            onChange={(event) => {
              setSelectedTier(event.target.value);
              setError("");
              setMessage("");
            }}
            className="rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500/50"
          >
            <option value="" className="bg-[#111]">
              Change tier...
            </option>

            {tiers.map((tier) => {
              const isCurrent =
                currentTierId &&
                currentTierId.toString() === tier._id.toString();

              return (
                <option
                  key={tier._id}
                  value={tier._id}
                  disabled={isCurrent}
                  className="bg-[#111]"
                >
                  {tier.name} — ₹{tier.price}
                  {isCurrent ? " (Current)" : ""}
                </option>
              );
            })}
          </select>

          <button
            type="button"
            onClick={handleChangeTier}
            disabled={changing || !selectedTier}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {changing ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Processing...
              </>
            ) : (
              "Change Tier"
            )}
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      {message && <p className="mt-2 text-sm text-green-400">{message}</p>}
    </div>
  );
}
