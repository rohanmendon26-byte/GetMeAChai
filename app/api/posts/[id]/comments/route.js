import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import Notification from "@/models/Notification";
import { authOptions } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Post ID is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const comments = await Comment.find({ post: id })
      .sort({ createdAt: 1 })
      .populate("author", "name username image")
      .lean();

    return NextResponse.json({
      success: true,
      comments: comments.map((c) => ({
        id: c._id.toString(),
        content: c.content,
        createdAt: c.createdAt,
        author: {
          id: c.author?._id?.toString() || "",
          name: c.author?.name || "Supporter",
          username: c.author?.username || "user",
          image: c.author?.image || "",
        },
      })),
    });
  } catch (error) {
    console.error("Fetch comments error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load comments." },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Please log in to comment." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, message: "Comment content is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const post = await Post.findById(id).populate("creator", "name username");

    if (!post) {
      return NextResponse.json(
        { success: false, message: "Post not found." },
        { status: 404 }
      );
    }

    const newComment = await Comment.create({
      post: post._id,
      author: session.user.id,
      content: content.trim(),
    });

    const populated = await Comment.findById(newComment._id)
      .populate("author", "name username image")
      .lean();

    // Create notification for creator if the commenter is not the creator
    if (post.creator?._id && post.creator._id.toString() !== session.user.id.toString()) {
      await Notification.create({
        recipient: post.creator._id,
        sender: session.user.id,
        type: "new_comment",
        title: "New Comment on Your Post",
        message: `${session.user.name || "A supporter"} commented on "${post.title}".`,
        link: `/${post.creator.username}`,
      }).catch((err) => console.error("Notification creation error:", err));
    }

    return NextResponse.json({
      success: true,
      message: "Comment posted successfully.",
      comment: {
        id: populated._id.toString(),
        content: populated.content,
        createdAt: populated.createdAt,
        author: {
          id: populated.author?._id?.toString() || "",
          name: populated.author?.name || "Supporter",
          username: populated.author?.username || "user",
          image: populated.author?.image || "",
        },
      },
    });
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to post comment." },
      { status: 500 }
    );
  }
}
