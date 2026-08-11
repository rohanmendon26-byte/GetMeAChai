import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const notifications = await Notification.find({ recipient: session.user.id })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate("sender", "name username image")
      .lean();

    const unreadCount = await Notification.countDocuments({
      recipient: session.user.id,
      isRead: false,
    });

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load notifications." },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { notificationId, markAll } = body;

    await connectDB();

    if (markAll) {
      await Notification.updateMany(
        { recipient: session.user.id, isRead: false },
        { $set: { isRead: true } }
      );

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read.",
      });
    }

    if (notificationId) {
      await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: session.user.id },
        { $set: { isRead: true } }
      );

      return NextResponse.json({
        success: true,
        message: "Notification marked as read.",
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid request parameters." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Update notifications error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update notification status." },
      { status: 500 }
    );
  }
}
