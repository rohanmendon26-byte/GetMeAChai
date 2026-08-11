import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import connectDB from "@/lib/mongodb";
import Post from "@/models/Post";
import Tier from "@/models/Tier";
import Subscription from "@/models/Subscription";
import Notification from "@/models/Notification";

import { authOptions } from "@/lib/auth";

// =========================================================
// POST — Create a post
// =========================================================

export async function POST(request) {
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
          message: "Only creators can create posts.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      title,
      content,
      visibility,
      tier,
      image,
    } = body;

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

    let selectedTier = null;

    // Supporter-only posts require a tier
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

      selectedTier = await Tier.findOne({
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
    }

    const post = await Post.create({
      creator: session.user.id,
      title: title.trim(),
      content: content.trim(),
      visibility,
      tier: selectedTier
        ? selectedTier._id
        : null,
      image: image?.trim() || "",
    });

    const createdPost = await Post.findById(post._id)
      .populate("tier", "name price")
      .lean();

    // Notify active subscribers
    try {
      const activeSubs = await Subscription.find({
        creator: session.user.id,
        status: "active",
      }).select("supporter");

      if (activeSubs.length > 0) {
        const notifications = activeSubs.map((sub) => ({
          recipient: sub.supporter,
          sender: session.user.id,
          type: "new_post",
          title: `New Post from ${session.user.name || "Creator"}`,
          message: `Check out "${title.trim()}".`,
          link: `/${session.user.username || ""}`,
        }));

        await Notification.insertMany(notifications).catch(() => {});
      }
    } catch (notifyErr) {
      console.error("Supporter notification error:", notifyErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Post created successfully.",
        post: createdPost,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create post error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create post.",
      },
      { status: 500 }
    );
  }
}

// =========================================================
// GET — Get creator's posts
// =========================================================

export async function GET() {
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
          message:
            "Only creators can access their posts.",
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
        message:
          error.message || "Failed to load posts.",
      },
      { status: 500 }
    );
  }
}

// =========================================================
// PUT — Update a post
// =========================================================

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

    const updatedPost = await Post.findById(
      post._id
    )
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

// =========================================================
// DELETE — Delete a post
// =========================================================

export async function DELETE(request) {
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
          message: "Only creators can delete posts.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        {
          success: false,
          message: "Post ID is required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

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

    await Post.deleteOne({
      _id: postId,
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
        message: "Failed to delete post.",
      },
      { status: 500 }
    );
  }
}