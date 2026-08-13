import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/mongodb";
import Subscription from "@/models/Subscription";
import "@/models/Tier";

import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    // ============================================
    // AUTHENTICATION
    // ============================================

    const session = await getServerSession(authOptions);

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
    // CREATOR ACCESS
    // ============================================

    if (session.user.role !== "creator") {
      return NextResponse.json(
        {
          success: false,
          message: "Creator access only.",
        },
        { status: 403 }
      );
    }

    // ============================================
    // DATABASE
    // ============================================

    await connectDB();

    // ============================================
    // GET PAYMENTS
    // ============================================

    const payments = await Subscription.find({
      creator: session.user.id,
      paymentId: {
        $exists: true,
        $ne: "",
      },
    })
      .populate(
        "supporter",
        "name username image"
      )
      .populate(
        "tier",
        "name price"
      )
      .sort({ createdAt: -1 })
      .lean();

    // ============================================
    // CALCULATE TOTALS
    // ============================================

    const totalEarnings = payments.reduce(
      (total, payment) =>
        total + (payment.amount || 0),
      0
    );

    const totalPayments = payments.length;

    // ============================================
    // RESPONSE
    // ============================================

    return NextResponse.json({
      success: true,

      stats: {
        totalEarnings,
        totalPayments,
      },

      payments,
    });
  } catch (error) {
    console.error(
      "================================"
    );

    console.error(
      "CREATOR PAYMENTS ERROR:"
    );

    console.error(error);

    console.error(
      "ERROR MESSAGE:",
      error?.message
    );

    console.error(
      "================================"
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to load payment history.",
      },
      { status: 500 }
    );
  }
}