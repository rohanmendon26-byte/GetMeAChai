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
    // DATABASE
    // ============================================

    await connectDB();

    const creatorId = session.user.id;
    console.log("Creator Dashboard User ID:", creatorId);

    // ============================================
    // GET ACTIVE SUBSCRIPTIONS
    // ============================================

    const activeSubscriptions =
      await Subscription.find({
        creator: creatorId,
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
        .sort({ createdAt: -1 })
        .lean();

    // ============================================
    // CALCULATE STATISTICS
    // ============================================

    const totalSupporters =
      activeSubscriptions.length;

    const monthlyEarnings =
      activeSubscriptions.reduce(
        (total, subscription) =>
          total + Number(subscription.amount || 0),
        0
      );

    // ============================================
    // TOTAL PAYMENTS
    // ============================================

    const totalPayments =
      await Subscription.countDocuments({
        creator: creatorId,
        status: "active",
      });

    // ============================================
    // RECENT SUPPORTERS
    // ============================================

    const recentSupporters =
      activeSubscriptions.slice(0, 5).map(
        (subscription) => ({
          id: subscription._id.toString(),

          supporter: subscription.supporter
            ? {
                id:
                  subscription.supporter._id.toString(),
                name:
                  subscription.supporter.name,
                username:
                  subscription.supporter.username,
                image:
                  subscription.supporter.image,
              }
            : null,

          tier: subscription.tier
            ? {
                id:
                  subscription.tier._id.toString(),
                name:
                  subscription.tier.name,
                price:
                  subscription.tier.price,
              }
            : null,

          amount: subscription.amount,

          startedAt:
            subscription.startedAt,

          createdAt:
            subscription.createdAt,
        })
      );

    // ============================================
    // RESPONSE
    // ============================================

    return NextResponse.json({
      success: true,

      stats: {
        totalSupporters,
        monthlyEarnings,
        totalPayments,
      },

      recentSupporters,
    });
  } catch (error) {
    console.error(
      "Get creator earnings error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load creator earnings.",
      },
      { status: 500 }
    );
  }
}