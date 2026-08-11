import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },

    image: {
      type: String,
      default: "",
    },

    visibility: {
      type: String,
      enum: ["public", "supporters"],
      default: "public",
    },

    tier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tier",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({
  creator: 1,
  createdAt: -1,
});

const Post =
  mongoose.models.Post ||
  mongoose.model("Post", postSchema);

export default Post;