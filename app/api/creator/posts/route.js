import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Tier from "@/models/Tier";
import Post from "@/models/Post";

import { authOptions } from "@/lib/auth";

export async function POST(request) {
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
    // GET REQUEST DATA
    // ============================================

    const body = await request.json();

    const {
      title,
      content,
      image,
      visibility,
      tierId,
    } = body;

    // ============================================
    // VALIDATION
    // ============================================

    if (!title?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Post title is required.",
        },
        { status: 400 }
      );
    }

    if (!content?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Post content is required.",
        },
        { status: 400 }
      );
    }

    if (title.trim().length > 150) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Post title cannot exceed 150 characters.",
        },
        { status: 400 }
      );
    }

    if (content.trim().length > 10000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Post content cannot exceed 10,000 characters.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // VALIDATE VISIBILITY
    // ============================================

    const postVisibility =
      visibility === "supporters"
        ? "supporters"
        : "public";

    // ============================================
    // DATABASE
    // ============================================

    await connectDB();

    // ============================================
    // VERIFY CREATOR
    // ============================================

    const creator = await User.findById(
      session.user.id
    );

    if (!creator) {
      return NextResponse.json(
        {
          success: false,
          message: "Creator not found.",
        },
        { status: 404 }
      );
    }

    if (creator.role !== "creator") {
      return NextResponse.json(
        {
          success: false,
          message: "Creator access only.",
        },
        { status: 403 }
      );
    }

    // ============================================
    // VALIDATE TIER
    // ============================================

    let tier = null;

    if (postVisibility === "supporters") {
      if (tierId) {
        tier = await Tier.findOne({
          _id: tierId,
          creator: creator._id,
          isActive: true,
        });

        if (!tier) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Selected tier is invalid or unavailable.",
            },
            { status: 400 }
          );
        }
      }
    }

    // ============================================
    // CREATE POST
    // ============================================

    const post = await Post.create({
      creator: creator._id,

      title: title.trim(),

      content: content.trim(),

      image: image?.trim() || "",

      visibility: postVisibility,

      tier: tier?._id || null,
    });

    // ============================================
    // RESPONSE
    // ============================================

    return NextResponse.json(
      {
        success: true,

        message: "Post created successfully.",

        post: {
          id: post._id.toString(),
          title: post.title,
          content: post.content,
          image: post.image,
          visibility: post.visibility,
          tier: post.tier
            ? post.tier.toString()
            : null,
          createdAt: post.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create creator post error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create post.",
      },
      { status: 500 }
    );
  }
}