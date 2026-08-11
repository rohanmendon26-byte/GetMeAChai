import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Razorpay from "razorpay";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Tier from "@/models/Tier";

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
          message: "Please login to support a creator.",
        },
        { status: 401 }
      );
    }

    // ============================================
    // GET TIER
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

    const tier = await Tier.findById(tierId);

    if (!tier || !tier.isActive) {
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

    const creator = await User.findById(tier.creator);

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
    // CREATE RAZORPAY ORDER
    // ============================================

    const amountInPaise = Math.round(
      Number(tier.price) * 100
    );

    if (!Number.isFinite(amountInPaise) || amountInPaise < 100) {
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
      receipt: `tier_${Date.now()}`,
      notes: {
        tierId: tier._id.toString(),
        creatorId: creator._id.toString(),
        supporterId: session.user.id.toString(),
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
        id: tier._id.toString(),
        name: tier.name,
        price: tier.price,
      },
      creator: {
        name: creator.name,
        username: creator.username,
      },
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error(
      "Create Razorpay order error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create payment order.",
      },
      { status: 500 }
    );
  }
}