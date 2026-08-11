import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/mongodb";
import Post from "@/models/Post";
import Tier from "@/models/Tier";
import { authOptions } from "@/lib/auth";

// =========================================================
// GET — Get a single post by ID
// =========================================================
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const post = await Post.findOne({
      _id: id,
      creator: session.user.id,
    })
      .populate("tier", "name price")
      .lean();

    if (!post) {
      return NextResponse.json(
        {
          success: false,
          message: "Post not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error) {
    console.error("Get post by ID error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to load post.",
      },
      { status: 500 }
    );
  }
}

// =========================================================
// PUT — Update a single post by ID
// =========================================================
export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    if (session.user.role !== "creator") {
      return NextResponse.json(
        {
          success: false,
          message: "Only creators can update posts.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, visibility, tier, image } = body;

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

    if (visibility !== "public" && visibility !== "supporters") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid post visibility.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const post = await Post.findOne({
      _id: id,
      creator: session.user.id,
    });

    if (!post) {
      return NextResponse.json(
        {
          success: false,
          message: "Post not found or unauthorized.",
        },
        { status: 404 }
      );
    }

    if (visibility === "supporters") {
      if (!tier) {
        return NextResponse.json(
          {
            success: false,
            message: "Please select a tier for supporter-only posts.",
          },
          { status: 400 }
        );
      }

      const selectedTier = await Tier.findOne({
        _id: tier,
        creator: session.user.id,
        isActive: true,
      });

      if (!selectedTier) {
        return NextResponse.json(
          {
            success: false,
            message: "Selected tier not found.",
          },
          { status: 404 }
        );
      }

      post.tier = selectedTier._id;
    } else {
      post.tier = null;
    }

    post.title = title.trim();
    post.content = content.trim();
    post.visibility = visibility;

    if (image !== undefined) {
      post.image = image?.trim() || "";
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("tier", "name price")
      .lean();

    return NextResponse.json({
      success: true,
      message: "Post updated successfully.",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Update post error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update post.",
      },
      { status: 500 }
    );
  }
}

// =========================================================
// DELETE — Delete a single post by ID
// =========================================================
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    if (session.user.role !== "creator") {
      return NextResponse.json(
        {
          success: false,
          message: "Only creators can delete posts.",
        },
        { status: 403 }
      );
    }

    await connectDB();

    const post = await Post.findOne({
      _id: id,
      creator: session.user.id,
    });

    if (!post) {
      return NextResponse.json(
        {
          success: false,
          message: "Post not found or unauthorized.",
        },
        { status: 404 }
      );
    }

    await Post.deleteOne({
      _id: id,
      creator: session.user.id,
    });

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully.",
    });
  } catch (error) {
    console.error("Delete post error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete post.",
      },
      { status: 500 }
    );
  }
}
