import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Razorpay from "razorpay";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Tier from "@/models/Tier";
import Subscription from "@/models/Subscription";

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
    // GET REQUEST DATA
    // ============================================

    const body = await request.json();
    const { tierId } = body;

    if (!tierId) {
      return NextResponse.json(
        {
          success: false,
          message: "Tier is required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // ============================================
    // FIND NEW TIER
    // ============================================

    const newTier = await Tier.findById(tierId);

    if (!newTier || !newTier.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "This tier is no longer available.",
        },
        { status: 404 }
      );
    }

    // ============================================
    // FIND CREATOR
    // ============================================

    const creator = await User.findById(
      newTier.creator
    );

    if (!creator) {
      return NextResponse.json(
        {
          success: false,
          message: "Creator not found.",
        },
        { status: 404 }
      );
    }

    // ============================================
    // PREVENT SELF-SUPPORT
    // ============================================

    if (
      creator._id.toString() ===
      session.user.id.toString()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot support yourself.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // FIND EXISTING SUBSCRIPTION
    // ============================================

    const subscription =
      await Subscription.findOne({
        supporter: session.user.id,
        creator: creator._id,
        status: "active",
      });

    if (!subscription) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You do not have an active subscription to this creator.",
        },
        { status: 404 }
      );
    }

    // ============================================
    // SAME TIER
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
    // CREATE RAZORPAY ORDER
    // ============================================

    const amountInPaise = Math.round(
      Number(newTier.price) * 100
    );

    if (
      !Number.isFinite(amountInPaise) ||
      amountInPaise < 100
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid tier price.",
        },
        { status: 400 }
      );
    }

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `change_${Date.now()}`,
      notes: {
        tierId: newTier._id.toString(),
        creatorId: creator._id.toString(),
        supporterId: session.user.id.toString(),
        subscriptionId: subscription._id.toString(),
      },
    });

    return NextResponse.json({
      success: true,

      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },

      tier: {
        id: newTier._id.toString(),
        name: newTier.name,
        price: newTier.price,
      },

      creator: {
        name: creator.name,
        username: creator.username,
      },

      keyId:
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error(
      "Create tier change order error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create tier change payment.",
      },
      { status: 500 }
    );
  }
}