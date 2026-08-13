import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Goal from "@/models/Goal";
import Subscription from "@/models/Subscription";
import Payment from "@/models/Payment";
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

    if (session.user.role !== "creator") {
      return NextResponse.json(
        {
          success: false,
          message: "Only creators can access goals.",
        },
        { status: 403 }
      );
    }

    await connectDB();

    const [goals, activeSubscriptions, allPayments] = await Promise.all([
      Goal.find({ creator: session.user.id })
        .sort({ createdAt: -1 })
        .lean(),

      Subscription.find({
        creator: session.user.id,
        status: "active",
      }).lean(),

      Payment.find({
        creatorId: session.user.id,
        status: "paid",
      }).lean(),
    ]);

    const activeSupporters = activeSubscriptions.length;

    const monthlySupport = activeSubscriptions.reduce(
      (sum, sub) => sum + Number(sub.amount || 0),
      0
    );

    const totalEarnings = allPayments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

    // Calculate live progress for each goal
    const computedGoals = goals.map((goal) => {
      const current =
        goal.type === "supporters" ? activeSupporters : monthlySupport;

      const percentage =
        goal.targetAmount > 0
          ? Math.min(100, Math.round((current / goal.targetAmount) * 100))
          : 0;

      const isReached = current >= goal.targetAmount;

      return {
        ...goal,
        currentProgress: current,
        percentage,
        isReached,
      };
    });

    return NextResponse.json({
      success: true,
      goals: computedGoals,
      stats: {
        activeSupporters,
        monthlySupport,
        totalEarnings,
      },
    });
  } catch (error) {
    console.error("Get goals error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load creator goals.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
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

    if (session.user.role !== "creator") {
      return NextResponse.json(
        {
          success: false,
          message: "Only creators can create goals.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, type, targetAmount, isActive } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Goal title is required.",
        },
        { status: 400 }
      );
    }

    const numericTarget = Number(targetAmount);
    if (!Number.isFinite(numericTarget) || numericTarget < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Target must be a positive number.",
        },
        { status: 400 }
      );
    }

    const validTypes = ["amount", "supporters"];
    const goalType = validTypes.includes(type) ? type : "amount";
    const shouldBeActive = isActive !== false;

    await connectDB();

    // If this goal is active, deactivate existing active goals for single focused banner
    if (shouldBeActive) {
      await Goal.updateMany(
        { creator: session.user.id, isActive: true },
        { isActive: false }
      );
    }

    const goal = await Goal.create({
      creator: session.user.id,
      title: title.trim(),
      description: description?.trim() || "",
      type: goalType,
      targetAmount: numericTarget,
      isActive: shouldBeActive,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Goal created successfully!",
        goal,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create goal error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create goal.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
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

    if (session.user.role !== "creator") {
      return NextResponse.json(
        {
          success: false,
          message: "Only creators can update goals.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { goalId, title, description, type, targetAmount, isActive } = body;

    if (!goalId) {
      return NextResponse.json(
        {
          success: false,
          message: "Goal ID is required.",
        },
        { status: 400 }
      );
    }

    if (!title?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Goal title is required.",
        },
        { status: 400 }
      );
    }

    const numericTarget = Number(targetAmount);
    if (!Number.isFinite(numericTarget) || numericTarget < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Target must be a positive number.",
        },
        { status: 400 }
      );
    }

    const validTypes = ["amount", "supporters"];
    const goalType = validTypes.includes(type) ? type : "amount";

    await connectDB();

    const goal = await Goal.findOne({
      _id: goalId,
      creator: session.user.id,
    });

    if (!goal) {
      return NextResponse.json(
        {
          success: false,
          message: "Goal not found.",
        },
        { status: 404 }
      );
    }

    if (isActive && !goal.isActive) {
      await Goal.updateMany(
        { creator: session.user.id, isActive: true },
        { isActive: false }
      );
    }

    goal.title = title.trim();
    goal.description = description?.trim() || "";
    goal.type = goalType;
    goal.targetAmount = numericTarget;
    if (typeof isActive === "boolean") {
      goal.isActive = isActive;
    }

    await goal.save();

    return NextResponse.json({
      success: true,
      message: "Goal updated successfully!",
      goal,
    });
  } catch (error) {
    console.error("Update goal error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update goal.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
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

    if (session.user.role !== "creator") {
      return NextResponse.json(
        {
          success: false,
          message: "Only creators can delete goals.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { goalId } = body;

    if (!goalId) {
      return NextResponse.json(
        {
          success: false,
          message: "Goal ID is required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const goal = await Goal.findOne({
      _id: goalId,
      creator: session.user.id,
    });

    if (!goal) {
      return NextResponse.json(
        {
          success: false,
          message: "Goal not found.",
        },
        { status: 404 }
      );
    }

    await Goal.deleteOne({
      _id: goalId,
      creator: session.user.id,
    });

    return NextResponse.json({
      success: true,
      message: "Goal deleted successfully.",
    });
  } catch (error) {
    console.error("Delete goal error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete goal.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
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

    if (session.user.role !== "creator") {
      return NextResponse.json(
        {
          success: false,
          message: "Only creators can toggle goal status.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { goalId, isActive } = body;

    if (!goalId || typeof isActive !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "Goal ID and isActive boolean are required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const goal = await Goal.findOne({
      _id: goalId,
      creator: session.user.id,
    });

    if (!goal) {
      return NextResponse.json(
        {
          success: false,
          message: "Goal not found.",
        },
        { status: 404 }
      );
    }

    if (isActive) {
      await Goal.updateMany(
        { creator: session.user.id, isActive: true },
        { isActive: false }
      );
    }

    goal.isActive = isActive;
    await goal.save();

    return NextResponse.json({
      success: true,
      message: isActive ? "Goal activated on profile." : "Goal deactivated.",
      goal,
    });
  } catch (error) {
    console.error("Patch goal error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to toggle goal status.",
      },
      { status: 500 }
    );
  }
}
