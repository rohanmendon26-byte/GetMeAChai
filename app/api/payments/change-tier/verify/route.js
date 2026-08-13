import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import Razorpay from "razorpay";

import connectDB from "@/lib/mongodb";
import Tier from "@/models/Tier";
import Subscription from "@/models/Subscription";
import Payment from "@/models/Payment";
import Notification from "@/models/Notification";

import { authOptions } from "@/lib/auth";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    // ============================================
    // AUTHENTICATION
    // ============================================

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to change your tier.",
        },
        { status: 401 }
      );
    }

    // ============================================
    // GET PAYMENT DATA
    // ============================================

    const body = await request.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      tierId,
    } = body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !tierId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment information is incomplete.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // VERIFY RAZORPAY SIGNATURE
    // ============================================

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    if (
      generatedSignature !== razorpay_signature
    ) {
      console.error(
        "Invalid Razorpay signature."
      );

      return NextResponse.json(
        {
          success: false,
          message: "Payment verification failed.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // DATABASE
    // ============================================

    await connectDB();

    // ============================================
    // FIND NEW TIER
    // ============================================

    const newTier = await Tier.findById(tierId);

    if (!newTier || !newTier.isActive) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This tier is no longer available.",
        },
        { status: 404 }
      );
    }

    // ============================================
    // VERIFY RAZORPAY ORDER
    // ============================================

    let razorpayOrder;

    try {
      razorpayOrder =
        await razorpay.orders.fetch(
          razorpay_order_id
        );
    } catch (error) {
      console.error(
        "Failed to fetch Razorpay order:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to verify Razorpay order.",
        },
        { status: 400 }
      );
    }

    if (!razorpayOrder) {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay order not found.",
        },
        { status: 404 }
      );
    }

    // ============================================
    // VERIFY ORDER NOTES
    // ============================================

    const orderNotes =
      razorpayOrder.notes || {};

    // Verify supporter

    if (
      orderNotes.supporterId !==
      session.user.id.toString()
    ) {
      console.error(
        "Razorpay order supporter mismatch."
      );

      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment order.",
        },
        { status: 403 }
      );
    }

    // Verify tier

    if (
      orderNotes.tierId !==
      newTier._id.toString()
    ) {
      console.error(
        "Razorpay order tier mismatch."
      );

      return NextResponse.json(
        {
          success: false,
          message: "Payment tier mismatch.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // VERIFY PAYMENT AMOUNT
    // ============================================

    const expectedAmount = Math.round(
      Number(newTier.price) * 100
    );

    if (
      Number(razorpayOrder.amount) !==
      expectedAmount
    ) {
      console.error(
        "Razorpay amount mismatch."
      );

      return NextResponse.json(
        {
          success: false,
          message: "Payment amount mismatch.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // FIND EXISTING SUBSCRIPTION
    // ============================================

    const subscription =
      await Subscription.findOne({
        _id: orderNotes.subscriptionId,
        supporter: session.user.id,
        creator: newTier.creator,
        status: "active",
      });

    if (!subscription) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Active subscription not found.",
        },
        { status: 404 }
      );
    }

    // ============================================
    // PREVENT SAME TIER
    // ============================================

    if (
      subscription.tier.toString() ===
      newTier._id.toString()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You are already subscribed to this tier.",
        },
        { status: 409 }
      );
    }

    // ============================================
    // UPDATE SUBSCRIPTION
    // ============================================

    subscription.tier = newTier._id;

    subscription.amount = newTier.price;

    subscription.paymentId =
      razorpay_payment_id;

    subscription.razorpayOrderId =
      razorpay_order_id;

    subscription.paymentStatus =
      "paid";

    subscription.status = "active";

    await subscription.save();

    // Create payment record
    try {
      await Payment.create({
        userId: session.user.id,
        creatorId: newTier.creator,
        tierId: newTier._id,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        amount: Number(newTier.price),
        currency: "INR",
        paymentType: "tier_upgrade",
        status: "paid",
      });

      // Send notification to creator
      await Notification.create({
        recipient: newTier.creator,
        sender: session.user.id,
        type: "payment_received",
        title: "Tier Changed",
        message: `${session.user.name || "A supporter"} changed tier to ${newTier.name} (₹${newTier.price}).`,
        link: "/creator/payments",
      });
    } catch (paymentErr) {
      console.error("Change tier payment log/notify error:", paymentErr);
    }

    // ============================================
    // SUCCESS
    // ============================================

    return NextResponse.json({
      success: true,

      message:
        `Your tier has been changed to ${newTier.name}.`,

      subscription: {
        id: subscription._id.toString(),
        tier: newTier.name,
        amount: newTier.price,
        status: subscription.status,
        paymentStatus:
          subscription.paymentStatus,
        paymentId:
          subscription.paymentId,
        razorpayOrderId:
          subscription.razorpayOrderId,
      },
    });
  } catch (error) {
    console.error(
      "Change tier payment verification error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while verifying your payment.",
      },
      { status: 500 }
    );
  }
}