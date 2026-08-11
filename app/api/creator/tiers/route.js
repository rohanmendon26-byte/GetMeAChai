import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/mongodb";
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

    if (session.user.role !== "creator") {
      return NextResponse.json(
        {
          success: false,
          message: "Only creators can access tiers.",
        },
        { status: 403 }
      );
    }

    await connectDB();

    const tiers = await Tier.find({
      creator: session.user.id,
    })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      tiers,
    });
  } catch (error) {
    console.error("Get tiers error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load tiers.",
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
          message: "Only creators can create tiers.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      name,
      description,
      price,
      benefits,
      image,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Tier name is required.",
        },
        { status: 400 }
      );
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Price must be at least ₹1.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const creator = await User.findById(session.user.id);

    if (!creator) {
      return NextResponse.json(
        {
          success: false,
          message: "Creator not found.",
        },
        { status: 404 }
      );
    }

    const existingTierCount = await Tier.countDocuments({
      creator: session.user.id,
    });

    const cleanedBenefits = Array.isArray(benefits)
      ? benefits
          .map((benefit) => String(benefit).trim())
          .filter(Boolean)
          .slice(0, 10)
      : [];

    const tier = await Tier.create({
      creator: session.user.id,
      name: name.trim(),
      description: description?.trim() || "",
      price: numericPrice,
      benefits: cleanedBenefits,
      image: image?.trim() || "",
      order: existingTierCount,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Tier created successfully.",
        tier,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create tier error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create tier.",
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
          message: "Only creators can update tiers.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      tierId,
      name,
      description,
      price,
      benefits,
      image,
    } = body;

    if (!tierId) {
      return NextResponse.json(
        {
          success: false,
          message: "Tier ID is required.",
        },
        { status: 400 }
      );
    }

    if (!name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Tier name is required.",
        },
        { status: 400 }
      );
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Price must be at least ₹1.",
        },
        { status: 400 }
      );
    }

    const cleanedBenefits = Array.isArray(benefits)
      ? benefits
          .map((benefit) => String(benefit).trim())
          .filter(Boolean)
          .slice(0, 10)
      : [];

    await connectDB();

    // Find the tier AND make sure it belongs to
    // the currently logged-in creator.
    const tier = await Tier.findOne({
      _id: tierId,
      creator: session.user.id,
    });

    if (!tier) {
      return NextResponse.json(
        {
          success: false,
          message: "Tier not found.",
        },
        { status: 404 }
      );
    }

    tier.name = name.trim();
    tier.description = description?.trim() || "";
    tier.price = numericPrice;
    tier.benefits = cleanedBenefits;

    if (image !== undefined) {
      tier.image = image?.trim() || "";
    }

    await tier.save();

    return NextResponse.json({
      success: true,
      message: "Tier updated successfully.",
      tier,
    });
  } catch (error) {
    console.error("Update tier error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update tier.",
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
          message: "Only creators can delete tiers.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { tierId } = body;

    if (!tierId) {
      return NextResponse.json(
        {
          success: false,
          message: "Tier ID is required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Make sure the tier belongs to the
    // currently logged-in creator.
    const tier = await Tier.findOne({
      _id: tierId,
      creator: session.user.id,
    });

    if (!tier) {
      return NextResponse.json(
        {
          success: false,
          message: "Tier not found.",
        },
        { status: 404 }
      );
    }

    await Tier.deleteOne({
      _id: tierId,
      creator: session.user.id,
    });

    return NextResponse.json({
      success: true,
      message: "Tier deleted successfully.",
    });
  } catch (error) {
    console.error("Delete tier error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete tier.",
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
          message: "Only creators can change tier status.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { tierId, isActive } = body;

    if (!tierId) {
      return NextResponse.json(
        {
          success: false,
          message: "Tier ID is required.",
        },
        { status: 400 }
      );
    }

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "isActive must be a boolean.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Make sure the tier belongs to the
    // currently logged-in creator.
    const tier = await Tier.findOne({
      _id: tierId,
      creator: session.user.id,
    });

    if (!tier) {
      return NextResponse.json(
        {
          success: false,
          message: "Tier not found.",
        },
        { status: 404 }
      );
    }

    tier.isActive = isActive;

    await tier.save();

    return NextResponse.json({
      success: true,
      message: isActive
        ? "Tier activated successfully."
        : "Tier deactivated successfully.",
      tier,
    });
  } catch (error) {
    console.error("Update tier status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update tier status.",
      },
      { status: 500 }
    );
  }
}