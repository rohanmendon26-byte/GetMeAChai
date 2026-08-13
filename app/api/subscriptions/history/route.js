import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/mongodb";
import Subscription from "@/models/Subscription";

import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    // ============================================
    // AUTHENTICATION
    // ============================================

    const session =
      await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    // ============================================
    // DATABASE
    // ============================================

    await connectDB();

    // ============================================
    // GET ALL SUBSCRIPTIONS
    // ============================================

    const subscriptions =
      await Subscription.find({
        supporter: session.user.id,
      })
        .populate(
          "creator",
          "name username image"
        )
        .populate(
          "tier",
          "name price description"
        )
        .sort({ createdAt: -1 })
        .lean();

    const formattedSubscriptions = subscriptions.map((sub) => ({
      ...sub,
      paymentStatus:
        sub.paymentStatus ||
        (sub.paymentId || sub.status === "active" ? "paid" : "pending"),
    }));

    return NextResponse.json({
      success: true,
      subscriptions: formattedSubscriptions,
    });
  } catch (error) {
    console.error(
      "Get subscription history error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load subscription history.",
      },
      { status: 500 }
    );
  }
}