import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/mongodb";
import Subscription from "@/models/Subscription";

import { authOptions } from "@/lib/auth";

export async function POST(request) {
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
          message:
            "Please login to cancel your subscription.",
        },
        { status: 401 }
      );
    }

    // ============================================
    // REQUEST DATA
    // ============================================

    const body = await request.json();

    const { subscriptionId } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Subscription ID is required.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // DATABASE
    // ============================================

    await connectDB();

    // ============================================
    // FIND SUBSCRIPTION
    // ============================================

    const subscription =
      await Subscription.findOne({
        _id: subscriptionId,
        supporter: session.user.id,
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
    // CANCEL
    // ============================================

    subscription.status = "cancelled";
    subscription.cancelledAt = new Date();

    await subscription.save();

    return NextResponse.json({
      success: true,

      message:
        "Your subscription has been cancelled successfully.",

      subscription: {
        id: subscription._id.toString(),
        status: subscription.status,
        cancelledAt:
          subscription.cancelledAt,
      },
    });
  } catch (error) {
    console.error(
      "Cancel subscription error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while cancelling your subscription.",
      },
      { status: 500 }
    );
  }
}