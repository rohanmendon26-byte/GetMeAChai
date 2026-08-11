import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Tier from "@/models/Tier";
import Subscription from "@/models/Subscription";

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
    // FIND CREATOR
    // ============================================

    const creator = await User.findById(
      session.user.id
    ).lean();

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
    // FETCH DATA
    // ============================================

    const [
      tiers,
      activeSubscriptions,
      allPayments,
    ] = await Promise.all([
      // All tiers
      Tier.find({
        creator: creator._id,
      })
        .sort({
          order: 1,
          createdAt: 1,
        })
        .lean(),

      // Currently active supporters
      Subscription.find({
        creator: creator._id,
        status: "active",
      })
        .populate(
          "supporter",
          "name username image"
        )
        .populate(
          "tier",
          "name price"
        )
        .sort({
          createdAt: -1,
        })
        .lean(),

      // All successful payments
      Subscription.find({
        creator: creator._id,
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
        .sort({
          createdAt: -1,
        })
        .lean(),
    ]);

    // ============================================
    // MONTHLY SUPPORT
    // ============================================

    const monthlySupport =
      activeSubscriptions.reduce(
        (total, subscription) =>
          total +
          (subscription.amount || 0),
        0
      );

    // ============================================
    // TOTAL EARNINGS
    // ============================================

    const totalEarnings =
      allPayments.reduce(
        (total, payment) =>
          total + (payment.amount || 0),
        0
      );

    // ============================================
    // TOTAL PAYMENTS
    // ============================================

    const totalPayments =
      allPayments.length;

    // ============================================
    // RECENT PAYMENTS
    // ============================================

    const recentPayments =
      allPayments.slice(0, 10);

    // ============================================
    // RESPONSE
    // ============================================

    return NextResponse.json({
      success: true,

      creator: {
        id: creator._id.toString(),
        name: creator.name,
        username: creator.username,
        image: creator.image,
        bio: creator.bio,
      },

      stats: {
        supporters:
          activeSubscriptions.length,

        tiers: tiers.length,

        monthlySupport,

        totalEarnings,

        totalPayments,
      },

      tiers,

      recentSupporters:
        activeSubscriptions.slice(0, 10),

      recentPayments,
    });
  } catch (error) {
    console.error(
      "Creator stats error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load creator dashboard.",
      },
      { status: 500 }
    );
  }
}