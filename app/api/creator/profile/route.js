import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id)
      .select("-passwordHash")
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get creator profile error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load profile.",
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
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      name,
      username,
      bio,
      image,
      coverImage,
      socialLinks,
    } = body;

    if (!name?.trim() || !username?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Name and username are required.",
        },
        { status: 400 }
      );
    }

    const normalizedUsername =
      username.trim().toLowerCase();

    await connectDB();

    const existingUsername = await User.findOne({
      username: normalizedUsername,
      _id: { $ne: session.user.id },
    });

    if (existingUsername) {
      return NextResponse.json(
        {
          success: false,
          message: "Username is already taken.",
        },
        { status: 409 }
      );
    }

    const updateFields = {
      name: name.trim(),
      username: normalizedUsername,
      bio: bio?.trim() || "",
      image: image?.trim() || "",
      coverImage: coverImage?.trim() || "",
      socialLinks: {
        github: socialLinks?.github?.trim() || "",
        instagram: socialLinks?.instagram?.trim() || "",
        twitter: socialLinks?.twitter?.trim() || "",
        linkedin: socialLinks?.linkedin?.trim() || "",
        website: socialLinks?.website?.trim() || "",
      },
    };

    if (body.role === "creator" || body.role === "supporter") {
      updateFields.role = body.role;
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: updateFields,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .select("-passwordHash")
      .lean();

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error(
      "Update creator profile error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update profile.",
      },
      { status: 500 }
    );
  }
}