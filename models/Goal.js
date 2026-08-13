import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
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
      maxlength: 120,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ["amount", "supporters"],
      default: "amount",
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isReached: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

goalSchema.index({ creator: 1, isActive: 1 });

const Goal =
  mongoose.models.Goal || mongoose.model("Goal", goalSchema);

export default Goal;
