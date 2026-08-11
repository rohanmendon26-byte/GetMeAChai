import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/mongodb";
import Post from "@/models/Post";
import Tier from "@/models/Tier";

import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    console.log("MY POSTS SESSION:", session);

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
          message: "Only creators can access their posts.",
        },
        { status: 403 }
      );
    }

    await connectDB();

    const posts = await Post.find({
      creator: session.user.id,
    })
      .populate("tier", "name price")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error("Get creator posts error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to load posts.",
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

    const {
      postId,
      title,
      content,
      visibility,
      tier,
      image,
    } = body;

    if (!postId) {
      return NextResponse.json(
        {
          success: false,
          message: "Post ID is required.",
        },
        { status: 400 }
      );
    }

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

    if (
      visibility !== "public" &&
      visibility !== "supporters"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid post visibility.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Make sure the post belongs to the
    // currently logged-in creator.
    const post = await Post.findOne({
      _id: postId,
      creator: session.user.id,
    });

    if (!post) {
      return NextResponse.json(
        {
          success: false,
          message: "Post not found.",
        },
        { status: 404 }
      );
    }

    // If the post is for supporters,
    // make sure a valid tier was selected.
    if (visibility === "supporters") {
      if (!tier) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Please select a tier for supporter-only posts.",
          },
          { status: 400 }
        );
      }

      const selectedTier = await Tier.findOne({
        _id: tier,
        creator: session.user.id,
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
        message: "Failed to update post.",
      },
      { status: 500 }
    );
  }
}