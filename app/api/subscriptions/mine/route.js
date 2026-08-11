import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/mongodb";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import Tier from "@/models/Tier";

import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
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

    await connectDB();

    const subscriptions = await Subscription.find({
      supporter: session.user.id,
      status: "active",
    })
      .populate(
        "creator",
        "name username image bio"
      )
      .populate(
        "tier",
        "name price description benefits"
      )
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      subscriptions,
    });
  } catch (error) {
    console.error(
      "Get supporter subscriptions error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load your subscriptions.",
      },
      { status: 500 }
    );
  }
}